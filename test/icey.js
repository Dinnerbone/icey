const expect = require('chai').expect;
const icey = require('../src/icey');

const validParser = {name: 'znc'};
const validCollectors = {test: {}};

describe('Icey', () => {
    describe('Config', () => {
        describe('Parser', () => {
            it('parser block is required', () => {
                expect(() => icey({collectors: validCollectors})).to.throw('Invalid config: Missing \'parser\'');
            });

            it('parser block must be object', () => {
                expect(() => icey({collectors: validCollectors, parser: 5})).to.throw('Invalid config: \'parser\' is invalid (should be an object)');
            });

            it('parser name is required', () => {
                expect(() => icey({collectors: validCollectors, parser: {}})).to.throw('Invalid config: Missing \'parser.name\' string');
            });

            it('parser name must be string', () => {
                expect(() => icey({collectors: validCollectors, parser: {name: 5}})).to.throw('Invalid config: \'parser.name\' is invalid (should be a string)');
            });
        });

        describe('Collectors', () => {
            it('collectors block is required', () => {
                expect(() => icey({parser: validParser})).to.throw('Invalid config: Missing \'collectors\'');
            });

            it('collectors block must be object', () => {
                expect(() => icey({parser: validParser, collectors: 5})).to.throw('Invalid config: \'collectors\' is invalid (should be an object)');
            });
        });

        it('config must be an object', () => {
            expect(() => icey(5)).to.throw('Invalid config (must be an object)');
        });
    });
});