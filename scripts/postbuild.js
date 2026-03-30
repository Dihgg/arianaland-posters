const fs = require('fs-extra');
const path = require('path');
const { generateTranslations } = require('./utils/translations');

const ROOT = process.cwd();
const packageJsonPath = path.join(ROOT, 'package.json');
const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const distModRoot = path.join(ROOT, 'dist', name);
const build42Root = path.join(distModRoot, '42');
const build42MediaOverlaySource = path.join(ROOT, 'src', 'media', '42');
const translationsSource = path.join(ROOT, 'src', 'translations');

const parseInfoFile = content =>
    content
        .split(/\r?\n/)
        .filter(Boolean)
        .reduce((acc, line) => {
            const [key, ...rest] = line.split('=');
            acc[key.trim()] = rest.join('=').trim();
            return acc;
        }, {});

const stringifyInfoFile = info =>
    Object.entries(info)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

const build42InfoFromBase = rawInfo => {
    const parsed = parseInfoFile(rawInfo);
    return stringifyInfoFile({
        ...parsed,
        version: '42'
    });
};

const run = async () => {
    const rootSource = path.join(ROOT, 'src', 'root');
    const mediaSource = path.join(ROOT, 'src', 'media');
    const legacyMediaSource = path.join(ROOT, 'media');
    const rootModInfoSource = path.join(rootSource, 'mod.info');
    const legacyModInfoSource = path.join(ROOT, 'mod.info');
    const modInfoSource = (await fs.pathExists(rootModInfoSource)) ? rootModInfoSource : legacyModInfoSource;
    const posterSource = path.join(ROOT, 'poster.png');
    const logoSource = path.join(ROOT, 'logo.png');

    await fs.ensureDir(distModRoot);

    // Copy top-level distributable files from src/root when present.
    if (await fs.pathExists(rootSource)) {
        await fs.copy(rootSource, distModRoot, { overwrite: true });
    }

    if (await fs.pathExists(mediaSource)) {
        await fs.copy(mediaSource, path.join(distModRoot, 'media'), { overwrite: true });
    } else if (await fs.pathExists(legacyMediaSource)) {
        await fs.copy(legacyMediaSource, path.join(distModRoot, 'media'), { overwrite: true });
    }

    if (await fs.pathExists(modInfoSource)) {
        await fs.copy(modInfoSource, path.join(distModRoot, 'mod.info'));
    }

    if (await fs.pathExists(posterSource)) {
        await fs.copy(posterSource, path.join(distModRoot, 'poster.png'));
    }

    if (await fs.pathExists(logoSource)) {
        await fs.copy(logoSource, path.join(distModRoot, 'logo.png'));
    }

    // Build 42 override folder keeps the same content with a versioned mod.info.
    await fs.ensureDir(build42Root);

    if (await fs.pathExists(path.join(distModRoot, 'media'))) {
        await fs.copy(path.join(distModRoot, 'media'), path.join(build42Root, 'media'), { overwrite: true });
    }

    // Optional Build 42-only media overrides (e.g., craftRecipe syntax).
    if (await fs.pathExists(build42MediaOverlaySource)) {
        await fs.copy(build42MediaOverlaySource, path.join(build42Root, 'media'), { overwrite: true });
    }

    if (await fs.pathExists(path.join(distModRoot, 'poster.png'))) {
        await fs.copy(path.join(distModRoot, 'poster.png'), path.join(build42Root, 'poster.png'));
    }

    if (await fs.pathExists(path.join(distModRoot, 'logo.png'))) {
        await fs.copy(path.join(distModRoot, 'logo.png'), path.join(build42Root, 'logo.png'));
    }

    if (await fs.pathExists(path.join(distModRoot, 'mod.info'))) {
        const modInfoRaw = await fs.readFile(path.join(distModRoot, 'mod.info'), 'utf8');
        await fs.writeFile(path.join(build42Root, 'mod.info'), build42InfoFromBase(modInfoRaw));
    }

    const translationsResult = await generateTranslations({
        sourceRoot: translationsSource,
        build41TranslateRoot: path.join(distModRoot, 'media', 'lua', 'shared', 'Translate'),
        build42TranslateRoot: path.join(build42Root, 'media', 'lua', 'shared', 'Translate')
    });

    if (translationsResult.generated) {
        console.info(
            `Translations generated (41 txt: ${translationsResult.build41FileCount}, 42 json: ${translationsResult.build42FileCount}).`
        );
    }

    console.info(`Build completed at ${path.join('dist', name)}`);
};

run().catch(err => {
    console.error('Error preparing build files:', err);
    process.exitCode = 1;
});