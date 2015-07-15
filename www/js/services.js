angular.module('starter.services', [])

.service('Settings', function() {
  
  this.host = 'http://dev.pierrepironin.fr:8111';

})

.service('Canvas', function() {

  this.handler = new canvasHandler();

})