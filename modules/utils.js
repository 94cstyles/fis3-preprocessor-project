const pth = require('path');
const fs = require('fs');
const url = require('url');

module.exports = {
    /**
     * 解析路径
     * @param {String} path
     * @returns {*}
     */
    parsePath(path) {
        if (!path) {
            return {
                protocol: null,
                slashes: null,
                auth: null,
                host: null,
                port: null,
                hostname: null,
                hash: '',
                search: '',
                query: '',
                pathname: '',
                path: '',
                href: '',
                rest: '',
                isLocalPath: false
            }
        } else {
            let info = url.parse(path),
                rest = Object.assign({}, info);

            rest.search = '';
            rest.query = '';
            if (info.pathname != null) rest.hash = '';
            info.rest = url.format(rest);
            //判断路径是否是本地路径
            info.isLocalPath = !/^(https?|ws):\/\//.test(info.rest) && !/^#/.test(info.rest) && !/^(tel|mailto|javascript|data):/.test(info.rest) && (pth.isAbsolute(info.rest) || info.protocol == null);
            return info;
        }
    },
    /**
     * 解析path 获取文件内联链接地址
     * @param {String} path 主文件绝对地址
     * @param {String} inlinePath 内联文件相对地址或者绝对地址
     * @returns {Object} {
     *  absolute: 内联文件绝对地址,
     *  relative: 内网文件相对于主文件地址
     *  }
     */
    inlinePath(path, inlinePath) {
        let info = this.parsePath(inlinePath),
            result = null;

        if (info.isLocalPath) {
            if (pth.isAbsolute(inlinePath)) {
                result = {
                    origin: pth.join(process.cwd(), info.pathname),
                    absolute: info.pathname
                };
            } else {
                result = {
                    origin: pth.join(pth.dirname(path), info.pathname),
                    absolute: `/${pth.relative(process.cwd(), pth.join(pth.dirname(path), info.pathname))}`
                };
            }

            if (!fs.existsSync(result.origin)) throw result.origin + '：文件不存在！';
        } else if (/^#/.test(inlinePath)) {
            result = {
                origin: '',
                absolute: ''
            };
        } else {
            result = {
                origin: info.rest,
                absolute: info.rest
            };
        }

        result.search = info.search || '';
        result.query = info.query || '';
        result.hash = info.hash || '';
        return result;
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