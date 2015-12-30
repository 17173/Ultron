'use strict';

const log4js = require('log4js');
const path = require('path');
const join = path.join;

log4js.configure({
  appenders: [
    { type: 'console' },
    { 
      type: 'file', 
      filename: join(path.dirname(__dirname),'logs','debug.log'), 
      maxLogSize: 1024,
      category: 'cheese' 
    }

  ],
  replaceConsole: true
});

const logger = module.exports = log4js.getLogger('cheese');
logger.setLevel('INFO');
