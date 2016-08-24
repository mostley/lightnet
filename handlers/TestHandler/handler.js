function Handler(data) {
  this.id = data.id || '';
  this.lightCount = data.lightCount || 1;
  this.lightSize = data.lightSize || 1;
  this.ipAddress = data.ipAddress || '';
  this.info = data.info || '';
  this.type = data.type || 0;
  this.version = data.version || '';
  this.offsetX = data.offsetX || 0;
  this.offsetY = data.offsetY || 0;
  this.offsetZ = data.offsetZ || 0;
  this.geometry = data.geometry || 'cube';
  this.geometryWidth = data.geometryWidth || 1;
  this.geometryHeight = data.geometryHeight || 1;
  this.geometryLength = data.geometryLength || 1;
  this.geometryDirection1 = data.geometryDirection1 || 'xx';
  this.geometryDirection2 = data.geometryDirection2 || 'yy';
  this.geometryDirection3 = data.geometryDirection3 || 'zz';
}

Handler.prototype.toServerData = function() {
  return {
    handlerID: this.id,
    handlerNumberOfLights: this.lightCount,
    lightSize: this.lightSize,
    handler: this.ipAddress,
    handlerInfo: this.info,
    handlerType: this.type,
    handlerVersion: this.version,
    handlerOffsetX: this.offsetX,
    handlerOffsetY: this.offsetY,
    handlerOffsetZ: this.offsetZ,
    handlerGeometry: this.geometry,
    handlerGeometryWidth: this.geometryWidth,
    handlerGeometryHeight: this.geometryHeight,
    handlerGeometryLength: this.geometryLength,
    handlerGeometryDirection1: this.geometryDirection1,
    handlerGeometryDirection2: this.geometryDirection2,
    handlerGeometryDirection3: this.geometryDirection3,
  };
};

Handler.prototype.saveToForm = function() {
  $('#handlerIDField').val(this.id);
  $('#handlerLightCountField').val(this.lightCount);
  $('#handlerLightSizeField').val(this.lightCount);
  $('#handlerIPField').val(this.ipAddress);
  $('#handlerInfoField').val(this.info);
  $('#handlerTypeField').val(this.type);
  $('#handlerVersionField').val(this.version);
  $('#handlerOffsetXField').val(this.offsetX);
  $('#handlerOffsetYField').val(this.offsetY);
  $('#handlerOffsetZField').val(this.offsetZ);
  $('#handlerGeometryField').val(this.geometry);
  $('#handlerWidthField').val(this.geometryWidth);
  $('#handlerHeightField').val(this.geometryHeight);
  $('#handlerLengthField').val(this.geometryLength);
  $('#handlerDirection1Field').val(this.geometryDirection1);
  $('#handlerDirection2Field').val(this.geometryDirection2);
  $('#handlerDirection3Field').val(this.geometryDirection3);
};

Handler.prototype.register = function(callback) {
  var path = '/handlers';
  lightnet.logOutgoingMessage('POST', path, 'loading handler');

  $.ajax({
    url: lightnet.apiUrl + path,
    method: 'POST',
    data: this.toServerData(),
    success: function(data) {
      lightnet.logIncomingMessage(data, 'success');

      console.log('Handler registered', data);
      toastr.success(data.message);

      callback();
    },
    error: function(e) {
      lightnet.logIncomingMessage('Failed to register Handler', 'error');

      console.error('Failed to register Handler', e);
      toastr.error('Failed to register Handler');

      callback();
    }
  });
};

Handler.prototype.update = function(callback) {
  var path = '/handlers/' + this.id;
  lightnet.logOutgoingMessage('PUT', path, 'loading handler');

  $.ajax({
    url: lightnet.apiUrl + path,
    method: 'PUT',
    data: getHandlerFromForm().toServerData(),
    success: function(data) {
      console.log('Handler updated', data);
      toastr.success('Handler updated');
      lightnet.logIncomingMessage(data, 'success');

      callback();
    },
    error: function(e) {
      lightnet.logIncomingMessage(e, 'error');

      if (e.status === 404) {
        console.log('Handler not found');
        toastr.error('Handler not found');

        callback();
      } else {
        console.error('Failed to update Handler', e);
        toastr.error('Failed to update Handler');

        callback();
      }
    }
  });
};

Handler.prototype.delete = function(callback) {
  var path = '/handlers/' + this.id.trim();
  lightnet.logOutgoingMessage('DELETE', path, 'loading handler');

  $.ajax({
    url: lightnet.apiUrl + path,
    method: 'DELETE',
    success: function(data) {
      console.log('Handler deleted', data);
      toastr.success('Handler deleted');
      lightnet.logIncomingMessage(data, 'success');

      callback();
    },
    error: function(e) {
      lightnet.logIncomingMessage(e, 'error');

      if (e.status === 404) {
        console.log('Handler not found');
        toastr.error('Handler not found');

        callback();
      } else {
        console.error('Failed to delete Handler', e);
        toastr.error('Failed to delete Handler');

        callback();
      }
    }
  });
};

/* static */
Handler.get = function(id, callback) {
  var path = '/handlers/' + id;
  lightnet.logOutgoingMessage('GET', path, 'loading handler');

  $.ajax({
    url: lightnet.apiUrl + path,
    success: function(data) {
      console.log('Handler retrieved', data);
      toastr.success('Handler retrieved');
      lightnet.logIncomingMessage(data, 'success');

      callback(new Handler(data));
    },
    error: function(e) {
      lightnet.logIncomingMessage(e, 'error');

      if (e.status === 404) {
        console.log('Handler not found');
        toastr.error('Handler not found');

        callback(null);
      } else {
        console.error('Failed to load Handler', e);
        toastr.error('Failed to load Handler');

        callback(null);
      }
    }
  });
};

Handler.getHandlerFromForm = function() {
  return new Handler({
    id: $('#handlerIDField').val().trim(),
    lightCount: parseInt($('#handlerLightCountField').val()),
    lightSize: parseFloat($('#handlerLightSizeField').val()),
    ipAddress: $('#handlerIPField').val(),
    info: $('#handlerInfoField').val(),
    type: parseInt($('#handlerTypeField').val()),
    version: $('#handlerVersionField').val(),
    offsetX: parseFloat($('#handlerOffsetXField').val()),
    offsetY: parseFloat($('#handlerOffsetYField').val()),
    offsetZ: parseFloat($('#handlerOffsetZField').val()),
    geometry: $('#handlerGeometryField').val(),
    geometryWidth: parseFloat($('#handlerWidthField').val()),
    geometryHeight: parseFloat($('#handlerHeightField').val()),
    geometryLength: parseFloat($('#handlerLengthField').val()),
    geometryDirection1: $('#handlerDirection1Field').val(),
    geometryDirection2: $('#handlerDirection2Field').val(),
    geometryDirection3: $('#handlerDirection3Field').val(),
  });
};
