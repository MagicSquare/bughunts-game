define(function(require) {

	var helper = require('js/canvas-game/helper');

	var assets = {
		ground: { url: 'img/assets/tiles/ground.png', center: false },
		bug: { url: 'img/assets/tiles/ladybug.png', center: true }
	};

	function canvasHandler() {
		
		this.time = 0;
		this.state = null;
		this.animations = [];
		this.stage = new PIXI.Container();
		this.sprites = {};
		this.squareSize = 32;

	}

	canvasHandler.prototype.init = function init(onInitialized) {

		var loader = PIXI.loader;

		// Load assets
		for(var key in assets) {
			loader.add(key, assets[key].url);
		}

		loader.once('complete', onComplete);
		loader.load();

		var self = this;

		function onComplete(loader, resources) {

			for(var key in resources) {
				var sprite = new PIXI.Sprite(resources[key].texture);
				self.sprites[key] = sprite;
				if(assets[key].center) {
					sprite.anchor.set(0.5, 0.5);
				}
			}
	    	self.stage.addChild(self.sprites.bug);
	    	self.sprites.bug.x = self.squareSize / 2;
	    	self.sprites.bug.y = self.squareSize / 2;
	    	onInitialized();

		}

	}

	canvasHandler.prototype.setCanvas = function setCanvas(canvas) {

		this.canvas = canvas;
		if(this.sprites.ground) {
			this.renderer = new PIXI.autoDetectRenderer(this.sprites.ground.width, this.sprites.ground.height, {view: canvas});
		}
		else {
			this.renderer = new PIXI.autoDetectRenderer(800, 600, {view: canvas});

		}
	}

	canvasHandler.prototype.draw = function draw() {

		// Render only if everything is loaded
		if(this.renderer) {
			this.renderer.render(this.stage);
		}
		
	}

	canvasHandler.prototype.drawGround = function drawGround() {

		this.stage.removeChild(this.sprites.ground);

		// Should recompute the ground with this.state values
		var sprite = new PIXI.Sprite(this.sprites.ground.texture);
		this.sprites.ground = sprite;
		this.stage.addChildAt(sprite, 0);

	}

	canvasHandler.prototype.update = function update(deltaTime) {

		if(this.renderer) {
			// Handle time and update animations (if any)
			this.time += deltaTime;
			TWEEN.update(window.performance.now());

			// Handle fixed sprites positions
		}

	}

	canvasHandler.prototype.setState = function setState(state) {
		
		this.state = state;
		this.drawGround();

	};

	canvasHandler.prototype.move = function move(pos, dir) {


		
	}

	canvasHandler.prototype.moveBug = function moveBug(pos, rotation, onComplete) {

		onComplete = helper.getDefault(function() {}, onComplete);

		var bug = this.sprites.bug;
		this.animation({
			from: { 
				x: bug.x,
				y: bug.y,
				rotation: bug.rotation
			},
			to: {
				x: ( pos.x + 0.5 ) * this.squareSize,
				y: ( pos.y + 0.5 ) * this.squareSize,
				rotation: rotation
			},
			onUpdate: function() {

				bug.x = this.x;
				bug.y = this.y;
				bug.rotation = this.rotation;

			},
			onComplete: onComplete
		});

	},

	canvasHandler.prototype.animation = function animation(options) {

		options = helper.getDefault({}, options);
		var defaultValues = {

			onUpdate: function() {},
			onComplete: function() {},
			duration: 350,
			delay: 50,
			from: { x: 0 },
			to: { x: 1 }

		};
		helper.getDefaults(defaultValues, options);

		var self = this;
		t0 = new TWEEN.Tween(options.from)
			.to(options.to, options.duration)
			.delay(options.delay)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate(options.onUpdate)
			.onComplete(options.onComplete)
		;
		this.tween = t0;
		this.tween.start();
		
	}

	canvasHandler.prototype.animationText = function animationText(options) {



	}

	return canvasHandler;

});