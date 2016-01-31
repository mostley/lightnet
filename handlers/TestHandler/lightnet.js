
var lightnet = global.lightnet = {
  apiUrl: 'http://localhost:4050/api',
  currentHandler: null,
  currentHandlerUpdated: false,
  voxels: {}
};

lightnet.addVoxel = function(pos, color) {
  var x = pos[0];
  var y = pos[1];
  var z = pos[2];
  if (!lightnet.voxels[x]) {
    lightnet.voxels[x] = {};
  }
  if (!lightnet.voxels[x][y]) {
    lightnet.voxels[x][y] = {};
  }

  var voxel = new voxelcss.Voxel(x, y, z, 100, {
    mesh: new voxelcss.Mesh(new voxelcss.ColorFace(color))
  });

  lightnet.voxels[x][y][z] = voxel;
  global.editor.add(voxel);
};

lightnet.getVoxelAt = function(pos) {
  var result = null;

  var x = pos[0];
  var y = pos[1];
  var z = pos[2];
  if (lightnet.voxels[x] && lightnet.voxels[x][y]) {
    result = lightnet.voxels[x][y][z];
  }

  return result;
};

lightnet.removeVoxel = function(voxel) {
  var x = voxel.getPositionX();
  var y = voxel.getPositionY();
  var z = voxel.getPositionZ();
  delete lightnet.voxels[x][y][z];
  global.editor.remove(voxel);
};

lightnet.removeAllVoxel = function(voxel) {
  for (var x in lightnet.voxels) {
    for (var y in lightnet.voxels[x]) {
      for (var z in lightnet.voxels[x][y]) {
        if (!lightnet.voxels[x][y][z]) { continue; }

        lightnet.removeVoxel(lightnet.voxels[x][y][z]);
      }
    }
  }
};

lightnet.updateLightGeometry = function () {
  console.log('updating light geometry');

  lightnet.removeAllVoxel();

  if (lightnet.currentHandler) {
    $('#light-container .message').hide();

    lightnet.addVoxel([0,0,0], [0,0,0]);
  } else {
    $('#light-container .message').show();
  }
};

lightnet.updateLights = function (colors) {
  if (lightnet.currentHandlerUpdated) {
    lightnet.currentHandlerUpdated = false;
    lightnet.updateLightGeometry();
  }

  if (lightnet.currentHandler) {
    //TODO change voxel colors
  }
};

lightnet.logIncomingMessage = function(message, type) {
  var entry = $('<div class="entry ' + type + '"></div>');
  var icon = $('<span class="glyphicon glyphicon-menu-left"></span>');
  entry.append(icon)
       .append(JSON.stringify(message));

  lightnet.logMessage(entry);
};

lightnet.logOutgoingMessage = function(method, path, message) {
  var entry = $('<div class="entry"></div>');
  var icon = $('<span class="glyphicon glyphicon-menu-right"></span>');
  entry.append(icon)
       .append('<span class="prefix">[ ' + method + ' ' + path + ' ]</span>')
       .append(message);

  lightnet.logMessage(entry);
};
lightnet.logMessage = function(message) {
  $('#log-container').append(message);
};