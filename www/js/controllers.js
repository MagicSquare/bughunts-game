angular.module('starter.controllers', [])

    .controller('ChallengeCtrl', function($scope, $stateParams, $state, $http, Settings, Canvas, $mdDialog) {

        var tometteId = 0;
        $scope.challenge = $stateParams.challenge;
        var str = location.search;
        $scope.functionOn = str.search("/\?f=1")!=-1;

        $scope.tablet = {
            items: [],
            colSize: 5,
            rowSize: 5
        };
        $scope.tabletFunction = {
            items: [],
            colSize: 5,
            rowSize: 1
        };
        $scope.tomettes = ['left', 'forward', 'right', 'back', 'repeat_2', 'repeat_3', 'repeat_4', 'repeat_5'];
        if ($scope.functionOn){
            $scope.tomettes.push('function');
        }
        $scope.tomettesCmd = {'left': 'LE', 'forward': 'FO', 'right': 'RI', 'back': 'BA'};
        //$scope.gameImage = 'https://placeholdit.imgix.net/~text?txtsize=23&txt=Chargement...&w=300&h=300';
        function getTometteUrl(tomette) {
            return 'img/icons/64/' + tomette + '.png';
        }

        function reset() {
            $scope.tablet.items = [];
            $scope.tabletFunction.items = [];
            initGame();
        }

        function run() {

            function tabletToInstructions(tablet, handleFunction) {

                var index = 0,
                    commands = [];
                for (var i = 0; i < tablet.items.length; ++i) {
                    var tomette = tablet.items[i],
                        instruction = tomette.icon,
                        currentCommand = '',
                        currentIndex = index;
                    if (instruction.indexOf('repeat_') != -1) {
                        var nbOfRepeat = instruction.split('_')[1];
                        if (commands.length > 0) {
                            var previousCommand = commands.pop();
                            index -= previousCommand.command.length + 1;
                            currentIndex = index + 1;
                            currentCommand = '(' + previousCommand.command + ')' + nbOfRepeat;
                            tomette = previousCommand.tomette;
                        }
                    }
                    else if (instruction === 'function') {
                        if (handleFunction) {
                            currentCommand = 'F';
                        }
                    }
                    else {
                        currentCommand = $scope.tomettesCmd[instruction];
                    }
                    if (currentCommand !== '') {
                        commands.push({
                            command: currentCommand,
                            tomette: tomette,
                            index: currentIndex
                        });
                        index += currentCommand.length + 1;
                    }
                }
                return commands;

            }

            var instructions = [],
                instructionsToTomettes = {}
            index = 0;

            // Add function declaration (if any)
            var functionCommands = tabletToInstructions($scope.tabletFunction, false);
            if (functionCommands.length > 0) {
                var commands = [];
                functionCommands.forEach(function(element) {
                    commands.push(element.command);
                    element.index += 2;
                    instructionsToTomettes[element.index] = element;
                });
                var functionString = 'F[' + commands.join(' ') + ']';
                instructions.push(functionString);
                index = functionString.length + 1;
            }

            // Add instructions
            var tabletCommands = tabletToInstructions($scope.tablet, true);
            tabletCommands.forEach(function(element) {
                instructions.push(element.command);
                element.index += index;
                instructionsToTomettes[element.index] = element;
            });
            var command = instructions.join(' ');


            Canvas.game.onNewInstruction = function onNewInstruction(location) {

                var command = instructionsToTomettes[location.column];
                $('.tometteCurrent, .tometteFail').removeClass('tometteCurrent').removeClass('tometteFail');
                if(typeof command !== 'undefined') {
                    $('#' + command.tomette.id).addClass('tometteCurrent');
                }

            };

            // Try the challenge with the web service
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
                            if(!data.win) {
                                $('.tometteCurrent').removeClass('tometteCurrent').addClass('tometteFail');
                            }
                            $scope.showScoreDialog();
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

        $scope.showScoreDialog = function(){
            $mdDialog.show({
                controller : showScoreDialogController,
                locals : {
                    result : $scope.result
                },
                templateUrl : 'templates/dialog-score.html'
            });
        };

        function showScoreDialogController($scope, $mdDialog, result){
            $scope.result = result;
            $scope.user = {};
            $scope.newHighscore = false;
            $scope.highscore;
            $scope.highscoreOwner;

            $http.jsonp(Settings.host + '/highscores/'+$scope.result.challenge.substr(1)+ '?callback=JSON_CALLBACK')
                .success(function(data) {
                    if (!data.error){
                        $scope.highscore = data[0].score;
                        $scope.highscoreOwner = data[0].name;
                        if (parseInt($scope.highscore) > parseInt($scope.result.score)){
                            $scope.newHighscore = true;
                        }
                    }else if ($scope.result.win && data.type == 1){
                        $scope.newHighscore = true;
                    }
                })
                .error(function(data, status) {
                    console.log('Loading command result: Error ' + status);
                });

            $scope.retryChallenge = function(){
                $mdDialog.hide();
            }

            $scope.nextChallenge = function(){
                $mdDialog.hide();
                var nextChallenge = $scope.result.challenge;
                nextChallenge = nextChallenge.substr(1);//remove #
                nextChallenge = addIntToHexa(1, nextChallenge);
                nextChallenge = '0x'+nextChallenge;
                $state.go("tab.challenge", {challenge : nextChallenge});
            };

            $scope.recordHighScore = function(){
                $http({
                    method: 'jsonp',
                    url: Settings.host + '/challenge/'+$scope.result.challenge.substr(1)+'/newHighScore/' + $scope.user.name + '?callback=JSON_CALLBACK',
                    params: { token: $scope.result.token }
                })
                    .success(function(data, status , header, config) {
                        $scope.highscore = $scope.result.score;
                        $scope.highscoreOwner =  $scope.user.name;
                        $scope.newHighscore = false;
                    })
                    .error(function(data, status , header, config) {
                        console.log('record highscore result: Error ' + status);
                    });
            }
        };

        function addIntToHexa(i, hexaNumber){
            var result = (parseInt(hexaNumber, 16) + i).toString(16);
            while (result.length < 4){
                result = '0' + result; // 0 padding
            }
            return result;
        }

        function shareScore(){

            FB.ui({
                method: 'share_open_graph',
                action_type: 'games.celebrate',
                action_properties: JSON.stringify({
                    victory:Settings.host + '/victory/'+encodeURIComponent($scope.result.challenge)+'/'+$scope.result.command.split(' ').join(',')+'/'
                })
            }, function(response) {});

        };

        function deleteMainTabletLast() {

            $scope.tablet.items.pop();

        }


        function deleteFuncTabletLast() {

            $scope.tabletFunction.items.pop();
        }

        function handleTomette(tablet, icon) {

            var id = 0,
                length = tablet.items.length;
            if (length > 0) {
                var prevtomette = tablet.items[length - 1];
                id = prevtomette.gridster.row * tablet.colSize + prevtomette.gridster.col + 1;
            }
            if (id < tablet.colSize * tablet.rowSize) {
                tablet.items.push({
                    gridster: {
                        sizeX: 1,
                        sizeY: 1,
                        row: Math.floor(id / tablet.rowSize),
                        col: id % tablet.colSize
                    },
                    icon: icon,
                    id: 'tomette-' + tometteId++
                });
            }

        }

        function addTometteToInstructions(icon) {

            handleTomette($scope.tablet, icon);

        }

        function addTometteToFunction(icon, functionOn) {
            if (functionOn){
                handleTomette($scope.tabletFunction, icon);
            }
        }

        function ordertomettes(tablet) {

            tablet.items.sort(function(a, b) {
                if (a.gridster.row != b.gridster.row) {
                    return a.gridster.row - b.gridster.row;
                }
                return a.gridster.col - b.gridster.col;
            });

        }

        function askReset() {

            $mdDialog.show($mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title('Remise à zéro')
                    .content('Voulez-vous supprimer toutes vos instructions?')
                    .ariaLabel('Remise à zéro')
                    .ok('Oui')
                    .cancel('Non')
                ).then(function() {
                    reset();
                }, function() {});

        }

        var gridsterBaseOpts = {
            columns: $scope.tablet.colSize,
            minColumns: $scope.tablet.colSize,
            minRows: $scope.tablet.rowSize,
            maxRows: $scope.tablet.rowSize,
            pushing: true,
            floating: false,
            swapping: true,
            margins: [5, 5],
            outerMargin: true,
            mobileModeEnabled: false,
            resizable: {
                enabled: false
            }
        };
        $scope.gridsterOpts = gridsterBaseOpts;

        Canvas.ready = initGame;
        function initGame() {
            Canvas.handler.setResolution(Settings.canvasResolution);
            var url = Settings.host + '/challenge/' + $scope.challenge + '?callback=JSON_CALLBACK';
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

            function setOptsFromTablet(opts, tablet) {
                opts.columns = tablet.colSize;
                opts.minColumns = tablet.colSize;
                opts.minRows = tablet.rowSize;
                opts.maxRows = tablet.rowSize;
                opts.draggable = { enable: true, stop: function stop(event, $element, widget) { ordertomettes(tablet); } };
                return opts;
            }

            $scope.gridsterOpts = setOptsFromTablet(Canvas.helper.cloneObject(gridsterBaseOpts), $scope.tablet);
            $scope.gridsterOptsFunction = setOptsFromTablet(Canvas.helper.cloneObject(gridsterBaseOpts), $scope.tabletFunction);

        }

        $scope.addTometteToInstructions = addTometteToInstructions;
        $scope.addTometteToFunction = addTometteToFunction;
        $scope.getTometteUrl = getTometteUrl;
        $scope.askReset = askReset;
        $scope.run = run;
        $scope.shareScore = shareScore;
        $scope.deleteMainTabletLast = deleteMainTabletLast;
        $scope.deleteFuncTabletLast = deleteFuncTabletLast;
    })

    .controller('SettingsCtrl', function($scope, Settings, Canvas) {
        $scope.settings = Settings;
        $scope.resolutions = [300, 450, 600, 750, 900];

        $scope.updateCanvasResolution = function updateCanvasResolution() {
            if (Canvas.isReady) {
                Canvas.handler.setResolution(Settings.canvasResolution);
            }
        }
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