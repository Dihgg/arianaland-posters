const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const { getInfo, distPath, copyFolder } = require('./utils');

async function createZip() {
    const { name, zipname } = getInfo();
    const dist = distPath();

    if (!(await fs.pathExists(dist))) {
        console.error('Error: dist folder does not exist. Run npm run build first.');
        process.exitCode = 1;
        return;
    }

    const tempDir = path.join(os.tmpdir(), `${name}-temp`);
    await fs.ensureDir(tempDir);
    await copyFolder(dist, tempDir);

    const output = fs.createWriteStream(zipname);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.info(`Zip file created successfully: ${zipname}`);
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
