const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const Channel = require('../src/channel.js');
const Events = require('../src/events.js');

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
        checkStandardAuthorUpdate(new Events.Message('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Notice', () => {
        checkStandardAuthorUpdate(new Events.Notice('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Hello, world!'));
    });

    describe('Action', () => {
        checkStandardAuthorUpdate(new Events.Action('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'does a thing'));
    });

    describe('Join', () => {
        checkStandardAuthorUpdate(new Events.Join('2001-01-01 00:00:00', {nick: 'Dinnerbone'}));
    });

    describe('Kick', () => {
        it('updates author & victim, then removes victim', () => {
            const event = new Events.Kick('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, {nick: 'Djinnibone'}, 'You suck!');
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
        const event = new Events.Mode('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'vm-oS+k voice op key');
        checkStandardAuthorUpdate(event);

        it('updates modes', () => {
            const spy = sinon.spy(channel, 'updateModes');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith('vm-oS+k voice op key');
        });
    });

    describe('Nick', () => {
        it('updates author & renames', () => {
            const event = new Events.Nick('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'Djinnibone');
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
            const event = new Events.Part('2001-01-01 00:00:00', {nick: 'Dinnerbone', user: {ident: 'dinnerbone', host: 'dinnerbone.com'}}, 'Bye!');
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
            const event = new Events.Quit('2001-01-01 00:00:00', {nick: 'Dinnerbone', user: {ident: 'dinnerbone', host: 'dinnerbone.com'}}, 'Bye!');
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
        const event = new Events.Topic('2001-01-01 00:00:00', {nick: 'Dinnerbone'}, 'A channel about nothing!');
        checkStandardAuthorUpdate(event);

        it('updates topic', () => {
            const spy = sinon.spy(channel, 'updateTopic');
            channel.addEvent(event);
            expect(spy).to.have.been.calledOnce.and.calledWith('A channel about nothing!');
        });
    });
});