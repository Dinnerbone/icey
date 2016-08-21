const Collector = require('./collectors/eventcount');
const CLIProgressBar = require('./progress/bar');

const icey = function(config) {
    if (typeof config !== 'object') throw new Error('Invalid config (must be an object)');

    let parser;
    if (typeof config.parser === 'object') {
        if (typeof config.parser.name === 'undefined') throw new Error('Invalid config: Missing \'parser.name\' string');
        if (typeof config.parser.name !== 'string') throw new Error('Invalid config: \'parser.name\' is invalid (should be a string)');
        const name = config.parser.name;
        if (typeof icey.parsers[name] === 'undefined') throw new Error(`Invalid config: unknown parser '${name}'`);
        parser = icey.parsers[name];
    } else if (config.parser === undefined) {
        throw new Error('Invalid config: Missing \'parser\' block');
    } else {
        throw new Error('Invalid config: \'parser\' is invalid (should be an object)');
    }

    let writer;
    if (typeof config.writer === 'object') {
        if (typeof config.writer.name === 'undefined') throw new Error('Invalid config: Missing \'writer.name\' string');
        if (typeof config.writer.name !== 'string') throw new Error('Invalid config: \'writer.name\' is invalid (should be a string)');
        const name = config.writer.name;
        if (typeof icey.writers[name] === 'undefined') throw new Error(`Invalid config: unknown writer '${name}'`);
        writer = icey.writers[name](config.writer);
    } else if (config.writer === undefined) {
        throw new Error('Invalid config: Missing \'writer\' block');
    } else {
        throw new Error('Invalid config: \'writer\' is invalid (should be an object)');
    }

    const collectors = [];
    if (typeof config.collectors === 'object') {
        for (const name in config.collectors) {
            const collector = icey.collectors[name];
            if (collector === undefined) throw new Error(`Invalid config: unknown collector '${name}'`);
            collectors.push(collector(config.collectors[name]));
        }
    } else if (config.collectors === undefined) {
        throw new Error('Invalid config: Missing \'collectors\' block');
    } else {
        throw new Error('Invalid config: \'collectors\' is invalid (should be an object)');
    }

    const collector = Collector.combine(collectors);
    parser(collector, config.parser, new CLIProgressBar())
        .then(() => collector.save((...args) => writer.write(...args)))
        .catch(err => {
            console.error(err);
        });
};

const loadCollector = name => config => {
    const collector = require(`./collectors/${name}`);
    return new collector(config);
};

const loadWriter = name => config => {
    const writer = require(`./writers/${name}`);
    return new writer(config);
};

const loadParser = name => (collector, config, progress) => {
    const parser = require(`./parsers/${name}`);
    return parser.process(collector, config, progress);
};

icey.parsers = {
    znc: loadParser('znc'),
};

icey.writers = {
    json: loadWriter('json'),
};

icey.collectors = {
    eventcount: loadCollector('eventcount'),
    sentiments: loadCollector('sentiments'),
};

module.exports = icey;