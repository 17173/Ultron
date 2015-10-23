var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var log = module.exports = {};

log.info = function(msg) {
  console.log(msg.info);
};

log.warn = function(msg) {
  console.log(msg.warn);
};

log.error = function(msg) {
  console.log(msg.error);
};

log.help = function(msg) {
  console.log(msg.help);
};