class Event {
    constructor(time) {
        this.time = time;
    }

    // eslint-disable-next-line no-unused-vars
    apply(channel) {
    }

    toJSON() {
        return Object.assign({type: this.constructor.name}, this);
    }

    static Reconstruct(obj) {
        return Object.assign(new this(), obj);
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
    Message: class Message extends SingleAuthorEvent {
        constructor(time, author, message) {
            super(time, author);
            this.message = message;
        }
    },
    Notice: class Notice extends SingleAuthorEvent {
        constructor(time, author, message) {
            super(time, author);
            this.message = message;
        }
    },
    Action: class Action extends SingleAuthorEvent {
        constructor(time, author, action) {
            super(time, author);
            this.action = action;
        }
    },
    Join: class Join extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }
    },
    Kick: class Kick extends Event {
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
    Part: class Part extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }

        apply(channel) {
            super.apply(channel);
            channel.removeActor(this.author);
        }
    },
    Quit: class Quit extends SingleAuthorEvent {
        constructor(time, author) {
            super(time, author);
        }

        apply(channel) {
            super.apply(channel);
            channel.removeActor(this.author);
        }
    },
    Mode: class Mode extends SingleAuthorEvent {
        constructor(time, author, instructions) {
            super(time, author, instructions);
            this.instructions = instructions;
        }

        apply(channel) {
            super.apply(channel);
            channel.updateModes(this.instructions);
        }
    },
    Topic: class Topic extends SingleAuthorEvent {
        constructor(time, author, topic) {
            super(time, author, topic);
            this.topic = topic;
        }

        apply(channel) {
            super.apply(channel);
            channel.updateTopic(this.topic);
        }
    },
    Nick: class Nick extends SingleAuthorEvent {
        constructor(time, author, nick) {
            super(time, author, nick);
            this.nick = nick;
        }

        apply(channel) {
            super.apply(channel);
            channel.renameActor(this.author.nick, this.nick);
        }
    },
    fromJson: function(json) {
        if (typeof json === 'string') json = JSON.parse(json);
        const type = json.type;
        delete json.type;
        return this[type].Reconstruct(json);
    },
});

module.exports = Events;