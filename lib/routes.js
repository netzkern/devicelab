var Misc = require('./misc');

exports.endpoints = [

  { method: ['GET'], path: '/', config: Misc.appGet },
  { method: ['POST'], path: '/', config: Misc.appPost },
  { method: ['GET'], path: '/r', config: Misc.redirectGet }
];
