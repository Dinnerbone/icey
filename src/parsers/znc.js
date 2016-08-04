const XRegExp = require('xregexp');

class ZncParser {
    constructor() {
        const subs = {
            time: XRegExp('\\d{2}:\\d{2}:\\d{2}'),
        };
        this.patterns = [
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\* (?<nick>\\S+)(?: (?<action>.*)|)$', subs),
                result: match => ({
                    type: 'action',
                    time: match.time,
                    nick: match.nick,
                    action: match.action,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] <(?<nick>[^>]+)>(?: (?<message>.*)|)$', subs),
                result: match => ({
                    type: 'message',
                    time: match.time,
                    nick: match.nick,
                    message: match.message,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\*\\*\\* Joins: (?<nick>\\S+) \\((?<ident>\\S+)@(?<host>\\S+)\\)$', subs),
                result: match => ({
                    type: 'join',
                    time: match.time,
                    nick: match.nick,
                    ident: match.ident,
                    host: match.host,
                }),
            },
            {
                pattern: XRegExp.build('\\[({{time}})\\] \\*\\*\\* (?<nick>\\S+) was kicked by (?<kickerNick>\\S+) \\((?<message>.+)\\)', subs),
                result: match => ({
                    type: 'kick',
                    time: match.time,
                    nick: match.nick,
                    kickerNick: match.kickerNick,
                    message: match.message,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\*\\*\\* (?<nick>\\S+) sets mode: (?<modes>.+)$', subs),
                result: match => ({
                    type: 'mode',
                    time: match.time,
                    nick: match.nick,
                    modes: this.parseModeChanges(match.modes),
                }),
            },
            {
                pattern: XRegExp.build('\\[({{time}})\\] \\*\\*\\* (?<nick>\\S+) is now known as (?<newNick>\\S+)', subs),
                result: match => ({
                    type: 'nick',
                    time: match.time,
                    nick: match.nick,
                    newNick: match.newNick,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] -(?<nick>[^-]+)- (?<message>.*)$', subs),
                result: match => ({
                    type: 'notice',
                    time: match.time,
                    nick: match.nick,
                    message: match.message,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\*\\*\\* Parts: (?<nick>\\S+) \\((?<ident>\\S+)@(?<host>\\S+)\\) \\((?<message>.*)\\)$', subs),
                result: match => ({
                    type: 'part',
                    time: match.time,
                    nick: match.nick,
                    ident: match.ident,
                    host: match.host,
                    message: match.message,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\*\\*\\* Quits: (?<nick>\\S+) \\((?<ident>\\S+)@(?<host>\\S+)\\) \\((?<message>.*)\\)$', subs),
                result: match => ({
                    type: 'quit',
                    time: match.time,
                    nick: match.nick,
                    ident: match.ident,
                    host: match.host,
                    message: match.message,
                }),
            },
            {
                pattern: XRegExp.build('^\\[({{time}})\\] \\*\\*\\* (?<nick>\\S+) changes topic to \'(?<topic>.*)\'$', subs),
                result: match => ({
                    type: 'topic',
                    time: match.time,
                    nick: match.nick,
                    topic: match.topic,
                }),
            },
        ];
    }

    parseModeChanges(message) {
        const split = message.split(' ');
        const modes = split[0];
        const params = split.length > 1 ? split.splice(1) : [];
        const result = {params, added: [], removed: []};
        let direction = 'added';
        for (let i = 0; i < modes.length; i++) {
            const char = modes[i];
            if (char === '+') {
                direction = 'added';
            } else if (char === '-') {
                direction = 'removed';
            } else {
                result[direction].push(char);
            }
        }
        return result;
    }

    parseLine(line) {
        for (let i = 0; i < this.patterns.length; i++) {
            const entry = this.patterns[i];
            const match = XRegExp.exec(line, entry.pattern);
            if (match) {
                return entry.result(match);
            }
        }
        return null;
    }
}

module.exports = ZncParser;