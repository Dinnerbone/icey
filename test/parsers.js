const fs = require('fs');

describe('Log Parsers', () => {
    const files = fs.readdirSync(`${__dirname}/parsers`);
    files.forEach(file => {
        const path = `./parsers/${file}`;
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