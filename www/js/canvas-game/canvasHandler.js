define(function(require) {

	var helper = require('js/canvas-game/helper'),
		Point = require('js/canvas-game/point');

	var assets = {
		grounds: 	{ url: '/tiles/grounds.png' },
		tileset: 	{ url: '/tiles/tiles.png' },
		bottlecap: 	{ url: '/tiles/bottlecap.png' },
		axe: 		{ url: '/tiles/axe.png' },
		bug: 		{ url: '/tiles/bug.png' }
	};

	var textures = {},
		squareSize = 32,
		texturesLoaded = false;

	function loadTexturesFromTileset() {

		function loadGroupOfTextures(array, source, scale, coordinates) {
			for(var i = 0; i < coordinates.length; ++i) {
				array.push(helper.extractTextureFromCanvas(
					source,
					coordinates[i].x * squareSize * scale,
					coordinates[i].y * squareSize * scale,
					squareSize * scale,
					squareSize * scale
				));
			}
		}

		var source = textures.tileset.baseTexture.source;
		textures.stones = [];
		loadGroupOfTextures(textures.stones, source, 1, [
			{ x: 7, y: 2 },
			{ x: 4, y: 3 },
			{ x: 6, y: 3 },
			{ x: 7, y: 3 }
		]);

		textures.grass = [];
		loadGroupOfTextures(textures.grass, source, 1, [
			{ x: 2, y: 2 },
			{ x: 6, y: 4 },
			{ x: 7, y: 4 },
			{ x: 3, y: 6 }
		]);

		textures.goal = helper.extractTextureFromCanvas(source, 4 * squareSize, 9 * squareSize, squareSize, squareSize);

		textures.bug = [];
		loadGroupOfTextures(textures.bug, textures.bug.baseTexture.source, 2, [
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
			{ x: 0, y: 0 },
			{ x: 1, y: 1 }
		]);

	}

	function loadTextures(onInitialized) {

		if(!texturesLoaded) {

			var loader = PIXI.loader;

			// Load assets
			for(var key in assets) {
				loader.add(key, 'img/assets/' + assets[key].url);
			}

			loader.once('complete', onComplete);
			loader.load();

			function onComplete(loader, resources) {

				for(var key in resources) {
					textures[key] = resources[key].texture;
				}
				loadTexturesFromTileset();
				texturesLoaded = true;
				onInitialized();

			}
			
		}
		else {
			onInitialized();
		}

	}

	function canvasHandler() {
		
		this.time = 0;
		this.state = null;
		this.animations = [];
		this.stage = null;
		this.animationDuration = 300;
		this.sprites = [];

	}

	canvasHandler.prototype.init = function init(onInitialized) {

		var self = this;
		loadTextures(function() {

			self.bugSpriteTexture = 0;
			var sprite = new PIXI.Sprite(textures['bug'][0] );
			self.sprites['bug'] = sprite;
			sprite.anchor.set(0.5, 0.5);
			sprite.realRotation = 0;
			sprite.scale.set(0.7, 0.7);

			onInitialized();
		});

	}

	canvasHandler.prototype.moveSquareSprite = function moveSquareSprite(sprite, x, y) {

		sprite.x = ( x + 0.5 ) * squareSize;
		sprite.y = ( y + 0.5 ) * squareSize;

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

		var halfSquareSize = squareSize * 0.5;
		function drawAutotilePart(context, source, autotile, tile, coordinates) {
			var top = (autotile.y * 6 + tile.y) * halfSquareSize,
				left = (autotile.x * 4 + tile.x) * halfSquareSize;

			context.drawImage(source, left, top, halfSquareSize, halfSquareSize, coordinates.x, coordinates.y, halfSquareSize, halfSquareSize);
		}
		var groundCanvas = document.createElement('canvas');
		groundCanvas.width = this.state.res.x * squareSize;
		groundCanvas.height = this.state.res.y * squareSize;
		var context = groundCanvas.getContext('2d');

  
		// Draw the ground
		var maxX = this.state.res.x * 2,
			maxY = this.state.res.y * 2,
			tile = {x: 0, y:0};
		for(var x = 0; x < maxX; ++x) {

			tile.x = (0 === x) ? 0 : (maxX - 1 === x) ? 3 : 1 + x % 2;
			for(var y = 0; y < maxY; ++y) {

				tile.y = (0 === y) ? 2 : (maxY - 1 === y) ? 5 : 3 + y % 2;
				drawAutotilePart(context, textures.grounds.baseTexture.source, { x: 5, y: 3 }, { x: tile.x, y:tile.y }, { x: x * halfSquareSize, y: y * halfSquareSize });

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

	canvasHandler.prototype.updateTextureWithRotation = function updateTextureWithRotation() {

		var rotation = (this.sprites.bug.realRotation + 2 * Math.PI) % (2 * Math.PI),
			step = Math.PI / 4;

		var id = 0;

		if(rotation < step) {
			id = 0;
		}
		else if(rotation < 3 * step) {
			id = 1;
		}
		else if(rotation < 5 * step) {
			id = 2;
		}
		else if(rotation < 7 * step) {
			id = 3;
		}
		this.sprites.bug.rotation = this.sprites.bug.realRotation - 2 * id * step;

		if(id != this.bugSpriteTexture) {
			this.bugSpriteTexture = id;
			this.sprites.bug.texture = textures.bug[id];
		}

	}

	canvasHandler.prototype.addSquare = function addSquare(x, y, square) {

		var sprite = null,
			texture = null,
			alpha = 1;


		switch(square.type) {
			case 'o':
				if(this.rand() > 0.8) {
					texture = textures.grass[Math.floor(textures.grass.length * this.rand())];
					alpha = 0.5;
				}
				break;
			case 's':
				texture = textures.stones[Math.floor(textures.stones.length * this.rand())];
				break;
			case 'g':
				texture = textures.goal;
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
		this.renderer.resize(this.sprites.ground.width, this.sprites.ground.height);

		// Add special squares on the map
		this.map = [];
		for(var i = 0; i < state.res.y; ++i) {
			for(var j = 0; j < state.res.x; ++j) {

				var square = state.get({x: j, y: i});
				this.map.push(this.addSquare(j, i, square));
			}
		}

		// Add the bug
		this.sprites.bug.realRotation = 0;
		this.stage.addChild(this.sprites.bug);
		this.moveSquareSprite(this.sprites.bug, state.bug.pos.x, state.bug.pos.y);

	}

	canvasHandler.prototype.spriteAnimation = function spriteAnimation(duration, spriteId, posFrom, rotationFrom, posTo, rotationTo, onComplete) {

		var texture = null;
		switch(spriteId) {
			case 'missile':
			case 'bottlecap':
				texture = textures.bottlecap;
				rotationFrom = 0;
				rotationTo = Math.PI * 20;
				break;
			case 'axe':
				texture = textures.axe;
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

		var bug = this.sprites.bug,
			self = this,
			rotationFrom = bug.realRotation;

		if(Math.abs(rotationFrom - rotation) > Math.abs((rotationFrom - Math.PI * 2) - rotation) ) {
			rotationFrom -= Math.PI * 2;
		}
		else if(Math.abs(rotationFrom - rotation) > Math.abs((rotationFrom + Math.PI * 2) - rotation) ) {
			rotationFrom += Math.PI * 2;
		}

		this.animation({
			duration: duration,
			from: { 
				x: bug.x,
				y: bug.y,
				rotation: rotationFrom
			},
			to: {
				x: ( pos.x + 0.5 ) * squareSize,
				y: ( pos.y + 0.5 ) * squareSize,
				rotation: rotation
			},
			onUpdate: function() {

				bug.x = this.x;
				bug.y = this.y;
				bug.realRotation = this.rotation;
				self.updateTextureWithRotation();

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