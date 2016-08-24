function LightsourceManager() {
  this.timer = -1;
  this.updateTimer = -1;
  this.currentLightsourceLinkId = null;
  this.currentRoomLinkId = null;
  this.selectedLightsource = null;
  this.selectedRoom = null;
  this.updating = false;
  this.editing = false;
  this.firstActivation = true;

  $('#addLightsourceBtn').click(this.onAddLightsourceClicked.bind(this));
}

LightsourceManager.prototype.showLightsource = function(lightsource) {
  this.updating = true;
  console.log('[LightsourceManager] showLightsource');

  $('#sourceName').html('Lightsouce ' + lightsource.id);
  $('#sourcePositionXOutput').html(lightsource.p[0]);
  $('#sourcePositionYOutput').html(lightsource.p[1]);
  $('#sourcePositionZOutput').html(lightsource.p[2]);

  var rgb = lightsource.c;
  var hex = '#' + ((1 << 24) | (parseInt(rgb[0]) << 16) | (parseInt(rgb[1]) << 8) | parseInt(rgb[2])).toString(16).substr(1);
  console.log(rgb,hex);
  $('#sourceColorInput').colorpicker('setValue', hex);

  $('#radiusInput').slider('setValue', parseFloat(lightsource.r));
  $('#softnessInput').slider('setValue', parseFloat(lightsource.s));

  this.updating = false;
};

LightsourceManager.prototype.onAddLightsourceClicked = function() {
  var me = this;

  var lightsourceData = {
    p: [0, 0, 0],
    c: [0, 0, 0],
    s: 1,
    r: 1
  };

  $.ajax(Lightnet.apiUrl + 'lightsources', {
    dataType: "json",
    method: 'POST',
    data: lightsourceData,
    success: function() {
      me.requestData();
    },
    error: function(xhr, textStatus, error) {
      console.log('[LightsourceManager] ' + error);
    }
  });
};

LightsourceManager.prototype.lightsourceClicked = function (lightsourceRow) {
  console.log('lightsourceClicked', lightsourceRow);

  $('#lightsource-editor').shroud('lift');
  $('#lightsourceRoomOutlineContainer').shroud('lift');

  if (this.currentLightsourceLinkId) {
    $('#' + this.currentLightsourceLinkId).removeClass('active');
  }

  lightsourceRow.addClass('active');
  this.currentLightsourceLinkId = lightsourceRow.attr('id');

  this.selectedLightsource = lightsourceRow.data('lightsource');
  this.showLightsource(lightsourceRow.data('lightsource'));
};

LightsourceManager.prototype.selectSource = function (lightsourceId) {
  console.log('selectSource', lightsourceId);
  var me = this;

  if (this.currentLightsourceLinkId) {
    $('#' + this.currentLightsourceLinkId).removeClass('active');
  }

  $('#' + lightsourceId).addClass('active');
  me.currentLightsourceLinkId = lightsourceId;

  var lightsource = $('#' + lightsourceId).data('lightsource');
  this.selectedLightsource = lightsource;
  this.showLightsource(lightsource);
};

LightsourceManager.prototype.createLightsourceRow = function (lightsource) {
  var me = this;

  var result = $('<li id="lightsourceitem_' + lightsource.id + '"><a href="#"> Lightsouce ' + lightsource.id + '</a></li>');
  result.click(function() { me.lightsourceClicked(result); return false; });
  result.data('lightsource', lightsource);

  return result;
};

LightsourceManager.prototype.addLightsource = function (lightsource) {
  var row = this.createLightsourceRow(lightsource);
  $('#lightsource-list').append(row);
};

LightsourceManager.prototype.clearList = function () {
  $('#lightsource-list').empty();
};

LightsourceManager.prototype.showRoom = function(room) {
  $('#lightsourcesPage').shroud('lift');
};

LightsourceManager.prototype.roomClicked = function(roomRow) {
  if (this.currentRoomLinkId) {
    $('#' + this.currentRoomLinkId).removeClass('active');
  }
  roomRow.addClass('active');
  this.currentRoomLinkId = roomRow.attr('id');

  this.selectedRoom = roomRow.data('room');
  this.showRoom(roomRow.data('room'));
};

LightsourceManager.prototype.createRoomRow = function (room) {
  var me = this;

  var result = $('<li id="roomtabitem_' + room._id + '"><a href="#">' + room.name + '</a></li>');
  result.click(function() { me.roomClicked(result); return false; });
  result.data('room', room);

  return result;
};

