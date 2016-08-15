const fs = require('fs');

const getConfigPath = args => {
    if (args.length === 0) {
        return `${process.cwd()}/config.json`;
    } else if (args.length === 1) {
        return args[0];
    }
    throw new Error('Too many parameters! Usage: [configPath]');
};

module.exports = (args, icey) => {
    const configPath = getConfigPath(args);
    let json;
    try {
        json = fs.readFileSync(configPath, 'utf8');
    } catch (error) {
        if (args.length === 0) {
            throw new Error(`Could not find a config.json in ${process.cwd()}. Please see https://github.com/Dinnerbone/icey/blob/master/README.md for instructions on creating one.`);
        }
        throw new Error(`Unable to read config file '${configPath}' (does it exist and is it accessible?)`);
    }
    let config;
    try {
        config = JSON.parse(json);
    } catch (error) {
        throw new Error(`Error trying to read config file '${configPath}': ${error}`);
    }
    icey(config);
};