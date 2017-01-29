Lightnet.activeManager = null;
Lightnet.lightManager = null;
Lightnet.roomManager = null;
Lightnet.lightsourceManager = null;
Lightnet.animationManager = null;

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
  Lightnet.lightsourceManager = new LightsourceManager();

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    window.location.hash = e.target.hash;

    if (e.target.hash == '#lights') {
      activateManager(Lightnet.lightManager);
    } else if (e.target.hash == '#rooms') {
      activateManager(Lightnet.roomManager);
    } else if (e.target.hash == '#lightsources') {
      activateManager(Lightnet.lightsourceManager);
    } else if (e.target.hash == '#animations') {
      activateManager(Lightnet.animationManager);
    } else if (Lightnet.activeManager) {
      Lightnet.activeManager.deactivate();
    }
  });

  if (window.location.hash.length > 0) {
    $('#navbar').find('a[href="' + window.location.hash + '"]').tab('show');
  } else {
    activateManager(Lightnet.lightManager);
  }

  $('.colorpicker-element').colorpicker();

  $.fn.shroud.defaults = {
    opacity: .8,
    z: 1000,
    color: '#fff',
    speed: 200,
    click: false
  };
});
