// Home handler
var Utils = require('./utils');
var Config = require('./config');
var Joi = require('joi');
var Fs = require('fs');
var Boom = require('boom');
var Process = require('child_process');

exports.redirectGet = {
  handler: function(request, reply) {

    if (internals.browserSyncProc) {

      return reply.view('redirect', internals.urls);
    }

    return reply.redirect('/');
  }
};

exports.appGet = {
  handler: function(request, reply) {


    if (internals.browserSyncProc) {

      return reply.view('index', internals.urls);
    }

    return reply.view('index', {});
  }
};


exports.appPost = {
  validate: {
    payload: {
      urlProxy: Joi.string().required(),
    }
  },
  handler: function(request, reply) {

    exitBrowserSyncProc();

    var host = request.info.host.split(':');
    var portBase = parseInt(host[1]);
    host = host[0];
    var portRedirect = Config.browserSync.portRedirect || portBase + 1;
    var portUi = Config.browserSync.portUi || portBase + 2;

    var args = [
      'start',
      '--proxy',
      request.payload.urlProxy,
      '--no-open',
      '--port',
      portRedirect,
      '--ui-port',
      portUi
    ];

    console.log('spawning child process: ' + Config.browserSync.processPath + ' ' +  args.join(' '));
    internals.browserSyncProc = Process.spawn(Config.browserSync.processPath, args);

    var replyOnce = function(payload) {

      try {

        return reply.redirect('/');

      } catch (err) {

        // Already replied
      }
    };

    internals.browserSyncProc.stdout.on('data', function(data) {

      console.log('stdout: ' + data);

      var model = {
        urlProxy: request.payload.urlProxy,
        urlRedirect: 'http://' + host + ':' + portRedirect,
        urlDashboard: 'http://' + host + ':' + portUi,
        urlBookmark: 'http://' + host + ':' + portBase + '/r',
      };

      internals.urls = model;

      replyOnce(model);
    });


    internals.browserSyncProc.stderr.on('data', function(data) {

      console.log('stderr: ' + data);

      replyOnce(Boom.badRequest(data));
    });

    internals.browserSyncProc.on('close', function(code) {

      console.log('child process exited with code ' + code);
      replyOnce(Boom.badRequest(code));
    });
  }
};

var internals = {};

function exitBrowserSyncProc() {

  console.log('exitBrowserSyncProc called');

  if (internals.browserSyncProc) {

    console.log('browserSyncProc.exit called');

    internals.browserSyncProc.kill('SIGINT');
    internals.browserSyncProc = null;
    internals.urls = null;
  }
}

//process.on('exit', exitBrowserSyncProc);
process.once('uncaughtException', exitBrowserSyncProc);
process.once('SIGUSR1', exitBrowserSyncProc);
process.once('SIGHUP', exitBrowserSyncProc);
process.once('SIGINT', exitBrowserSyncProc);
process.once('SIGQUIT', exitBrowserSyncProc);
process.once('SIGABRT', exitBrowserSyncProc);
process.once('SIGTERM', exitBrowserSyncProc);

/* PM2 relaod */
process.once('message', function(msg) {

  if (msg == 'shutdown') {

    exitBrowserSyncProc();
  }
});
