const util = require('util');
const cbml = require('cbml');
const cheerio = require('cheerio');
const utils = require('./utils');

/**
 * 循环html 标签
 * @param {String|jQuery} code 待处理代码
 * @param {String} selector 选择器
 * @param {Function} callback 回调
 * @returns {String|jQuery} 处理完成后的代码
 */
function eachHtml(code, selector, callback) {
    let $ = typeof(code) === "string" ? cheerio.load(code, {decodeEntities: false}) : code,
        elements = $(selector);

    for (let i = 0; i < elements.length; i++) {
        callback(elements.eq(i), elements.eq(i)[0].tagName);
    }
    return typeof(code) === "string" ? $.html() : $;
}

/**
 * html嵌入html文件中资源地址定位
 * @param {String} path 主html绝对地址
 * @param {String} inlineContent 待处理代码
 * @returns {String} 处理完成后的代码
 */
function inlineHtmlResLocate(path, inlineContent) {
    return eachHtml(inlineContent, 'link,script,a,iframe,img,embed,audio,video,object,source', function (el, tag) {
        let attr = /link|a/.test(tag) ? 'href' : 'src';

        for (let name of [attr, 'data-' + attr]) {
            let url = el.attr(name);
            if (url !== undefined) {
                let inlinePath = utils.inlinePath(path, url);

                if (inlinePath) {
                    el.attr(name, inlinePath.absolute + inlinePath.search + inlinePath.hash);
                }
            }
        }
    });
}

/**
 * html嵌入html文件中资源地址定位
 * @param {String} path 主html绝对地址
 * @param {jQuery} $ html文件内容
 * @returns {jQuery} 处理完成后的代码
 */
function htmlInlineHtml(path, $) {
    return eachHtml($, 'link[rel="import"]', function (el) {
        let href = el.attr('href'),
            inlinePath = utils.inlinePath(path, href);

        if (inlinePath && /\.(html|tpl|ejs)$/i.test(inlinePath.origin)) {
            let inlineContent = fis.util.read(inlinePath.origin, true);

            inlineContent = inlineHtmlResLocate(inlinePath.origin, inlineContent); //资源定位
            inlineContent = htmlInlineHtml(inlinePath.origin, inlineContent); //循环嵌入

            el.before(inlineContent).remove();
        }
    });
}

/**
 * html中嵌如svg图片
 * fis3原本内联svg是转换为base64，提前转换为svg code。
 * @param {String} path 主html绝对地址
 * @param {jQuery} $ html文件内容
 */
function htmlInlineSVG(path, $) {
    return eachHtml($, 'img[src$=".svg?__inline"]', function (el) {
        let src = el.attr('src'),
            inlinePath = utils.inlinePath(path, src);

        if (inlinePath) {
            let inlineContent = fis.util.read(inlinePath.origin, true);

            let svg = $(utils.compressHTML(inlineContent));
            if (el.attr('class') !== undefined) svg.attr('class', el.attr('class'));
            if (el.attr('style') !== undefined) svg.attr('style', el.attr('style'));
            el.before(svg).remove();
        }
    });
}

/**
 * 格式化html代码
 * @param {String} contents 待处理内容
 * @param {Object} file 文件信息
 * @returns {String} 处理后的内容
 */
module.exports.extHTML = function (contents, file) {
    let $ = cheerio.load(contents, {decodeEntities: false});

    htmlInlineHtml(file.origin, $);
    htmlInlineSVG(file.origin, $);

    return $.html();
};

/**
 * 清理开发内容 用来切换release版本和debug版本
 * debug env != 0 -> 移除
 * remove env == 0 -> 移除
 * remove trigger -> 移除
 * @param {String} contents 待处理内容
 * @param {Object} settings dev环境值
 * @returns {String} 处理后的内容
 */
module.exports.dev = function (contents, settings) {
    function buildBlock(obj) {
        if (!obj) return '';

        obj = typeof obj === "string" ? cbml.parse(obj) : obj;

        let value = '';

        for (let node of obj.nodes) {
            if (node.type === 'block') {
                if ((node.tag === 'debug' && settings.env != 0) || (node.tag === 'remove' && !node.attrs.trigger && settings.env == 0)) {
                    node.value = '';
                } else if (node.tag === 'remove' && node.attrs.trigger) {
                    let trigger = node.attrs.trigger,
                        match = trigger.match(/@([a-z]*?)+(\s*?)/g);
                    if (match) {
                        for (let m of match) {
                            let v = settings[m.replace('@', '')];
                            trigger = trigger.replace(m, typeof v === "string" ? `'${v.replace(/'/g, "\\'")}'` : v);
                        }
                    }

                    if (eval(trigger)) {
                        node.value = '';
                    }
                } else if (node.nodes.length > 1) {
                    node.value = buildBlock(node);
                }
            }
            value += node.value;
        }

        return value;
    }

    return buildBlock(contents);
};