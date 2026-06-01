const path = require("path");
const fs = require("fs-extra");
const {
	srcPath,
	distPath,
	copyFolder,
	moveFolder,
	getInfo,
	translationsBuild42,
	translationsBuild41
} = require("./utils");

const run = async () => {
	try {
		const { id } = getInfo();

		// Move the built mod from dist/id to dist/Name
		const generatedDistPath = path.join(process.cwd(), "dist", id);
		if (generatedDistPath !== distPath()) {
			await moveFolder(generatedDistPath, distPath());
		} else {
			console.warn(`Generated dist path ${generatedDistPath} is the same as target dist path ${distPath()}. Skipping move to avoid overwriting source.`);
		}

		// Copy root assets to both dist/Name and dist/Name/42
		await copyFolder(srcPath("src/root"), distPath());
		await copyFolder(srcPath("src/root"), distPath("42"));

		// Copy mod.info to dist/Name/mod.info to dist/Name/42/mod.info
		await fs.copy(distPath("mod.info"), distPath("42/mod.info"));

		
		// Copy common media
		await copyFolder(srcPath("src/media"), distPath("media"));
		await copyFolder(srcPath("src/media"), distPath("42/media"));
		// Copy build 42 media
		await copyFolder(srcPath("src/42"), distPath("42/media"));
		// Copy build 41 media
		await copyFolder(srcPath("src/41"), distPath("media"));

		// Handle build 42 translations
		await translationsBuild42(distPath("42/media/lua/shared/Translate"));

		// Handle build 41 translations
		await translationsBuild41(distPath("media/lua/shared/Translate"));

	} catch (err) {
		console.error("Error copying files:", err);
		process.exit(1);
	}
};

run();
