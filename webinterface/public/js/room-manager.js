function RoomManager() {
  var me = this;

  this.rooms = {};
  this.timer = -1;
  this.outlineOffset = [10, 10];
  this.defaultOutline = [ [110, 10], [110, 110], [10, 110] ];
  this.currentOutlineSegment = null;
  this.selectedRoom = null;
  this.updateTimer = -1;

  $('#saveRoomBtn').click(this.saveRoomClicked.bind(this));
  $('#deleteRoomBtn').click(this.deleteCurrentRoom.bind(this));
  $('#addRoomDialog').on('shown.bs.modal', function () {
    $('#roomNameInput').focus()
  });

  $('#removePointBtn').click(this.removeCurrentOutlineSegment.bind(this));
  $('#pointXInput, #pointYInput').blur(this.updateSegmentFromInspector.bind(this));

  paper.setup($('#roomOutlineCanvas')[0]);
  paper.settings.handleSize = 8;

  this.outlinePath = new paper.Path();
  this.outlinePath.strokeColor = 'black';
  this.outlinePath.closed = true;

  var drawTool = new paper.Tool();
  drawTool.activate();

  drawTool.onMouseDown = function(e) {
    var hitResult;

    if (e.event.detail > 1) {
      hitResult = me.outlinePath.hitTest(e.point, {
        segments:  false,
        fill:      false,
        stroke:    false,
        curves:    true,
        tolerance: 10
      });
      if (hitResult) {
        if (hitResult.type == 'curve') {
          me.currentOutlineSegment = me.outlinePath.insert(hitResult.location._segment2._index, e.point);
          me.currentOutlineSegment.selected = true;
        }
      }
    } else {

      if (me.currentOutlineSegment) {
        me.currentOutlineSegment.selected = false;
        me.currentOutlineSegment = null;
      }

      hitResult = me.outlinePath.hitTest(e.point, {
        segments: true,
        fill: false,
        stroke: true,
        handles: true,
        tolerance: 20
      });
      console.log(hitResult);
      if (hitResult) {
        me.currentOutlineSegment = hitResult.segment;
        if (me.currentOutlineSegment) {
          me.currentOutlineSegment.selected = true;
        }
      }

      me.updatePointInspector();
    }
  };

  drawTool.onMouseUp = function(e) {
    me.updatePointInspector();
  };

  drawTool.onMouseDrag = function(e) {
    if (me.currentOutlineSegment) {
      me.currentOutlineSegment.point.x += e.delta.x;
      me.currentOutlineSegment.point.y += e.delta.y;

      me.updatePointInspector();

      me.updateCurrentRoom();
    }
  };

  $(window).resize(this.resizeAndRedrawCanvas.bind(this));
  window.setTimeout(this.resizeAndRedrawCanvas.bind(this), 1);
}

RoomManager.prototype.deleteCurrentRoom = function() {
  var me = this;

  if (this.selectedRoom) {

    $.ajax(Lightnet.apiUrl + 'rooms/' + this.selectedRoom._id, {
      dataType: "json",
      method: 'DELETE',
      success: function() {
        console.log('[RoomManager] room deleted!');
        me.selectedRoom = null;

        me.showRoom(null);

        me.requestData();
      },
      error: function(xhr, textStatus, error) {
        console.log('[RoomManager] ' + error);
      }
    });
  }
};

RoomManager.prototype.updateSegmentFromInspector = function() {
  if (this.currentOutlineSegment) {
    this.currentOutlineSegment.point.x = parseFloat($('#pointXInput').val());
    this.currentOutlineSegment.point.y = parseFloat($('#pointYInput').val());
    paper.view.draw();
  }
};

RoomManager.prototype.updatePointInspector = function() {
  if (this.currentOutlineSegment) {
    $('#pointXInput').val(this.currentOutlineSegment.point.x);
    $('#pointYInput').val(this.currentOutlineSegment.point.y);
  } else {
    $('#pointXInput').val('-');
    $('#pointYInput').val('-');
  }
};

RoomManager.prototype.removeCurrentOutlineSegment = function() {
  if (this.currentOutlineSegment) {
    this.currentOutlineSegment.remove();
    paper.view.draw();

    this.updatePointInspector();

    this.updateCurrentRoom();
  }
};

RoomManager.prototype.updateCurrentRoom = function() {
  var outline = [];
  for (var i in this.outlinePath.segments) {
    var segment = this.outlinePath.segments[i];
    outline.push([segment.point.x, segment.point.y]);
  }
  this.selectedRoom.outline = outline;

  this.updateRoom(this.selectedRoom);
};

