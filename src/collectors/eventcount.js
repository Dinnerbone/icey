const Collector = require('../collector');
module.exports = class EventCountCollector extends Collector {
    constructor() {
        super();
        this.days = {total: {}, nicks: {}};
        this.hours = {total: {}, nicks: {}};
    }

    increment(time, event, nick) {
        const day = time.format('YYYY-MM-DD');
        const hour = time.format('H');

        if (this.days.total[day] === undefined) this.days.total[day] = {};
        const dayTotal = this.days.total[day];
        if (dayTotal[event] === undefined) dayTotal[event] = 0;
        dayTotal[event] += 1;

        if (this.days.nicks[nick] === undefined) this.days.nicks[nick] = {};
        if (this.days.nicks[nick][day] === undefined) this.days.nicks[nick][day] = {};
        const dayNick = this.days.nicks[nick][day];
        if (dayNick[event] === undefined) dayNick[event] = 0;
        dayNick[event] += 1;

        if (this.hours.total[hour] === undefined) this.hours.total[hour] = {};
        const hourTotal = this.hours.total[hour];
        if (hourTotal[event] === undefined) hourTotal[event] = 0;
        hourTotal[event] += 1;

        if (this.hours.nicks[nick] === undefined) this.hours.nicks[nick] = {};
        if (this.hours.nicks[nick][hour] === undefined) this.hours.nicks[nick][hour] = {};
        const hourNick = this.hours.nicks[nick][hour];
        if (hourNick[event] === undefined) hourNick[event] = 0;
        hourNick[event] += 1;
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
        return write('eventcount/days', this.days.total)
            .then(() => write('eventcount/hours', this.hours.total));
    }
};