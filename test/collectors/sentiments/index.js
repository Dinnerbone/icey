const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const SentimentCollector = require('../../../src/collectors/sentiments');
const moment = require('moment');
const path = require('path');

const validLexicon = path.join(__dirname, 'fixtures', 'valid_lexicon.txt');

describe('Collects events', () => {
    const time = moment();
    let collector;
    let increment;

    beforeEach(() => {
        collector = new SentimentCollector({lexicon: validLexicon});
        increment = sinon.spy(collector, 'increment');
    });

    it('#onAction(time, nick, action)', () => {
        collector.onAction(time, 'Dinnerbone', 'Hello world!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'Hello world!');
    });

    it('#onMessage(time, nick, message)', () => {
        collector.onMessage(time, 'Dinnerbone', 'Hello world!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'Hello world!');
    });

    it('#onNotice(time, nick, message)', () => {
        // Notices will be treated as messages, as I don't think they're used in a channel context enough
        // to justify their own counter.
        collector.onNotice(time, 'Dinnerbone', 'Senpai!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'Senpai!');
    });
});

describe('#constructor(config)', () => {
    it('requires a config', () => {
        expect(() => new SentimentCollector()).to.throw('Config object is required');
    });

    it('requires config to have lexicon', () => {
        expect(() => new SentimentCollector({})).to.throw('Invalid config: \'lexicon\' is required');
    });

    it('loads the lexicon', () => {
        const loadLexicon = sinon.spy(SentimentCollector.prototype, 'loadLexicon');
        try {
            new SentimentCollector({lexicon: validLexicon});
            expect(loadLexicon).to.be.calledOnce.and.calledWithExactly(validLexicon);
        } finally {
            loadLexicon.restore();
        }
    });
});

describe('#loadLexicon(file)', () => {
    it('throws an error if nothing was read', () => {
        expect(() => new SentimentCollector({lexicon: path.join(__dirname, 'fixtures', 'empty_lexicon.txt')})).to.throw('Invalid lexicon: no valid lines found, is it the right format?');
    });

    it('parses only valid lines', () => {
        const collector = new SentimentCollector({lexicon: validLexicon});
        expect(collector.lexicon).to.deep.equal({
            hug: {
                sentiment: 1,
                joy: 1,
            },
            haunt: {
                sentiment: -1,
                fear: 1,
            },
            intruder: {
                sentiment: -1,
                fear: 1,
                anger: 1,
            },
        });
    });
});

describe('#getWord(word)', () => {
    let collector;
    beforeEach(() => collector = new SentimentCollector({lexicon: validLexicon}));

    it('returns score for known word', () => {
        expect(collector.getWord('hug')).to.deep.equal({
            sentiment: 1,
            joy: 1,
        });
    });

    it('returns null for unknown word', () => {
        expect(collector.getWord('unknown')).to.be.null;
    });

    it('returns score for known singular form of unknown word', () => {
        expect(collector.getWord('hugs')).to.deep.equal({
            sentiment: 1,
            joy: 1,
        });
    });
});

describe('#getWords(message)', () => {
    let collector;
    let getWord;

    beforeEach(() => {
        collector = new SentimentCollector({lexicon: validLexicon});
        getWord = sinon.spy(collector, 'getWord');
    });

    it('returns empty array for empty message', () => {
        expect(collector.getWords('')).to.deep.equal([]);
    });

    it('returns empty array for unknown message', () => {
        expect(collector.getWords('This is full of unknown words!')).to.deep.equal([]);
    });

    it('checks all words after normalization', () => {
        expect(collector.getWords('Let\'s hug! :)')).to.deep.equal([
            {
                sentiment: 1,
                joy: 1,
            },
        ]);
        expect(getWord).to.be.calledTwice;
        expect(getWord).to.be.calledWithExactly('lets');
        expect(getWord).to.be.calledWithExactly('hug');
    });
});

describe('#combineScore(words)', () => {
    let collector;
    beforeEach(() => collector = new SentimentCollector({lexicon: validLexicon}));

    it('returns null for empty array', () => {
        expect(collector.combineScore([])).to.be.null;
    });

    it('returns first value for single-entry array', () => {
        expect(collector.combineScore([{sentiment: 1, joy: 1}])).to.deep.equal({sentiment: 1, joy: 1});
    });

    it('returns averaged value for big array', () => {
        expect(collector.combineScore([
            {sentiment: 1, joy: 1},
            {sentiment: -1, fear: 1},
            {sentiment: -1, fear: 1, anger: 1},
        ])).to.deep.equal({sentiment: -1 / 3, joy: 1 / 3, fear: 2 / 3, anger: 1 / 3});
    });
});

describe('#increment(time, message)', () => {
    let collector;
    beforeEach(() => collector = new SentimentCollector({lexicon: validLexicon}));

    it('increments scores', () => {
        collector.increment(moment.utc('2005-08-09T11:13:14Z'), 'hugs Dinnerbone');
        collector.increment(moment.utc('2005-08-09T11:05:01Z'), 'Oh no, an intruder!');
        collector.increment(moment.utc('2015-08-09T10:05:01Z'), 'Ten years have passed... I will haunt you!');

        expect(collector.months).to.deep.equal({
            '2005-08': [
                {sentiment: 1, joy: 1},
                {sentiment: -1, fear: 1, anger: 1},
            ],
            '2015-08': [
                {sentiment: -1, fear: 1},
            ],
        });
    });
});

describe('#save(write)', () => {
    let collector;
    beforeEach(() => collector = new SentimentCollector({lexicon: validLexicon}));

    it('merges scores', () => {
        const write = sinon.stub().returns(Promise.resolve());
        collector.increment(moment.utc('2005-08-09T11:13:14Z'), 'hugs Dinnerbone');
        collector.increment(moment.utc('2005-08-09T11:05:01Z'), 'Oh no, an intruder!');
        collector.increment(moment.utc('2015-08-09T10:05:01Z'), 'Ten years have passed... I will haunt you!');
        return collector.save(write)
            .then(() => {
                expect(write).to.be.calledOnce.and.calledWithExactly('sentiments/months', {
                    '2005-08': {
                        sentiment: 0,
                        joy: 0.5,
                        fear: 0.5,
                        anger: 0.5,
                    },
                    '2015-08': {
                        sentiment: -1,
                        fear: 1,
                    },
                });
            });
    });
});