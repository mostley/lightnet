var Lightnet = {
  apiUrl: 'http://192.168.0.15:4050/api/',
  pollingInterval: 5000,
  lightmanager: null,
  roommanager: null,
}


$(function() {
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    window.location.hash = e.target.hash;
  })
  $('#navbar a[href="' + window.location.hash + '"]').tab('show');

  Lightnet.lightmanager = new LightManager();
  Lightnet.roommanager = new RoomManager();

  Lightnet.lightmanager.requestData();
});
