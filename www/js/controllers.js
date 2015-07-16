angular.module('starter.controllers', [])

.controller('GameCtrl', function($scope, $http, Settings) {

	var tabletSize = 4;

	$scope.tablet = [];
	$scope.tommettes = ['left', 'forward', 'right', 'back', 'remove'];
	$scope.tommettesCmd = {'left': 'LE', 'forward': 'FO', 'right': 'RI', 'back': 'BA'};
	$scope.gameImage = 'https://placeholdit.imgix.net/~text?txtsize=23&txt=Chargement...&w=300&h=300';
	$scope.getTommetteUrl = function getTommetteUrl(tommette) {
		return 'img/icons/' + tommette + '.png';
	}

	$scope.clear = function clear() {
		$scope.tablet = [];
	};

	$scope.run = function run() {
		var commands = []
		for(var i = 0; i < $scope.tablet.length; ++i) {
			commands.push($scope.tommettesCmd[$scope.tablet[i].icon]);
		}
		var command = commands.join(' ');
		var url = Settings.host + '/command/' + command + '?callback=JSON_CALLBACK';
		console.log(url);
		$http.jsonp(url)
			.success(function(data) {
				$scope.gameImage = data.image;
			});
	}

	$scope.handleTommette = function handleTommette(icon) {
		if('remove' === icon) {
			$scope.tablet.pop();
		}
		else {
			var id = 0, length = $scope.tablet.length;
			if(length > 0) {
				var prevTommette = $scope.tablet[length-1];
				id = prevTommette.gridster.row * tabletSize + prevTommette.gridster.col + 1;
			}
			if(id < tabletSize * tabletSize) {
				$scope.tablet.push({
					gridster: {
						sizeX: 1,
						sizeY: 1,
						row: Math.floor(id / tabletSize),
						col: id % tabletSize
					}, 
					icon: icon
				});
			}
		}
	};

	$scope.handleTommette('forward');
	$scope.run();

	function orderTommettes() {
		console.log('order');
		$scope.tablet.sort(function(a, b) {
			if(a.gridster.row != b.gridster.row)
				return a.gridster.row - b.gridster.row;
			return a.gridster.col - b.gridster.col;
		});
	}

	$scope.gridsterOpts = {
	    columns: tabletSize,
	    minColumns: tabletSize,
	    minRows: tabletSize,
	    maxRows: tabletSize,
	    pushing: true,
	    floating: false,
	    swapping: true,
	    margins: [5, 5],
	    outerMargin: true,
	    mobileModeEnabled: false,
	    resizable: {
	       enabled: false,
	    },
	    draggable: {
	       enabled: true,
	       stop: function(event, $element, widget) { orderTommettes(); }
	    }
	};
})

.directive('drawing', function(Canvas) {

	function link(scope, element) {

		var canvas = element[0];
		Canvas.ready = function() {

			Canvas.handler.setCanvas(canvas);
			Canvas.game.start();
			var challenge = [
				{ bug: { pos: { x: 0, y: 0 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 1, y: 0 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 2, y: 0 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 2, y: 0 }, rotation: Math.PI } },
				{ bug: { pos: { x: 2, y: 1 }, rotation: Math.PI } },
				{ bug: { pos: { x: 2, y: 2 }, rotation: Math.PI } },
				{ bug: { pos: { x: 2, y: 3 }, rotation: Math.PI } },
				{ bug: { pos: { x: 2, y: 3 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 3, y: 3 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 4, y: 3 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 4, y: 3 }, rotation: Math.PI } },
				{ bug: { pos: { x: 4, y: 3 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 3, y: 3 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 2, y: 3 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 1, y: 3 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 0, y: 3 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 0, y: 3 }, rotation: Math.PI * 2 } },
				{ bug: { pos: { x: 0, y: 2 }, rotation: Math.PI * 2 } },
				{ bug: { pos: { x: 0, y: 1 }, rotation: Math.PI * 2 } },
				{ bug: { pos: { x: 0, y: 0 }, rotation: Math.PI * 2 } },
				{ bug: { pos: { x: 0, y: 0 }, rotation: Math.PI * 1.5 } },
				{ bug: { pos: { x: 0, y: 0 }, rotation: Math.PI * 1 } },
				{ bug: { pos: { x: 0, y: 0 }, rotation: Math.PI * 0.5 } },
				{ bug: { pos: { x: 0, y: 0 }, rotation: 0 } }
			];
			Canvas.game.runChallenge(challenge, function onComplete() {
				Canvas.game.runChallenge(challenge, onComplete);
			});

		};
		Canvas.load();

	}

	return {
		restrict: 'A',
		link: link,
		template: 'Test'
	};
})

.controller('CanvasCtrl', function($scope, Settings) {
  
})

.controller('SettingsCtrl', function($scope, Settings) {
  $scope.settings = Settings;
});
