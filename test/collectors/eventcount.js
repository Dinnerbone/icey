const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const EventCountCollector = require('../../src/collectors/eventcount');
const moment = require('moment');

describe('Collects events', () => {
    const time = moment();
    let collector;
    let increment;

    beforeEach(() => {
        collector = new EventCountCollector();
        increment = sinon.spy(collector, 'increment');
    });

    it('#onAction(time, nick, action)', () => {
        collector.onAction(time, 'Dinnerbone', 'Hello world!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'action', 'Dinnerbone');
    });

    it('#onMessage(time, nick, message)', () => {
        collector.onMessage(time, 'Dinnerbone', 'Hello world!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'message', 'Dinnerbone');
    });

    it('#onKick(time, nick, victim, message)', () => {
        collector.onKick(time, 'Dinnerbone', 'Djinnibone', 'Get out!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'kick', 'Dinnerbone');
    });

    it('#onMode(time, nick, mode)', () => {
        collector.onMode(time, 'Dinnerbone', '+b *');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'mode', 'Dinnerbone');
    });

    it('#onNotice(time, nick, message)', () => {
        // Notices will be treated as messages, as I don't think they're used in a channel context enough
        // to justify their own counter.
        collector.onNotice(time, 'Dinnerbone', 'Senpai!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'message', 'Dinnerbone');
    });

    it('#onTopic(time, nick, topic)', () => {
        collector.onTopic(time, 'Dinnerbone', 'Hot topic!');
        expect(increment).to.have.been.calledOnce.and.calledWithExactly(time, 'topic', 'Dinnerbone');
    });
});

describe('#increment(time, event, nick)', () => {
    let collector;

    beforeEach(() => {
        collector = new EventCountCollector();
    });

    it('increments counters', () => {
        for (let i = 0; i < 5; i++) collector.increment(moment.utc('2005-05-15T12:13:14Z'), 'message', 'Dinnerbone');
        for (let i = 0; i < 10; i++) collector.increment(moment.utc('2005-05-15T12:13:14Z'), 'message', 'Djinnibone');
        for (let i = 0; i < 3; i++) collector.increment(moment.utc('2005-08-09T00:13:14Z'), 'action', 'Dinnerbone');
        for (let i = 0; i < 3; i++) collector.increment(moment.utc('2005-08-09T11:13:14Z'), 'message', 'Dinnerbone');
        expect(collector.days).deep.equals({
            total: {
                '2005-05-15': {
                    message: 15,
                },
                '2005-08-09': {
                    message: 3,
                    action: 3,
                },
            },
            nicks: {
                Dinnerbone: {
                    '2005-05-15': {
                        message: 5,
                    },
                    '2005-08-09': {
                        action: 3,
                        message: 3,
                    },
                },
                Djinnibone: {
                    '2005-05-15': {
                        message: 10,
                    },
                },
            },
        });
        expect(collector.hours).deep.equals({
            total: {
                '0': {
                    action: 3,
                },
                '11': {
                    message: 3,
                },
                '12': {
                    message: 15,
                },
            },
            nicks: {
                Dinnerbone: {
                    '0': {
                        action: 3,
                    },
                    '11': {
                        message: 3,
                    },
                    '12': {
                        message: 5,
                    },
                },
                Djinnibone: {
                    '12': {
                        message: 10,
                    },
                },
            },
        });
    });
});

describe('#save(writeFile)', () => {
    it('saves to file', () => {
        const collector = new EventCountCollector();
        const writeFile = sinon.stub().returns(Promise.resolve());
        collector.increment(moment.utc('2005-05-15T12:13:14Z'), 'message', 'Dinnerbone');
        return collector.save(writeFile)
            .then(() => {
                expect(writeFile).to.be.calledTwice;
                expect(writeFile).to.be.calledWithExactly('eventcount/days', {
                    '2005-05-15': {
                        message: 1,
                    },
                });
                expect(writeFile).to.be.calledWithExactly('eventcount/hours', {
                    '12': {
                        message: 1,
                    },
                });
            });
    });
});