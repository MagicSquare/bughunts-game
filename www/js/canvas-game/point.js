define(function(require) {

  function Point(x, y) {

    this.x = (typeof x === 'undefined') ? 0 : x;
    this.y = (typeof y === 'undefined') ? 0 : y;
    
  }

  Point.prototype.clone = function clone() {

    return new Point(this.x, this.y);
    
  };

  function generateOperator(operator, newObject) {

    newObject = (typeof newObject === 'undefined') ? false : newObject;
    
    if (newObject) {
      
      return function funcOperatorNew(x, y) {
      
        // Handle x,y or point
        var point = (typeof y !== 'undefined')? {x: x, y: y} : (!isNaN(x))? {x: x, y: x} : x;
        return new Point(operator(this.x, point.x), operator(this.y, point.y));
        
      };
      
    }
    else {
    
      return function funcOperator(x, y) {
      
        // Handle x,y or point
        var point = (typeof y !== 'undefined')? {x: x, y: y} : (!isNaN(x))? {x: x, y: x} : x;
        this.x = operator(this.x, point.x);
        this.y = operator(this.y, point.y);
        return this;
        
      };
      
    }
    
  }

  function add(a, b) { return a + b; }
  function sub(a, b) { return a - b; }
  function mul(a, b) { return a * b; }
  function div(a, b) { return a / b; }
  function mod(a, b) { return a % b; }

  // Update the point with operators
  Point.prototype.add = generateOperator(add);
  Point.prototype.sub = generateOperator(sub);
  Point.prototype.mul = generateOperator(mul);
  Point.prototype.div = generateOperator(div);
  Point.prototype.mod = generateOperator(mod);

  // Return a new object
  Point.prototype.addN = generateOperator(add, true);
  Point.prototype.subN = generateOperator(sub, true);
  Point.prototype.mulN = generateOperator(mul, true);
  Point.prototype.divN = generateOperator(div, true);
  Point.prototype.modN = generateOperator(mod, true);

  Point.prototype.set = function set(x, y) {

    if (typeof y === 'undefined') {
      this.x = x.x;
      this.y = x.y;
    }
    else {
      this.x = x;
      this.y = y;
    }
    return this;

  };

  Point.prototype.invert = function invert() {

    var x = this.x ;
    this.x = this.y;
    this.y = x;
    return this;
    
  };

  Point.prototype.invertN = function invert() {

    return new Point(this.y, this.x);
    
  };

  Point.prototype.rotate = function rotate(angle) {

    var cosA = Math.cos(angle),
        sinA = Math.sin(angle),
        x = this.x,
        y = this.y;
    this.x = x * cosA - y * sinA;
    this.y = y * cosA + x * sinA;
    return this;
    
  };

  Point.prototype.rotateN = function rotate(angle) {

    return this.clone().rotate(angle);
    
  };

  Point.prototype.normalize = function normalize() {

    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    return this.div(length);
    
  };

  Point.prototype.normalizeN = function normalize() {

    return this.clone().normalize();
    
  };

  return Point;
  
});