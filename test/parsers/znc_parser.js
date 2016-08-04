const expect = require('chai').expect;
const ZncParser = require('../../src/parsers/znc.js');

describe('Parsing a line with no context', function() {
    describe('Parsing a message', () => {
        it('Ordinary message', function() {
            expect(new ZncParser().parseLine('[01:23:45] <Dinnerbone> Hello world! :)')).to.deep.equal({
                type: 'message',
                time: '01:23:45',
                nick: 'Dinnerbone',
                message: 'Hello world! :)',
            });
        });

        it('Empty message', function() {
            expect(new ZncParser().parseLine('[01:23:45] <Dinnerbone> ')).to.deep.equal({
                type: 'message',
                time: '01:23:45',
                nick: 'Dinnerbone',
                message: '',
            });
        });
    });

    describe('Parsing an action', () => {
        it('Ordinary action', function() {
            expect(new ZncParser().parseLine('[01:23:45] * Dinnerbone does an action.')).to.deep.equal({
                type: 'action',
                time: '01:23:45',
                nick: 'Dinnerbone',
                action: 'does an action.',
            });
        });

        it('Empty action', function() {
            expect(new ZncParser().parseLine('[01:23:45] * Dinnerbone ')).to.deep.equal({
                type: 'action',
                time: '01:23:45',
                nick: 'Dinnerbone',
                action: '',
            });
        });
    });

    it('Parsing a join', function() {
        expect(new ZncParser().parseLine('[01:23:45] *** Joins: Dinnerbone (dinnerbone@i.like.butts.and.my.name.is.dinnerbone.com)')).to.deep.equal({
            type: 'join',
            time: '01:23:45',
            nick: 'Dinnerbone',
            ident: 'dinnerbone',
            host: 'i.like.butts.and.my.name.is.dinnerbone.com',
        });
    });

    describe('Parsing a kick', () => {
        it('Ordinary kick', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Troll was kicked by Dinnerbone (You suck!)')).to.deep.equal({
                type: 'kick',
                time: '01:23:45',
                kickerNick: 'Dinnerbone',
                nick: 'Troll',
                message: 'You suck!',
            });
        });

        it('Empty message', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Troll was kicked by Dinnerbone ( )')).to.deep.equal({
                type: 'kick',
                time: '01:23:45',
                kickerNick: 'Dinnerbone',
                nick: 'Troll',
                message: ' ',
            });
        });
    });

    describe('Parsing a mode change', () => {
        it('Adding a single mode', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: +m')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: ['m'],
                    removed: [],
                    params: [],
                },
            });
        });

        it('Adding a single parameter mode', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: +v somebody')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: ['v'],
                    removed: [],
                    params: ['somebody'],
                },
            });
        });

        it('Adding multiple modes', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: +vmv somebody else')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: ['v', 'm', 'v'],
                    removed: [],
                    params: ['somebody', 'else'],
                },
            });
        });

        it('Removing a single mode', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: -m')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: [],
                    removed: ['m'],
                    params: [],
                },
            });
        });

        it('Removing a single parameter mode', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: +v somebody')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: ['v'],
                    removed: [],
                    params: ['somebody'],
                },
            });
        });

        it('Removing multiple modes', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: -vmv somebody else')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: [],
                    removed: ['v', 'm', 'v'],
                    params: ['somebody', 'else'],
                },
            });
        });

        it('Adding and removing multiple modes', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone sets mode: -v+mv-o somebody else Dinnerbone')).to.deep.equal({
                type: 'mode',
                time: '01:23:45',
                nick: 'Dinnerbone',
                modes: {
                    added: ['m', 'v'],
                    removed: ['v', 'o'],
                    params: ['somebody', 'else', 'Dinnerbone'],
                },
            });
        });
    });

    it('Parsing a name change', function() {
        expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone is now known as Djinnibone')).to.deep.equal({
            type: 'nick',
            time: '01:23:45',
            nick: 'Dinnerbone',
            newNick: 'Djinnibone',
        });
    });

    describe('Parsing a notice', () => {
        it('Ordinary notice', function() {
            expect(new ZncParser().parseLine('[01:23:45] -Dinnerbone- Hello world! :)')).to.deep.equal({
                type: 'notice',
                time: '01:23:45',
                nick: 'Dinnerbone',
                message: 'Hello world! :)',
            });
        });

        it('Empty notice', function() {
            expect(new ZncParser().parseLine('[01:23:45] -Dinnerbone- ')).to.deep.equal({
                type: 'notice',
                time: '01:23:45',
                nick: 'Dinnerbone',
                message: '',
            });
        });
    });

    describe('Parsing a part', () => {
        it('Ordinary part', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Parts: Dinnerbone (dinnerbone@i.like.butts.and.my.name.is.dinnerbone.com) (Goodbye cruel world!)')).to.deep.equal({
                type: 'part',
                time: '01:23:45',
                nick: 'Dinnerbone',
                ident: 'dinnerbone',
                host: 'i.like.butts.and.my.name.is.dinnerbone.com',
                message: 'Goodbye cruel world!',
            });
        });

        it('Empty message', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Parts: Dinnerbone (dinnerbone@i.like.butts.and.my.name.is.dinnerbone.com) ()')).to.deep.equal({
                type: 'part',
                time: '01:23:45',
                nick: 'Dinnerbone',
                ident: 'dinnerbone',
                host: 'i.like.butts.and.my.name.is.dinnerbone.com',
                message: '',
            });
        });
    });

    describe('Parsing a quit', () => {
        it('Ordinary quit', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Quits: Dinnerbone (dinnerbone@i.like.butts.and.my.name.is.dinnerbone.com) (Goodbye cruel world!)')).to.deep.equal({
                type: 'quit',
                time: '01:23:45',
                nick: 'Dinnerbone',
                ident: 'dinnerbone',
                host: 'i.like.butts.and.my.name.is.dinnerbone.com',
                message: 'Goodbye cruel world!',
            });
        });

        it('Empty message', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Quits: Dinnerbone (dinnerbone@i.like.butts.and.my.name.is.dinnerbone.com) ()')).to.deep.equal({
                type: 'quit',
                time: '01:23:45',
                nick: 'Dinnerbone',
                ident: 'dinnerbone',
                host: 'i.like.butts.and.my.name.is.dinnerbone.com',
                message: '',
            });
        });
    });

    describe('Parsing a topic change', () => {
        it('Ordinary topic', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone changes topic to \'Hello world!\'')).to.deep.equal({
                type: 'topic',
                time: '01:23:45',
                nick: 'Dinnerbone',
                topic: 'Hello world!',
            });
        });

        it('Empty topic', function() {
            expect(new ZncParser().parseLine('[01:23:45] *** Dinnerbone changes topic to \'\'')).to.deep.equal({
                type: 'topic',
                time: '01:23:45',
                nick: 'Dinnerbone',
                topic: '',
            });
        });
    });
});