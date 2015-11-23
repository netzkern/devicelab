'use strict';

// extend configuration
var Config = require('./lib/config');
var Package = require('./package.json');

// Load modules
var Hapi = require('hapi');
var Path = require('path');
var Fs = require('fs');
var Hoek = require('hoek');
var Routes = require('./lib/routes');

// Declare internals
var internals = {
  version: Package.version,
  onPreResponse: function(request, reply) {

    var response = request.response;

    // Handle error
    if (response.isBoom) {

      console.log(response);

      return reply
        .view('error', {
          credentials: request.auth.credentials,
          statusCode: response.output.statusCode,
        })
        .code(response.output.statusCode);
    }

    if (response.variety === 'view') {

      var ctx = response.source.context = response.source.context || {};
      ctx.version = internals.version;
      ctx.credentials = request.auth.credentials;
      ctx.config = this.config;
    }

    return reply(response);
  }
};

var server = new Hapi.Server();

server.connection({
  host: process.env.HOST || Config.host || '0.0.0.0',
  port: process.env.PORT || Config.port || 3000,
  routes: {
    cors: {
      origin: Config.corsOrigins
    },
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
});

server.debug = {
  request: ['error']
};

server.cache = {
  engine: require('catbox-memory'),
  shared: true
};

server.bind({
  config: Config
});

var plugins = [{
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  },
  require('inert'),
  require('vision')
];

server.register(plugins, function(err) {

  Hoek.assert(!err, 'Failed loading plugin: ' + err);
  server.ext('onPreResponse', internals.onPreResponse);

  var swig = require('swig');
  swig.setDefaults({
    cache: false, // is cached by hapi
    varControls: ['{$', '$}'], // default is {{ }} it colides with angularjs
    tagControls: ['{%', '%}'],
    cmtControls: ['{#', '#}'],
  });

  server.views({
    path: Config.assetsDir + '/views',
    engines: {
      html: {
        module: swig,
        compileMode: 'sync',
        isCached: !Config.isDevEnv
      }
    },
    compileOptions: {
      colons: true,
      pretty: Config.isDevEnv
    }
  });

  // Register routes
  server.route(Routes.endpoints);

  // Register route for static files
  server.route({
    method: 'GET',
    path: Config.isDevEnv ? '/{path*}' : ('/' + Config.assetsHash + '/{path*}'),

    handler: {
      directory: {
        path: Config.assetsDir + '/static'
      }
    },
    config: {
      auth: false,
      cache: {
        expiresIn: 60 * 1000 * 60 * 60 * 24,
        privacy: 'private'
      }
    }
  });

  server.start(function() {

    console.info('Server started at ' + server.info.uri);
  });
});
