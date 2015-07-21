angular.module('starter.controllers', [])

.controller('GameCtrl', function($scope, $http, Settings) {

	var tabletSize = 4;

	$scope.tablet = [];
	$scope.tommettes = ['left', 'forward', 'right', 'back', 'remove'];
	$scope.tommettesCmd = {'left': 'LE', 'forward': 'FO', 'right': 'RI', 'back': 'BA'};
	$scope.gameImage = 'https://placeholdit.imgix.net/~text?txtsize=23&txt=Chargement...&w=300&h=300';
	$scope.getTommetteUrl = function getTommetteUrl(tommette) {
		return 'img/icons/' + tommette + '.png';
	};

	$scope.clear = function clear() {
		$scope.tablet = [];
	};

	$scope.run = function run() {
		var commands = [];
		for(var i = 0; i < $scope.tablet.length; ++i) {
			commands.push($scope.tommettesCmd[$scope.tablet[i].icon]);
		}
		var command = commands.join(' ');
		var url = Settings.host + '/command/' + command + '?callback=JSON_CALLBACK';
		console.log(url);
		$http.jsonp(url)
			.success(function(data) {
				$scope.gameImage = data.image;
                $scope.result = data;
			});
	};

    $scope.shareScore = function(){
        FB.ui({
            method: 'share_open_graph',
            action_type: 'games.celebrate',
            action_properties: JSON.stringify({
                victory:Settings.host + '/victory/'+encodeURIComponent($scope.result.challenge)+'/'+$scope.result.command.split(' ').join(',')+'/'
            })
        }, function(response){});
    };

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
	       enabled: false
	    },
	    draggable: {
	       enabled: true,
	       stop: function(event, $element, widget) { orderTommettes(); }
	    }
	};
})

.controller('CanvasCtrl', function($scope, Settings) {
  
})

.controller('SettingsCtrl', function($scope, Settings) {
  $scope.settings = Settings;
})

.directive('bughunts', function(Canvas) {

	function link(scope, element) {

		var canvas = element[0];
		Canvas.ready = function() {

			var state = Canvas.game.initialState;
			var stones = [
				{x: 1, y: 1},
				{x: 4, y: 0},
				{x: 5, y: 0},
				{x: 6, y: 0},
				{x: 2, y: 3},
				{x: 2, y: 4},
				{x: 5, y: 5},
				{x: 10, y: 5}
			];
			for(var i = 0; i < stones.length; ++i) {
				state.set(stones[i], {type: 's'});
			}
			Canvas.game.setState(state.clone());

			Canvas.handler.setCanvas(canvas);
			Canvas.game.start();
			var challenge = [
				[{ type: 'bug', bug: { pos: { x: 0, y: 0 }, rotation: 'R' } }],
				[
					{ type: 'bug', bug: { pos: { x: 1, y: 0 }, rotation: 'R' } },
					{ type: 'object', name: 'bottlecap', posFrom: { x: 0, y: 0 }, rotationFrom: 0, posTo: { x: 6, y: 0 }, rotationTo: 0, duration: 2.5 }
				],
				[
					{ type: 'bug', bug: { pos: { x: 2, y: 0 }, rotation: 'R' } },
					{ type: 'del', pos: { x: 4, y: 0 } },
					{ type: 'del', pos: { x: 5, y: 0 } },
					{ type: 'del', pos: { x: 6, y: 0 } }
				],
				[{ type: 'bug', bug: { pos: { x: 2, y: 0 }, rotation: 'D' } }],
				[
					{ type: 'bug', bug: { pos: { x: 2, y: 1 }, rotation: 'D' } },
					{ type: 'object', name: 'axe', posFrom: { x: 2, y: 0 }, rotationFrom: 0, posTo: { x: 2, y: 3 }, rotationTo: 0, duration: 2.5 }
				],
				[
					{ type: 'bug', bug: { pos: { x: 2, y: 2 }, rotation: 'D' } },
					{ type: 'object', name: 'axe', posFrom: { x: 2, y: 1 }, rotationFrom: 0, posTo: { x: 2, y: 4 }, rotationTo: 0, duration: 2.5 },
					{ type: 'del', pos: { x: 2, y: 3 } }
				],
				[
					{ type: 'bug', bug: { pos: { x: 2, y: 3 }, rotation: 'D' } },
					{ type: 'del', pos: { x: 2, y: 4 } }
				],
				[{ type: 'bug', bug: { pos: { x: 2, y: 3 }, rotation: 'R' } }],
				[{ type: 'bug', bug: { pos: { x: 3, y: 3 }, rotation: 'R' } }],
				[{ type: 'bug', bug: { pos: { x: 4, y: 3 }, rotation: 'R' } }],
				[{ type: 'bug', bug: { pos: { x: 4, y: 3 }, rotation: 'D' } }],
				[{ type: 'bug', bug: { pos: { x: 4, y: 3 }, rotation: 'L' } }],
				[{ type: 'bug', bug: { pos: { x: 3, y: 3 }, rotation: 'L' } }],
				[{ type: 'bug', bug: { pos: { x: 2, y: 3 }, rotation: 'L' } }],
				[{ type: 'bug', bug: { pos: { x: 1, y: 3 }, rotation: 'L' } }],
				[{ type: 'bug', bug: { pos: { x: 0, y: 3 }, rotation: 'L' } }],
				[{ type: 'bug', bug: { pos: { x: 0, y: 3 }, rotation: 'U' } }],
				[{ type: 'bug', bug: { pos: { x: 0, y: 2 }, rotation: 'U' } }],
				[{ type: 'bug', bug: { pos: { x: 0, y: 1 }, rotation: 'U' } }],
				[{ type: 'bug', bug: { pos: { x: 0, y: 0 }, rotation: 'U' } }]
			];
			Canvas.game.runChallenge(challenge, function onComplete() {
				Canvas.game.setState(state.clone());
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
});
