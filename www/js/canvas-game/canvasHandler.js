define(function(require) {

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

	}

	canvasHandler.prototype.init = function init(canvas) {

		this.canvas = canvas;

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
			var ground = self.sprites.ground;
	    	self.stage.addChild(self.sprites.bug);

			self.renderer = new PIXI.autoDetectRenderer(ground.width, ground.height, {view: self.canvas});

			self.animation();
			self.draw();

			self.drawGround();

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
			TWEEN.update( this.time );

			// Handle fixed sprites positions
			this.sprites.bug.x = this.renderer.width / 2;
			this.sprites.bug.y = this.renderer.height / 2;
		}

	}

	canvasHandler.prototype.setState = function setState(state) {
		
		this.state = state;
		this.drawGround();

	};

	canvasHandler.prototype.move = function move(pos, dir) {


		
	}

	canvasHandler.prototype.animation = function animation(options) {

		var self = this;
		t0 = new TWEEN.Tween({ rotation: 0 })
			.to({ rotation: Math.PI * 2 }, 2000)
			.delay(100)
			.repeat(Infinity)
			.easing(TWEEN.Easing.Cubic.InOut)
			.onUpdate(function() {
				self.sprites.bug.rotation = this.rotation;
		});
		t0.start();
		
	}

	canvasHandler.prototype.animationText = function animationText(options) {



	}

	return canvasHandler;

});