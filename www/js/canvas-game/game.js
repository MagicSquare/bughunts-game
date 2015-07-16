define(function(require) {

	var helper = require('js/canvas-game/helper'),
		Point = require('js/canvas-game/point');

	function getDefault(defaultValue, value) {
		
		if(typeof value === 'undefined')
			return defaultValue;
		return value;

	}

	function Game(canvasHandler) {

		this.canvasHandler = canvasHandler;

		this.initialState = new State(new Point(15, 8));
		for(var i = 0; i < this.initialState.res.y; ++i) {
			for(var j = 0; j < this.initialState.res.x; ++j) {
				if(i !== 0 && j !== 0) {
					if(Math.random() > 0.8) {
						this.initialState.set({ x: j, y: i }, {type: 's'});
					}
				}
			}
		}

	}

	Game.prototype.init = function load(onInitialized) {

		var self = this;
		this.canvasHandler.init(function() {

			self.canvasHandler.setState(self.initialState.clone());
			onInitialized();

		});

	}

	Game.prototype.start = function start() {

	 	var time = new Date().getTime();
	 	var self = this;

		function animate() {
		    requestAnimationFrame(animate);

		    // http://creativejs.com/resources/requestanimationframe/
		    var now = new Date().getTime(),
		        dt = now - (time || now);
		    time = now;

		    self.canvasHandler.update(dt);
		    self.canvasHandler.draw();
		}
		animate();

	}

	Game.prototype.setState = function setState(state) {

		this.initialState = state;
		this.canvasHandler.setState(state.clone());

	}

	Game.prototype.runChallenge = function runChallenge(steps, onChallengeComplete) {

		onChallengeComplete = helper.getDefault(function() {}, onChallengeComplete);
		// Copy the initial map
		this.state = this.initialState.clone();

		var index = 0, self = this;
		function onStepComplete() {

			index ++;
			if(index < steps.length) {
				self.runStep(steps[index], onStepComplete);
			}
			else {
				onChallengeComplete();
			}

		};
		this.runStep(steps[0], onStepComplete);

	}

	Game.prototype.runStep = function runStep(step, onComplete) {

		this.canvasHandler.moveBug(step.bug.pos, step.bug.rotation, onComplete);

	}

	function State(res) {

		this.res = res;
		this.bug = { pos: new Point(0, 0), dir: new Point(1, 0) };
		this.mapSize = res.x * res.y;
		this.map = [];
		for(var i = this.mapSize; i > 0; i--) {
			this.map.push( {
				type: 'o'
			} );
		}
	  
	}

	State.prototype.get = function(pos) {

		var index = pos.y * this.res.x + pos.x;
		if( index < this.mapSize ) {
			return this.map[index];
		}
		return null;

	}

	State.prototype.set = function(pos, square) {

		var index = pos.y * this.res.x + pos.x;
		if( index < this.mapSize ) {
			this.map[index] = square;
		}

	}

	State.prototype.clone = function() {

		var clone = new State( this.res );
		clone.bug = { pos: this.bug.pos.clone(), dir: this.bug.dir.clone() };
		clone.map = this.map.slice();
		return clone;

	}

	return Game;
});