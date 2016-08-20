const fs = require('fs');

describe('Result Writers', () => {
    const files = fs.readdirSync(`${__dirname}/writers`);
    files.forEach(file => {
        const path = `./writers/${file}`;
        const stats = fs.statSync(`${__dirname}/${path}`);
        if (stats.isFile()) {
            const match = file.match(/^(.+).js$/);
            if (match) {
                describe(match[1], () => require(path));
            }
        } else if (stats.isDirectory()) {
            describe(file, () => require(`${path}/index.js`));
        }
    });
});