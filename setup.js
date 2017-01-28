var fs = require('fs');
var inquirer = require('inquirer');
var gutil = require('gulp-util');
var exec = require('child_process').exec;


/*
  This Setup Script tries to do the following things:

  1. configure IP
  2. select DB
  3. select install path
  4. autostart?
  5. install
  6. start all the things
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
            value: 'local',
            name: 'local' + gutil.colors.grey(' - already running'),
            key: 'l'
          },
          {
            value: 'docker',
            name: 'docker' + gutil.colors.grey(' - start locally with docker (requires Docker installed and working for the current user)'),
            key: 'd'
          },
          {
            value: 'remote',
            name: 'remote' + gutil.colors.grey(' - enter a remote address next'),
            key: 'r'
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
    questionFactory.autostart()
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
    var cmd = 'cd ' + directory + ' && npm install && cd ..';
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

function startMongoInDocker() {
  return new Promise(function(resolve, reject) {
    var containerName = 'lightnet_mongo';
    var cmd = 'docker run -d --name ' + containerName + ' mongo';
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      console.log('Docker container ("' + containerName + '") was started as daemon.');

      resolve(containerName);
    });
  });
}

function handleDBSelection(databaseType) {
  if (databaseType === 'local') {
    return Promise.resolve('mongodb://mongo/lightnet');
  } else if (databaseType === 'docker') {
    return startMongoInDocker()
      .then(containerName => {
        return 'mongodb://' + containerName + '/lightnet';
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
      console.log('Starting the ' + gutil.colors.cyan('Lightnet Webinterface'));
      //TODO start server and webinterface
    });
}

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
