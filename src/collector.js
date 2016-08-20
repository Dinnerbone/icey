/* eslint no-unused-vars: "off" */

class CombinedCollector {
    constructor(collectors) {
        this.collectors = collectors;
    }

    onAction(...args) {
        this.collectors.forEach(collector => collector.onAction(...args));
    }

    onMessage(...args) {
        this.collectors.forEach(collector => collector.onMessage(...args));
    }

    onJoin(...args) {
        this.collectors.forEach(collector => collector.onJoin(...args));
    }

    onKick(...args) {
        this.collectors.forEach(collector => collector.onKick(...args));
    }

    onMode(...args) {
        this.collectors.forEach(collector => collector.onMode(...args));
    }

    onNick(...args) {
        this.collectors.forEach(collector => collector.onNick(...args));
    }

    onNotice(...args) {
        this.collectors.forEach(collector => collector.onNotice(...args));
    }

    onPart(...args) {
        this.collectors.forEach(collector => collector.onPart(...args));
    }

    onQuit(...args) {
        this.collectors.forEach(collector => collector.onQuit(...args));
    }

    onTopic(...args) {
        this.collectors.forEach(collector => collector.onTopic(...args));
    }
}

module.exports = class Collector {
    onAction(time, nick, action) {}
    onMessage(time, nick, message) {}
    onJoin(time, nick) {}
    onKick(time, nick, victim, message) {}
    onMode(time, nick, mode) {}
    onNick(time, oldNick, newNick) {}
    onNotice(time, nick, message) {}
    onPart(time, nick, message) {}
    onQuit(time, nick, message) {}
    onTopic(time, nick, topic) {}

    static combine(collectors) {
        return new CombinedCollector(collectors);
    }
};