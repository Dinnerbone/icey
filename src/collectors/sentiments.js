const fs = require('fs');
const XRegExp = require('xregexp');
const Collector = require('../collector');

module.exports = class SentimentCollector extends Collector {
    constructor(config) {
        super();
        this.months = {};
        this.lexicon = {};

        if (config === undefined) throw new Error('Config object is required');
        if (config.lexicon === undefined) throw new Error('Invalid config: \'lexicon\' is required');
        this.loadLexicon(config.lexicon);
    }

    loadLexicon(file) {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        const pattern = XRegExp('^(?<word>[a-z]+)\t(?<type>[a-z]+)\t1$');
        lines.forEach(line => {
            const match = XRegExp.exec(line.trim(), pattern);
            if (match) {
                if (this.lexicon[match.word] === undefined) this.lexicon[match.word] = {};
                const entry = this.lexicon[match.word];
                if (match.type === 'positive') {
                    entry.sentiment = 1;
                } else if (match.type === 'negative') {
                    entry.sentiment = -1;
                } else {
                    entry[match.type] = 1;
                }
            }
        });
        if (Object.keys(this.lexicon).length === 0) throw new Error('Invalid lexicon: no valid lines found, is it the right format? Try downloading the NRC Emoticon Lexicon! http://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm');
    }

    getWord(word) {
        let result = this.lexicon[word];
        if (result === undefined && word.endsWith('s')) result = this.lexicon[word.slice(0, -1)];
        return result || null;
    }

    getWords(message) {
        return message.toLowerCase()
            .replace(/[^a-z0-9 ]/g, '')
            .split(/ /)
            .map(word => word.length > 0 ? this.getWord(word) : null)
            .filter(result => result !== null);
    }

    combineScore(words) {
        if (words.length === 0) return null;
        const result = {};
        words.forEach(word => {
            Object.keys(word).forEach(key => {
                if (result[key] === undefined) {
                    result[key] = word[key];
                } else {
                    result[key] += word[key];
                }
            });
        });
        Object.keys(result).forEach(key => {
            result[key] /= words.length;
        });
        return result;
    }

    increment(time, message) {
        const words = this.getWords(message);
        if (words.length === 0) return;
        const month = time.format('YYYY-MM');
        const monthWords = this.months[month];

        if (monthWords === undefined) {
            this.months[month] = words;
        } else {
            this.months[month].push(...words);
        }
    }

    onAction(time, nick, message) {
        this.increment(time, message);
    }

    onMessage(time, nick, message) {
        this.increment(time, message);
    }

    onNotice(time, nick, message) {
        // Notices will be treated as messages, as I don't think they're used in a channel context enough
        // to justify their own counter.
        this.increment(time, message);
    }

    save(write) {
        const months = {};
        Object.keys(this.months).forEach(month => {
            months[month] = this.combineScore(this.months[month]);
        });
        return write('sentiments/months', months);
    }
};