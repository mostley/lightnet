var apiUrl = 'http://lightnet:4050/api/';
var pollingInterval = 5000;

var lights = {};
var handlers = {};

function setLight(id, r, g, b) {
  console.log('setLight(' + id + ',' + r + ',' + g + ',' + b + ')');

  $.ajax(apiUrl + 'lights/' + id + '/control', {
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

function createLightRow(light) {
  var row = $('<tr id="lightrow_' + light._id + '"></tr>');
  var red_button = '<button type="button" class="btn btn-default" onclick="javascript:setLight(\'' + light._id + '\', 255, 0, 0)">Red</button>';
  var green_button = '<button type="button" class="btn btn-default" onclick="javascript:setLight(\'' + light._id + '\', 0, 255, 0)">Green</button>';
  var blue_button = '<button type="button" class="btn btn-default" onclick="javascript:setLight(\'' + light._id + '\', 0, 0, 255)">Blue</button>';
  var off_button = '<button type="button" class="btn btn-default" onclick="javascript:setLight(\'' + light._id + '\', 0, 0, 0)">Off</button>';
  var buttons = '<div class="btn-group" role="group">' + red_button + green_button + blue_button + off_button + '</div>';

  row.append('<td>' + light.x + ':' + light.y + ':' + light.z + '</td>');
  row.append('<td>' + (light.room || '-') + '</td>');
  row.append('<td>' + light.index + '</td>');
  row.append('<td>' + light.handlerID + '</td>');
  row.append('<td>' + !!light.active + '</td>');
  row.append('<td>' + buttons + '</td>');

  return row;
}

function appendLightToTable(light) {
  var row = createLightRow(light);
  $('#lightlist tbody').append(row);
}

function updateLightInTable(light) {
  console.log('[updateLightInTable]', light);

  $('#lightrow_' + light._id).replaceWith(createLightRow(light));
}

function appendHandlerToList(handler) {
  var name = handler.id + ' - ' + handler.ipAddress;
  var tooltip = 'version: ' + handler.version + ' type: ' + handler.type + ' offset: ('
    + handler.offsetX + ':' + handler.offsetY + ':' + handler.offsetZ + ') info: ' + handler.info;

  $('#handlerlist').append('<li id="handleritem_' + handler.id + '" title="' + tooltip + '"><a href="#">' + name + '</a></li>')
}

function lightEquals(lightA, lightB) {
  var result = lightA.x === lightB.x && lightA.y === lightB.y && lightA.z === lightB.z &&
        lightA.room === lightB.room && lightA.index === lightB.index && lightA.handler === lightB.handler &&
        lightA.active === lightB.active;
  return result;
}

function getValues(obj) {
  var result = [];
  for (var i in obj) {
    result.push(obj[i]);
  }
  return result;
}

function updateData() {
  $.ajax(apiUrl + 'lights', {
    dataType: "json",
    success: function(lightList) {
      if (!lightList) { return; }

      var lightsToDelete = getValues(lights).filter(function(light) {
        var result = true;
        for (var i in lightList) {
          if (lightList[i]._id === light._id) {
            result = false;
            break;
          }
        }
        return result;
      });

      var handlersToDelete = getValues(handlers).filter(function(handler) {
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
        delete lights[lightsToDelete[i]._id];
        $('#lightrow_' + lightsToDelete[i]._id).remove();
      }

      for (var i in handlersToDelete) {
        delete handlers[handlersToDelete[i].id];
        $('#handleritem_' + handlersToDelete[i].id).remove();
      }


      for (var i in lightList) {
        var light = lightList[i];

        if (!lights[light._id]) {
          lights[light._id] = light;
          appendLightToTable(light);
        } else if (!lightEquals(light, lights[light._id])) {
          lights[light._id] = light;
          updateLightInTable(light);
        }

        if (!handlers[light.handlerID]) {
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
          handlers[light.handlerID] = handler;
          appendHandlerToList(handler);
        }
      }

      window.setTimeout(updateData, pollingInterval);
    },
    error: function(xhr, textStatus, error) {
      window.setTimeout(updateData, pollingInterval);
    }
  });
}

$(function() {
  updateData();
});
