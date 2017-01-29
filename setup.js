var fs = require('fs');
var inquirer = require('inquirer');
var gutil = require('gulp-util');
var exec = require('child_process').exec;


/*
  This Setup Script tries to do the following things:

  1. configure IP
  2. select DB
  3. select install path
  4. start all the things
  //5. autostart?
*/

var questionFactory = {
  interface: () => getListOfInterfaces()
    .then(interfaces => {
      return {
        type: 'list',
        name: 'interface',
        message: 'Which Network Interface do you want to use?',
        choices: interfaces,
        validate: function (answer) {
          return getAddressForInterface(answer.interface)
            .then(address => {
              if (!address) {
                return 'No IP Address was found for this interface!';
              }
              return true;
            })
        }
      };
    }),

    database: () => {
      return Promise.resolve({
        type: 'list',
        name: 'databaseType',
        message: 'What Database do you wish to use?',
        choices: [
          {
            name: 'Local' + gutil.colors.grey(' - already running'),
            value: 'local'
          },
          {
            name: 'Docker' + gutil.colors.grey(' - start locally with docker (requires Docker installed and working for the current user)'),
            value: 'docker'
          },
          {
            name: 'Remote' + gutil.colors.grey(' - enter a remote address next'),
            value: 'remote'
          },
        ]
      });
    },

    autostart: () => {
      return Promise.resolve({
        type: 'confirm',
        name: 'autostart',
        message: 'Do you wish to automatically start the lightnet server on boot?'
      });
    },

    startnow: () => {
      return Promise.resolve({
        type: 'confirm',
        name: 'startnow',
        message: 'Do you wish to start the lightnet server now?'
      });
    }
};

function askQuestions(interfaces) {
  return Promise.all([
    questionFactory.interface(),
    questionFactory.database(),
    questionFactory.startnow(),
    //questionFactory.autostart()
  ]).then(questions => inquirer.prompt(questions));
}

function getListOfInterfaces() {
  var cmd = 'ifconfig | sed \'s/[ \t].*//;/^\(lo\|\)$/d\'';
  return new Promise(function(resolve, reject) {
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      resolve(stdout
        .split('\n')
        .map(interface => {
          var result = interface.trim();
          if (result.indexOf(':') === result.length - 1) {
            result = result.substr(0, result.length - 1);
          }
          return result;
        })
        .filter(interface => !!interface));
    });
  });
}

function getAddressForInterface(interface) {
  return new Promise(function(resolve, reject) {
    var cmd = 'ifconfig ' + interface + '| grep "inet " | grep -v 127.0.0.1 | awk \'{print $2}\'';
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      if (stdout.indexOf('addr:') >= 0) {
        stdout = stdout.replace('addr:', '');
      }

      resolve(stdout.trim());
    });
  });
}

function npmInstall(directory) {
  return new Promise(function(resolve, reject) {
    var cmd = 'cd ' + directory + ' && npm install';
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      console.log('done.');

      resolve(stdout);
    });
  });
}

function npmStart(directory) {
  return new Promise(function(resolve, reject) {
    var cmd = 'cd ' + directory + ' && npm run daemon';
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      console.log('done.');

      resolve(stdout);
    });
  });
}

function startMongoInDocker(mongoImage) {
  return new Promise(function(resolve, reject) {
    console.log('Starting Docker container (' + containerName + ') as daemon.');
    var containerName = 'lightnet_mongo';
    var cmd = 'docker run -d -p 27017:27017 --hostname ' + containerName + ' --name ' + containerName + ' ' + mongoImage;
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      console.log('done.');

      resolve(containerName);
    });
  });
}

function handleDBSelection(databaseType) {
  if (databaseType === 'local') {
    return Promise.resolve('mongodb://localhost:27017/lightnet');
  } else if (databaseType === 'docker') {
    return startMongoInDocker('mongo')
      .then(containerName => {
        return 'mongodb://localhost:27017/lightnet';
      })
  } else if (databaseType === 'remote') {
    return askForDBUrl()
      .then(answer => answer.dbUrl);
  } else {
    throw new Error('tsnh - unexpected choice', databaseType);
  }
}

function updateConfig(updateFunc) {
    var config = require('./server/config.json');
    updateFunc(config);
    fs.writeFileSync('./server/config.json', JSON.stringify(config, null, '\t'), 'utf8');
    return Promise.resolve();
}

function startLightnet() {
  return Promise.resolve()
    .then(() => {
      console.log('Installing dependencies for the ' + gutil.colors.cyan('Lightnet Server'));
      return npmInstall('server');
    }).then(() => {
      console.log('Installing dependencies for the ' + gutil.colors.cyan('Lightnet Webinterface'));
      return npmInstall('webinterface');
    }).then(() => {
      console.log('Starting the ' + gutil.colors.cyan('Lightnet Server'));
      return npmStart('server', 'npm start');
    }).then(() => {
      console.log('Starting the ' + gutil.colors.cyan('Lightnet Webinterface'));
      return npmStart('webinterface', 'npm start');
    }).then(() => {
      //TODO start server and webinterface
    });
}

console.log('\n\n'+
'╔════════════════════════════════════════════════════════════════════════════════════╗\n'+
'║   __         __     ______     __  __     ______   __   __     ______     ______   ║\n'+
'║  /\\ \\       /\\ \\   /\\  ___\\   /\\ \\_\\ \\   /\\__  _\\ /\\ "-.\\ \\   /\\  ___\\   /\\__  _\\  ║\n'+
'║  \\ \\ \\____  \\ \\ \\  \\ \\ \\__ \\  \\ \\  __ \\  \\/_/\\ \\/ \\ \\ \\-.  \\  \\ \\  __\\   \\/_/\\ \\/  ║\n'+
'║   \\ \\_____\\  \\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\    \\ \\_\\  ║\n'+
'║    \\/_____/   \\/_/   \\/_____/   \\/_/\\/_/     \\/_/   \\/_/ \\/_/   \\/_____/     \\/_/  ║\n'+
'║                                                                                    ║\n'+
'╚════════════════════════════════════════════════════════════════════════════════════╝\n'+
gutil.colors.bold('\n  LightNet Automated Setup v' + require('./package.json').version + ' \n\n')+
'This setup will ask you a few questions to determine your lightnet configuration. \n');
console.log('# running in node v' + process.versions.node + '\n\n');

askQuestions()
  .then(answers => {
    return getAddressForInterface(answers.interface)
      .then(address => {
        answers.ipAddress = address;
        return answers;
      });
  })
  .then(answers => {
    return handleDBSelection(answers.databaseType)
      .then(dbUrl => {
        answers.database = dbUrl;
        return answers;
      });
  })
  .then(answers => {
    console.log('using IP ' + gutil.colors.cyan(answers.ipAddress));
    console.log('using DB at ' + gutil.colors.cyan(answers.database));

    return updateConfig(config => {
      config.appIP = answers.ipAddress;
      config.dbUrl = answers.database;
    }).then(() => {
      console.log('updated config.json');
      return answers;
    });
  })
  .then(answers => {
    if (answers.startnow) {
      return startLightnet()
        .then(() => answers);
    }
    return answers;
  })
  .then(answers => {
    if (answers.autostart) {
      console.log('Autostart configuration is not yet implemented');
    }
    return answers;
  })
  .catch(err => console.error(gutil.colors.red(err)));
