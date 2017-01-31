var server = require('pushstate-server');

console.log('Running Server on port 9000');

server.start({
  port: 9000,
  directory: 'build'
});
