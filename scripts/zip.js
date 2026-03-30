const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const { getZipName } = require('./utils');

async function createZip() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const distModPath = path.join(process.cwd(), 'dist', name);
    const tempDir = path.join(os.tmpdir(), `${name}-temp`);
    const outputZip = getZipName();

    if (!(await fs.pathExists(distModPath))) {
        throw new Error('dist mod folder does not exist. Run npm run build first.');
    }

    await fs.ensureDir(tempDir);
    await fs.copy(distModPath, tempDir, { overwrite: true });

    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.info(`${outputZip} has been created.`);
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();

    await fs.remove(tempDir);
}

createZip().catch(err => {
    console.error('Error preparing zip file:', err);
    process.exitCode = 1;
});
