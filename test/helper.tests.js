'use strict';

var should = require('should'),
    requirejs = require('requirejs'),
    helperPath = './www/js/canvas-game/helper.js';

function testHelper(test) {

    return function(done) {

        requirejs([helperPath], function(Helper) {
            test(done, Helper);
        });

    }

}

function round(x) {

    return Math.round( x * 1e+10 ) / 1e+10;

}

var ROTATION = {
    TOP: round(0),
    RIGHT: round(Math.PI * 0.5),
    BOTTOM: round(Math.PI),
    LEFT: round(-Math.PI * 0.5)
};

describe('helper', function () {
    describe('default', function () {

        it('should return default value', testHelper(function(done, Helper) {

            var unknowVariable;
            var unknowObject = {};
            Helper.getDefault('default1').should.be.equal('default1');
            Helper.getDefault('default2', unknowVariable).should.be.equal('default2');
            Helper.getDefault(42, unknowObject.unknowAttribute).should.be.equal(42);

            done();
            
        }));

        it('should return default values', testHelper(function(done, Helper) {

            var defaults = {
                integer: 42,
                float: 32.5478,
                string: 'default'
            };

            var defaults1 = Helper.getDefaults(defaults, {});
            defaults1.integer.should.be.equal(42);
            defaults1.float.should.be.equal(32.5478);
            defaults1.string.should.be.equal('default');

            var defaults2 = Helper.getDefaults(defaults, {integer: 1, string: 'custom'});
            defaults2.integer.should.be.equal(1);
            defaults2.float.should.be.equal(32.5478);
            defaults2.string.should.be.equal('custom');

            done();
            
        }));

    });

    describe('direction', function () {

        it('should compute rotation from direction right', testHelper(function(done, Helper) {

            round(Helper.dirToRotation({ x: 0, y:-1 })).should.be.equal(ROTATION.TOP);
            round(Helper.dirToRotation({ x: 1, y: 0 })).should.be.equal(ROTATION.RIGHT);
            round(Helper.dirToRotation({ x: 0, y: 1 })).should.be.equal(ROTATION.BOTTOM);
            round(Helper.dirToRotation({ x:-1, y: 0 })).should.be.equal(ROTATION.LEFT);

            done();
            
        }));

        it('should compute direction from rotation right', testHelper(function(done, Helper) {

            round(Helper.rotationToDir(ROTATION.TOP).x).should.be.equal(0);
            round(Helper.rotationToDir(ROTATION.TOP).y).should.be.equal(-1); 

            round(Helper.rotationToDir(ROTATION.RIGHT).x).should.be.equal(1);
            round(Helper.rotationToDir(ROTATION.RIGHT).y).should.be.equal(0);

            round(Helper.rotationToDir(ROTATION.BOTTOM).x).should.be.equal(0);
            round(Helper.rotationToDir(ROTATION.BOTTOM).y).should.be.equal(1); 

            round(Helper.rotationToDir(ROTATION.LEFT).x).should.be.equal(-1);
            round(Helper.rotationToDir(ROTATION.LEFT).y).should.be.equal(0); 

            done();
            
        }));

        it('should retrieve rotation after direction conversion', testHelper(function(done, Helper) {

            var rotation = 0;

            rotation = 0.7;
            round(Helper.dirToRotation(Helper.rotationToDir(rotation))).should.be.equal(rotation);

            rotation = 0.55;
            round(Helper.dirToRotation(Helper.rotationToDir(rotation))).should.be.equal(rotation);

            rotation = 2.3546487976;
            round(Helper.dirToRotation(Helper.rotationToDir(rotation))).should.be.equal(rotation);

            done();
            
        }));

    })
});