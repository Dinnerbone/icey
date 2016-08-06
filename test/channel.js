const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const {Channel} = require('../src/channel.js');

describe('Channel Events', () => {
    let channel;

    beforeEach(() => channel = new Channel());

    const checkStandardAuthorReplacement = event => {
        it('replaces author', () => {
            const spy = sinon.spy(channel, 'updateActor');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith(event.author);
            expect(event.author).to.equal(channel.actors.Dinnerbone);
        });
    };

    describe('Message', () => {
        checkStandardAuthorReplacement(new Channel.Events.Message('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Notice', () => {
        checkStandardAuthorReplacement(new Channel.Events.Notice('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Action', () => {
        checkStandardAuthorReplacement(new Channel.Events.Action('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'does a thing'));
    });

    describe('Join', () => {
        checkStandardAuthorReplacement(new Channel.Events.Join('2001-01-01 00:00:00', {nick: 'Dinnerbone'}));
    });

    describe('Kick', () => {
        it('replaces author & victim, then removes victim', () => {
            const event = new Channel.Events.Kick('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, {nick: 'Djinnibone'}, 'You suck!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledTwice.and.calledWith(event.author).and.calledWith(event.victim);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.victim);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.equal(channel.actors.Dinnerbone);
            expect(event.victim).to.deep.equal({nick: 'Djinnibone'});
        });
    });

    describe('Mode', () => {
        const event = new Channel.Events.Mode('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'vm-oS+k voice op key');
        checkStandardAuthorReplacement(event);

        it('updates modes', () => {
            const spy = sinon.spy(channel, 'updateModes');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith('vm-oS+k voice op key');
        });
    });

    describe('NickChange', () => {
        // TODO
    });

    describe('Part', () => {
        it('replaces author then kicks author', () => {
            const event = new Channel.Events.Part('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Bye!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.deep.equal({nick: 'Dinnerbone'});
        });
    });

    describe('Quit', () => {
        it('replaces author then kicks author', () => {
            const event = new Channel.Events.Quit('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Bye!');
            const update = sinon.spy(channel, 'updateActor');
            const remove = sinon.spy(channel, 'removeActor');
            channel.addEvent(event);
            expect(update).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledOnce.and.calledWith(event.author);
            expect(remove).to.have.been.calledAfter(update);
            expect(event.author).to.deep.equal({nick: 'Dinnerbone'});
        });
    });

    describe('Topic', () => {
        const event = new Channel.Events.Topic('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'A channel about nothing!');
        checkStandardAuthorReplacement(event);

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
        it('adds new actor', () => {
            const channel = new Channel();
            const actor = {nick: 'Dinnerbone'};
            const result = channel.updateActor(actor);
            expect(result).to.not.equal(actor);
            expect(result).to.deep.equal(actor);
            expect(channel.actors).to.have.property('Dinnerbone', result);
        });

        it('updates actor with new info', () => {
            const channel = new Channel();
            const actor = {nick: 'Dinnerbone'};
            const actorWithIdent = {nick: 'Dinnerbone', ident: 'dinnerbone'};
            const actorWithHost = {nick: 'Dinnerbone', host: 'dinnerbone.com'};
            const result = channel.updateActor(actor);
            expect(channel.updateActor(actorWithIdent)).to.equal(result);
            expect(channel.updateActor(actorWithHost)).to.equal(result);
            expect(result).to.deep.equal({
                nick: 'Dinnerbone',
                ident: 'dinnerbone',
                host: 'dinnerbone.com',
            });
            expect(channel.actors).to.have.property('Dinnerbone', result);
        });

        it('allows multiple actors', () => {
            const channel = new Channel();
            const actor1 = channel.updateActor({nick: 'Dinnerbone'});
            const actor2 = channel.updateActor({nick: 'Djinnibone'});
            expect(actor1).to.not.equal(actor2);
            expect(channel.actors).to.have.property('Dinnerbone', actor1);
            expect(channel.actors).to.have.property('Djinnibone', actor2);
        });
    });

    describe('#removeActor(actor)', () => {
        let channel;

        beforeEach(() => {
            channel = new Channel();
            channel.updateActor({nick: 'Dinnerbone'});
            channel.updateActor({nick: 'Djinnibone'});
        });

        it('removes known actor', () => {
            channel.removeActor({nick: 'Dinnerbone'});
            expect(channel.actors).to.deep.equal({
                Djinnibone: {nick: 'Djinnibone'},
            });
        });

        it('ignores unknown actor', () => {
            channel.removeActor({nick: 'Nobody'});
            expect(channel.actors).to.deep.equal({
                Dinnerbone: {nick: 'Dinnerbone'},
                Djinnibone: {nick: 'Djinnibone'},
            });
        });
    });
});