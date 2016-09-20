const utils = require('./modules/utils');
const compile = require('./modules/compile');

module.exports = function (content, file, settings) {
    if (utils.isHtmlFile(file.origin)) {
        content = compile.html(content, file, settings);
    }
    return content;
};