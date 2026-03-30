const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const { getZipName } = require('./utils');

async function prepareSteamZip() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const tempPath = path.join(os.tmpdir(), `${name}-temp`);
    const workshopRoot = path.join(tempPath, 'contents', 'mods');
    const distPath = path.join(process.cwd(), 'dist');
    const outputZip = getZipName().replace('.zip', '-steam.zip');

    if (!(await fs.pathExists(distPath))) {
        throw new Error('dist folder does not exist. Run npm run build first.');
    }

    await fs.ensureDir(workshopRoot);

    // Copy workshop metadata files to the steam package root.
    const contentsSource = path.join(process.cwd(), 'contents');
    if (await fs.pathExists(contentsSource)) {
        await fs.copy(contentsSource, tempPath, { overwrite: true });
    }

    // Copy built mod output to the workshop mods directory.
    await fs.copy(distPath, workshopRoot, { overwrite: true });

    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.info(`${outputZip} has been created.`);
    });

    archive.pipe(output);
    archive.directory(tempPath, name);
    await archive.finalize();

    await fs.remove(tempPath);
}

prepareSteamZip().catch(err => {
    console.error('Error preparing Steam zip file:', err);
    process.exitCode = 1;
});