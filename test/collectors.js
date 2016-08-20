const chai = require('chai');
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const expect = chai.expect;
const fs = require('fs');
const moment = require('moment');
const Collector = require('../src/collector.js');

describe('Stat Collectors', () => {
    const files = fs.readdirSync(`${__dirname}/collectors`);
    files.forEach(file => {
        const path = `./collectors/${file}`;
        const stats = fs.statSync(`${__dirname}/${path}`);
        if (stats.isFile()) {
            const match = file.match(/^(.+).js$/);
            if (match) {
                describe(match[1], () => require(path));
            }
        } else if (stats.isDirectory()) {
            describe(file, () => require(`${path}/index.js`));
        }
    });
});

describe('Combined Collector', () => {
    let collectors;
    let combined;

    beforeEach(() => {
        collectors = [new Collector(), new Collector()];
        combined = Collector.combine(collectors);
    });

    describe('#onAction(time, nick, action)', () => {
        it('is deligated with same args', () => {
            const onAction = [sinon.spy(collectors[0], 'onAction'), sinon.spy(collectors[1], 'onAction')];
            const time = moment();
            const nick = 'Dinnerbone';
            const action = 'Hello world!';
            combined.onAction(time, nick, action);
            expect(onAction[0]).to.be.calledOnce.and.calledWithExactly(time, nick, action);
            expect(onAction[1]).to.be.calledOnce.and.calledWithExactly(time, nick, action);
        });
    });

    describe('#onMessage(time, nick, message)', () => {
        it('is deligated with same args', () => {
            const onMessage = [sinon.spy(collectors[0], 'onMessage'), sinon.spy(collectors[1], 'onMessage')];
            const time = moment();
            const nick = 'Dinnerbone';
            const message = 'Hello world!';
            combined.onMessage(time, nick, message);
            expect(onMessage[0]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
            expect(onMessage[1]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
        });
    });

    describe('#onJoin(time, nick)', () => {
        it('is deligated with same args', () => {
            const onJoin = [sinon.spy(collectors[0], 'onJoin'), sinon.spy(collectors[1], 'onJoin')];
            const time = moment();
            const nick = 'Dinnerbone';
            combined.onJoin(time, nick);
            expect(onJoin[0]).to.be.calledOnce.and.calledWithExactly(time, nick);
            expect(onJoin[1]).to.be.calledOnce.and.calledWithExactly(time, nick);
        });
    });

    describe('#onKick(time, nick, victim, message)', () => {
        it('is deligated with same args', () => {
            const onKick = [sinon.spy(collectors[0], 'onKick'), sinon.spy(collectors[1], 'onKick')];
            const time = moment();
            const nick = 'Dinnerbone';
            const victim = 'Troll';
            const message = 'Buh-bye!';
            combined.onKick(time, nick, victim, message);
            expect(onKick[0]).to.be.calledOnce.and.calledWithExactly(time, nick, victim, message);
            expect(onKick[1]).to.be.calledOnce.and.calledWithExactly(time, nick, victim, message);
        });
    });

    describe('#onMode(time, nick, mode)', () => {
        it('is deligated with same args', () => {
            const onMode = [sinon.spy(collectors[0], 'onMode'), sinon.spy(collectors[1], 'onMode')];
            const time = moment();
            const nick = 'Dinnerbone';
            const mode = '+b *!*@*';
            combined.onMode(time, nick, mode);
            expect(onMode[0]).to.be.calledOnce.and.calledWithExactly(time, nick, mode);
            expect(onMode[1]).to.be.calledOnce.and.calledWithExactly(time, nick, mode);
        });
    });

    describe('#onNick(time, oldNick, newNick)', () => {
        it('is deligated with same args', () => {
            const onNick = [sinon.spy(collectors[0], 'onNick'), sinon.spy(collectors[1], 'onNick')];
            const time = moment();
            const oldNick = 'Dinnerbone';
            const newNick = 'Djinnibone';
            combined.onNick(time, oldNick, newNick);
            expect(onNick[0]).to.be.calledOnce.and.calledWithExactly(time, oldNick, newNick);
            expect(onNick[1]).to.be.calledOnce.and.calledWithExactly(time, oldNick, newNick);
        });
    });

    describe('#onNotice(time, nick, message)', () => {
        it('is deligated with same args', () => {
            const onNotice = [sinon.spy(collectors[0], 'onNotice'), sinon.spy(collectors[1], 'onNotice')];
            const time = moment();
            const nick = 'Dinnerbone';
            const message = 'Hello world!';
            combined.onNotice(time, nick, message);
            expect(onNotice[0]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
            expect(onNotice[1]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
        });
    });

    describe('#onPart(time, nick, message)', () => {
        it('is deligated with same args', () => {
            const onPart = [sinon.spy(collectors[0], 'onPart'), sinon.spy(collectors[1], 'onPart')];
            const time = moment();
            const nick = 'Dinnerbone';
            const message = 'Hello world!';
            combined.onPart(time, nick, message);
            expect(onPart[0]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
            expect(onPart[1]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
        });
    });

    describe('#onQuit(time, nick, message)', () => {
        it('is deligated with same args', () => {
            const onQuit = [sinon.spy(collectors[0], 'onQuit'), sinon.spy(collectors[1], 'onQuit')];
            const time = moment();
            const nick = 'Dinnerbone';
            const message = 'Hello world!';
            combined.onQuit(time, nick, message);
            expect(onQuit[0]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
            expect(onQuit[1]).to.be.calledOnce.and.calledWithExactly(time, nick, message);
        });
    });

    describe('#onTopic(time, nick, topic)', () => {
        it('is deligated with same args', () => {
            const onTopic = [sinon.spy(collectors[0], 'onTopic'), sinon.spy(collectors[1], 'onTopic')];
            const time = moment();
            const nick = 'Dinnerbone';
            const topic = 'Hello world!';
            combined.onTopic(time, nick, topic);
            expect(onTopic[0]).to.be.calledOnce.and.calledWithExactly(time, nick, topic);
            expect(onTopic[1]).to.be.calledOnce.and.calledWithExactly(time, nick, topic);
        });
    });

});