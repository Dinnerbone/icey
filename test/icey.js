const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const icey = require('../src/icey');
const Collector = require('../src/collector.js');

describe('Icey', () => {
    describe('Config', () => {
        describe('Parser', () => {
            it('parser block is required', () => {
                expect(() => icey({})).to.throw('Invalid config: Missing \'parser\'');
            });

            it('parser block must be object or function', () => {
                expect(() => icey({parser: 5})).to.throw('Invalid config: \'parser\' is invalid (should be an object or function)');
            });

            it('parser name is required', () => {
                expect(() => icey({parser: {}})).to.throw('Invalid config: Missing \'parser.name\' string');
            });

            it('parser name must be string', () => {
                expect(() => icey({parser: {name: 5}})).to.throw('Invalid config: \'parser.name\' is invalid (should be a string)');
            });
        });

        it('config must be an object', () => {
            expect(() => icey(5)).to.throw('Invalid config (must be an object)');
        });
    });

    describe('Parser', () => {
        describe('By name', () => {
            let parserSpy;

            beforeEach(() => {
                parserSpy = sinon.spy();
                icey.parsers.__spy = parserSpy;
            });

            afterEach(() => {
                delete icey.parsers.__spy;
            });

            it('is given collector and config', () => {
                const config = {name: '__spy', foo: 'bar'};
                icey({parser: config});
                expect(parserSpy).to.have.been.calledOnce.and.calledWithExactly(sinon.match.instanceOf(Collector), config);
            });

            it('errors when unknown', () => {
                expect(() => icey({parser: {name: '__unknown'}})).to.throw('Invalid config: unknown parser \'__unknown\'');
            });
        });

        describe('As function', () => {
            it('is called with a collector', () => {
                const parser = sinon.spy();
                icey({parser});
                expect(parser).to.have.been.calledOnce.and.calledWithExactly(sinon.match.instanceOf(Collector));
            });
        });
    });
});