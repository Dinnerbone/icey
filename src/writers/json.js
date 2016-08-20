const path = require('path');
const fs = require('mz/fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Writer = require('../writer');

const mkdirs = dir => new Promise((resolve, reject) => {
    mkdirp(dir, err => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

module.exports = class JsonFileWriter extends Writer {
    constructor(config) {
        super();
        if (config === undefined) throw new Error('Config object is required');
        if (config.target === undefined) throw new Error('Invalid config: \'target\' is required (path to write files)');

        this.dir = config.target;
        this.spacing = config.spacing || '';
        this.cleaned = false;
    }

    write(name, data) {
        const file = path.join(this.dir, `${name}.json`);
        const parent = path.dirname(file);
        const clean = this.cleaned ? Promise.resolve() : this.clean();

        return clean
            .then(() => mkdirs(parent))
            .then(() => fs.writeFile(file, JSON.stringify(data, null, this.spacing)));
    }

    clean() {
        this.cleaned = true;
        return new Promise((resolve, reject) => {
            rimraf(path.join(this.dir, '*'), {}, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};