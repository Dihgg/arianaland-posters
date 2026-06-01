const fs = require("fs-extra");
const path = require("path");
const { srcPath } = require("./folders");

/**
 * Copy EN translations from src/translations-json/LOCALE to the Build 42 output folder, ensuring the directory structure is correct.
 * @param {string} outputPath the path to the output directory for translations (e.g., 42/media/lua/shared/Translate/LOCALE)
 * @param {string} locale the locale to copy (default: "EN")
 */
const translationsBuild42 = async (outputPath, locale = "EN") => {
	const sourceDir = srcPath(`src/translations-json/${locale}`);
	if (!(await fs.pathExists(sourceDir))) {
		console.info(`No src/translations-json/${locale} found; skipping translations.`);
		return;
	}
	await fs.ensureDir(path.join(outputPath, locale));
	const translationFiles = await fs.readdir(sourceDir);
	for (const file of translationFiles) {
		const json = await fs.readJSON(path.join(sourceDir, file));
		const sortedTranslations = new Map(Object.entries(json).sort());
		await fs.writeJson(path.join(outputPath, locale, file), Object.fromEntries(sortedTranslations), { spaces: 4 });
	}
	console.info(`${locale} Translations copied successfully.`);
}


const translationsBuild41 = async (outputPath, locale = "EN", sourceDir = undefined) => {
	sourceDir = sourceDir ?? srcPath(`src/translations-json/${locale}`);
	if (!(await fs.pathExists(sourceDir))) {
		console.info(`No src/translations-json/${locale} found; skipping translations.`);
		return;
	}
	await fs.ensureDir(path.join(outputPath, locale));
	const translationFiles = await fs.readdir(sourceDir);
	for (const file of translationFiles) {
		const json = await fs.readJSON(path.join(sourceDir, file));
		const sortedTranslations = new Map(Object.entries(json).sort());

		// Extract the filename without extension to use as the table name prefix
		const baseName = path.basename(file, path.extname(file));
		const tableName = `${baseName}_${locale}`;

		// Transform the json into the Build 41 Lua translation table format:
		// TableName_LOCALE = {\n\n    TableName_key = "value",\n\n}
		const entries = [...sortedTranslations.entries()]
			.map(([key, value]) => `    ${baseName}_${key} = "${value}",`)
			.join("\n");
		const content = `${tableName} = {\n\n${entries}\n\n}\n`;

		// Save to outputPath/locale/FileName_LOCALE.txt
		await fs.writeFile(path.join(outputPath, locale, `${tableName}.txt`), content, "utf8");
	}
	console.info(`${locale} Build 41 translations copied successfully.`);
};

module.exports = {
    translationsBuild42,
    translationsBuild41,
};