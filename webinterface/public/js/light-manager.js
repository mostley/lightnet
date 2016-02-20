function LightManager() {
  this.lights = {};
  this.handlers = {};
  this.timer = -1;
}

LightManager.prototype.setLight = function (id, r, g, b) {
  console.log('setLight(' + id + ',' + r + ',' + g + ',' + b + ')');

  $.ajax(Lightnet.apiUrl + 'lights/' + id + '/control', {
    method: 'PUT',
    data: { r: r, g: g, b: b },
    success: function(result) {
      toastr["success"](result.message);
    },
    error: function() {
      toastr["error"]("I failed to control this light, sorry");
    }
  });
}

LightManager.prototype.createLightRow = function (light) {
  var me = this;

  var row = $('<tr id="lightrow_' + light._id + '"></tr>');
  var red_button = $('<button type="button" class="btn btn-default">Red</button>');
  $(red_button).click(function() { me.setLight(light._id, 255, 0, 0); });
  var green_button = $('<button type="button" class="btn btn-default">Green</button>');
  $(green_button).click(function() { me.setLight(light._id, 0, 255, 0); });
  var blue_button = $('<button type="button" class="btn btn-default">Blue</button>');
  $(blue_button).click(function() { me.setLight(light._id, 0, 0, 255); });
  var off_button = $('<button type="button" class="btn btn-default">Off</button>');
  $(off_button).click(function() { me.setLight(light._id, 0, 0, 0); });
  var buttons = $('<div class="btn-group" role="group"></div>');
  buttons.append(red_button).append(green_button).append(blue_button).append(off_button);

  row.append('<td>' + light.x + ':' + light.y + ':' + light.z + '</td>');
  row.append('<td>' + (light.room || '-') + '</td>');
  row.append('<td>' + light.index + '</td>');
  row.append('<td>' + light.handlerID + '</td>');
  row.append('<td>' + !!light.active + '</td>');
  row.append($('<td></td>').append(buttons));

  return row;
}

LightManager.prototype.appendLightToTable = function (light) {
  var row = this.createLightRow(light);
  $('#lightlist tbody').append(row);
}

LightManager.prototype.updateLightInTable = function (light) {
  console.log('[updateLightInTable]', light);

  $('#lightrow_' + light._id).replaceWith(this.createLightRow(light));
}

LightManager.prototype.appendHandlerToList = function (handler) {
  var name = handler.id + ' - ' + handler.ipAddress;
  var tooltip = 'version: ' + handler.version + ' type: ' + handler.type + ' offset: ('
    + handler.offsetX + ':' + handler.offsetY + ':' + handler.offsetZ + ') info: ' + handler.info;

  $('#handlerlist').append('<li id="handleritem_' + handler.id + '" title="' + tooltip + '"><a href="#">' + name + '</a></li>')
}

LightManager.prototype.lightEquals = function (lightA, lightB) {
  var result = lightA.x === lightB.x && lightA.y === lightB.y && lightA.z === lightB.z &&
        lightA.room === lightB.room && lightA.index === lightB.index && lightA.handler === lightB.handler &&
        lightA.active === lightB.active;
  return result;
};

LightManager.prototype.getValues = function (obj) {
  var result = [];
  for (var i in obj) {
    result.push(obj[i]);
  }
  return result;
};

LightManager.prototype.onData = function (lightList) {
  if (!lightList) { return; }

  var lightsToDelete = this.getValues(this.lights).filter(function(light) {
    var result = true;
    for (var i in lightList) {
      if (lightList[i]._id === light._id) {
        result = false;
        break;
      }
    }
    return result;
  });

  var handlersToDelete = this.getValues(this.handlers).filter(function(handler) {
    var result = true;
    for (var i in lightList) {
      if (lightList[i].handlerID === handler.id) {
        result = false;
        break;
      }
    }
    return result;
  });

  for (var i in lightsToDelete) {
    delete this.lights[lightsToDelete[i]._id];
    $('#lightrow_' + lightsToDelete[i]._id).remove();
  }

  for (var i in handlersToDelete) {
    delete this.handlers[handlersToDelete[i].id];
    $('#handleritem_' + handlersToDelete[i].id).remove();
  }


  for (var i in lightList) {
    var light = lightList[i];

    if (!this.lights[light._id]) {
      this.lights[light._id] = light;
      this.appendLightToTable(light);
    } else if (!this.lightEquals(light, this.lights[light._id])) {
      this.lights[light._id] = light;
      this.updateLightInTable(light);
    }

    if (!this.handlers[light.handlerID]) {
      var handler = {
        id: light.handlerID,
        ipAddress: light.handler,
        info: light.handlerInfo,
        type: light.handlerType,
        version: light.handlerVersion,
        offsetX: light.handlerOffsetX,
        offsetY: light.handlerOffsetY,
        offsetZ: light.handlerOffsetZ
      };
      this.handlers[light.handlerID] = handler;
      this.appendHandlerToList(handler);
    }
  }

  this.timer = window.setTimeout(this.requestData.bind(this), Lightnet.pollingInterval);
};

LightManager.prototype.requestData = function () {
  var me = this;

  $.ajax(Lightnet.apiUrl + 'lights', {
    dataType: "json",
    success: this.onData.bind(this),
    error: function(xhr, textStatus, error) {
      console.log('[LightManager] ' + error);

      this.timer = window.setTimeout(me.requestData.bind(me), Lightnet.pollingInterval);
    }
  });
};

LightManager.prototype.activate = function() {
  console.log('[LightManager] activate');

  this.requestData();
};

LightManager.prototype.deactivate = function() {
  console.log('[LightManager] deactivate');

  window.clearTimeout(this.timer);
};