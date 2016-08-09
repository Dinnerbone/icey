const XRegExp = require('xregexp');
const fs = require('mz/fs');
const es = require('event-stream');
const moment = require('momentjs');

class ZncParser {
    constructor(counter) {
        this.counter = counter;

        const subs = {
            time: XRegExp('\\[(?<time>\\d{2}:\\d{2}:\\d{2})\\]'),
            hostmask: XRegExp('\\((?<ident>\\S+)@(?<host>\\S+)\\)'),
            system: XRegExp.escape('***'),
        };

        const toMoment = (date, time) => moment(`${date} ${time} Z`, 'YYYY-MM-DD HH:mm:ss Z');

        this.patterns = [
            {
                pattern: XRegExp.build('^{{time}} \\* (?<nick>\\S+) (?<action>.*)$', subs),
                result: (match, date) => this.counter.onAction(toMoment(date, match.time), match.nick, match.action),
            },
            {
                pattern: XRegExp.build('^{{time}} <(?<nick>[^>]+)> (?<message>.*)$', subs),
                result: (match, date) => this.counter.onMessage(toMoment(date, match.time), match.nick, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Joins: (?<nick>\\S+) {{hostmask}}$', subs),
                result: (match, date) => this.counter.onJoin(toMoment(date, match.time), match.nick),
            },
            {
                pattern: XRegExp.build('{{time}} {{system}} (?<victimNick>\\S+) was kicked by (?<nick>\\S+) \\((?<message>.+)\\)$', subs),
                result: (match, date) => this.counter.onKick(toMoment(date, match.time), match.nick, match.victimNick, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} (?<nick>\\S+) sets mode: (?<modes>.+)$', subs),
                result: (match, date) => this.counter.onMode(toMoment(date, match.time), match.nick, match.modes),
            },
            {
                pattern: XRegExp.build('{{time}} {{system}} (?<nick>\\S+) is now known as (?<newNick>\\S+)$', subs),
                result: (match, date) => this.counter.onNick(toMoment(date, match.time), match.nick, match.newNick),
            },
            {
                pattern: XRegExp.build('^{{time}} -(?<nick>[^-]+)- (?<message>.*)$', subs),
                result: (match, date) => this.counter.onNotice(toMoment(date, match.time), match.nick, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Parts: (?<nick>\\S+) {{hostmask}} \\((?<message>.*)\\)$', subs),
                result: (match, date) => this.counter.onPart(toMoment(date, match.time), match.nick, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} Quits: (?<nick>\\S+) {{hostmask}} \\((?<message>.*)\\)$', subs),
                result: (match, date) => this.counter.onQuit(toMoment(date, match.time), match.nick, match.message),
            },
            {
                pattern: XRegExp.build('^{{time}} {{system}} (?<nick>\\S+) changes topic to \'(?<topic>.*)\'$', subs),
                result: (match, date) => this.counter.onTopic(toMoment(date, match.time), match.nick, match.topic),
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
            fs.createReadStream(filename)
                .pipe(es.split())
                .pipe(es.mapSync(line => this.parseLine(date, line)))
                .on('error', error => reject(error))
                .on('end', () => {
                    resolve();
                });
        });
    }
}

module.exports = ZncParser;