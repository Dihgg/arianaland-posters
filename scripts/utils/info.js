const fs = require("fs-extra");
const path = require("path");

/**
 * Parses a `.info` file into a key-value object.
 * @param {string} content
 * @returns {Record<string, string>}
 */
const parseInfoFile = content =>
    content
        .split(/\r?\n/)
        .filter(Boolean)
        .reduce((acc, line) => {
            const [key, ...rest] = line.split("=");
            acc[key.trim()] = rest.join("=").trim();
            return acc;
        }, {});

/**
 * Serializes an info object back to `.info` file format.
 * @param {Record<string, string | undefined>} info
 * @returns {string}
 */
const stringifyInfoFile = info =>
    Object.entries(info)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

/**
 * Returns mod metadata derived from package.json and src/root/mod.info.
 * @returns {{ id: string, name: string, displayName: string, modInfo: Record<string, string>, version: string, zipname: string }}
 */
const getInfo = () => {
    const { name, version } = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );

    const modInfoPath = path.join(process.cwd(), "src", "root", "mod.info");
    let id = name;
    let displayName = name;
    let modInfo = {};

    if (fs.existsSync(modInfoPath)) {
        modInfo = parseInfoFile(fs.readFileSync(modInfoPath, "utf-8"));
        id = modInfo.id || name;
        displayName = modInfo.name || name;
    }

    return {
        /** mod id from mod.info (e.g. "ArianalandPosters") */
        id,
        /** package.json name, used as the dist folder (e.g. "arianaland-posters") */
        name,
        /** human-readable mod name (e.g. "Arianaland Posters") */
        displayName,
        modInfo,
        version,
        zipname: `${name}-${version}.zip`,
    };
};

module.exports = { getInfo, parseInfoFile, stringifyInfoFile };
