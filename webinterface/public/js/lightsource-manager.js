function LightsourceManager() {
  this.timer = -1;
  this.currentLightsourceLinkId = null;
  this.currentRoomLinkId = null;
  this.selectedLightsource = null;
  this.selectedRoom = null;

  $('#addLightsourceBtn').click(this.onAddLightsourceClicked.bind(this));
}

LightsourceManager.prototype.showLightsource = function(lightsource) {
  //TODO
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
  if (this.currentLightsourceLinkId) {
    $('#' + this.currentLightsourceLinkId).removeClass('active');
  }

  lightsourceRow.addClass('active');
  this.currentLightsourceLinkId = lightsourceRow.attr('id');

  this.selectedLightsource = lightsourceRow.data('lightsource');
  this.showLightsource(lightsourceRow.data('lightsource'));
};

LightsourceManager.prototype.selectSource = function (lightsource) {
  if (this.currentLightsourceLinkId) {
    $('#' + this.currentLightsourceLinkId).removeClass('active');
  }

  var id = 'lightsourceitem_' + lightsource._id;
  $('#' + id).addClass('active');
  me.currentLightsourceLinkId = id;

  this.selectedLightsource = lightsource;
  this.showLightsource(lightsource);
};

LightsourceManager.prototype.createLightsourceRow = function (lightsource) {
  var me = this;

  var result = $('<li id="lightsourceitem_' + lightsource._id + '"><a href="#"> Lightsouce ' + lightsource.id + '</a></li>');
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

  this.clearList();

  for (var i in lightsourcelist) {
    var lightsource = lightsourcelist[i];

    this.addLightsource(lightsource);
  }

  if (this.currentLightsourceLinkId) {
    this.selectSource(this.currentLightsourceLinkId);
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

LightsourceManager.prototype.activate = function() {
  console.log('[LightsourceManager] activate');

  this.requestData();
};

LightsourceManager.prototype.deactivate = function() {
  console.log('[LightsourceManager] deactivate');

  window.clearTimeout(this.timer);
};