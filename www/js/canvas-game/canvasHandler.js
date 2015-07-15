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
    	self.stage.addChild(ground);
    	self.stage.addChild(self.sprites.bug);

		self.renderer = new PIXI.autoDetectRenderer(ground.width, ground.height, {view: self.canvas});

		self.animation();
		self.draw();

	}

}

canvasHandler.prototype.draw = function draw() {

	if(this.renderer) {
		this.renderer.render(this.stage);
	}
	
}

canvasHandler.prototype.drawGround = function drawGround() {

	this.ground = 
	PIXI.Sprite.fromImage(assets.squares);

	return this.groundCanvas;

}

canvasHandler.prototype.update = function update(deltaTime) {

	if(this.renderer) {
		this.time += deltaTime;
		TWEEN.update( this.time );

		//this.sprites.bug.rotation += Math.PI * 0.03;
		this.sprites.bug.x = this.renderer.width / 2;
		this.sprites.bug.y = this.renderer.height / 2;
	}

}

canvasHandler.prototype.load = function load(state) {
	
	this.state = state;

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

exports = canvasHandler;