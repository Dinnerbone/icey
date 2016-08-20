const Collector = require('../collector');
module.exports = class EventCountCollector extends Collector {
    constructor() {
        super();
        this.counter = {};
    }

    increment(time, event, nick) {
        if (this.counter[event] === undefined) this.counter[event] = {total: 0, byNick: {}, byDay: {}};
        const tally = this.counter[event];
        const day = time.format('YYYY-MM-DD');
        const hour = time.format('H');
        tally.total++;

        if (tally.byNick[nick] === undefined) {
            tally.byNick[nick] = 1;
        } else {
            tally.byNick[nick]++;
        }

        if (tally.byDay[day] === undefined) tally.byDay[day] = {total: 0, byNick: {}, byHour: {}};
        const dayTally = tally.byDay[day];
        dayTally.total++;

        if (dayTally.byNick[nick] === undefined) {
            dayTally.byNick[nick] = 1;
        } else {
            dayTally.byNick[nick]++;
        }

        if (dayTally.byHour[hour] === undefined) dayTally.byHour[hour] = {total: 0, byNick: {}};
        const hourTally = dayTally.byHour[hour];
        hourTally.total++;

        if (hourTally.byNick[nick] === undefined) {
            hourTally.byNick[nick] = 1;
        } else {
            hourTally.byNick[nick]++;
        }
    }

    onAction(time, nick) {
        this.increment(time, 'action', nick);
    }

    onMessage(time, nick) {
        this.increment(time, 'message', nick);
    }

    onKick(time, nick) {
        this.increment(time, 'kick', nick);
    }

    onMode(time, nick) {
        this.increment(time, 'mode', nick);
    }

    onNotice(time, nick) {
        // Notices will be treated as messages, as I don't think they're used in a channel context enough
        // to justify their own counter.
        this.increment(time, 'message', nick);
    }

    onTopic(time, nick) {
        this.increment(time, 'topic', nick);
    }

    save(write) {
        return write('eventcount', this.counter);
    }
};