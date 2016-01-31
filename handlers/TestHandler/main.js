global.$ = $;
var gui = require('nw.gui');

console.log("Starting App...");

if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
}

function registerHandler() {
  console.log('register handler');

  var handler = Handler.getHandlerFromForm();

  handler.register(function(handler) {
    if (lightnet.currentHandler !== handler) {
      lightnet.currentHandler = handler;
      lightnet.currentHandlerUpdated = true;
    }

    readHandler();
  });

  return false;
}

function readHandler() {
  console.log('read handler');

  Handler.get($('#handlerIDField').val(), function(handler) {
    if (lightnet.currentHandler !== handler) {
      if (handler) {
        handler.saveToForm();
      }
      lightnet.currentHandler = handler;
      lightnet.currentHandlerUpdated = true;
    }

    lightnet.updateLights();
  });

  return false;
}

function updateHandler() {
  console.log('update handler');

  if (!lightnet.currentHandler) {
    console.warn('no handler registered yet');
    toastr.warning('no handler registered yet');
    return;
  }

  lightnet.currentHandler.update(function(handler) {
    if (lightnet.currentHandler !== handler) {
      if (handler) {
        handler.saveToForm();
      }
      lightnet.currentHandler = handler;
      lightnet.currentHandlerUpdated = true;
    }

    lightnet.updateLights();
  });

  return false;
}

function deleteHandler() {
  console.log('delete handler');

  if (!lightnet.currentHandler) {
    console.warn('no handler registered yet');
    toastr.warning('no handler registered yet');
    return;
  }

  lightnet.currentHandler.delete(function(handler) {
    lightnet.currentHandler = null;
    lightnet.currentHandlerUpdated = true;

    lightnet.updateLights();
  });

  return false;
}

$(document).ready(function() {

  gui.Window.get().show();
  console.log("App Ready.");

  var scene = new voxelcss.Scene();
  scene.rotate(-Math.PI / 8, Math.PI / 4, 0);
  scene.attach($('#light-container')[0]);

  var world = new voxelcss.World(scene);
  global.editor = new voxelcss.Editor(world);
  global.editor.disable();

  readHandler();

  $('#handlerIDField').change(readHandler);
  $('#readHandlerBtn').click(readHandler);
  $('#registerHandlerBtn').click(registerHandler);
  $('#updateHandlerBtn').click(updateHandler);
  $('#deleteHandlerBtn').click(deleteHandler);
});
