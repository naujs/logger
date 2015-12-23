'use strict';

// These methods are from trace
function union(obj, args) {
  for (var i = 0, len = args.length; i < len; i += 1) {
    var source = args[i];
    for ( var prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
};

var formatRegExp = /%[sdjt]/g;
var nodeUtil = require('util');
function format(f) {
  var inspectOpt = this.inspectOpt;
  var args = arguments;
  var i = 0;

  if (typeof f !== 'string') {
    var objects = [];
    for (; i < args.length; i++) {
      objects.push(nodeUtil.inspect(args[i], inspectOpt));
    }
    return objects.join(' ');
  }

  i = 1;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
    case '%s':
      return String(args[i++]);
    case '%d':
      return Number(args[i++]);
    case '%j':
      try {
        return JSON.stringify(args[i++]);
      } catch(e) {
        return '[Circular]';
      }
    case '%t':
      return nodeUtil.inspect(args[i++], inspectOpt);
    default:
      return x;
    }
  });
  for ( var len = args.length, x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + nodeUtil.inspect(x, inspectOpt);
    }
  }
  return str;
};

var EventEmitter = require('events')
  , util = require('@naujs/util')
  , tracer = require('tracer');

class Logger {
  constructor(ns) {
    this._ns = ns;
    this._logLevel = util.getEnv('LOG_LEVEL') || 'debug';

    this._currentNs = util.getEnv('LOG_NAMESPACE') || null;
    if (this._currentNs) {
      this._nsRegExp = new RegExp('^' + this._currentNs.replace('*', '(.*)', 'gi') + '$');
    } else {
      this._nsRegExp = null;
    }

    this._logger = tracer.colorConsole({
      level: this._logLevel
    });
  }
}

Logger._listeners = [];

Logger.addListener = (listener) => {
  Logger._listeners.push(listener);
};

Logger.clearListener = () => {
  Logger._listeners = [];
};

['info', 'debug', 'trace', 'warn', 'error'].forEach((method) => {
  Logger.prototype[method] = function(...args) {
    if (this._currentNs && this._ns && !this._nsRegExp.test(this._ns)) {
      return;
    }

    if (this._ns) {
      args[0] = '<' + this._ns + '> ' + args[0];
    }

    Logger._listeners.forEach((listener) => {
      listener(method, format.apply(this, args));
    });

    this._logger[method].apply(this._logger, args);
  };
});

module.exports = Logger;
