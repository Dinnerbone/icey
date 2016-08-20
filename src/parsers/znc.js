const XRegExp = require('xregexp');
const fs = require('mz/fs');
const es = require('event-stream');
const moment = require('moment');
const path = require('path');

class ZncParser {
    constructor(counter, progress) {
        this.counter = counter;
        this.progress = progress;

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

    parseFile(date, file) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(file)
                .pipe(es.split())
                .pipe(es.mapSync(line => this.parseLine(date, line)))
                .on('error', error => reject(error))
                .on('end', () => resolve());
        });
    }

    parseDir(dir) {
        return fs.readdir(dir)
            .then(files => {
                const dates = [];
                let result = Promise.resolve();
                let totalBytes = 0;
                files.forEach(file => {
                    const name = path.parse(file).name;
                    const date = moment(name, 'YYYY-MM-DD');
                    if (date.isValid()) {
                        const filename = path.join(dir, file);
                        const bytes = fs.statSync(filename).size;
                        totalBytes += bytes;
                        dates.push({date, name, path: filename, size: bytes});
                    }
                });
                dates.sort((a, b) => a.date.isAfter(b.date) ? 1 : -1);
                this.progress.start('parsing log files [:bar] :percent (:date) - :etas remaining', totalBytes);
                dates.forEach(file => {
                    result = result
                        .then(() => this.parseFile(file.name, file.path))
                        .then(() => this.progress.tick(file.size, {date: file.name}));
                });
                return result;
            })
            .catch(err => {
                this.progress.end();
                throw err;
            })
            .then(() => this.progress.end());
    }

    static process(collector, config, progress) {
        if (config.path === undefined) throw new Error('Parser config: Missing \'path\' string');
        if (typeof config.path !== 'string') throw new Error('Parser config: \'path\' is invalid (should be a string!)');
        return new ZncParser(collector, progress).parseDir(config.path);
    }
}

module.exports = ZncParser;