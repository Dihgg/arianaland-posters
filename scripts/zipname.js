const { getInfo } = require("./utils");

const getZipName = () => {
    const { name, version } = getInfo();
    return `${name}-${version}.zip`;
}

console.log(getZipName());