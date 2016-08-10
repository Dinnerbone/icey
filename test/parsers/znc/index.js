const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const ZncParser = require('../../../src/parsers/znc');
const Collector = require('../../../src/collector');

describe('Parsing a line', () => {
    let collector;
    let parser;
    const on = {};

    beforeEach(() => {
        collector = new Collector();
        parser = new ZncParser(collector);
        on.message = sinon.spy(collector, 'onMessage');
        on.action = sinon.spy(collector, 'onAction');
        on.join = sinon.spy(collector, 'onJoin');
        on.kick = sinon.spy(collector, 'onKick');
        on.mode = sinon.spy(collector, 'onMode');
        on.nick = sinon.spy(collector, 'onNick');
        on.notice = sinon.spy(collector, 'onNotice');
        on.part = sinon.spy(collector, 'onPart');
        on.quit = sinon.spy(collector, 'onQuit');
        on.topic = sinon.spy(collector, 'onTopic');
    });

    describe('Parsing a message', () => {
        it('Ordinary message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] <Dinnerbone> Hello world! :)');
            expect(on.message).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Hello world! :)');
        });

        it('Empty message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] <Dinnerbone>  ');
            expect(on.message).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', ' ');
        });
    });

    describe('Parsing an action', () => {
        it('Ordinary action', () => {
            parser.parseLine('2001-01-01', '[01:23:45] * Dinnerbone does an action');
            expect(on.action).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'does an action');
        });

        it('Empty action', () => {
            parser.parseLine('2001-01-01', '[01:23:45] * Dinnerbone ');
            expect(on.action).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '');
        });
    });

    it('Parsing a join', () => {
        parser.parseLine('2001-01-01', '[01:23:45] *** Joins: Dinnerbone (dinnerbone@dinnerbone.com)');
        expect(on.join).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone');
    });

    describe('Parsing a kick', () => {
        it('Ordinary kick', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone (You suck!)');
            expect(on.kick).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Troll', 'You suck!');
        });

        it('Empty message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone ( )');
            expect(on.kick).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Troll', ' ');
        });
    });

    describe('Parsing a mode change', () => {
        it('Adding a single mode', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +m');
            expect(on.mode).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '+m');
        });

        it('Removing a single mode', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: -m');
            expect(on.mode).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '-m');
        });

        it('Adding a single mode with parameter', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +v voice');
            expect(on.mode).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '+v voice');
        });

        it('Adding and removing multiple modes with parameters', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +vm-oS+k voice op key');
            expect(on.mode).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '+vm-oS+k voice op key');
        });
    });

    it('Parsing a name change', () => {
        parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone is now known as Djinnibone');
        expect(on.nick).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Djinnibone');
    });

    describe('Parsing a notice', () => {
        it('Ordinary notice', () => {
            parser.parseLine('2001-01-01', '[01:23:45] -Dinnerbone- Hey, listen!');
            expect(on.notice).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Hey, listen!');
        });

        it('Empty notice', () => {
            parser.parseLine('2001-01-01', '[01:23:45] -Dinnerbone-  ');
            expect(on.notice).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', ' ');
        });
    });

    describe('Parsing a part', () => {
        it('Ordinary part', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel channel!)');
            expect(on.part).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Goodbye, cruel channel!');
        });

        it('Empty message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) ()');
            expect(on.part).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '');
        });
    });

    describe('Parsing a quit', () => {
        it('Ordinary part', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel network!)');
            expect(on.quit).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'Goodbye, cruel network!');
        });

        it('Empty message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) ()');
            expect(on.quit).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '');
        });
    });

    describe('Parsing a topic change', () => {
        it('Ordinary topic', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'It\'s a channel about nothing!\'');
            expect(on.topic).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', 'It\'s a channel about nothing!');
        });

        it('Empty message', () => {
            parser.parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'\'');
            expect(on.topic).to.have.been.calledOnce.calledWithExactly(sinon.match(time => time.isSame('2001-01-01T01:23:45Z')), 'Dinnerbone', '');
        });
    });
});