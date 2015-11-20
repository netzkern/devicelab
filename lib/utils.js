var fs = require('fs');
var path = require('path');

var internals = {
  languageRegExp: /^([a-z]{2})\./i
};

exports.formatString = function(format, values) {

  if (format) {
    var i = 0;
    return format.replace(/%@/g, function(match, index) {

      var value = typeof values[i] !== 'undefined' ? values[i] : match;
      i++;
      return value;
    });
  }

  return '';
};

exports.removeKeys = function(object, keys) {

  for (var i = 0, il = keys.length; i < il; i++) {
    delete object[keys[i]];
  }
};

// Prevent open redirect, https://www.owasp.org/index.php/Open_redirect
exports.sanitizeNext = function(next) {

  return (next && next.charAt(0) === '/' ? next : undefined);
};

exports.contains = function(a, obj) {

  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {

      return true;
    }
  }
  return false;
};

exports.toViewError = function(error) {

  // Handle validation error
  if (error) {

    var errors = {};
    for (var i = 0; i < error.details.length; i++) {
      var detail = error.details[i];
      var group = errors[detail.path] = errors[detail.path] || [];
      group.push(detail.message);
    }

    return errors;
  }
};

exports.isAjax = function(request) {

  var contentTypeHeader = request.headers['content-type'];
  return (contentTypeHeader && contentTypeHeader === 'application/json');
};
