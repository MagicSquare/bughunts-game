define(function(require) {

    var helper = require('js/canvas-game/helper'),
        Point = require('js/canvas-game/point');

    var assets = {
        grounds: 	{ url: '/tiles/grounds.png' },
        tileset: 	{ url: '/tiles/tiles.png' },
        bottlecap: 	{ url: '/tiles/bottlecap_64.png' },
        axe: 		{ url: '/tiles/axe.png' },
        bug: 		{ url: '/tiles/bug_128.png' },
        stones: 	{ url: '/tiles/stones_64.png' },
        gems: 		{ url: '/tiles/gems_64.png' },
        web: 		{ url: '/tiles/web_64.png' },
        launcher: 	{ url: '/tiles/robot_64.png' },
        goal: 		{ url: '/tiles/goal2_64.png' },
        sand: 		{ url: '/tiles/sand_256.png' }
    };

    var textures = {},
        texturesLoaded = false,
        tileResolution = 32;

    function loadTexturesFromTileset() {

        function loadGroupOfTextures(source, scale, coordinates) {
            var textures = [];
            for(var i = 0; i < coordinates.length; ++i) {
                textures.push(helper.extractTextureFromCanvas(
                    source,
                    coordinates[i].x * tileResolution * scale,
                    coordinates[i].y * tileResolution * scale,
                    tileResolution * scale,
                    tileResolution * scale
                ));
            }
            return textures;
        }

        function lineSprites(nbSprites) {
            var sprites = [];
            for(var i = 0; i < nbSprites; ++i) {
                sprites.push({x: i, y: 0});
            }
            return sprites;
        }

        // Load stones
        textures.stones = loadGroupOfTextures(textures.stones.baseTexture.source, 2, lineSprites(4));

        // Load gems
        textures.gems = loadGroupOfTextures(textures.gems.baseTexture.source, 2, lineSprites(3));

        // Load grass
        textures.grass = loadGroupOfTextures(textures.tileset.baseTexture.source, 1, [
            { x: 2, y: 2 },
            { x: 6, y: 4 },
            { x: 7, y: 4 },
            { x: 3, y: 6 }
        ]);

        // Load bug
        var spritesDirection = [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 1, y: 1 }
        ];
        textures.bug = loadGroupOfTextures(textures.bug.baseTexture.source, 4, spritesDirection);

        // Load robot
        textures.launcher = loadGroupOfTextures(textures.launcher.baseTexture.source, 2, spritesDirection);

    }

    function loadTextures(onInitialized) {

        if(!texturesLoaded) {

            var loader = PIXI.loader;

            // Load assets
            for(var key in assets) {
                loader.add(key, 'img/assets/' + assets[key].url);
            }

            function onComplete(loader, resources) {

                for(var key in resources) {
                    textures[key] = resources[key].texture;
                }
                loadTexturesFromTileset();
                texturesLoaded = true;
                onInitialized();

            }

            loader.once('complete', onComplete);
            loader.load();

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
        this.animationDuration = 500;
        this.sprites = [];
        this.squareSize = 0;
        this.tilesScale = 0;
        this.canvasWidth = 600;
        this.resolutionChanged = false;

    }

    canvasHandler.prototype.setResolution = function setResolution(resolution) {

        if (resolution !== this.canvasWidth) {
            this.resolutionChanged = true;
            this.canvasWidth = resolution;
            if (this.state !== null) {
                this.setState(this.state, this.actors);
            }
        }

    }

    canvasHandler.prototype.init = function init(onInitialized) {

        var self = this;
        loadTextures(function() {

            self.bugSpriteTexture = 0;
            var sprite = new PIXI.Sprite(textures['bug'][0] );
            self.sprites['bug'] = sprite;
            sprite.anchor.set(0.5, 0.6);
            sprite.realRotation = 0;

            onInitialized();
        });

    }

    canvasHandler.prototype.moveSquareSprite = function moveSquareSprite(sprite, x, y) {

        sprite.x = ( x + 1 ) * this.squareSize;
        sprite.y = ( y + 1 ) * this.squareSize;

    }

    canvasHandler.prototype.setCanvas = function setCanvas(canvas) {

        this.canvas = canvas;
        if(this.sprites.ground) {
            this.renderer = new PIXI.autoDetectRenderer(this.sprites.ground.width, this.sprites.ground.height, {view: canvas});
        }
        else {
            this.renderer = new PIXI.autoDetectRenderer(800, 600, {view: canvas});
        }
        this.renderer.plugins.interaction.destroy()

    }

    canvasHandler.prototype.draw = function draw() {

        // Render only if everything is loaded
        if (this.renderer && this.stage) {
            this.renderer.render(this.stage);
        }

    }

    canvasHandler.prototype.drawGround = function drawGround() {

        var halfSquareSize = this.squareSize * 0.5;

        var resX = this.state.res.x * 2 + 2,
            resY = this.state.res.y * 2 + 2,
            canvasHeight = this.canvasWidth * (this.state.res.y + 1) / (this.state.res.x + 1);

        this.stage.removeChild(this.sprites.ground);

        var halfTileResolution = tileResolution * 0.5;
        function drawAutotilePart(context, source, autotile, tile, coordinates, autotileX, autotileY) {
            var top = (autotile.y * 6 + tile.y) * halfTileResolution,
                left = (autotile.x * 4 + tile.x) * halfTileResolution;

            context.drawImage(source, left, top, halfTileResolution, halfTileResolution, coordinates.x * autotileX, coordinates.y * autotileY, autotileX, autotileY);
        }
        var groundCanvas = document.createElement('canvas');
        groundCanvas.width = this.canvasWidth;
        groundCanvas.height = canvasHeight;
        var context = groundCanvas.getContext('2d');


        // Draw the ground
        var nbTilesX = Math.ceil(this.canvasWidth / 32),
            nbTilesY = Math.ceil(canvasHeight / 32),
            nbAutoTilesX = nbTilesX * 2,
            nbAutoTilesY = nbTilesY * 2,
            autotileX = this.canvasWidth / nbAutoTilesX,
            autotileY = canvasHeight / nbAutoTilesY
            tile = {x: 0, y:0};
        for (var x = 0; x < nbAutoTilesX; ++x) {

            tile.x = (0 === x) ? 0 : (nbAutoTilesX - 1 === x) ? 3 : 1 + x % 2;
            for (var y = 0; y < nbAutoTilesY; ++y) {

                tile.y = (0 === y) ? 2 : (nbAutoTilesY - 1 === y) ? 5 : 3 + y % 2;
                drawAutotilePart(context, textures.grounds.baseTexture.source, { x: 5, y: 3 }, { x: tile.x, y:tile.y }, { x: x, y: y }, autotileX, autotileY);

            }

        }

        // Add sand
        context.globalAlpha = 0.5;
        var sandRes = this.squareSize * 3;
        if (groundCanvas.width + this.squareSize >= sandRes && groundCanvas.height + this.squareSize >= sandRes) {
            var nb = 12 + Math.round(this.rand() * 12);
            for (var i = 0; i < nb; ++i) {
                var x = (groundCanvas.width - sandRes) * this.rand(),
                    y = (groundCanvas.height - sandRes) * this.rand();
                context.drawImage(textures.sand.baseTexture.source, 0, 0, textures.sand.width, textures.sand.height, x, y, sandRes, sandRes);
            }
        }

        // Draw elements on the ground
        context.globalAlpha = 0.4;
        for (var x = 1; x < resX - 1; ++x) {
            for (var y = 1; y < resY - 1; ++y) {

                if (this.rand() > 0.6) {
                    var posX = x + 0.5 + (this.rand() - 0.5) * 0.3,
                        posY = y + 0.5 + (this.rand() - 0.5) * 0.3;
                    var texture = textures.grass[Math.floor(textures.grass.length * this.rand())];
                    context.drawImage(texture.baseTexture.source, 0, 0, 32, 32, posX * 32 - 16, posY * 32 - 16, 32, 32);
                }

            }
        }

        // Draw the grid
        context.globalAlpha = 0.5;
        context.setLineDash([4, 4]);
        context.beginPath();
        for (var x = 0; x <= this.state.res.x; ++x) {
            var pos = halfSquareSize + x * this.squareSize;
            context.moveTo(pos, halfSquareSize);
            context.lineTo(pos, halfSquareSize + this.state.res.y * this.squareSize);
        }
        for (var y = 0; y <= this.state.res.y; ++y) {
            var pos = halfSquareSize + y * this.squareSize;
            context.moveTo(halfSquareSize, pos);
            context.lineTo(halfSquareSize + this.state.res.x * this.squareSize, pos);
        }
        context.stroke();

        var texture = PIXI.Texture.fromCanvas(groundCanvas);
        var sprite = new PIXI.Sprite(texture);
        this.sprites.ground = sprite;

    }

    canvasHandler.prototype.update = function update(deltaTime) {

        if (this.renderer) {
            // Handle time and update animations (if any)
            this.time += deltaTime;
            TWEEN.update(window.performance.now());
        }

    }

    canvasHandler.prototype.getRobotRotationFrame = function (realRotation) {

        var rotation = (realRotation + 2 * Math.PI) % (2 * Math.PI),
            step = Math.PI / 4;

        var id = 0;

        if (rotation < step) {
            id = 0;
        }
        else if (rotation < 3 * step) {
            id = 1;
        }
        else if (rotation < 5 * step) {
            id = 2;
        }
        else if (rotation < 7 * step) {
            id = 3;
        }
        return id;
    }

    canvasHandler.prototype.setBugRotation = function setBugRotation(realRotation) {

        this.sprites.bug.realRotation = realRotation;
        var rotation = (realRotation + 2 * Math.PI) % (2 * Math.PI),
            step = Math.PI / 4;

        var id = 0;

        if (rotation < step) {
            id = 0;
        }
        else if (rotation < 3 * step) {
            id = 1;
        }
        else if (rotation < 5 * step) {
            id = 2;
        }
        else if (rotation < 7 * step) {
            id = 3;
        }
        this.sprites.bug.rotation = realRotation - 2 * id * step;

        if(id != this.bugSpriteTexture) {
            this.bugSpriteTexture = id;
            this.sprites.bug.texture = textures.bug[id];
        }
    }

    canvasHandler.prototype.addSquare = function addSquare(x, y, square) {

        var sprite = null,
            texture = null,
            alpha = 1,
            scale = 1;

        if (isNaN(square.type)){
            switch(square.type) {
                case 'o':
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
        }
        else if (this.actors) {
            var actor = this.actors[square.type];
            switch(actor.type) {
                case 't':
                    texture = textures.gems[0];
                    break;
                case 'm':
                    var rotation = helper.dirToRotation(actor.dir);
                    texture = textures.launcher[this.getRobotRotationFrame(rotation)];
                    break;
                case 'w':
                    texture = textures.web;
                    break;
                default:
                    break;
            }
        }

        if(texture !== null) {
            sprite = new PIXI.Sprite(texture);
            sprite.scale.set(scale / this.tilesScale, scale / this.tilesScale);
            sprite.anchor.set(0.5, 0.5);
            sprite.alpha = alpha;
            this.stage.addChild(sprite);
            this.moveSquareSprite(sprite, x, y);
        }

        return sprite;

    }

    canvasHandler.prototype.removeSquare = function removeElement(x, y, onComplete) {

        onComplete = helper.getDefault(function() {}, onComplete);

        var index = y * this.state.res.x + x;
        if(index < this.map.length && this.map[index] != null) {
            this.stage.removeChild(this.map[index]);
            this.map[index] = null;
        }
        onComplete();
    }

    canvasHandler.prototype.setState = function setState(state, actors) {

        // Update state
    	var changeSize = true;
    	if(this.state != null && state.res.x == this.state.res.x && state.res.y == this.state.res.y && !this.resolutionChanged) {
    		changeSize = false;
    	}
        this.resolutionChanged = false;
        this.state = state;
        this.actors = actors;
        this.squareSize = this.canvasWidth / (this.state.res.x + 1);
        this.tilesScale = 64 / this.squareSize;

        this.rand = helper.lcg(this.state.res.x * this.state.res.y);

        this.stage = new PIXI.Container();

        // Add special squares on the map
        this.map = [];
        for(var i = 0; i < state.res.y; ++i) {
            for(var j = 0; j < state.res.x; ++j) {

                var square = state.get({x: j, y: i});
                this.map.push(this.addSquare(j, i, square));

            }
        }

        // Draw the ground
        if(changeSize) {
            this.drawGround();
            this.renderer.resize(this.sprites.ground.width, this.sprites.ground.height);
        }
        this.stage.addChildAt(this.sprites.ground, 0);

        // Add the bug
        for (var a = 0; a < actors.length; a++) {
            if (actors[a].type === 'l') {
                state.bug.dir = actors[0].dir;
            }
        }
        this.sprites.bug.scale.set(0.5 / this.tilesScale, 0.5 / this.tilesScale);

        // TODO : use state.bug.dir ?
        var rotation = helper.dirToRotation(state.bug.dir);
        this.setBugRotation(rotation);
        this.stage.addChild(this.sprites.bug);
        this.moveSquareSprite(this.sprites.bug, state.bug.pos.x, state.bug.pos.y);

    }

    canvasHandler.prototype.spriteAnimation = function spriteAnimation(duration, spriteId, posFrom, rotationFrom, posTo, rotationTo, onComplete) {

        onComplete = helper.getDefault(function() {}, onComplete);
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
        sprite.rotation = rotationFrom;
        sprite.scale.set(1 / this.tilesScale, 1 / this.tilesScale);
        this.moveSquareSprite(sprite, posFrom.x, posFrom.y);
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
            easing: TWEEN.Easing.Cubic.Out,
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
                x: ( pos.x + 1 ) * this.squareSize,
                y: ( pos.y + 1 ) * this.squareSize,
                rotation: rotation
            },
            onUpdate: function() {

                bug.x = this.x;
                bug.y = this.y;
                self.setBugRotation(this.rotation);

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