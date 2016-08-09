const fs = require('fs');

describe('Stat Collectors', () => {
    const files = fs.readdirSync(`${__dirname}/collectors`);
    files.forEach(file => {
        const path = `./collectors/${file}`;
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