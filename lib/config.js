var Config = require('../config.json');
var Package = require('../package.json');
var Path = require('path');

// Read the NODE_ENV variable end set it do development if none is provided
process.env.NODE_ENV = Config.environment = process.argv[2] || process.env.NODE_ENV || 'development';

// Make a short cut for the development mode
Config.isDevEnv = Config.environment === 'development';
Config.version = Package.version;

// Set assets dir depending on current enviroment, the dev folder contains
// uncompressed source code like less/sass or typescript files. after running
// "gulp build" resources will be compiled to assets folder.
Config.assetsDir = Path.join(__dirname, (Config.isDevEnv ? '/../assets_dev' : '/../assets'));


module.exports = Config;
