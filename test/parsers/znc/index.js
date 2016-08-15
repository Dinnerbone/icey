const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const ZncParser = require('../../../src/parsers/znc');
const Collector = require('../../../src/collector');
const path = require('path');

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

describe('#parseLine(line)', () => {
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

describe('#parseFile(date, path)', () => {
    it('reads lines in correct order', () => {
        const parseLine = sinon.spy(parser, 'parseLine');
        return parser.parseFile('2010-01-01', `${__dirname}/fixtures/#simple_sessions/2010-01-01.log`)
            .then(() => {
                expect(parseLine).to.have.callCount(5);
                expect(parseLine.getCall(0)).to.be.calledWithExactly('2010-01-01', '[00:00:00] *** Joins: Dinnerbone (dinnerbone@dinnerbone.com)');
                expect(parseLine.getCall(1)).to.be.calledWithExactly('2010-01-01', '[00:01:00] *** ChanServ sets mode: +o Dinnerbone');
                expect(parseLine.getCall(2)).to.be.calledWithExactly('2010-01-01', '[00:02:00] <Dinnerbone> Hello world! :)');
                expect(parseLine.getCall(3)).to.be.calledWithExactly('2010-01-01', '[00:03:00] *** Dinnerbone changes topic to \'Hot Topic!\'');
                expect(parseLine.getCall(4)).to.be.calledWithExactly('2010-01-01', '[00:04:00] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, world!)');
            });
    });
});

describe('#parseDir(path)', () => {
    it('parses files in order, ignoring invalid', () => {
        const parseFile = sinon.spy(parser, 'parseFile');
        const dir = `${__dirname}/fixtures/#simple_sessions`;
        return parser.parseDir(dir)
            .then(() => {
                expect(parseFile).to.be.calledThrice;
                expect(parseFile.getCall(0)).to.be.calledWithExactly('2010-01-01', path.join(dir, '2010-01-01.log'));
                expect(parseFile.getCall(1)).to.be.calledWithExactly('2011-05-10', path.join(dir, '2011-05-10.log'));
                expect(parseFile.getCall(2)).to.be.calledWithExactly('2011-05-11', path.join(dir, '2011-05-11.log'));
            });
    });
});

describe('#process(collector, config)', () => {
    it('config requires a path', () => {
        const collector = new Collector();
        const config = {};
        expect(() => ZncParser.process(collector, config)).to.throw('Parser config: Missing \'path\' string');
    });

    it('config path must be string', () => {
        const collector = new Collector();
        const config = {path: 5};
        expect(() => ZncParser.process(collector, config)).to.throw('Parser config: \'path\' is invalid (should be a string!)');
    });

    it('processes all files in path', () => {
        const collector = new Collector();
        const config = {path: `${__dirname}/fixtures/#simple_sessions`};
        const parseDir = sinon.spy(ZncParser.prototype, 'parseDir');
        try {
            ZncParser.process(collector, config);
            expect(parseDir).to.be.calledOnce.and.calledWithExactly(`${__dirname}/fixtures/#simple_sessions`);
        } finally {
            parseDir.restore();
        }
    });
});