RoomManager.prototype.resizeAndRedrawCanvas = function ()
{
  var desiredWidth = $('#roomOutlineContainer').width();
  var desiredHeight = $('#roomOutlineContainer').height();

  $('#roomOutlineCanvas')
    .width(desiredWidth)
    .height(desiredHeight);

  paper.view.viewSize = new paper.Size(desiredWidth, desiredHeight);
  paper.view.draw();
};

RoomManager.prototype.saveRoomClicked = function() {
  var me = this;

  var roomData = {
    name: $('#roomNameInput').val(),
    height: $('#roomHeightInput').val()
  };

  $.ajax(Lightnet.apiUrl + 'rooms', {
    dataType: "json",
    method: 'POST',
    data: roomData,
    success: function() {
      me.requestData();
      $('#addRoomDialog').modal('hide');
    },
    error: function(xhr, textStatus, error) {
      console.log('[RoomManager] ' + error);
    }
  });
};

RoomManager.prototype.updateRoom = function(room) {
  var me = this;
  if (this.updateTimer) {
    window.clearTimeout(this.updateTimer);
  }

  this.updateTimer = window.setTimeout(function() {
    window.clearTimeout(me.updateTimer);

    $.ajax(Lightnet.apiUrl + 'rooms/' + room._id, {
      dataType: "json",
      method: 'PUT',
      data: room,
      success: function () {
        console.log('[RoomManager] room updated', room);
      },
      error: function (xhr, textStatus, error) {
        console.log('[RoomManager] ' + error);
      }
    });
  }, 500);
};

RoomManager.prototype.showRoom = function(room) {
  if (!room) {
    this.outlinePath.removeSegments();
    paper.view.draw();

    return;
  }

  var outline = room.outline;
  if (!outline || outline.length <= 0) {
    outline = this.defaultOutline;

    room.outline = outline;
    this.updateRoom(room);
  }

  this.outlinePath.removeSegments();

  this.outlinePath.moveTo(new paper.Point(this.outlineOffset[0], this.outlineOffset[1]));

  for (var i in outline) {
    var p = outline[i];
    this.outlinePath.lineTo(new paper.Point(parseFloat(p[0]), parseFloat(p[1])));
  }
  this.outlinePath.selected = true;

  paper.view.draw();
};

RoomManager.prototype.roomClicked = function(roomRow) {
  if (this.currentRoomLinkId) {
    $('#' + this.currentRoomLinkId).removeClass('active');
  }
  roomRow.addClass('active');
  this.currentRoomLinkId = roomRow.attr('id');

  this.selectedRoom = roomRow.data('room');
  this.showRoom(roomRow.data('room'));
};

RoomManager.prototype.clearList = function () {
  $('#roomlist').empty();
};

RoomManager.prototype.createRoomRow = function (room) {
  var me = this;

  var result = $('<li id="roomitem_' + room._id + '"><a href="#">' + room.name + '</a></li>');
  result.click(function() { me.roomClicked(result); return false; });
  result.data('room', room);

  return result;
};

RoomManager.prototype.addRoom = function (room) {
  var row = this.createRoomRow(room);
  $('#roomlist').append(row);
};

RoomManager.prototype.onData = function (roomList) {
  var me = this;

  if (!roomList) { return; }

  this.clearList();

  for (var i in roomList) {
    var room = roomList[i];

    this.addRoom(room);
  }

  if (this.currentRoomLinkId) {
    $('#' + me.currentRoomLinkId).addClass('active');
  }

  this.timer = window.setTimeout(this.requestData.bind(this), Lightnet.pollingInterval);
};

RoomManager.prototype.requestData = function () {
  console.log('[RoomManager] requestData');
  var me = this;

  window.clearTimeout(this.timer);

  $.ajax(Lightnet.apiUrl + 'rooms', {
    dataType: "json",
    success: this.onData.bind(this),
    error: function(xhr, textStatus, error) {
      console.log('[RoomManager] ' + error);

      this.timer = window.setTimeout(me.requestData.bind(me), Lightnet.pollingInterval);
    }
  });
};

RoomManager.prototype.activate = function() {
  console.log('[RoomManager] activate');

  this.requestData();
};

RoomManager.prototype.deactivate = function() {
  console.log('[RoomManager] deactivate');

  window.clearTimeout(this.timer);
};