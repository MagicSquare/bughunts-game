define(function(require) {

	var helper = require('js/canvas-game/helper'),
		Point = require('js/canvas-game/point');

	var assets = {
		grounds: 	{ url: '/tiles/grounds.png', sprite: false, center: false },
		bug: 		{ url: '/tiles/ladybug.png', sprite: true, center: true },
		tileset: 	{ url: '/tiles/tiles.png', sprite: false, center: false },
		bottlecap: 	{ url: '/tiles/bottlecap.png', sprite: false, center: false },
		axe: 		{ url: '/tiles/axe.png', sprite: false, center: false }
	};

	function canvasHandler() {
		
		this.time = 0;
		this.state = null;
		this.animations = [];
		this.stage = null;
		this.sprites = {};
		this.textures = {};
		this.squareSize = 32;
		this.animationDuration = 350;

	}

	canvasHandler.prototype.init = function init(onInitialized) {

		var loader = PIXI.loader;

		// Load assets
		for(var key in assets) {
			loader.add(key, 'img/assets/' + assets[key].url);
		}

		loader.once('complete', onComplete);
		loader.load();

		var self = this;

		function onComplete(loader, resources) {

			for(var key in resources) {
				self.textures[key] = resources[key].texture;
				if(assets[key].sprite) {
					var sprite = new PIXI.Sprite(resources[key].texture);
					self.sprites[key] = sprite;
					if(assets[key].center) {
						sprite.anchor.set(0.5, 0.5);
					}
				}
			}
	    	self.loadTexturesFromTileset();
	    	onInitialized();

		}

	}

	canvasHandler.prototype.moveSquareSprite = function moveSquareSprite(sprite, x, y) {

		sprite.x = ( x + 0.5 ) * this.squareSize;
		sprite.y = ( y + 0.5 ) * this.squareSize;

	}

	canvasHandler.prototype.loadTexturesFromTileset = function loadTexturesFromTileset() {

		var self = this;

		function loadGroupOfTextures(array, source, coordinates) {
			for(var i = 0; i < coordinates.length; ++i) {
				array.push(helper.extractTextureFromCanvas(
					source,
					coordinates[i].x * self.squareSize,
					coordinates[i].y * self.squareSize,
					self.squareSize,
					self.squareSize
				));
			}
		}

		this.textures.stones = [];
		loadGroupOfTextures(this.textures.stones, this.textures.tileset.baseTexture.source, [
			{ x: 7, y: 2 },
			{ x: 4, y: 3 },
			{ x: 6, y: 3 },
			{ x: 7, y: 3 }
		]);

		this.textures.grass = [];
		loadGroupOfTextures(this.textures.grass, this.textures.tileset.baseTexture.source, [
			{ x: 2, y: 2 },
			{ x: 6, y: 4 },
			{ x: 7, y: 4 },
			{ x: 3, y: 6 }
		]);

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
		if(this.renderer && this.stage) {
			this.renderer.render(this.stage);
		}
		
	}

	canvasHandler.prototype.drawGround = function drawGround() {

		this.stage.removeChild(this.sprites.ground);

		var halfSquareSize = this.squareSize * 0.5;
		function drawAutotilePart(context, source, autotile, tile, coordinates) {
			var top = (autotile.y * 6 + tile.y) * halfSquareSize,
				left = (autotile.x * 4 + tile.x) * halfSquareSize;

			context.drawImage(source, left, top, halfSquareSize, halfSquareSize, coordinates.x, coordinates.y, halfSquareSize, halfSquareSize);
		}
		var groundCanvas = document.createElement('canvas');
		groundCanvas.width = this.state.res.x * this.squareSize;
		groundCanvas.height = this.state.res.y * this.squareSize;
		var context = groundCanvas.getContext('2d');

  
		// Draw the ground
		var maxX = this.state.res.x * 2,
			maxY = this.state.res.y * 2,
			tile = {x: 0, y:0};
		for(var x = 0; x < maxX; ++x) {

			tile.x = (0 === x) ? 0 : (maxX - 1 === x) ? 3 : 1 + x % 2;
			for(var y = 0; y < maxY; ++y) {

				tile.y = (0 === y) ? 2 : (maxY - 1 === y) ? 5 : 3 + y % 2;
				drawAutotilePart(context, this.textures.grounds.baseTexture.source, { x: 5, y: 3 }, { x: tile.x, y:tile.y }, { x: x * halfSquareSize, y: y * halfSquareSize });

			}

		}

		var texture = PIXI.Texture.fromCanvas(groundCanvas);
		var sprite = new PIXI.Sprite(texture);
		this.sprites.ground = sprite;
		this.stage.addChildAt(sprite, 0);

	}

	canvasHandler.prototype.update = function update(deltaTime) {

		if(this.renderer) {
			// Handle time and update animations (if any)
			this.time += deltaTime;
			TWEEN.update(window.performance.now());
		}

	}

	canvasHandler.prototype.addSquare = function addSquare(x, y, square) {

		var sprite = null,
			texture = null,
			alpha = 1;


		switch(square.type) {
			case 'o':
				if(this.rand() > 0.8) {
					texture = this.textures.grass[Math.floor(this.textures.grass.length * this.rand())];
					alpha = 0.5;
				}
				break;
			case 's':
				texture = this.textures.stones[Math.floor(this.textures.stones.length * this.rand())];
				break;
			default:
				break;
		}

		if(texture !== null) {
			sprite = new PIXI.Sprite(texture);
			sprite.anchor.set(0.5, 0.5);
			sprite.alpha = alpha;
			this.stage.addChild(sprite);
			this.moveSquareSprite(sprite, x, y);
		}

		return sprite;

	}

	canvasHandler.prototype.removeSquare = function removeElement(x, y) {

		var index = y * this.state.res.x + x;
		if(index < this.map.length && this.map[index] != null) {
			this.stage.removeChild(this.map[index]);
			this.map[index] = null;
		}
		
	}

	canvasHandler.prototype.setState = function setState(state) {
		
		this.state = state;
		this.rand = helper.lcg(this.state.res.x * this.state.res.y);

		this.stage = new PIXI.Container();
		this.drawGround();

		// Add special squares on the map
		this.map = [];
		for(var i = 0; i < state.res.y; ++i) {
			for(var j = 0; j < state.res.x; ++j) {

				var square = state.get({x: j, y: i});
				this.map.push(this.addSquare(j, i, square));
			}
		}

		// Add the bug
		this.moveSquareSprite(this.sprites.bug, state.bug.pos.x, state.bug.pos.y);
		this.stage.addChild(this.sprites.bug);

	}

	canvasHandler.prototype.spriteAnimation = function spriteAnimation(duration, spriteId, posFrom, rotationFrom, posTo, rotationTo, onComplete) {

		var texture = null;
		switch(spriteId) {
			case 'bottlecap':
				texture = this.textures.bottlecap;
				rotationFrom = 0;
				rotationTo = Math.PI * 20;
				break;
			case 'axe':
				texture = this.textures.axe;
				rotationFrom = 0;
				rotationTo = Math.PI * 10;
				break;
		}
		if(texture !== null) {
			this.moveTexture(duration, texture, posFrom, rotationFrom, posTo, rotationTo, onComplete);
		}

	}

	canvasHandler.prototype.moveTexture = function moveTexture(duration, texture, posFrom, rotationFrom, posTo, rotationTo, onComplete) {

		var self = this;
		onComplete = helper.getDefault(function() {}, onComplete);

		var sprite = new PIXI.Sprite(texture);
		sprite.anchor.set(0.5, 0.5);
		this.moveSquareSprite(sprite, posFrom.x, posFrom.y);
		sprite.rotation = rotationFrom;
		this.stage.addChild(sprite);

		var onAnimationComplete = function() {
			self.stage.removeChild(sprite);
			onComplete();
		}

		this.animation({
			duration: duration,
			from: { 
				x: posFrom.x,
				y: posFrom.y,
				rotation: rotationFrom
			},
			to: {
				x: posTo.x,
				y: posTo.y,
				rotation: rotationTo
			},
			easing: TWEEN.Easing.Quadratic.In,
			onUpdate: function() {
				self.moveSquareSprite(sprite, this.x, this.y);
				sprite.rotation = this.rotation;
			},
			onComplete: onAnimationComplete
		});

	}

	canvasHandler.prototype.moveBug = function moveBug(duration, pos, rotation, onComplete) {

		onComplete = helper.getDefault(function() {}, onComplete);

		var bug = this.sprites.bug;
		this.animation({
			duration: duration,
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

	}

	canvasHandler.prototype.animation = function animation(options) {

		options = helper.getDefault({}, options);
		var defaultValues = {

			onUpdate: function() {},
			onComplete: function() {},
			duration: 350,
			delay: 50,
			from: { x: 0 },
			to: { x: 1 },
			easing: TWEEN.Easing.Quadratic.InOut

		};
		helper.getDefaults(defaultValues, options);

		var tweenAnimation = new TWEEN.Tween(options.from)
			.to(options.to, options.duration * this.animationDuration)
			.delay(options.delay)
			.easing(options.easing)
			.onUpdate(options.onUpdate)
			.onComplete(options.onComplete)
		;
		tweenAnimation.start();
		
	}

	return canvasHandler;

});