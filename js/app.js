const Home = {
    template: "#tables",
    mounted: function() {
        this.$root.showTabs = true;
    }
}
const Player = {
    template: "#player",
    methods: {
        getLeagueStorage: function(name) {
            this.setPlayer(name, JSON.parse(localStorage.getItem("fifaTable")));
        },
        setPlayer: function(name, arr) {
            var self = this.$root;

            for (var i = 0; i < arr.length; i++) {
                var player = arr[i];
                if (player.ShortName === name) {
                    self.selectedPlayer = player;
                }
            }
        },
        setPageData: function() {
            var self = this.$root,
                name = this.$route.params.name,
                players = self.players;
                if (players.length) {
                    localStorage.setItem("fifaTable", JSON.stringify(players));
                }

            if (!players.length) {
                this.getLeagueStorage(name);
            } else {
                this.setPlayer(name, players);
            }
        }
    },
    mounted: function() {
        var _app = this.$root;
        this.setPageData();
        _app.showTabs = false;
        setTimeout(function() {
            _app.buildGraph("#ct-chart__" + _app.selectedLeague + "-" + _app.selectedPlayer.Position, _app.selectedPlayer);
        }, 200);
    },
    watch: {
        "$route": function() {
            this.setPageData();
        }
    }
}

const routes = [
  { path: '/', component: Home },
  { path: '/player/:name', component: Player },
];

const router = new VueRouter({routes});

const app = new Vue({
    router,
    el: "#app",
    data: {
        showTabs: true,
        apiUrl: "https://fifawebapi.azurewebsites.net/api/",
        leagues: [],
        selectedLeague: "p",
        selectedPlayer: "",
        pID: "706",
        cID: "",
        players: [],
        p: [],
        c: [],
        sortedPlayers: [],
        graphsBuilt: false
    },
    methods: {
        getApiData: function(url, callback, league) {
            var fetchArgs = {
                method: "GET",
                mode: "cors"
            }

            fetch(this.apiUrl + url, fetchArgs).then(function(response){
                return response.json();
            }).then(function(reply) {
                callback(reply, league);
            });
        },
        getLeagues: function() {
            this.getApiData("leagues", this.setLeagues);
        },
        setLeagues: function(data) {
            this.leagues = data;
            this.getPlayers("p", this.pID);
            //this.getPlayers("c", this.cID);
        },
        getPlayers: function(league, id) {
            this.getApiData("leagues/" + id, this.setPlayers, league);
        },
        setPlayers: function(data, league) {
            if (league == "p") {
                this.p = data;
            }
            else if (league == "c") {
                this.c = data;
            }
            if (this.selectedLeague == "p") {
                this.players = this.p;
                this.players = arr = _.orderBy(this.players, 'Position', 'asc');

                if (!this.graphsBuilt) {
                    this.buildGraphs();
                }
                this.graphsBuilt = true;
            }
            else if (this.selectedLeague == "c") {
                this.players = this.c;
                this.players = arr = _.orderBy(this.players, 'Position', 'asc');
            }

            this.createRowShowVal(this.p);
            this.createRowShowVal(this.c);
        },
        playerLink: function(val) {
            if (val) {
                return "/player/" + val.split(":").join("");
            }
        },
        playerEmoji: function(val) {
            if (val) {
                return "img/emoji/" + val.split(":").join("") + ".png";
            }
        },
        playerBadge: function(val) {
            if (val) {
                return "img/badges/" + val.split(":").join("") + ".png";
            }
        },
        createRowShowVal: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                this.$set(arr[i], 'ShowForm', false);

                var name = arr[i].PlayerFace.split(":").join("");
                this.$set(arr[i], 'ShortName', name);
            }
        },
        formatDate: function(val, format) {
            if (val) {
                var date = new Date(val);
                return moment(date).format(format);
            }
        },
        projectedPoints: function(player) {
            var totalGames = (this.players.length - 1) * 2;
            var projected = (player.Points / player.GamesPlayed) * totalGames;
            Vue.set(player, 'Projected', projected);
            if (projected) {
                return Math.round(projected);
            } else {
                return 0;
            }
        },
        limitResults: function(arr, limit) {
            if (arr) {
                return arr = arr.slice(0, Number(limit));
            }
        },
        sortResults: function(arr, limit) {
            if (arr) {
                arr = _.orderBy(arr, 'ResultDate', 'desc');

                if (limit) {
                    arr = this.limitResults(arr, limit);
                }
                // Ensure results show most recent result first
                return arr;
            }
        },
        switchLeagues: function(val) {
            this.players = this[val];
            this.selectedLeague = val;

            this.buildGraphs();
            this.sortTable('Position', 'asc');
        },
        sortTable: function(prop, order) {
            this.players = _.orderBy(this.players, prop, order);
        },
        graphID: function(pos) {
            return "ct-chart__" + this.selectedLeague + "-" + pos;
        },
        playerGraphID: function(pos) {
            return "ct-chart__" + this.selectedLeague + "-" + pos;
        },
        graphSelector: function(pos) {
            return "#ct-chart__" + this.selectedLeague + "-" + pos;
        },
        buildGraphs: function() {
            var _this = this;
            _.forEach(this.players, function(player) {
                var selector = "#ct-chart__" + _this.selectedLeague + "-" + player.Position
                //_this.buildGraph(selector, player);
            });
        },
        buildGraph: function(selector, player) {
            console.log(selector, player);

            var _this = this,
                seriesArr = [],
                pointBackgroundColors = [];

            //setTimeout(function() {
                var labels = [];
                var dataset = [
                    {
                        type: 'line',
                        label: '',
                        fill: false,
                        data: [],
                        lineTension: 0,
                        pointBorderColor: "#fff",
                        pointBackgroundColor: pointBackgroundColors,
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: pointBackgroundColors,
                        pointHoverBorderColor: "#fff",
                        pointHoverBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 6
                    }
                ];

                _.forEach(player.PositionHistory, function (match, i) {
                    labels.push(i + 1);
                    dataset[0].data.push(match.Position);
                });

                var ctx = $(selector);
                console.log(selector, ctx);
                var myLineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: dataset
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        tooltips: {
                            enabled: false
                        },
                        scales: {
                            xAxes: [
                                {
                                    scaleLabel: {
                                        display: true,
                                        labelString: "Games Played"
                                    },
                                    gridLines: {
                                        display: false,
                                        drawBorder: false
                                    },
                                    ticks: {
                                        padding: 20
                                    }
                                }
                            ],
                            yAxes: [
                                {
                                    scaleLabel: {
                                        display: true,
                                        labelString: "Position"
                                    },
                                    gridLines: {
                                        drawBorder: false
                                    },
                                    ticks: {
                                        padding: 20,
                                        min: 1,
                                        max: 18,
                                        beginAtZero: true,
                                        reverse: true,
                                    },
                                    display: true,
                                }
                            ]
                        }
                    }
                });

                for (i = 0; i < player.PositionHistory.length; i++) {
                    var dotColour;

                    if (player.PositionHistory[i].IsWin) {
                        dotColour = "#74bd6c";
                    } else if (player.PositionHistory[i].IsDraw) {
                        dotColour = "#c3c3c3";
                    } else if(player.PositionHistory[i].IsLoss) {
                        dotColour = "#e73c3c";
                    }

                    pointBackgroundColors.push(dotColour);
                }

                myLineChart.update();
            //}, 2000);
        }
    },
    created: function() {
        this.getLeagues();
    }
});
