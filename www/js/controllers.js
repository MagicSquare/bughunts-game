angular.module('starter.controllers', [])

    .controller('ChallengeCtrl', function($scope, $stateParams, $state, $http, Settings, Canvas) {

        var tabletSize = 5;
        $scope.challenge = $stateParams.challenge;

        $scope.tablet = [];
        $scope.tomettes = ['left', 'forward', 'right', 'back', 'repeat_2', 'repeat_3', 'repeat_4', 'repeat_5', 'remove'];
        $scope.tomettesCmd = {'left': 'LE', 'forward': 'FO', 'right': 'RI', 'back': 'BA'};
        //$scope.gameImage = 'https://placeholdit.imgix.net/~text?txtsize=23&txt=Chargement...&w=300&h=300';
        $scope.getTometteUrl = function getTometteUrl(tomette) {
            return 'img/icons/' + tomette + '.png';
        };

        $scope.clear = function clear() {
            $scope.tablet = [];
        };

        $scope.run = function run() {
            var commands = [];
            for(var i = 0; i < $scope.tablet.length; ++i) {
                var instruction = $scope.tablet[i].icon;
                var currentCommand = '';
                if (instruction.indexOf('repeat_') != -1) {
                    var nbOfRepeat = instruction.split('_')[1];
                    var previousCommand = commands.pop();
                    if (previousCommand === undefined) {
                        console.log('Error: repeat is misused');
                    } else {
                        currentCommand = '(' + previousCommand + ')' + nbOfRepeat;
                    }
                } else {
                    currentCommand = $scope.tomettesCmd[instruction];
                }
                commands.push(currentCommand);
            }
            var command = commands.join(' ');
            var url = Settings.host + '/challenge/'+$scope.challenge+'/command/' + command + '?callback=JSON_CALLBACK';
            $http.jsonp(url)
                .success(function(data) {
                    if (data.error){
                        console.log(data.error);
                        return;
                    }
                    if(Canvas.isReady) {
                        Canvas.game.parseChallengeTry(data, function() {
                            $scope.result = data;
                            $scope.$apply();
                        });
                    }
                    else {
                        $scope.result = data;
                    }
                })
                .error(function(data, status) {
                    console.log('Loading command result: Error ' + status);
                });
        };

        $scope.shareScore = function shareScore(){
            FB.ui({
                method: 'share_open_graph',
                action_type: 'games.celebrate',
                action_properties: JSON.stringify({
                    victory:Settings.host + '/victory/'+encodeURIComponent($scope.result.challenge)+'/'+$scope.result.command.split(' ').join(',')+'/'
                })
            }, function(response){});
        };

        $scope.handleTomette = function handleTomette(icon) {
            if('remove' === icon) {
                $scope.tablet.pop();
            }
            else {
                var id = 0, length = $scope.tablet.length;
                if(length > 0) {
                    var prevTomette = $scope.tablet[length-1];
                    id = prevTomette.gridster.row * tabletSize + prevTomette.gridster.col + 1;
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

        Canvas.ready = function() {

            var url = Settings.host + '/challenge/'+$scope.challenge+ '?callback=JSON_CALLBACK';
            $http.jsonp(url)
                .success(function(data) {
                    if (data.error){
                        console.log(data.error);
                        return;
                    }
                    Canvas.game.initChallenge(data);
                })
                .error(function(data, status) {
                    console.log('Loading command result: Error ' + status);
                });

        }

        function orderTomettes() {

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
                stop: orderTomettes
            }
        };
    })

    .controller('SettingsCtrl', function($scope, Settings) {
        $scope.settings = Settings;
    })

    .controller('EditorCtrl', function($scope, LevelEditor) {

        $scope.challenge = {
            res : { x: 10, y: 6 },
            map : []
        };

        $scope.onStateChanged = function onStateChanged() {};

        $scope.getNumber = function getNumber(num) {
            var array = [];
            for(var i = 0; i < num; ++i)
                array.push(i);
            return array;
        };

        $scope.onResChanged = function onResChanged() {
            map = $scope.challenge.map;

            map = map.length > $scope.challenge.res.y ? map.slice(0, $scope.challenge.res.y) : map;
            for(var i = 0; i < $scope.challenge.res.y; ++i) {
                var line = [];
                if(map.length <= i ) {
                    map.push(line);
                }
                else {
                    line = map[i];
                }
                line = line.length > $scope.challenge.res.y ? line.slice(0, $scope.challenge.res.x) : line;
                for(var j = line.length; j < $scope.challenge.res.x; ++j) {
                    if(line.length < j + 1) {
                        line.push('o');
                    }
                }
                map[i] = line;
            }
            $scope.challenge.map = map;
            $scope.onStateChanged();
        };
        $scope.onResChanged();

        LevelEditor.ready = function() {

            $scope.onStateChanged = function onStateChanged() {
                LevelEditor.game.parseChallengeTry($scope.challenge);
            };
            $scope.onStateChanged();

        }

    })

    .directive('bughunts', function(Canvas) {

        function link(scope, element) {

            Canvas.domCanvas = element[0];
            Canvas.load();

        }

        return {
            restrict: 'A',
            link: link
        };
    })

    .directive('bughuntseditor', function(LevelEditor) {

        function link(scope, element) {

            LevelEditor.domCanvas = element[0];
            LevelEditor.load();

        }

        return {
            restrict: 'A',
            link: link
        };
    });
