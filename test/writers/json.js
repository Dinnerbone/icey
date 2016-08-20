const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const path = require('path');
const rimraf = require('rimraf');
const fs = require('mz/fs');
const JsonFileWriter = require('../../src/writers/json');

const getFileType = name => {
    let stats = null;
    try {
        stats = fs.statSync(name);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (stats === null) return '(Does not exist)';
    if (stats.isFile()) return 'File';
    if (stats.isDirectory()) return 'Directory';
    if (stats.isBlockDevice()) return 'BlockDevice';
    if (stats.isCharacterDevice()) return 'CharacterDevice';
    if (stats.isFIFO()) return 'FIFO';
    if (stats.isSocket()) return 'Socket';
    return 'Unknown';
};
const assertFileType = (name, expected) => {
    chai.assert.equal(getFileType(name), expected, `for path ${name}`);
};

const dir = path.join(__dirname, 'json_temp');

afterEach(done => rimraf(dir, {glob: false}, done));

describe('#constructor(config)', () => {
    it('requires a config', () => {
        expect(() => new JsonFileWriter()).to.throw('Config object is required');
    });

    it('requires config to have target', () => {
        expect(() => new JsonFileWriter({})).to.throw('Invalid config: \'target\' is required');
    });
});

describe('#write(name, data)', () => {
    it('makes sure directories exist', () => {
        const writer = new JsonFileWriter({target: dir});
        return writer.write('nested/directory/file', {hello: 'world'})
            .then(() => {
                assertFileType(dir, 'Directory');
                assertFileType(path.join(dir, 'nested'), 'Directory');
                assertFileType(path.join(dir, 'nested', 'directory'), 'Directory');
                assertFileType(path.join(dir, 'nested', 'directory', 'file.json'), 'File');
            })
            .then(() => fs.readFile(path.join(dir, 'nested', 'directory', 'file.json'), 'utf8'))
            .then(json => {
                expect(json).to.equal('{"hello":"world"}');
            });
    });

    it('prints with configured spacing', () => {
        const writer = new JsonFileWriter({target: dir, spacing: '    '});
        return writer.write('file', {hello: 'world'})
            .then(() => fs.readFile(path.join(dir, 'file.json'), 'utf8'))
            .then(json => {
                expect(json).to.equal('{\n    "hello": "world"\n}');
            });
    });

    it('first write calls clean, second does not', () => {
        const writer = new JsonFileWriter({target: dir});
        const clean = sinon.spy(writer, 'clean');
        return writer.write('file', {hello: 'world'})
            .then(() => {
                expect(clean).to.be.calledOnce;
                clean.reset();
            })
            .then(() => writer.write('file2', {hello: 'space'}))
            .then(() => {
                expect(clean).to.not.be.called;
            });
    });
});

describe('#clean()', () => {
    beforeEach(
              () => fs.mkdir(dir)
        .then(() => fs.mkdir(path.join(dir, 'dir')))
        .then(() => fs.mkdir(path.join(dir, 'other_dir')))
        .then(() => fs.writeFile(path.join(dir, 'dir', 'nested_file.json'), ''))
        .then(() => fs.writeFile(path.join(dir, 'file.json'), ''))
    );

    it('deletes dir contents', () => {
        const writer = new JsonFileWriter({target: dir});
        return writer.clean()
            .then(() => {
                assertFileType(dir, 'Directory');
            })
            .then(() => fs.readdir(dir))
            .then(files => expect(files).to.be.empty);
    });
});