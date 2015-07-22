define(function(require) {

	function getDefault(defaultValue, value) {
		
		if(typeof value === 'undefined')
			return defaultValue;
		return value;

	}

	function getDefaults(defaultValues, values) {

		for(var i in defaultValues) {
			values[i] = getDefault(defaultValues[i], values[i]);
		}
		return values;

	}

	function extractTextureFromCanvas(source, x, y, width, height) {

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext('2d');

		context.drawImage(source, x, y, width, height, 0, 0, width, height);
		return PIXI.Texture.fromCanvas(canvas);
		
	}

	function lcg(seed) {

		// https://bocoup.com/weblog/random-numbers/
		var m = 0x80000000,
		// a - 1 should be divisible by m's prime factors
		a = 1103515245,
		// c and m should be co-prime
		c = 12345;

		// Setting the seed
		var z = seed;

		return function rand() {
			// define the recurrence relationship
			z = (a * z + c) % m;
			return z / m;
		};

	}

	function stringToRotation(string) {

		switch(string) {
			case 'U':
			case 'UP':
				return 0;
				break;
			case 'L':
			case 'LEFT':
				return -Math.PI * 0.5;
				break;
			case 'R':
			case 'RIGHT':
				return Math.PI * 0.5;
				break;
			case 'D':
			case 'DOWN':
				return Math.PI;
				break;
		}
		return 0;

	}

	function dirToRotation(direction) {

		return Math.atan2( direction.x, -direction.y );

	}

	function rotationToDir(rotation) {

		return { 
			x: Math.sin(rotation), 
			y: -Math.cos(rotation) 
		};
		
	}

	return {
		getDefault: getDefault,
		getDefaults: getDefaults,
		extractTextureFromCanvas: extractTextureFromCanvas,
		lcg: lcg,
		stringToRotation: stringToRotation,
		dirToRotation: dirToRotation,
		rotationToDir: rotationToDir
	}
  
});