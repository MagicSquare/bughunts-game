define(function(require) {

	var Point = require('js/canvas-game/point');

	function Game(canvasHandler) {

		this.canvasHandler = canvasHandler;

		var res = new Point(6, 6);
		this.initialState = new State(new Point(6, 4));

	}

	Game.prototype.setState = function setState(state) {

		this.initialState = state;
		this.canvasHandler.setState(state.clone());

	}

	Game.prototype.runChallenge = function runChallenge(steps) {

		// Copy the initial map
		this.state = this.initialState.clone();

		for(var i = 0; i < steps.length; ++i) {
			this.runStep(steps[i]);
		}

	}

	Game.prototype.runStep = function runStep(step) {

	}

	function State(res) {
	  
	  this.res = res;
	  this.bug = { pos: new Point(0, 0), dir: new Point(1, 0) };
	  this.mapSize = res.x * res.y;
	  this.map = [];
	  for(var i = this.mapSize; i > 0; i--) {
	    this.map.push( {
	      state: State.Type.Empty
	    } );
	  }
	  
	}

	State.Type = {
	  EMPTY: 0,
	  STONE: 1
	}

	State.prototype.get = function(pos) {
	  
	  var index = pos.y * res.x + pos.x;
	  if( index < mapSize ) {
	    return this.map[index];
	  }
	  return null;
	  
	}

	State.prototype.set = function(pos, square) {
	  
	  var index = pos.y * res.x + pos.x;
	  if( index < mapSize ) {
	    this.map[index] = square;
	  }
	  
	}

	State.prototype.clone = function() {

	  var clone = new Point( this.res );
	  clone.bug = { pos: this.bug.pos.clone(), dir: this.bug.dir.clone() };
	  clone.map = this.map.slice();
	  return clone;

	}

	return Game;
});