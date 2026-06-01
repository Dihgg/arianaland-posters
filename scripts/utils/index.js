const { getInfo, parseInfoFile, stringifyInfoFile } = require('./info');
const { srcPath, distPath, copyFolder, moveFolder } = require('./folders');
const { createProgressBar, startProgressBar, stopProgressBar } = require('./progressBar');
const { markdownToBbcode, extractFrontMatterData } = require('./markdown');
const { translationsBuild42, translationsBuild41 } = require('./translations');

module.exports = {
    getInfo,
    parseInfoFile,
    stringifyInfoFile,
    srcPath,
    distPath,
    copyFolder,
    moveFolder,
    createProgressBar,
    startProgressBar,
    stopProgressBar,
    markdownToBbcode,
    extractFrontMatterData,
    translationsBuild42,
    translationsBuild41,
};