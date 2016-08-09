class Event {
    constructor(time) {
        this.time = time;
    }

    // eslint-disable-next-line no-unused-vars
    apply(channel) {
    }
}

class SingleAuthorEvent extends Event {
    constructor(time, author) {
        super(time);
        this.author = author;
    }

    apply(channel) {
        channel.updateActor(this.author);
    }
}

const Events = Object.freeze({
    Base: Event,
    Message: class extends SingleAuthorEvent {
        constructor(time, author, message) {
            super(time, author);
            this.message = message;
        }
    },
    Notice: class extends SingleAuthorEvent {
        constructor(time, author, message) {
            super(time, author);
            this.message = message;
        }
    },
    Action: class extends SingleAuthorEvent {
        constructor(time, author, action) {
            super(time, author);
            this.action = action;
        }
    },
    Join: class extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }
    },
    Kick: class extends Event {
        constructor(time, author, victim) {
            super(time);
            this.author = author;
            this.victim = victim;
        }

        apply(channel) {
            channel.updateActor(this.author);
            channel.updateActor(this.victim);
            channel.removeActor(this.victim);
        }
    },
    Part: class extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }

        apply(channel) {
            super.apply(channel);
            channel.removeActor(this.author);
        }
    },
    Quit: class extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }

        apply(channel) {
            super.apply(channel);
            channel.removeActor(this.author);
        }
    },
    Mode: class extends SingleAuthorEvent {
        constructor(time, author, instructions) {
            super(time, author, instructions);
            this.instructions = instructions;
        }

        apply(channel) {
            super.apply(channel);
            channel.updateModes(this.instructions);
        }
    },
    Topic: class extends SingleAuthorEvent {
        constructor(time, author, topic) {
            super(time, author, topic);
            this.topic = topic;
        }

        apply(channel) {
            super.apply(channel);
            channel.updateTopic(this.topic);
        }
    },
    Nick: class extends SingleAuthorEvent {
        constructor(time, author, nick) {
            super(time, author, nick);
            this.nick = nick;
        }

        apply(channel) {
            super.apply(channel);
            channel.renameActor(this.author.nick, this.nick);
        }
    },
});

class Channel {
    constructor() {
        this.actors = {};
        this.events = [];
        this.availableModes = {};
        this.channelModes = {};
        this.userModes = {};
        this.lists = {};
    }

    addEvent(event) {
        event.apply(this);
        this.events.push(event);
    }

    updateActor(actor) {
        let user = this.actors[actor.nick];
        if (user === undefined) {
            user = {};
            this.actors[actor.nick] = user;
        }
        if ('user' in actor) Object.assign(user, actor.user);
        actor.user = user;
    }

    removeActor(actor) {
        delete this.actors[actor.nick];
    }

    renameActor(nick, target) {
        if (nick in this.actors) {
            this.actors[target] = this.actors[nick];
            delete this.actors[nick];
        } else {
            this.actors[target] = {};
        }
    }

    updateModes(instructions) {
        const params = instructions.split(' ');
        const modes = params.splice(0, 1)[0].split('');
        let adding = true;

        modes.forEach(mode => {
            if (mode === '+') {
                adding = true;
            } else if (mode === '-') {
                adding = false;
            } else {
                const type = this.availableModes[mode];
                let param = undefined;
                if (type === 'list' || type === 'param' || (type === 'partial' && adding) || type === 'user') {
                    param = params.shift();
                }
                if (adding) {
                    this.setMode(mode, param);
                } else {
                    this.unsetMode(mode, param);
                }
            }
        });
    }

    setMode(mode, param) {
        const type = this.availableModes[mode];
        if (type === 'list') {
            const list = this.lists[mode];
            if (typeof param === 'string' && param.length > 0 && list.indexOf(param) === -1) {
                list.push(param);
            }
        } else if (type === 'param' || type === 'partial') {
            if (typeof param === 'string' && param.length > 0) {
                this.channelModes[mode] = param;
            }
        } else if (type === 'channel') {
            this.channelModes[mode] = true;
        } else if (type === 'user') {
            const list = this.userModes[mode];
            if (typeof param === 'string' && param.length > 0 && list.indexOf(param) === -1) {
                list.push(param);
            }
        } else {
            this.availableModes[mode] = 'channel';
            this.channelModes[mode] = true;
        }
    }

    unsetMode(mode, param) {
        const type = this.availableModes[mode];
        if (type === 'list') {
            const list = this.lists[mode];
            if (typeof param === 'string' && param.length > 0) {
                const index = list.indexOf(param);
                if (index > -1) list.splice(index, 1);
            }
        } else if (type === 'param') {
            if (typeof param === 'string' && param.length > 0) {
                this.channelModes[mode] = null;
            }
        } else if (type === 'partial') {
            this.channelModes[mode] = null;
        } else if (type === 'channel') {
            this.channelModes[mode] = false;
        } else if (type === 'user') {
            const list = this.userModes[mode];
            if (typeof param === 'string' && param.length > 0) {
                const index = list.indexOf(param);
                if (index > -1) list.splice(index, 1);
            }
        } else {
            this.availableModes[mode] = 'channel';
            this.channelModes[mode] = false;
        }
    }

    updateTopic(topic) {
        this.topic = topic;
    }

    setAvailableModes(list, param, partial, channel, user) {
        const all = {list: list.split(''), param: param.split(''), partial: partial.split(''), channel: channel.split(''), user: user.split('')};
        const added = type => all[type].filter(v => this.availableModes[v] === undefined || this.availableModes[v] !== type);
        const removed = type => Object.keys(this.availableModes).filter(v => this.availableModes[v] === type && all[type].indexOf(v) === -1);
        const types = {
            list: {add: added('list'), remove: removed('list'), list: this.lists, initial: () => []},
            param: {add: added('param'), remove: removed('param'), list: this.channelModes, initial: () => null},
            partial: {add: added('partial'), remove: removed('partial'), list: this.channelModes, initial: () => null},
            channel: {add: added('channel'), remove: removed('channel'), list: this.channelModes, initial: () => false},
            user: {add: added('user'), remove: removed('user'), list: this.userModes, initial: () => []},
        };
        const typeNames = Object.keys(types);
        const allToAdd = [];

        typeNames.forEach(type => {
            types[type].add.forEach(mode => {
                if (allToAdd.indexOf(mode) > -1) {
                    throw new Error(`Cannot add mode ${mode} as different types at the same time.`);
                }
                allToAdd.push(mode);
            });
        });

        typeNames.forEach(type => {
            types[type].remove.forEach(mode => {
                delete this.availableModes[mode];
                delete types[type].list[mode];
            });
        });

        typeNames.forEach(type => {
            types[type].add.forEach(mode => {
                this.availableModes[mode] = type;
                types[type].list[mode] = types[type].initial();
            });
        });
    }

    getAvailableModes() {
        return this.availableModes;
    }

    getUserModes() {
        return this.userModes;
    }

    getChannelModes() {
        return this.channelModes;
    }

    getLists() {
        return this.lists;
    }

    static get Events() {
        return Events;
    }
}

module.exports = {Channel};