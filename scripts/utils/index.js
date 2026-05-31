const { generateZippedFiles } = require('./zipper');
const { getZipName } = require('./zipname');
const { getInfo, parseInfoFile, stringifyInfoFile } = require('./info');
const { srcPath, distPath, copyFolder, moveFolder } = require('./folders');
const { createProgressBar, startProgressBar, stopProgressBar } = require('./progressBar');

module.exports = {
    generateZippedFiles,
    getZipName,
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
};