function Player(name, team) {
    this.name = name;
    this.team = team;
    this.score = 0;

    this.shoot = function(attempts) {
        for (let i = 0; i < attempts; i++) {
            if (Math.random() > 0.5) {
                this.score++;
            }
        }
    };
}

function scoreRank(players) {
    return players.sort((playerA, playerB) => playerB.score - playerA.score);
}

function shootRound(players, round) {
    console.log("\n" + String.fromCodePoint(0x1F3C0) + ` Round ${round} Begins!`);
    players.forEach(player => player.shoot(5));
    players = scoreRank(players);

    console.log("\n" + String.fromCodePoint(0x1F3C6) + " Rankings after this round:");

    players.forEach((player, rank) => {
        console.log(`${rank + 1}. ${player.name} - ${player.score} points`);
    });

    return players
}

function tieBreaker(players) {
    let tiebreakerRound = 2
    let topScorer = players[0].score;
    let tiedPlayers = players.filter(player => player.score === topScorer);

    while (tiedPlayers.length > 1) {
        console.log("\n" + String.fromCodePoint(0x1F525) + ` Tiebreaker needed between: ${tiedPlayers.map(player => player.name).join(', ')}`);

        tiedPlayers.forEach(player => player.score = 0);
        tiedPlayers = shootRound(tiedPlayers, tiebreakerRound);

        topScorer = tiedPlayers[0].score;
        tiedPlayers = tiedPlayers.filter(player => player.score === topScorer);

        tiebreakerRound++
    }

    return tiedPlayers
}

let players = [
    new Player("Durant", "Nets"),
    new Player("Jordan", "Bulls"),
    new Player("James", "Lakers"),
    new Player("Curry", "Warriors"),
    new Player("Bryant", "Lakers")
];

players = shootRound(players, 1)

let topScorer = players[0].score;
let tiedPlayers = players.filter(player => player.score === topScorer);

if (tiedPlayers.length > 1) {
    tiedPlayers = tieBreaker(tiedPlayers)
}

console.log("\n" + String.fromCodePoint(0x1F3C6) + ` The champion is ${tiedPlayers[0].name} with ${tiedPlayers[0].score} points!`);