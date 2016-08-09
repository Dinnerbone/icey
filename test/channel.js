const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const {Channel} = require('../src/channel.js');

describe('Channel Events', () => {
    let channel;

    beforeEach(() => channel = new Channel());

    const checkStandardAuthorUpdate = event => {
        it('updates author', () => {
            const spy = sinon.spy(channel, 'updateActor');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith(event.author);
            expect(event.author).to.have.property('user', channel.actors.Dinnerbone);
        });
    };

    describe('Message', () => {
        checkStandardAuthorUpdate(new Channel.Events.Message('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Notice', () => {
        checkStandardAuthorUpdate(new Channel.Events.Notice('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Action', () => {
        checkStandardAuthorUpdate(new Channel.Events.Action('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'does a thing'));
    });

    describe('Join', () => {
        checkStandardAuthorUpdate(new Channel.Events.Join('2001-01-01 00:00:00', {nick: 'Dinnerbone'}));
    });

    describe('Kick', () => {
        it('updates author & victim, then removes victim', () => {
            const event = new Channel.Events.Kick('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, {nick: 'Djinnibone'}, 'You suck!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledTwice.and.calledWith(event.author).and.calledWith(event.victim);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.victim);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.have.property('user', channel.actors.Dinnerbone);
            expect(event.victim).to.have.property('user').deep.equals({});
        });
    });

    describe('Mode', () => {
        const event = new Channel.Events.Mode('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'vm-oS+k voice op key');
        checkStandardAuthorUpdate(event);

        it('updates modes', () => {
            const spy = sinon.spy(channel, 'updateModes');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith('vm-oS+k voice op key');
        });
    });

    describe('Nick', () => {
        it('updates author & renames', () => {
            const event = new Channel.Events.Nick('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Djinnibone');
            const update = sinon.spy(channel, 'updateActor');
            const rename = sinon.spy(channel, 'renameActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledOnce.and.calledWith(event.author);
            expect(rename).to.have.been.calledOnce.and.calledWith('Dinnerbone', 'Djinnibone');
            expect(rename).to.have.been.calledAfter(update);
            expect(event.author).to.have.property('user', channel.actors.Djinnibone);
        });
    });

    describe('Part', () => {
        it('updates author then kicks author', () => {
            const event = new Channel.Events.Part('2001-01-01 00:00:00', {nick: 'Dinnerbone', user: {ident: 'dinnerbone', host: 'dinnerbone.com'}}, 'Bye!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.have.property('user').that.deep.equals({ident: 'dinnerbone', host: 'dinnerbone.com'});
        });
    });

    describe('Quit', () => {
        it('updates author then kicks author', () => {
            const event = new Channel.Events.Quit('2001-01-01 00:00:00', {nick: 'Dinnerbone', user: {ident: 'dinnerbone', host: 'dinnerbone.com'}}, 'Bye!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.have.property('user').that.deep.equals({ident: 'dinnerbone', host: 'dinnerbone.com'});
        });
    });

    describe('Topic', () => {
        const event = new Channel.Events.Topic('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'A channel about nothing!');
        checkStandardAuthorUpdate(event);

        it('updates topic', () => {
            const spy = sinon.spy(channel, 'updateTopic');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith('A channel about nothing!');
        });
    });
});

describe('Channel', () => {
    describe('#addEvent(event)', () => {
        it('applies event', () => {
            const channel = new Channel();
            const event = new Channel.Events.Base('2001-01-01 00:00:00', 'test');
            const spy = sinon.spy(event, 'apply');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith(channel);
        });

        it('records event', () => {
            const channel = new Channel();
            const event1 = new Channel.Events.Base('2001-01-01 00:00:00', 'test');
            const event2 = new Channel.Events.Base('2001-01-01 00:00:01', 'test');
            channel.addEvent(event1);
            channel.addEvent(event2);
            expect(channel.events).to.deep.equal([
                event1,
                event2,
            ]);
        });
    });

    describe('#updateActor(actor)', () => {
        it('adds new actor with no user', () => {
            const channel = new Channel();
            const actor = {nick: 'Dinnerbone'};
            channel.updateActor(actor);
            expect(actor).to.have.property('user').that.deep.equals({});
            expect(channel.actors).to.have.property('Dinnerbone', actor.user);
        });

        it('adds new actor with user info', () => {
            const channel = new Channel();
            const user = {ident: 'dinnerbone', host: 'dinnerbone.com'};
            const actor = {nick: 'Dinnerbone', user};
            channel.updateActor(actor);
            expect(actor).to.have.property('user').that.deep.equals(user);
            expect(channel.actors).to.have.property('Dinnerbone').that.deep.equals(user);
        });

        it('updates actor with user info', () => {
            const channel = new Channel();
            const actor = {nick: 'Dinnerbone'};
            const actorWithIdent = {nick: 'Dinnerbone', user: {ident: 'dinnerbone'}};
            const actorWithHost = {nick: 'Dinnerbone', user: {host: 'dinnerbone.com'}};
            channel.updateActor(actor);
            channel.updateActor(actorWithIdent);
            channel.updateActor(actorWithHost);
            expect(actor).to.have.property('user').that.deep.equals({ident: 'dinnerbone', host: 'dinnerbone.com'});
            const user = actor.user;
            expect(actorWithHost).to.have.property('user', user);
            expect(actorWithIdent).to.have.property('user', user);
            expect(channel.actors).to.have.property('Dinnerbone', user);
        });

        it('allows multiple actors', () => {
            const channel = new Channel();
            const user1 = {ident: 'dinnerbone'};
            const user2 = {ident: 'djinnibone'};
            channel.updateActor({nick: 'Dinnerbone', user: user1});
            channel.updateActor({nick: 'Djinnibone', user: user2});
            expect(user1).to.not.equal(user2);
            expect(channel.actors).to.have.property('Dinnerbone').that.deep.equals(user1);
            expect(channel.actors).to.have.property('Djinnibone').that.deep.equals(user2);
        });
    });

    describe('#removeActor(actor)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.updateActor({nick: 'Dinnerbone', user: {ident: 'dinnerbone'}});
            channel.updateActor({nick: 'Djinnibone', user: {ident: 'djinnibone'}});
        });

        it('removes known actor', () => {
            channel.removeActor({nick: 'Dinnerbone'});
            expect(channel.actors).to.deep.equal({
                Djinnibone: {ident: 'djinnibone'},
            });
        });

        it('ignores unknown actor', () => {
            channel.removeActor({nick: 'Nobody'});
            expect(channel.actors).to.deep.equal({
                Dinnerbone: {ident: 'dinnerbone'},
                Djinnibone: {ident: 'djinnibone'},
            });
        });
    });

    describe('#renameActor(actor, nick)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.updateActor({nick: 'Dinnerbone', user: {ident: 'dinnerbone'}});
        });

        it('renames known actor', () => {
            channel.renameActor('Dinnerbone', 'Djinnibone');
            expect(channel.actors).to.deep.equal({
                Djinnibone: {ident: 'dinnerbone'},
            });
        });

        it('rename replaces target actor', () => {
            channel.updateActor({nick: 'Djinnibone', user: {ident: 'djinnibone'}});
            channel.renameActor('Dinnerbone', 'Djinnibone');
            expect(channel.actors).to.deep.equal({
                Djinnibone: {ident: 'dinnerbone'},
            });
        });

        it('adds unknown actor', () => {
            channel.renameActor('Djinnibone', 'Otherbone');
            expect(channel.actors).to.deep.equal({
                Dinnerbone: {ident: 'dinnerbone'},
                Otherbone: {},
            });
        });
    });

    describe('#updateTopic(topic)', () => {
        it('sets the topic', () => {
            const channel = new Channel();
            channel.updateTopic('Hello world!');
            expect(channel.topic).to.equal('Hello world!');
        });
    });

    describe('#setAvailableModes(lists, param, semiparam, channel, user)', () => {
        it('sets correct availability', () => {
            const channel = new Channel();
            channel.setAvailableModes('ab', 'cd', 'ef', 'gh', 'ij');
            expect(channel.getLists()).deep.equals({a: [], b: []});
            expect(channel.getChannelModes()).deep.equals({
                c: null,
                d: null,
                e: null,
                f: null,
                g: false,
                h: false,
            });
            expect(channel.getUserModes()).deep.equals({i: [], j: []});
            expect(channel.getAvailableModes()).deep.equals({
                a: 'list',
                b: 'list',
                c: 'param',
                d: 'param',
                e: 'partial',
                f: 'partial',
                g: 'channel',
                h: 'channel',
                i: 'user',
                j: 'user',
            });
        });

        it('does not allow duplicates', () => {
            const channel = new Channel();
            expect(() => channel.setAvailableModes('a', 'a', '', '', '')).to.throw();
            expect(channel.getAvailableModes()).to.be.empty;
        });

        it('removes old modes but keeps existing', () => {
            const channel = new Channel();
            channel.setAvailableModes('ab', 'de', 'gh', 'jk', 'mn');
            channel.setMode('b', 'one');
            channel.setMode('e', 'two');
            channel.setMode('h', 'three');
            channel.setMode('k');
            channel.setMode('n', 'four');
            channel.setAvailableModes('bc', 'ef', 'hi', 'kl', 'no');
            expect(channel.getLists()).deep.equals({b: ['one'], c: []});
            expect(channel.getChannelModes()).deep.equals({
                e: 'two',
                f: null,
                h: 'three',
                i: null,
                k: true,
                l: false,
            });
            expect(channel.getUserModes()).deep.equals({n: ['four'], o: []});
            expect(channel.getAvailableModes()).deep.equals({
                b: 'list',
                c: 'list',
                e: 'param',
                f: 'param',
                h: 'partial',
                i: 'partial',
                k: 'channel',
                l: 'channel',
                n: 'user',
                o: 'user',
            });
        });

        it('allows changing a modes type', () => {
            const channel = new Channel();
            channel.setAvailableModes('ab', 'cd', 'ef', 'gh', 'ij');
            channel.setAvailableModes('bc', 'de', 'fg', 'hi', 'jk');
            expect(channel.getLists()).deep.equals({b: [], c: []});
            expect(channel.getChannelModes()).deep.equals({
                d: null,
                e: null,
                f: null,
                g: null,
                h: false,
                i: false,
            });
            expect(channel.getUserModes()).deep.equals({j: [], k: []});
            expect(channel.getAvailableModes()).deep.equals({
                b: 'list',
                c: 'list',
                d: 'param',
                e: 'param',
                f: 'partial',
                g: 'partial',
                h: 'channel',
                i: 'channel',
                j: 'user',
                k: 'user',
            });
        });
    });

    describe('#getList(mode)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('bq', '', '', '', '');
        });

        it('returns only known lists', () => {
            expect(channel.getLists()).deep.equals({b: [], q: []});
        });
    });

    describe('#getChannelModes()', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('', 'k', 'j', 'm', '');
        });

        it('returns only known modes', () => {
            expect(channel.getChannelModes()).to.deep.equal({
                k: null,
                j: null,
                m: false,
            });
        });
    });

    describe('#getUserModes()', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('', '', '', '', 'ov');
        });

        it('returns only known modes', () => {
            expect(channel.getUserModes()).deep.equals({o: [], v: []});
        });
    });

    describe('#updateModes(instructions)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('b', 'k', 'j', 'm', 'vo');
        });

        it('sets as default', () => {
            const setMode = sinon.spy(channel, 'setMode');
            channel.updateModes('m');
            expect(setMode).to.have.been.calledOnce.and.calledWithExactly('m', undefined);
        });

        it('sets when explicit', () => {
            const setMode = sinon.spy(channel, 'setMode');
            channel.updateModes('+m');
            expect(setMode).to.have.been.calledOnce.and.calledWithExactly('m', undefined);
        });

        it('unsets when explicit', () => {
            const unsetMode = sinon.spy(channel, 'unsetMode');
            channel.updateModes('-m');
            expect(unsetMode).to.have.been.calledOnce.and.calledWithExactly('m', undefined);
        });

        it('ignores extra params', () => {
            const setMode = sinon.spy(channel, 'setMode');
            channel.updateModes('m param');
            expect(setMode).to.have.been.calledOnce.and.calledWithExactly('m', undefined);
        });

        it('parses in correct order', () => {
            const setMode = sinon.spy(channel, 'setMode');
            const unsetMode = sinon.spy(channel, 'unsetMode');
            channel.updateModes('bo-jk+mv ban op key voice');
            expect(setMode).to.have.callCount(4);
            expect(unsetMode).to.have.callCount(2);

            expect(setMode.getCall(0)).to.have.been.calledWithExactly('b', 'ban');
            expect(setMode.getCall(1)).to.have.been.calledWithExactly('o', 'op');
            expect(unsetMode.getCall(0)).to.have.been.calledWithExactly('j', undefined);
            expect(unsetMode.getCall(1)).to.have.been.calledWithExactly('k', 'key');
            expect(setMode.getCall(2)).to.have.been.calledWithExactly('m', undefined);
            expect(setMode.getCall(3)).to.have.been.calledWithExactly('v', 'voice');

            expect(setMode.callIds[0]).to.be.below(setMode.callIds[1]);
            expect(setMode.callIds[1]).to.be.below(unsetMode.callIds[0]);
            expect(unsetMode.callIds[1]).to.be.below(setMode.callIds[2]);
            expect(setMode.callIds[2]).to.be.below(setMode.callIds[3]);
        });
    });

    describe('#setMode(mode, param)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('b', 'k', 'j', 'm', 'vo');
        });

        describe('Adding to a list', () => {
            it('adds', () => {
                channel.setMode('b', 'banned');
                expect(channel.getLists()).deep.equals({b: ['banned']});
            });

            it('does not duplicate', () => {
                channel.setMode('b', 'banned');
                channel.setMode('b', 'also');
                channel.setMode('b', 'banned');
                expect(channel.getLists()).deep.equals({b: ['banned', 'also']});
            });

            it('ignores missing param', () => {
                channel.setMode('b');
                expect(channel.getLists()).deep.equals({b: []});
            });
        });

        describe('Setting a channel mode with required param', () => {
            it('sets', () => {
                channel.setMode('k', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: null,
                    m: false,
                });
            });

            it('does not duplicate', () => {
                channel.setMode('k', 'alpha');
                channel.setMode('k', 'beta');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'beta',
                    j: null,
                    m: false,
                });
            });

            it('ignores missing param', () => {
                channel.setMode('k');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: null,
                    m: false,
                });
            });
        });

        describe('Setting a channel mode with semi-required param', () => {
            it('sets', () => {
                channel.setMode('j', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: 'param',
                    m: false,
                });
            });

            it('does not duplicate', () => {
                channel.setMode('j', 'alpha');
                channel.setMode('j', 'beta');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: 'beta',
                    m: false,
                });
            });

            it('ignores missing param', () => {
                channel.setMode('j');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: null,
                    m: false,
                });
            });
        });

        describe('Setting a channel mode without param', () => {
            it('sets', () => {
                channel.setMode('m');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: null,
                    m: true,
                });
            });

            it('does not duplicate', () => {
                channel.setMode('m');
                channel.setMode('m');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: null,
                    m: true,
                });
            });

            it('ignores param', () => {
                channel.setMode('m', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: null,
                    m: true,
                });
            });
        });

        describe('Setting a user mode', () => {
            it('sets', () => {
                channel.setMode('o', 'Dinnerbone');
                expect(channel.getUserModes()).deep.equals({o: ['Dinnerbone'], v: []});
            });

            it('does not duplicate', () => {
                channel.setMode('v', 'Dinnerbone');
                channel.setMode('v', 'Dinnerbone');
                expect(channel.getUserModes()).deep.equals({o: [], v: ['Dinnerbone']});
            });

            it('ignores missing param', () => {
                channel.setMode('o');
                expect(channel.getUserModes()).deep.equals({o: [], v: []});
            });
        });

        describe('Setting an unknown mode', () => {
            it('adds as channel mode', () => {
                channel = new Channel();
                channel.setMode('x');
                expect(channel.getChannelModes()).deep.equals({x: true});
                expect(channel.getAvailableModes()).deep.equals({x: 'channel'});
            });

            it('ignores missing param', () => {
                channel = new Channel();
                channel.setMode('x', 'hello world!');
                expect(channel.getChannelModes()).deep.equals({x: true});
                expect(channel.getAvailableModes()).deep.equals({x: 'channel'});
            });
        });
    });

    describe('#unsetMode(mode, param)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.setAvailableModes('b', 'k', 'j', 'm', 'vo');
            channel.setMode('b', 'banned');
            channel.setMode('k', 'param');
            channel.setMode('j', 'param');
            channel.setMode('m');
            channel.setMode('o', 'Dinnerbone');
        });

        describe('Removing from a list', () => {
            it('removes existing values', () => {
                channel.unsetMode('b', 'banned');
                expect(channel.getLists()).deep.equals({b: []});
            });

            it('only changes one entry', () => {
                channel.setMode('b', 'other');
                channel.unsetMode('b', 'banned');
                expect(channel.getLists()).deep.equals({b: ['other']});
            });

            it('ignores nonexistent values', () => {
                channel.unsetMode('b', 'nobody');
                expect(channel.getLists()).deep.equals({b: ['banned']});
            });

            it('ignores missing param', () => {
                channel.unsetMode('b');
                expect(channel.getLists()).deep.equals({b: ['banned']});
            });
        });

        describe('Unsetting a channel mode with required param', () => {
            it('unsets', () => {
                channel.unsetMode('k', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: 'param',
                    m: true,
                });
            });

            it('unsets even if not set', () => {
                channel.unsetMode('k', 'param');
                channel.unsetMode('k', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: null,
                    j: 'param',
                    m: true,
                });
            });

            it('ignores missing param', () => {
                channel.unsetMode('k');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: 'param',
                    m: true,
                });
            });
        });

        describe('Unsetting a channel mode with semi-required param', () => {
            it('unsets without param', () => {
                channel.unsetMode('j');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: null,
                    m: true,
                });
            });

            it('unsets even if not set', () => {
                channel.unsetMode('j');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: null,
                    m: true,
                });
            });

            it('ignores param', () => {
                channel.unsetMode('j', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: null,
                    m: true,
                });
            });
        });

        describe('Unsetting a channel mode without param', () => {
            it('sets', () => {
                channel.unsetMode('m');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: 'param',
                    m: false,
                });
            });

            it('unsets even if not set', () => {
                channel.unsetMode('m');
                channel.unsetMode('m');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: 'param',
                    m: false,
                });
            });

            it('ignores param', () => {
                channel.unsetMode('m', 'param');
                expect(channel.getChannelModes()).deep.equals({
                    k: 'param',
                    j: 'param',
                    m: false,
                });
            });
        });

        describe('Unsetting a user mode', () => {
            it('unsets known value', () => {
                channel.unsetMode('o', 'Dinnerbone');
                expect(channel.getUserModes()).deep.equals({o: [], v: []});
            });

            it('ignores unknown value', () => {
                channel.unsetMode('o', 'Nobody');
                expect(channel.getUserModes()).deep.equals({o: ['Dinnerbone'], v: []});
            });

            it('ignores missing param', () => {
                channel.unsetMode('o');
                expect(channel.getUserModes()).deep.equals({o: ['Dinnerbone'], v: []});
            });
        });

        describe('Unsetting an unknown mode', () => {
            it('adds as channel mode', () => {
                channel = new Channel();
                channel.unsetMode('x');
                expect(channel.getChannelModes()).deep.equals({x: false});
                expect(channel.getAvailableModes()).deep.equals({x: 'channel'});
            });

            it('ignores missing param', () => {
                channel = new Channel();
                channel.unsetMode('x', 'hello world!');
                expect(channel.getChannelModes()).deep.equals({x: false});
                expect(channel.getAvailableModes()).deep.equals({x: 'channel'});
            });
        });
    });
});