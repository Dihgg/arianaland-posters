const fs = require('fs-extra');
const path = require('path');

const collectJsonFiles = async dirPath => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectJsonFiles(fullPath)));
            continue;
        }

        if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.json') {
            files.push(fullPath);
        }
    }

    return files;
};

const loadTranslationSource = async sourceRoot => {
    if (!(await fs.pathExists(sourceRoot))) {
        return {};
    }

    const jsonFiles = await collectJsonFiles(sourceRoot);
    const source = {};

    for (const filePath of jsonFiles) {
        const locale = path.basename(path.dirname(filePath));
        const namespace = path.basename(filePath, '.json');
        const content = await fs.readJson(filePath);

        if (!content || typeof content !== 'object' || Array.isArray(content)) {
            throw new Error(`Invalid translation file format: ${filePath}`);
        }

        for (const [key, value] of Object.entries(content)) {
            if (typeof value !== 'string') {
                throw new Error(`Invalid translation value for key '${key}' in ${filePath}. Values must be strings.`);
            }
        }

        if (!source[locale]) {
            source[locale] = {};
        }

        source[locale][namespace] = content;
    }

    return source;
};

const escapeLegacyValue = value => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const toBuild41Key = (namespace, key) => {
    if (namespace === 'Recipes') {
        return `Recipe_${key}`;
    }

    if (namespace === 'ItemName') {
        return `ItemName_${key}`;
    }

    return key;
};

const writeBuild41Translations = async ({ source, build41TranslateRoot }) => {
    let fileCount = 0;

    for (const [locale, namespaces] of Object.entries(source)) {
        for (const [namespace, entries] of Object.entries(namespaces)) {
            const tableName = `${namespace}_${locale}`;
            const lines = Object.entries(entries).map(([key, value]) => {
                const outKey = toBuild41Key(namespace, key);
                return `    ${outKey} = \"${escapeLegacyValue(value)}\",`;
            });

            const content = `${tableName} = {\n\n${lines.join('\n')}\n\n}\n`;
            const outputPath = path.join(build41TranslateRoot, locale, `${namespace}_${locale}.txt`);

            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, content, 'utf8');
            fileCount += 1;
        }
    }

    return fileCount;
};

const writeBuild42Translations = async ({ source, build42TranslateRoot }) => {
    let fileCount = 0;

    for (const [locale, namespaces] of Object.entries(source)) {
        for (const [namespace, entries] of Object.entries(namespaces)) {
            const outputPath = path.join(build42TranslateRoot, locale, `${namespace}.json`);
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeJson(outputPath, entries, { spaces: 2 });
            fileCount += 1;
        }
    }

    return fileCount;
};

const generateTranslations = async ({ sourceRoot, build41TranslateRoot, build42TranslateRoot }) => {
    const source = await loadTranslationSource(sourceRoot);
    const locales = Object.keys(source);

    if (locales.length === 0) {
        return {
            generated: false,
            build41FileCount: 0,
            build42FileCount: 0
        };
    }

    const build41FileCount = await writeBuild41Translations({ source, build41TranslateRoot });
    const build42FileCount = await writeBuild42Translations({ source, build42TranslateRoot });

    return {
        generated: true,
        build41FileCount,
        build42FileCount
    };
};

module.exports = {
    generateTranslations
};
