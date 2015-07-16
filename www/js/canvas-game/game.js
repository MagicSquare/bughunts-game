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

	}

	Game.prototype.init = function load(onInitialized) {

		var self = this;
		this.canvasHandler.init(function() {

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

		var firstCall = true,
			StR = helper.stringToRotation;
		function getOnComplete() {
			if(firstCall) {
				firstCall = false;
				return onComplete;
			}
			return function() {};
		}

		for(var i = 0; i < step.length; ++i) {
			var animation = step[i];

			switch(animation.type) {
				case 'bug':
					this.canvasHandler.moveBug(animation.bug.pos, StR(animation.bug.rotation), getOnComplete());
					break;
				case 'object':
					this.canvasHandler.spriteAnimation(animation.name, animation.posFrom, StR(animation.rotationFrom), animation.posTo, StR(animation.rotationTo), getOnComplete());
					break;
			}
		}


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