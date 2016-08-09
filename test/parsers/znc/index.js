const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const ZncParser = require('../../../src/parsers/znc');
const Counter = require('../../../src/counter');
const moment = require('momentjs');

describe('Parsing a line', () => {
    let counter;
    let parser;

    beforeEach(() => {
        counter = new Counter();
        parser = new ZncParser(counter);
    });

    describe('Parsing a message', () => {
        it('Ordinary message', () => {
            const onMessage = sinon.spy(counter, 'onMessage');
            parser.parseLine('2001-01-01', '[01:23:45] <Dinnerbone> Hello world! :)');
            expect(onMessage).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Hello world! :)');
        });

        it('Empty message', () => {
            const onMessage = sinon.spy(counter, 'onMessage');
            parser.parseLine('2001-01-01', '[01:23:45] <Dinnerbone>  ');
            expect(onMessage).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', ' ');
        });
    });

    describe('Parsing an action', () => {
        it('Ordinary action', () => {
            const onAction = sinon.spy(counter, 'onAction');
            parser.parseLine('2001-01-01', '[01:23:45] * Dinnerbone does an action');
            expect(onAction).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'does an action');
        });

        it('Empty action', () => {
            const onAction = sinon.spy(counter, 'onAction');
            parser.parseLine('2001-01-01', '[01:23:45] * Dinnerbone ');
            expect(onAction).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '');
        });
    });

    it('Parsing a join', () => {
        const onJoin = sinon.spy(counter, 'onJoin');
        parser.parseLine('2001-01-01', '[01:23:45] *** Joins: Dinnerbone (dinnerbone@dinnerbone.com)');
        expect(onJoin).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone');
    });

    describe('Parsing a kick', () => {
        it('Ordinary kick', () => {
            const onKick = sinon.spy(counter, 'onKick');
            parser.parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone (You suck!)');
            expect(onKick).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Troll', 'You suck!');
        });

        it('Empty message', () => {
            const onKick = sinon.spy(counter, 'onKick');
            parser.parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone ( )');
            expect(onKick).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Troll', ' ');
        });
    });

    describe('Parsing a mode change', () => {
        it('Adding a single mode', () => {
            const onMode = sinon.spy(counter, 'onMode');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +m');
            expect(onMode).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '+m');
        });

        it('Removing a single mode', () => {
            const onMode = sinon.spy(counter, 'onMode');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: -m');
            expect(onMode).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '-m');
        });

        it('Adding a single mode with parameter', () => {
            const onMode = sinon.spy(counter, 'onMode');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +v voice');
            expect(onMode).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '+v voice');
        });

        it('Adding and removing multiple modes with parameters', () => {
            const onMode = sinon.spy(counter, 'onMode');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +vm-oS+k voice op key');
            expect(onMode).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '+vm-oS+k voice op key');
        });
    });

    it('Parsing a name change', () => {
        const onNick = sinon.spy(counter, 'onNick');
        parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone is now known as Djinnibone');
        expect(onNick).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Djinnibone');
    });

    describe('Parsing a notice', () => {
        it('Ordinary notice', () => {
            const onNotice = sinon.spy(counter, 'onNotice');
            parser.parseLine('2001-01-01', '[01:23:45] -Dinnerbone- Hey, listen!');
            expect(onNotice).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Hey, listen!');
        });

        it('Empty notice', () => {
            const onNotice = sinon.spy(counter, 'onNotice');
            parser.parseLine('2001-01-01', '[01:23:45] -Dinnerbone-  ');
            expect(onNotice).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', ' ');
        });
    });

    describe('Parsing a part', () => {
        it('Ordinary part', () => {
            const onPart = sinon.spy(counter, 'onPart');
            parser.parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel channel!)');
            expect(onPart).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Goodbye, cruel channel!');
        });

        it('Empty message', () => {
            const onPart = sinon.spy(counter, 'onPart');
            parser.parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) ()');
            expect(onPart).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '');
        });
    });

    describe('Parsing a quit', () => {
        it('Ordinary part', () => {
            const onQuit = sinon.spy(counter, 'onQuit');
            parser.parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel network!)');
            expect(onQuit).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'Goodbye, cruel network!');
        });

        it('Empty message', () => {
            const onQuit = sinon.spy(counter, 'onQuit');
            parser.parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) ()');
            expect(onQuit).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '');
        });
    });

    describe('Parsing a topic change', () => {
        it('Ordinary topic', () => {
            const onTopic = sinon.spy(counter, 'onTopic');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'It\'s a channel about nothing!\'');
            expect(onTopic).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', 'It\'s a channel about nothing!');
        });

        it('Empty message', () => {
            const onTopic = sinon.spy(counter, 'onTopic');
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'\'');
            expect(onTopic).to.have.been.calledOnce.calledWithExactly(moment('2001-01-01T01:23:45Z'), 'Dinnerbone', '');
        });
    });
});