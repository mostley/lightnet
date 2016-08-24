function AnimationManager() {
  this.timer = -1;
}

AnimationManager.prototype.onData = function (lightList) {

  this.timer = window.setTimeout(this.requestData.bind(this), Lightnet.pollingInterval);
};

AnimationManager.prototype.requestData = function () {
  var me = this;

  $.ajax(Lightnet.apiUrl + 'animations', {
    dataType: "json",
    success: this.onData.bind(this),
    error: function(xhr, textStatus, error) {
      console.log('[AnimationManager] ' + error);

      this.timer = window.setTimeout(me.requestData.bind(me), Lightnet.pollingInterval);
    }
  });
};

AnimationManager.prototype.activate = function() {
  console.log('[AnimationManager] activate');

  this.requestData();
};

AnimationManager.prototype.deactivate = function() {
  console.log('[AnimationManager] deactivate');

  window.clearTimeout(this.timer);
};