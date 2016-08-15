const Collector = require('./collectors/eventcount');

const icey = function(config) {
    if (typeof config !== 'object') throw new Error('Invalid config (must be an object)');
    let parser;
    const collector = new Collector();
    if (typeof config.parser === 'object') {
        if (typeof config.parser.name === 'undefined') throw new Error('Invalid config: Missing \'parser.name\' string');
        if (typeof config.parser.name !== 'string') throw new Error('Invalid config: \'parser.name\' is invalid (should be a string)');
        const name = config.parser.name;
        if (typeof icey.parsers[name] === 'undefined') throw new Error(`Invalid config: unknown parser '${name}'`);
        parser = icey.parsers[name](collector, config.parser);
    } else if (typeof config.parser === 'function') {
        parser = config.parser(collector);
    } else if (config.parser === undefined) {
        throw new Error('Invalid config: Missing \'parser\' block');
    } else {
        throw new Error('Invalid config: \'parser\' is invalid (should be an object or function)');
    }

    parser.then(() => console.log(JSON.stringify(collector.counter)))
    .catch(error => console.error(error));
};

const loadParser = name => (collector, config) => {
    const parser = require(`./parsers/${name}`);
    return parser.process(collector, config);
};

icey.parsers = {
    znc: loadParser('znc'),
};

module.exports = icey;