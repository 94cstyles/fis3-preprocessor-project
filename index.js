const compile = require('./modules/compile');

module.exports = function (content, file, settings) {

    if (/^\.(html|tpl|ejs|js|css)$/i.test(file.rExt)) {
        content = compile.dev(content, settings);
    }

    if (/^\.(html|tpl|ejs)$/i.test(file.rExt)) {
        content = compile.extHTML(content, file);
    }
    return content;
};