/*
 * jQuery.shroud plugin
 * https://github.com/drzax/jquery-shroud
 *
 * Copyright 2011, Simon Elvery
 * http://elvery.net
 *
 * This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * http://creativecommons.org/licenses/by-sa/3.0/
 */
(function($){

  /*
   * Make error logging easier.
   */
  var log = function(message){
    if ( window.console && window.console.log ) {
      window.console.log(message);
    }
    $.error(message);
  }

  var methods = {

    /*
     * Initialise or drop the shroud on the selected elements.
     */
    drop : function(_opts) {

      var opts = $.extend( {}, $.fn.shroud.defaults || {}, _opts || {} );

      return this.each(function() {
        var $this = $(this),
          data = $this.data('shroud');


        if ( ! data ) {
          data = {
            shroud : $('<div class="shroud"></div>'),
            target : $this,
            opts : opts
          }
          data.shroud.appendTo(data.target);
        } else {
          $.extend( data.opts, opts );
        }

        // TODO: Support non-relative positioning of element to be shrouded.

        data.shroud.css({
          opacity: opts.opacity,
          zIndex: opts.z,
          backgroundColor: opts.color,
          height: $this.outerHeight(),
          width: $this.outerWidth(),
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'none'
        });

        // Drop it
        // TODO: Support additional drop animations.
        // TODO: Support easing
        data.shroud.fadeIn(opts.speed, function(){
          if ( typeof opts.complete == 'function' ) {
            opts.complete.call(this, 'drop', opts);
          }
        });
        data.target.addClass('shrouded');

        // Setup the lift listener
        if (opts.click) {
          data.shroud.one('click', function(){
            data.target.shroud('lift', opts);
          })
        }

        // TOOD: Support browser resize.

        // Store some stuff we might need later
        $this.data('shroud', data);

      });
    },

    /*
     * Lift the shroud from the selected elements
     */
    lift : function(_opts) {

      return this.each(function(){
        var $this = $(this),
          data = $this.data('shroud');

        // Nothing to do if there is no shroud.
        if ( ! data ) return;

        // Nothing to do if the element isn't shrouded
        if ( ! data.target.hasClass('shrouded') ) return;

        // Sort out the options.
        var opts = $.extend( {}, $.fn.shroud.defaults || {}, data.opts, _opts || {} );
        data.shroud.fadeOut(opts.speed).promise().done(function(){ // Is .promise() needed here? I simple on complete callback should do.

          // Destroy shroud if requested
          if ( opts.destroy ) {
            data.shroud.remove();
            $this.removeData('shroud');
          }

          // Do callback
          if ( typeof opts.complete == 'function' ) {
            opts.complete.call(this, 'lift', opts);
          }
        });
      });
    },

    /*
     * A shortcut for $('selector').shroud('lift', {destroy:true});
     */
    destroy : function(_opts) {
      _opts.destroy = true;
      return methods.lift.apply( this, _opts );
    }
  }

  // The plugin function
  $.fn.shroud = function( method ) {
    if ( methods[method] ) {
      // Remove the first argument (method name) and send on to the requested method.
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      // Initialise the shroud
      return methods.drop.apply( this, arguments );
    } else {
      log( '[shroud] method ' +  method + ' does not exist' );
      return this;
    }
  }


  // Default options exposed so they can be updated globally.
  $.fn.shroud.defaults = {
    opacity: .8,      // Opacity of the shroud
    z: 100,         // z-index for the shroud element
    color: '#000',      // Shroud color
    speed: 200,       // Effect speed
    click: true,      // Close on click?,
    destroy: false,     // Completely remove shroud from DOM after lifting? (only applies when lift function is called)
    complete: null      // A callback to execute on completion of drop or lift event.
  }
})(jQuery);