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

module.exports = Events;