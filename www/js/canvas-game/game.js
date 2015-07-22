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

	Game.prototype.parseChallengeTry = function parseChallengeTry(data, onComplete) {

		onComplete = helper.getDefault(function() {}, onComplete);
		var state = State.from2DArray(data.map);
		this.setState(state);
		if(typeof data.details != 'undefined') {
			this.runChallenge(data.details, onComplete);
		}
		else {
			onComplete();
		}

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
		function getOnComplete(longestAnimation, i, animation) {
			if(firstCall && longestAnimation === i && animation.type != 'del') {
				firstCall = false;
				return onComplete;
			}
			return function() {};
		}

		var longestDuration = 0,
			longestAnimation = 0;
		for(var i = 0; i < step.length; ++i) {
			var duration = helper.getDefault(1, step[i].duration);
			if(duration > longestDuration) {
				longestDuration = duration;
				longestAnimation = i;
			}
		}

		for(var i = 0; i < step.length; ++i) {
			var animation = step[i],
				duration = helper.getDefault(1, animation.duration),
				completeCallback = getOnComplete(longestAnimation, i, animation);

			switch(animation.type) {
				case 'bug':
					var rotation = 0;
					if(typeof animation.bug.dir !== 'undefined') {
						rotation = helper.dirToRotation(animation.bug.dir);
					}
					else {
						rotation = helper.stringToRotation(animation.bug.rotation);
					}
					this.canvasHandler.moveBug(duration, animation.bug.pos, rotation, completeCallback);
					break;
				case 'object':
					this.canvasHandler.spriteAnimation(duration, animation.name, animation.posFrom, StR(animation.rotationFrom), animation.posTo, StR(animation.rotationTo), completeCallback);
					break;
				case 'del':
					this.canvasHandler.removeSquare(animation.pos.x, animation.pos.y);
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

	State.from2DArray = function(array) {

		var res = new Point(array[0].length, array.length);
		var state = new State(res);

		for(var i = 0; i < res.y; ++i) {
			for(var j = 0; j < res.x; ++j) {

				var square = array[i][j];
				if(square != 'l' && square != 'o') {
					state.set( {x: j, y: i }, {type: square})
				}
				else if(square == 'l') {
					state.bug.pos.set(j, i);
				}
			}
		}

		return state;

	}

	return Game;
});