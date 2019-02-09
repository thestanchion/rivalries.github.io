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
            lost: 0,
            drawn: 0,
            points: 0,
            gf: 0,
            ga: 0,
            gd: 0
        },
        p2: {
            won: 0,
            lost: 0,
            drawn: 0,
            points: 0,
            gf: 0,
            ga: 0,
            gd: 0
        },
        p1Score: 0,
        p2Score: 0
    },
    methods: {
        getData: function() {
            const _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function(snapshot) {
               _this.rivalries = snapshot.val();
               console.log( _this.rivalries );
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
         viewRivalry: function( rivalry, index ) {
            const _this = this;

            _this.selectedRivalry = rivalry;
            this.$set( _this.selectedRivalry, 'results', rivalry.results);


            _this.fbIndex = index;
            _this.p1 = _this.buildStats( 'player1' );
            _this.p2 = _this.buildStats( 'player2' );

            setTimeout( function() {
                _this.bakePie();
            });
         },
         buildStats: function( player ) {
            const _this = this;

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
            const winsCtx = document.getElementById('winsPie').getContext('2d');
            const goalsCtx = document.getElementById('goalsPie').getContext('2d');

            const winsChart = new Chart(winsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [_this.p1.won, _this.p2.won, _this.p1.drawn],
                        backgroundColor :["rgb(255, 99, 132)","rgb(54, 162, 235)","rgb(255, 205, 86)"]
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
                        backgroundColor :["rgb(255, 99, 132)","rgb(54, 162, 235)"]
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
                date: 1249211400000,
                player1: parseInt(_this.p1Score),
                player2: parseInt(_this.p2Score)
            });
            _this.getNewData();
        }
    },
    created: function() {
        this.getData();
    }
});
