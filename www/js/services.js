angular.module('starter.services', [])

.service('Settings', function() {
  
  this.host = 'http://dev.pierrepironin.fr:8111';

})

.service('Canvas', function() {

  var self = this;

  this.ready = function() {};

  this.load = function() {

    requirejs(['js/canvas-game/canvasHandler', 'js/canvas-game/game', 'js/canvas-game/point'], function(CanvasHandler, Game) {

      self.handler = new CanvasHandler();
      self.game = new Game(self.handler);
      self.ready();

    });

  }

});