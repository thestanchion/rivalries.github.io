"use strict";

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

var app = new Vue({
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
        p2Score: 0,
        newP1: '',
        newP2: ''
    },
    methods: {
        getData: function getData() {
            var _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function (snapshot) {
                _this.rivalries = snapshot.val();
                console.log(_this.rivalries);
            });
        },
        getNewData: function getNewData() {
            var _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function (snapshot) {
                _this.rivalries = snapshot.val();

                setTimeout(function () {
                    _this.viewRivalry(_this.rivalries[_this.fbIndex], _this.fbIndex);
                    _this.p1Score = 0;
                    _this.p2Score = 0;
                });
            });
        },
        addRivalry: function addRivalry(event) {
            var _this = this;
            event.preventDefault();

            _this.firebase.ref('/rivalries/').push({
                results: {},
                player1: _this.newP1,
                player2: _this.newP2
            });

            _this.newP1 = '';
            _this.newP2 = '';
        },

        viewRivalry: function viewRivalry(rivalry, index) {
            var _this = this;

            _this.selectedRivalry = rivalry;
            this.$set(_this.selectedRivalry, 'results', rivalry.results);

            _this.fbIndex = index;
            _this.p1 = _this.buildStats('player1');
            _this.p2 = _this.buildStats('player2');

            setTimeout(function () {
                _this.bakePie();
            });
        },
        buildStats: function buildStats(player) {
            var _this = this;

            var gf = _this.getGoalsFor(player);

            return {
                won: _this.getWins(player),
                drawn: _this.getDraws(player),
                goals: gf
            };
        },
        gamesPlayed: function gamesPlayed() {
            var _this = this;

            return Object.keys(_this.selectedRivalry.results).length;
        },
        getWins: function getWins(player) {
            var _this = this;
            var count = 0;
            var i = void 0;

            for (i in _this.selectedRivalry.results) {
                var result = _this.selectedRivalry.results[i];

                if (player === 'player1') {
                    if (result.player1 > result.player2) {
                        count++;
                    }
                } else if (player === 'player2') {
                    if (result.player2 > result.player1) {
                        count++;
                    }
                }
            }
            return count;
        },
        getDraws: function getDraws(player) {
            var _this = this;
            var count = 0;
            var i = void 0;

            for (i in _this.selectedRivalry.results) {
                var result = _this.selectedRivalry.results[i];

                if (result.player1 === result.player2) {
                    count++;
                }
            }
            return count;
        },
        getGoalsFor: function getGoalsFor(player) {
            var _this = this;
            var total = 0;
            var i = void 0;

            for (i in _this.selectedRivalry.results) {
                var result = _this.selectedRivalry.results[i];

                if (player === 'player1') {
                    total += result.player1;
                } else if (player === 'player2') {
                    total += result.player2;
                }
            }
            return total;
        },
        fixtureDate: function fixtureDate(date) {
            return moment(date).format(' Do MMMM YYYY');
        },
        bakePie: function bakePie() {
            var _this = this;

            if (!_this.selectedRivalry.results) {
                return;
            }

            var winsCtx = document.getElementById('winsPie').getContext('2d');
            var goalsCtx = document.getElementById('goalsPie').getContext('2d');

            var winsChart = new Chart(winsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [_this.p1.won, _this.p2.won, _this.p1.drawn],
                        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)"]
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [_this.selectedRivalry.player1, _this.selectedRivalry.player2, 'Draws']
                },
                options: {
                    responsive: true,
                    responsiveAnimationDuration: 0,
                    maintainAspectRatio: true,
                    cutoutPercentage: 65
                }
            });

            var goalsChart = new Chart(goalsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [_this.p1.goals, _this.p2.goals],
                        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"]
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [_this.selectedRivalry.player1, _this.selectedRivalry.player2]
                },
                options: {
                    responsive: true,
                    responsiveAnimationDuration: 0,
                    maintainAspectRatio: true,
                    cutoutPercentage: 65
                }
            });
        },
        addResult: function addResult(event) {
            var _this = this;
            event.preventDefault();

            _this.firebase.ref('/rivalries/' + _this.fbIndex + '/results').push({
                date: moment().valueOf(),
                player1: parseInt(_this.p1Score),
                player2: parseInt(_this.p2Score)
            });
            _this.getNewData();
        },
        deleteResult: function deleteResult(event, index) {
            var _this = this;
            event.preventDefault();

            var matchRef = firebase.database().ref('/rivalries/' + _this.fbIndex + '/results/' + index);

            matchRef.remove();
            _this.getNewData();
        },
        orderedResults: function orderedResults(results) {
            var arr = _.orderBy(results, 'date', 'desc');
            return arr;
        }
    },
    created: function created() {
        this.getData();
    }
});