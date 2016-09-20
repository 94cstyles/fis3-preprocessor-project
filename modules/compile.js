const util = require('util');
const pth = require('path');
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
 * @param {String} inlinePath 嵌入html相对地址
 * @param {String} inlineContent 待处理代码
 * @returns {String} 处理完成后的代码
 */
function inlineHtmlResLocate(path, inlinePath, inlineContent) {
    return eachHtml(inlineContent, 'link,script,a,iframe,img,embed,audio,video,object,source', function (el, tag) {
        let attr = /link|a/.test(tag) ? 'href' : 'src';
        for (let name of [attr, 'data-' + attr]) {
            let url = el.attr(name);
            if (utils.isLocatePath(url) && !pth.isAbsolute(url)) {
                el.attr(name, utils.inlinePath(path, inlinePath, url).relative);
            }
        }
    });
}

/**
 * html嵌入html文件中资源地址定位
 * @param {Object} file html文件对象
 * @param {jQuery|String} $ html文件内容
 * @returns {jQuery|String} 处理完成后的代码
 */
function htmlInlineHtml(file, $) {
    return eachHtml($, 'link[rel="import"]', function (el) {
        let url = el.attr('href');
        if (utils.isLocatePath(url) && !pth.isAbsolute(url) && utils.isHtmlFile(url)) {
            let inlinePath = utils.inlinePath(file.origin, url),
                inlineContent = fis.util.read(inlinePath.absolute);

            inlineContent = inlineHtmlResLocate(file.origin, url, inlineContent); //资源定位
            inlineContent = htmlInlineHtml(file, inlineContent); //循环嵌入

            el.before(inlineContent).remove();
        }
    });
}

/**
 * html中嵌如svg图片
 * fis3原本内联svg是转换为base64，提前转换为svg code。
 * @param {Object} file html文件对象
 * @param {jQuery} $ html文件内容
 */
function htmlInlineSVG(file, $) {
    return eachHtml($, 'img[src$=".svg?__inline"]', function (el) {
        let url = el.attr('src');

        if (utils.isLocatePath(url) && !pth.isAbsolute(url)) {
            let inlinePath = utils.inlinePath(file.origin, url),
                inlineContent = fis.util.read(inlinePath.absolute, true);

            //压缩svg 替换原来的img
            let svg = $(utils.compressHTML(inlineContent));
            if (el.attr('class') !== undefined) svg.attr('class', el.attr('class'));
            el.before(svg).remove();
        }
    });
}

module.exports.html = function (content, file, settings) {
    let $ = cheerio.load(content, {decodeEntities: false});

    htmlInlineHtml(file, $);
    htmlInlineSVG(file, $);

    return $.html();
};