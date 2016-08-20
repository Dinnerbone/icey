const ProgressBar = require('progress');

module.exports = class CLIProgressBar {
    start(title, length) {
        this.bar = new ProgressBar(title, {
            complete: '—',
            incomplete: ' ',
            width: 20,
            total: length,
        });
    }

    tick(...args) {
        this.bar.tick(...args);
    }

    end() {
        this.bar.terminate();
        this.bar = null;
    }
};