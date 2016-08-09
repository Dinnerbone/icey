const XRegExp = require('xregexp');
const fs = require('mz/fs');
const es = require('event-stream');
const Events = require('../events');

class ZncParser {
    constructor() {
        const subs = {
            time: XRegExp('\\[(?<time>\\d{2}:\\d{2}:\\d{2})\\]'),
            hostmask: XRegExp('\\((?<ident>\\S+)@(?<host>\\S+)\\)'),
            system: XRegExp.escape('***'),
        };
        this.patterns = [
            {
                pattern: XRegExp.build('^{{time}} \\* (?<nick>\\S+) (?<action>.*)$', subs),
                result: (match, date) => new Events.Action( `${date} ${match.time}`, {nick: match.nick}, match.action),
            },
            {
                pattern: XRegExp.build('^{{time}} <(?<nick>[^>]+)> (?<message>.*)$', subs),
                result: (match, date) => new Events.Message(`${date} ${match.time}`, {nick: match.nick}, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Joins: (?<nick>\\S+) {{hostmask}}$', subs),
                result: (match, date) => new Events.Join(`${date} ${match.time}`, {nick: match.nick, user: {ident: match.ident, host: match.host}}),
            },
            {
                pattern: XRegExp.build('{{time}} {{system}} (?<victimNick>\\S+) was kicked by (?<nick>\\S+) \\((?<message>.+)\\)$', subs),
                result: (match, date) => new Events.Kick(`${date} ${match.time}`, {nick: match.nick}, {nick: match.victimNick}, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} (?<nick>\\S+) sets mode: (?<modes>.+)$', subs),
                result: (match, date) => new Events.Mode(`${date} ${match.time}`, {nick: match.nick}, match.modes),
            },
            {
                pattern: XRegExp.build('{{time}} {{system}} (?<nick>\\S+) is now known as (?<newNick>\\S+)$', subs),
                result: (match, date) => new Events.Nick(`${date} ${match.time}`, {nick: match.nick}, match.newNick),
            },
            {
                pattern: XRegExp.build('^{{time}} -(?<nick>[^-]+)- (?<message>.*)$', subs),
                result: (match, date) => new Events.Notice(`${date} ${match.time}`, {nick: match.nick}, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Parts: (?<nick>\\S+) {{hostmask}} \\((?<message>.*)\\)$', subs),
                result: (match, date) => new Events.Part(`${date} ${match.time}`, {nick: match.nick, user: {ident: match.ident, host: match.host}}, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Quits: (?<nick>\\S+) {{hostmask}} \\((?<message>.*)\\)$', subs),
                result: (match, date) => new Events.Quit(`${date} ${match.time}`, {nick: match.nick, user: {ident: match.ident, host: match.host}}, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} (?<nick>\\S+) changes topic to \'(?<topic>.*)\'$', subs),
                result: (match, date) => new Events.Topic(`${date} ${match.time}`, {nick: match.nick}, match.topic),
            },
        ];
    }

    parseLine(date, line) {
        for (let i = 0; i < this.patterns.length; i++) {
            const entry = this.patterns[i];
            const match = XRegExp.exec(line, entry.pattern);
            if (match) {
                return entry.result(match, date);
            }
        }
        return null;
    }

    parseFile(date, filename) {
        return new Promise((resolve, reject) => {
            const lines = [];
            fs.createReadStream(filename)
                .pipe(es.split())
                .pipe(es.mapSync(line => {
                    const event = this.parseLine(date, line);
                    if (event) lines.push(event);
                }))
                .on('error', error => reject(error))
                .on('end', () => {
                    resolve(lines);
                });
        });
    }
}

module.exports = ZncParser;