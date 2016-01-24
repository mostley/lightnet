var Lightnet = {
  apiUrl: 'http://localhost:4050/api/',
  pollingInterval: 5000,
  lightManager: null,
  roomManager: null,
  activeManager: null
};

function activateManager(mgr) {
  if (Lightnet.activeManager) {
    Lightnet.activeManager.deactivate();
  }

  mgr.activate();
  Lightnet.activeManager = mgr;
}


$(function() {
  $('#apiDocsLink').attr('href', Lightnet.apiUrl + '../apiDocs');

  Lightnet.lightManager = new LightManager();
  Lightnet.roomManager = new RoomManager();

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    window.location.hash = e.target.hash;

    if (e.target.hash == '#lights') {
      activateManager(Lightnet.lightManager);
    } else if (e.target.hash == '#rooms') {
      activateManager(Lightnet.roomManager);
    } else if (Lightnet.activeManager) {
      Lightnet.activeManager.deactivate();
    }
  });

  if (window.location.hash.length > 0) {
    $('#navbar').find('a[href="' + window.location.hash + '"]').tab('show');
  } else {
    activateManager(Lightnet.lightManager);
  }
});
