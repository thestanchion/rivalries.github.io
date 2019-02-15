// Initialize Firebase
var fbConfig = {
    aapiKey: "AIzaSyDNfVVXIXtXtatTRoU4A-05NMNnj_ZodJQ",
    authDomain: "rivalries-9afcb.firebaseapp.com",
    databaseURL: "https://rivalries-9afcb.firebaseio.com",
    projectId: "rivalries-9afcb",
    storageBucket: "rivalries-9afcb.appspot.com",
    messagingSenderId: "576287936202"
 };
 firebase.initializeApp(fbConfig);

const app = new Vue({
    el: "#app",
    data: {
        firebase: firebase.database(),
        rivalries: [],
        selectedRivalry: {},
        fbIndex: 0,
        p1: {
            won: 0,
            drawn: 0,
            gf: 0,
        },
        p2: {
            won: 0,
            gf: 0,
        },
        p1Score: 0,
        p2Score: 0,
        newP1: '',
        newP2: '',
        vsPos: 0
    },
    methods: {
        getData: function() {
            const _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function(snapshot) {
               _this.rivalries = snapshot.val();
               _this.viewRivalry( _this.rivalries[ _this.fbIndex ], _this.fbIndex );
            });
         },
         getNewData: function() {
            const _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function(snapshot) {
                _this.rivalries = snapshot.val();

                setTimeout( function() {
                    _this.viewRivalry( _this.rivalries[ _this.fbIndex ], _this.fbIndex );
                    _this.p1Score = 0;
                    _this.p2Score = 0;
                });
            });
        },
        getStyle: function( player ) {
            const _this = this;
            let thisPlayer = _this[player];
            let width = thisPlayer.won / ( _this.p1.won + _this.p2.won ) * 100;

            if ( player === 'p1' ) {
                _this.vsPos = `left: ${ width }%;`;
            }

            return `width: ${ width }%;`;
        },
         addRivalry( event ) {
            const _this = this;
            event.preventDefault();

            _this.firebase.ref('/rivalries/').push({
                results: {},
                player1: _this.newP1,
                player2: _this.newP2
            });

            _this.newP1 = '';
            _this.newP2 = '';
         },
         viewRivalry: function( rivalry, index ) {
            const _this = this;

            _this.selectedRivalry = rivalry;
            this.$set( _this.selectedRivalry, 'results', rivalry.results);


            _this.fbIndex = index;
            _this.p1 = _this.buildStats( 'player1' );
            _this.p2 = _this.buildStats( 'player2' );
            _this.getStreak();

            setTimeout( function() {
                _this.bakePie();
            });
         },
         getEmoji: function( player ) {
            const _this = this;
            let name = player.toLowerCase();

            return `./img/${ name }.png`;
         },
         buildStats: function( player ) {
            const _this = this;
            let thisPlayer = _this[player];

            let gf = _this.getGoalsFor( player );

            return {
                won: _this.getWins( player ),
                drawn: _this.getDraws( player ),
                goals: gf
            };
         },
         gamesPlayed: function() {
            const _this = this;

            return Object.keys( _this.selectedRivalry.results ).length;
         },
         goalsPerGame: function( player ) {
             const _this = this;
             let gf = _this.getGoalsFor( player );
             let goalsPerGameNum = gf / Object.keys( _this.selectedRivalry.results ).length;

             return Math.round(goalsPerGameNum * 100) / 100;;
         },
         biggestWin: function( player ) {
             const _this = this;
             let i,
                playerScoreDiff = 0,
                playerGoals = 0,
                playerBiggestResult,
                returnString;

             for ( i in _this.selectedRivalry.results ) {
                 let result = _this.selectedRivalry.results[i];

                 if( player === 'player1' ) {
                     if ( result.player1 > result.player2 ) {
                         var tempScoreDiff = result.player1 - result.player2;
                         var tempPlayerGoals = result.player1;
                     }
                 } else if( player === 'player2' ) {
                     if ( result.player2 > result.player1 ) {
                         var tempScoreDiff = result.player2 - result.player1;
                         var tempPlayerGoals = result.player2;
                     }
                 }

                  if( tempScoreDiff > playerScoreDiff ) {
                      playerBiggestResult = result;
                      playerScoreDiff = tempScoreDiff;
                      playerGoals = tempPlayerGoals;
                  } else if ( tempScoreDiff === playerScoreDiff ) {
                      if( tempPlayerGoals > playerGoals ) {
                          playerBiggestResult = result;
                          playerScoreDiff = tempScoreDiff;
                          playerGoals = tempPlayerGoals;
                      }
                  }
             }

             returnString = player === 'player1' ? `${playerBiggestResult.player1} - ${playerBiggestResult.player2}` : `${playerBiggestResult.player1} - ${playerBiggestResult.player2}`

             return returnString;
         },
         getWins: function( player ) {
             const _this = this;
             let count = 0;
             let i;

            for ( i in _this.selectedRivalry.results ) {
                 let result = _this.selectedRivalry.results[i];

                 if ( player === 'player1' ) {
                    if ( result.player1 > result.player2 ) {
                        count ++;
                    }
                 } else if ( player === 'player2' ) {
                    if ( result.player2 > result.player1 ) {
                        count ++;
                    }
                 }
             }
             return count;
         },
        getDraws: function( player ) {
            const _this = this;
            let count = 0;
            let i;

            for ( i in _this.selectedRivalry.results ) {
                let result = _this.selectedRivalry.results[i];

                if ( result.player1 === result.player2 ) {
                    count ++;
                }
            }
            return count;
        },
        getGoalsFor: function( player ) {
            const _this = this;
            let total = 0;
            let i;

            for ( i in _this.selectedRivalry.results ) {
                let result = _this.selectedRivalry.results[i];

                if ( player === 'player1' ) {
                    total += result.player1;
                } else if ( player === 'player2' ) {
                    total += result.player2;
                }
            }
            return total;
        },
        fixtureDate: function( date ) {
            return moment(date).format(' Do MMMM YYYY');
        },
        bakePie: function() {
            const _this = this;

            if ( !_this.selectedRivalry.results ) {
                return;
            }

            const winsCtx = document.getElementById('winsPie').getContext('2d');
            const goalsCtx = document.getElementById('goalsPie').getContext('2d');

            const winsChart = new Chart(winsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [_this.p1.won, _this.p2.won, _this.p1.drawn],
                        backgroundColor :["rgb(218, 41, 28)","rgb(0,91,158)","rgb(255, 205, 86)"]
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                        _this.selectedRivalry.player1,
                        _this.selectedRivalry.player2,
                        'Draws'
                    ]
                },
                options: {
                    responsive: true,
                    responsiveAnimationDuration: 0,
                    maintainAspectRatio: true,
                    cutoutPercentage: 65
                }
            });

            const goalsChart = new Chart(goalsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [_this.p1.goals, _this.p2.goals],
                        backgroundColor :["rgb(218, 41, 28)","rgb(0,91,158)"]
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                        _this.selectedRivalry.player1,
                        _this.selectedRivalry.player2,
                    ]
                },
                options: {
                    responsive: true,
                    responsiveAnimationDuration: 0,
                    maintainAspectRatio: true,
                    cutoutPercentage: 65
                }
            });
        },
        addResult: function(event) {
            const _this = this;
            event.preventDefault();

            _this.firebase.ref('/rivalries/' + _this.fbIndex + '/results').push({
                date: moment().valueOf(),
                player1: parseInt(_this.p1Score),
                player2: parseInt(_this.p2Score)
            });
            _this.getNewData();
        },
        deleteResult: function( event, index ) {
            const _this = this;
            event.preventDefault();

            let key = Object.keys(_this.selectedRivalry.results, index);

            let matchRef = _this.firebase.ref('/rivalries/' + _this.fbIndex + '/results/' + key);

            matchRef.remove();
            _this.getNewData();
        },
        orderedResults: function( results ) {
            let arr = _.orderBy( results, 'date', 'desc' );
            return arr;
        },
        getHighStreak:function() {
            const _this = this;

            let i,
                streakholder = '',
                p1Count = 0,
                p2Count = 0,
                longest = 0;

            for ( i in _this.selectedRivalry.results ) {
                let result = _this.selectedRivalry.results[i];

                if ( result.player1 > result.player2 ) {
                    streakholder = _this.selectedRivalry.player1;
                    p2Count =  0;
                    p1Count++;
                } else if ( result.player2 > result.player1 ) {
                    streakholder = _this.selectedRivalry.player1;
                    p1Count =  0;
                    p2Count++;
                }

                if ( p1Count > longest ) {
                    longest = p1Count;
                } else if ( p2Count > longest ) {
                    longest = p2Count;
                }
            }
            console.log({p1Count, p2Count});
            return `Longest streak: ${ streakholder } - ${ longest } games`;
        },
        getStreak:function() {
            const _this = this;

            let i,
                streakholder = '',
                p1Count = 0,
                p2Count = 0;

            let reversedResults = _.orderBy( _this.selectedRivalry.results, 'date', 'desc' );

            for ( i in reversedResults ) {
                let result = reversedResults[i];

                if ( result.player1 > result.player2 ) {
                    if ( p2Count > 0 ) {
                        return `Current streak: ${ streakholder } - ${ p2Count } games`;
                    }

                    streakholder = _this.selectedRivalry.player1;
                    p1Count++;
                } else if ( result.player2 > result.player1 ) {
                    if ( p1Count > 0 ) {
                        return `Current streak: ${streakholder} - ${p1Count} games`;
                    }

                    streakholder = _this.selectedRivalry.player2;
                    p2Count++;
                }
            }
        }
    },
    created: function() {
        this.getData();
    }
});
