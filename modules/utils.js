const pth = require('path');

const HTML_FILE_EXTS = /^\.(html|tpl|ejs)$/i;

module.exports = {
    /**
     * 判断文件是否是html文件
     * @param {String} path 文件路径
     * @returns {Boolean}
     */
    isHtmlFile: function (path) {
        return HTML_FILE_EXTS.test(pth.extname(fis.util.query(path).rest));
    },
    /**
     * 判断path是否为本地路径
     * @param {String} path 路径
     * @returns {Boolean}
     */
    isLocatePath: function (path) {
        return path != '' && path !== undefined && !/^(http:|https:|ftp:)?\/\/.*/.test(path) && !/\/\?\?/.test(path) && !/^(tel:|mailto:|javascript:|\#|data:image)/.test(path);
    },
    /**
     * 解析path 获取文件内联链接地址
     * @param {String} path 主文件绝对地址
     * @param {Array} inlinePaths 内联文件相对地址
     * @returns {Object} {
     *  absolute: 内联文件绝对地址,
     *  relative: 内网文件相对于主文件地址
     *  }
     */
    inlinePath: function (path, ...inlinePaths) {
        let absolutePath = fis.util.query(path).rest;
        for (let inlinePath of inlinePaths) {
            absolutePath = pth.resolve(pth.parse(absolutePath).dir, fis.util.query(inlinePath).rest);
        }
        let info = fis.util.query(inlinePaths[inlinePaths.length - 1]);
        return {
            absolute: absolutePath,
            relative: pth.relative(pth.parse(path).dir, absolutePath) + info.query + info.hash,
            qh: info.query + info.hash
        }
    },
    /**
     * 压缩HTML代码
     * @param {String} contents 待处理的阿迪吗
     * @returns {String} 处理后的代码
     */
    compressHTML: function (contents) {
        [/[\n\r\t]+/g, /\s{2,}/g].forEach(function (regexp) {
            contents = contents.replace(regexp, " ");
        });
        contents = contents.replace(/> </g, '><');
        contents = contents.trim();

        return contents;
    }
};