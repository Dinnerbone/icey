const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const cli = require('../src/cli');

describe('Command Line Interface', () => {
    describe('Config option', () => {
        const oldDir = process.cwd();
        let icey;

        beforeEach(() => {
            icey = sinon.spy();
        });

        afterEach(() => {
            process.chdir(oldDir);
        });

        it('errors on non-existant file', () => {
            expect(() => cli(['not-a-file'], icey)).to.throw('Unable to read config file \'not-a-file\' (does it exist and is it accessible?)');
            expect(icey).to.not.have.been.called;
        });

        it('errors on invalid .json file', () => {
            const path = `${__dirname}/fixtures/configs/syntax_error.json`;
            expect(() => cli([path], icey)).to.throw(`Error trying to read config file '${path}': SyntaxError: Unexpected token O in JSON at position 0`);
            expect(icey).to.not.have.been.called;
        });

        it('loads correct file', () => {
            cli([`${__dirname}/fixtures/configs/dummy.json`], icey);
            expect(icey).to.have.been.calledOnce.and.calledWithExactly({test: true});
        });

        it('loads defaults workdir config', () => {
            process.chdir(`${__dirname}/fixtures/configs/default/`);
            cli([], icey);
            expect(icey).to.have.been.calledOnce.and.calledWithExactly({test: 'testing default config.json resolution'});
        });

        it('errors when default workdir config does not exist', () => {
            process.chdir(`${__dirname}/fixtures/configs/no_default/`);
            expect(() => cli([], icey)).to.throw(`Could not find a config.json in ${process.cwd()}. Please see https://github.com/Dinnerbone/icey/blob/master/README.md for instructions on creating one.`);
            expect(icey).to.not.have.been.called;
        });

        it('errors on multiple args', () => {
            expect(() => cli(['foo', 'bar'], icey)).to.throw('Too many parameters! Usage: [configPath]');
            expect(icey).to.not.have.been.called;
        });
    });
});