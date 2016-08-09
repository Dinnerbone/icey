/* eslint no-unused-vars: "off" */

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
};