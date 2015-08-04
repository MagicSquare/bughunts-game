define(function(require) {

	var helper = require('js/canvas-game/helper'),
		Point = require('js/canvas-game/point'),
		Map = require('js/canvas-game/map');

	function getDefault(defaultValue, value) {
		
		if(typeof value === 'undefined')
			return defaultValue;
		return value;

	}

	function Game(canvasHandler) {

		this.canvasHandler = canvasHandler;
		this.onNewInstruction = function() {};
		this.initialState = new State(new Point(15, 8));

	}

	Game.prototype.init = function(onInitialized) {

		var self = this;
		this.canvasHandler.init(function() {

			onInitialized();

		});

	}

	Game.prototype.start = function() {

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

	Game.prototype.setState = function(state, actors) {

		this.initialState = state;
        this.actors = actors;
		this.canvasHandler.setState(state.clone(), actors);

	}

    Game.prototype.initChallenge = function(data) {

        var array = data.map;
        if(typeof data.map.squares !== 'undefined') {
            array = [];
            for(var i = 0; i < data.map.res.y; ++i) {
                array.push(data.map.squares.slice(i * data.map.res.x, (i + 1) * data.map.res.x));
            }
        }

        var state = State.from2DArray(array);
        this.setState(state, data.map.actors);
    }

	Game.prototype.parseChallengeTry = function(data, onComplete) {

		onComplete = helper.getDefault(function() {}, onComplete);

        this.initChallenge(data);

		if(typeof data.details != 'undefined') {
			this.runChallenge(data.details, onComplete);
		}
		else {
			onComplete();
		}

	}

	Game.prototype.runChallenge = function(steps, onChallengeComplete) {

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

	Game.prototype.runStep = function(step, onComplete) {

		var StR = helper.stringToRotation;

		if (typeof step === 'undefined' || step.length === 0) {
			onComplete();
			return;
		}

		var longestDuration = 0,
			longestAnimation = 0;
		for(var i = 0; i < step.length; ++i) {
			var duration = helper.getDefault(1, step[i].duration);
			if(duration > longestDuration && step[i].type != 'del') {
				longestDuration = duration;
				longestAnimation = i;
			}
		}

        function getOnComplete(longestAnimation, i) {
            if(longestAnimation === i) {
                return onComplete;
            }
            return function() {};
        }

		for(var i = 0; i < step.length; ++i) {
			var animation = step[i],
				duration = helper.getDefault(1, animation.duration),
                completeCallback = getOnComplete(longestAnimation, i);

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
					this.canvasHandler.removeSquare(animation.pos.x, animation.pos.y, completeCallback);
					break;
				case 'instruction':
					this.onNewInstruction(animation.location);
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