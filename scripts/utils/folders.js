const fs = require("fs-extra");
const path = require("path");
const { getInfo } = require("./info");

/**
 * Resolves a path relative to the workspace root.
 * @param {string} dirPath
 * @returns {string}
 */
const srcPath = dirPath => path.join(process.cwd(), dirPath);

/**
 * Resolves a path inside dist/{name}/.
 * @param {string} [dirPath]
 * @returns {string}
 */
const distPath = (dirPath = "") => {
    const { name } = getInfo();
    return path.join(process.cwd(), "dist", name, dirPath);
};

/**
 * Copies a folder recursively. No-ops silently when source does not exist.
 * @param {string} src
 * @param {string} dest
 */
const copyFolder = async (src, dest) => {
    if (!(await fs.pathExists(src))) {
        return;
    }
    await fs.ensureDir(dest);
    await fs.copy(src, dest, { overwrite: true });
};

/**
 * Moves a folder to a new location (overwriting destination).
 * @param {string} src
 * @param {string} dest
 */
const moveFolder = async (src, dest) => {
    if (!(await fs.pathExists(src))) {
        return;
    }
    await fs.move(src, dest, { overwrite: true });
};

module.exports = { srcPath, distPath, copyFolder, moveFolder };
