const fs = require('fs');

describe('Log Parsers', () => {
    const files = fs.readdirSync(`${__dirname}/parsers`);
    files.forEach(file => {
        const match = file.match(/^(.+).js$/);
        if (match) {
            describe(match[1], () => require(`./parsers/${file}`));
        }
    });
});