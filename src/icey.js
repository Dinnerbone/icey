const Collector = require('./collectors/eventcount');
const fs = require('mz/fs');

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
    const writeFile = (name, object) => fs.writeFile(name, JSON.stringify(object));
    parser(collector, config.parser).then(() => collector.save(writeFile));
};

const loadCollector = name => config => {
    const collector = require(`./collectors/${name}`);
    return new collector(config);
};

const loadParser = name => (collector, config) => {
    const parser = require(`./parsers/${name}`);
    return parser.process(collector, config);
};

icey.parsers = {
    znc: loadParser('znc'),
};

icey.collectors = {
    eventcount: loadCollector('eventcount'),
};

module.exports = icey;