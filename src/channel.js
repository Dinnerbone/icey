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
        this.author = channel.updateActor(this.author);
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
            this.author = channel.updateActor(this.author);
            this.victim = channel.updateActor(this.victim);
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
            // channel.renameNick(this.nick); TODO
        }
    },
});

class Channel {
    constructor() {
        this.actors = {};
        this.events = [];
    }

    addEvent(event) {
        event.apply(this);
        this.events.push(event);
    }

    updateActor(actor) {
        let result = this.actors[actor.nick];
        if (result === undefined) {
            result = Object.assign({}, actor);
            this.actors[actor.nick] = result;
        } else {
            Object.assign(result, actor);
        }
        return result;
    }

    removeActor(actor) {
        delete this.actors[actor.nick];
    }

    updateModes(instructions) {
        // TODO
    }

    updateTopic(topic) {
        // TODO
    }

    static get Events() {
        return Events;
    }
}

module.exports = {Channel};