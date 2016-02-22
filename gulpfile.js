var gulp = require('gulp');
var exec = require('child_process').exec;
var gutil = require('gulp-util');

gulp.task('docker-machine:create', function(cb) {
  exec('docker-machine create --driver virtualbox lightnet', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('docker-machine:start', ['server:build'], function(cb) {
  exec('docker-machine start lightnet', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('build', function(cb) {
  exec('docker-compose build', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('run', ['build'], function(cb) {
  exec('docker-compose up -d', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('status', function(cb) {
  exec('docker-compose ps', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('server:restart', function(cb) {
  exec('docker-compose restart server', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('webinterface:restart', function(cb) {
  exec('docker-compose restart webinterface', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('mongo:restart', function(cb) {
  exec('docker-compose restart mongo', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('server:stop', function(cb) {
  exec('docker-compose stop server', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('webinterface:stop', function(cb) {
  exec('docker-compose stop webinterface', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('mongo:stop', function(cb) {
  exec('docker-compose stop mongo', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('clean', function(cb) {
  exec('docker-compose rm -f', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

gulp.task('testhandler:run', function() {
});

gulp.task('testhandler:restart', function() {
});

gulp.task('testhandler:stop', function() {
});


gulp.task('watch', ['run', 'testhandler:run'], function() {
  var serverWatcher = gulp.watch('server/**/*.js', ['server:restart']);
  serverWatcher.on('change', function(event) {
    gutil.log(gutil.colors.red('[Server]'), '- File', gutil.colors.magenta(event.path), 'was', gutil.colors.green(event.type), ', running tasks...');
  });

  var webinterfaceWatcher = gulp.watch('webinterface/**/*.js', ['server:restart']);
  webinterfaceWatcher.on('change', function(event) {
    gutil.log(gutil.colors.red('[Webinterface]'), '- File', gutil.colors.magenta(event.path), 'was', gutil.colors.green(event.type), ', running tasks...');
  });

  var testhandlerWatcher = gulp.watch('handlers/TestHandler/**/*.*', ['testhandler:restart']);
  testhandlerWatcher.on('change', function(event) {
    gutil.log(gutil.colors.red('[TestHandler]'), '- File', gutil.colors.magenta(event.path), 'was', gutil.colors.green(event.type), ', running tasks...');
  });
});

gulp.task('restart', ['server:restart', 'webinterface:restart', 'mongo:restart', 'testhandler:restart']);
gulp.task('stop', ['server:stop', 'webinterface:stop', 'mongo:stop', 'testhandler:stop']);
gulp.task('start', ['run']);
gulp.task('prepare', ['docker-machine:create']);


gulp.task('default', ['watch']);