LightsourceManager.prototype.addRoom = function (room) {
  var row = this.createRoomRow(room);
  $('#room-tab-list').append(row);
};

LightsourceManager.prototype.clearRoomList = function () {
  $('#room-tab-list').empty();
};

LightsourceManager.prototype.onData = function (lightsourcelist) {

  if (!lightsourcelist) { return; }

  if (!this.editing) {
    this.clearList();

    for (var i in lightsourcelist) {
      var lightsource = lightsourcelist[i];

      this.addLightsource(lightsource);
    }

    if (this.currentLightsourceLinkId) {
      this.selectSource(this.currentLightsourceLinkId);
    }
  }

  this.requestRoomData();
};

LightsourceManager.prototype.onRoomData = function (roomList) {
  var me = this;

  if (!roomList) { return; }

  this.clearRoomList();

  for (var i in roomList) {
    var room = roomList[i];

    this.addRoom(room);
  }

  if (this.currentRoomLinkId) {
    $('#' + me.currentRoomLinkId).addClass('active');
  }

  this.timer = window.setTimeout(this.requestData.bind(this), Lightnet.pollingInterval);
};

LightsourceManager.prototype.requestRoomData = function () {

  $.ajax(Lightnet.apiUrl + 'rooms', {
    dataType: "json",
    success: this.onRoomData.bind(this),
    error: function(xhr, textStatus, error) {
      console.log('[LightsourceManager] ' + error);

      this.timer = window.setTimeout(me.requestData.bind(me), Lightnet.pollingInterval);
    }
  });
};

LightsourceManager.prototype.requestData = function () {
  var me = this;

  $.ajax(Lightnet.apiUrl + 'lightsources', {
    dataType: "json",
    success: this.onData.bind(this),
    error: function(xhr, textStatus, error) {
      console.log('[LightsourceManager] ' + error);

      this.timer = window.setTimeout(me.requestData.bind(me), Lightnet.pollingInterval);
    }
  });
};

LightsourceManager.prototype.updateLightsource = function() {
  console.log('[LightsourceManager] trigger updateLightsource');

  var me = this;
  if (!me.selectedLightsource) {
    return;
  }
  if (me.updating) {
    return;
  }

  if (me.updateTimer) {
    window.clearTimeout(me.updateTimer);
  }

  me.updateTimer = window.setTimeout(function() {
    console.log('[LightsourceManager] updateLightsource');
    me.updateTimer = -1;

    var color = $('#sourceColorInput').data('colorpicker').color.toRGB();

    var lightsourceData = {
      p: [0, 0, 0], //TODO
      c: [color.r, color.g, color.b],
      r: $('#radiusInput').val(),
      s: $('#softnessInput').val()
    };

    $.ajax(Lightnet.apiUrl + 'lightsources/' + me.selectedLightsource.id, {
      dataType: "json",
      method: 'PUT',
      data: lightsourceData,
      success: function () {
        console.log('[LightsourceManager] lightsource updated');
      },
      error: function (xhr, textStatus, error) {
        console.log('[LightsourceManager] ' + error);
      }
    });
  }, 500);
};

LightsourceManager.prototype.activate = function() {
  var me = this;
  console.log('[LightsourceManager] activate');

  me.requestData();

  if (!this.selectedRoom) {
    $('#lightsourcesPage').shroud({click: false, color: '#fff'});
    $('#lightsource-editor').shroud({click: false, color: '#dcdcdc'});
    $('#lightsourceRoomOutlineContainer').shroud({click: false, color: '#000'});
  }

  if (me.firstActivation) {
    me.firstActivation = false;

    $('#radiusInput, #softnessInput').slider();
    $('#radiusInput, #softnessInput').slider({
      min: 0,
      max: 1,
      step: 0.01,
      value: 1,
      handle: 'triangle'
    });
    $('#radiusInput, #softnessInput').on('slideStop', me.updateLightsource.bind(me));

    $('#sourceColorInput').on('changeColor', me.updateLightsource.bind(me));
    $('#sourceColorInput').on('show', function() {
      me.editing = true;
    });
    $('#sourceColorInput').on('hide', function() {
      me.editing = false;
    });
  }
};

LightsourceManager.prototype.deactivate = function() {
  console.log('[LightsourceManager] deactivate');

  window.clearTimeout(this.timer);
};