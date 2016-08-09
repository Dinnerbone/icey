const expect = require('chai').expect;
const {ZncParser} = require('../../../src/parsers/znc');
const {Channel} = require('../../../src/channel');

describe('Parsing a line', () => {
    describe('Parsing a message', () => {
        it('Ordinary message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] <Dinnerbone> Hello world! :)')).to.deep.equal(
                new Channel.Events.Message('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, 'Hello world! :)')
            );
        });

        it('Empty message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] <Dinnerbone>  ')).to.deep.equal(
                new Channel.Events.Message('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, ' ')
            );
        });
    });

    describe('Parsing an action', () => {
        it('Ordinary action', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] * Dinnerbone does an action')).to.deep.equal(
                new Channel.Events.Action('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, 'does an action')
            );
        });

        it('Empty action', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] * Dinnerbone ')).to.deep.equal(
                new Channel.Events.Action('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '')
            );
        });
    });

    it('Parsing a join', () => {
        expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Joins: Dinnerbone (dinnerbone@dinnerbone.com)')).to.deep.equal(
            new Channel.Events.Join('2001-01-01 01:23:45', {
                nick: 'Dinnerbone',
                user: {
                    ident: 'dinnerbone',
                    host: 'dinnerbone.com',
                },
            })
        );
    });

    describe('Parsing a kick', () => {
        it('Ordinary kick', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone (You suck!)')).to.deep.equal(
                new Channel.Events.Kick('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, {nick: 'Troll'}, 'You suck!')
            );
        });

        it('Empty message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Troll was kicked by Dinnerbone ( )')).to.deep.equal(
                new Channel.Events.Kick('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, {nick: 'Troll'}, ' ')
            );
        });
    });

    describe('Parsing a mode change', () => {
        it('Adding a single mode', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +m')).to.deep.equal(
                new Channel.Events.Mode('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '+m')
            );
        });

        it('Removing a single mode', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: -m')).to.deep.equal(
                new Channel.Events.Mode('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '-m')
            );
        });

        it('Adding a single mode with parameter', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +v voice')).to.deep.equal(
                new Channel.Events.Mode('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '+v voice')
            );
        });

        it('Adding and removing multiple modes with parameters', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone sets mode: +vm-oS+k voice op key')).to.deep.equal(
                new Channel.Events.Mode('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '+vm-oS+k voice op key')
            );
        });
    });

    it('Parsing a name change', () => {
        expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone is now known as Djinnibone')).to.deep.equal(
            new Channel.Events.Nick('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, 'Djinnibone')
        );
    });

    describe('Parsing a notice', () => {
        it('Ordinary notice', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] -Dinnerbone- Hey, listen!')).to.deep.equal(
                new Channel.Events.Notice('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, 'Hey, listen!')
            );
        });

        it('Empty notice', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] -Dinnerbone-  ')).to.deep.equal(
                new Channel.Events.Notice('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, ' ')
            );
        });
    });

    describe('Parsing a part', () => {
        it('Ordinary part', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel channel!)')).to.deep.equal(
                new Channel.Events.Part('2001-01-01 01:23:45', {
                    nick: 'Dinnerbone',
                    user: {
                        ident: 'dinnerbone',
                        host: 'dinnerbone.com',
                    },
                }, 'Goodbye, cruel channel!')
            );
        });

        it('Empty message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Parts: Dinnerbone (dinnerbone@dinnerbone.com) ()')).to.deep.equal(
                new Channel.Events.Part('2001-01-01 01:23:45', {
                    nick: 'Dinnerbone',
                    user: {
                        ident: 'dinnerbone',
                        host: 'dinnerbone.com',
                    },
                }, '')
            );
        });
    });

    describe('Parsing a quit', () => {
        it('Ordinary part', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) (Goodbye, cruel network!)')).to.deep.equal(
                new Channel.Events.Quit('2001-01-01 01:23:45', {
                    nick: 'Dinnerbone',
                    user: {
                        ident: 'dinnerbone',
                        host: 'dinnerbone.com',
                    },
                }, 'Goodbye, cruel network!')
            );
        });

        it('Empty message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Quits: Dinnerbone (dinnerbone@dinnerbone.com) ()')).to.deep.equal(
                new Channel.Events.Quit('2001-01-01 01:23:45', {
                    nick: 'Dinnerbone',
                    user: {
                        ident: 'dinnerbone',
                        host: 'dinnerbone.com',
                    },
                }, '')
            );
        });
    });

    describe('Parsing a topic change', () => {
        it('Ordinary topic', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'It\'s a channel about nothing!\'')).to.deep.equal(
                new Channel.Events.Topic('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, 'It\'s a channel about nothing!')
            );
        });

        it('Empty message', () => {
            expect(new ZncParser().parseLine('2001-01-01', '[01:23:45] *** Dinnerbone changes topic to \'\'')).to.deep.equal(
                new Channel.Events.Topic('2001-01-01 01:23:45', {nick: 'Dinnerbone'}, '')
            );
        });
    });
});