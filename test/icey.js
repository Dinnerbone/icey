const expect = require('chai').expect;
const icey = require('../src/icey');

const validParser = {name: 'znc'};
const validCollectors = {test: {}};
const validWriter = {name: 'json', target: 'tmp'};

describe('Icey', () => {
    describe('Config', () => {
        describe('Parser', () => {
            it('parser block is required', () => {
                expect(() => icey({collectors: validCollectors, writer: validWriter})).to.throw('Invalid config: Missing \'parser\'');
            });

            it('parser block must be object', () => {
                expect(() => icey({collectors: validCollectors, writer: validWriter, parser: 5})).to.throw('Invalid config: \'parser\' is invalid (should be an object)');
            });

            it('parser name is required', () => {
                expect(() => icey({collectors: validCollectors, writer: validWriter, parser: {}})).to.throw('Invalid config: Missing \'parser.name\' string');
            });

            it('parser name must be string', () => {
                expect(() => icey({collectors: validCollectors, writer: validWriter, parser: {name: 5}})).to.throw('Invalid config: \'parser.name\' is invalid (should be a string)');
            });
        });

        describe('Writer', () => {
            it('writer block is required', () => {
                expect(() => icey({parser: validParser, collectors: validCollectors})).to.throw('Invalid config: Missing \'writer\'');
            });

            it('writer block must be object', () => {
                expect(() => icey({parser: validParser, collectors: validCollectors, writer: 5})).to.throw('Invalid config: \'writer\' is invalid (should be an object)');
            });

            it('writer name is required', () => {
                expect(() => icey({parser: validParser, collectors: validCollectors, writer: {}})).to.throw('Invalid config: Missing \'writer.name\' string');
            });

            it('writer name must be string', () => {
                expect(() => icey({parser: validParser, collectors: validCollectors, writer: {name: 5}})).to.throw('Invalid config: \'writer.name\' is invalid (should be a string)');
            });
        });

        describe('Collectors', () => {
            it('collectors block is required', () => {
                expect(() => icey({parser: validParser, writer: validWriter})).to.throw('Invalid config: Missing \'collectors\'');
            });

            it('collectors block must be object', () => {
                expect(() => icey({parser: validParser, writer: validWriter, collectors: 5})).to.throw('Invalid config: \'collectors\' is invalid (should be an object)');
            });
        });

        it('config must be an object', () => {
            expect(() => icey(5)).to.throw('Invalid config (must be an object)');
        });
    });
});