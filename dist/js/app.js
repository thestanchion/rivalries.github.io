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
        }
    },
    methods: {
        getData: function getData() {
            var _this = this;
            _this.firebase.ref('/rivalries').once('value').then(function (snapshot) {
                _this.rivalries = snapshot.val();
                console.log(_this.rivalries);
            });
        },
        viewRivalry: function viewRivalry(rivalry) {
            var _this = this;

            _this.selectedRivalry = rivalry;
            _this.p1 = _this.buildStats('player1');
            _this.p2 = _this.buildStats('player2');
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
        getWins: function getWins(player) {
            var _this = this;
            var count = 0;

            for (var i = 0; i < _this.selectedRivalry.results.length; i++) {
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

            for (var i = 0; i < _this.selectedRivalry.results.length; i++) {
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

            for (var i = 0; i < _this.selectedRivalry.results.length; i++) {
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
        }
    },
    created: function created() {
        this.getData();
    }
});