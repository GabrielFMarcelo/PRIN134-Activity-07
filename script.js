let players = [];
let currentWinner = null;

function Player(name) {
  this.name = name;
  this.score = 0;
  this.eliminated = false;

  this.shoot = function (attempts) {
    if (!this.eliminated) {
      for (let i = 0; i < attempts; i++) {
        if (Math.random() > 0.5) {
          this.score++;
        }
      }
    }
  };
}

function addPlayer() {
  const name = document.getElementById('playerName').value.trim();
  const duplicateError = document.getElementById('duplicateError');

  duplicateError.style.display = 'none';

  if (name) {
    const isDuplicate = players.some(player =>
      player.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      duplicateError.style.display = 'block';
      document.getElementById('playerName').classList.add('shake');
      setTimeout(() => {
        document.getElementById('playerName').classList.remove('shake');
      }, 500);
      return;
    }

    players.push(new Player(name));
    document.getElementById('playerName').value = '';
    updatePlayersList();
  }
}

function deletePlayer(index) {
  players.splice(index, 1);
  updatePlayersList();
}

function updatePlayersList() {
  const listDiv = document.getElementById('playersList');
  listDiv.innerHTML = '';

  players.forEach((player, index) => {
    const isWinner = currentWinner && currentWinner.name === player.name;
    const playerCard = document.createElement('div');
    playerCard.className = `player-card ${isWinner ? 'winner' : ''}`;
    playerCard.innerHTML = `
      <div>
        <strong>${player.name}</strong>
        <small class="text-muted">Score: ${player.score}</small>
        ${player.eliminated ? '<span class="badge bg-danger">Eliminated</span>' : ''}
      </div>
      <button class="remove-btn" onclick="deletePlayer(${index})">Remove</button>
    `;
    listDiv.appendChild(playerCard);
  });
}

function scoreRank(players) {
  return players.sort((playerA, playerB) => playerB.score - playerA.score);
}

function shootRound(players, round) {
  let log = `<div class="round-header">🏀 Round ${round} Begins!</div>`;

  const activePlayers = players.filter(p => !p.eliminated);
  activePlayers.forEach(player => player.shoot(5));

  const rankedPlayers = scoreRank(activePlayers);

  currentWinner = rankedPlayers[0];

  log += `<div class="rankings"><strong>🏆 Rankings after this round:</strong>`;
  rankedPlayers.forEach((player, rank) => {
    log += `<div>${rank + 1}. ${player.name} - ${player.score} points</div>`;
  });
  log += `</div>`;

  updatePlayersList();

  return { players: rankedPlayers, log };
}

function tieBreaker(tiedPlayers, allPlayers) {
  let tiebreakerRound = 2;
  let fullLog = '';
  let winner = null;

  allPlayers.forEach(player => {
    player.score = 0;
  });

  allPlayers.forEach(player => {
    player.eliminated = !tiedPlayers.some(p => p.name === player.name);
  });

  while (!winner) {
    fullLog += `<div class="tiebreaker">\n🔥 Tiebreaker needed between: ${tiedPlayers.map(player => player.name).join(', ')}</div>`;

    const result = shootRound(allPlayers, tiebreakerRound);
    fullLog += result.log;

    const activePlayers = allPlayers.filter(p => !p.eliminated);
    const rankedPlayers = scoreRank(activePlayers);

    const topScore = rankedPlayers[0].score;
    const newTiedPlayers = rankedPlayers.filter(player => player.score === topScore);

    if (newTiedPlayers.length === 1) {
      winner = newTiedPlayers[0];
    } else {
      allPlayers.forEach(player => {
        if (!player.eliminated && !newTiedPlayers.some(p => p.name === player.name)) {
          player.eliminated = true;
        }
      });
      tiedPlayers = newTiedPlayers;
      tiebreakerRound++;
    }
  }

  allPlayers.forEach(player => player.eliminated = false);

  return { winner, log: fullLog };
}

function startGame() {
  const minPlayersError = document.getElementById('minPlayersError');
  minPlayersError.style.display = 'none';

  if (players.length < 2) {
    minPlayersError.style.display = 'block';
    document.querySelector('.play-btn').classList.add('shake');
    setTimeout(() => {
      document.querySelector('.play-btn').classList.remove('shake');
    }, 500);
    return;
  }

  players.forEach(player => {
    player.score = 0;
    player.eliminated = false;
  });
  currentWinner = null;

  document.getElementById('gameLog').innerHTML = '';
  updatePlayersList();

  let { players: rankedPlayers, log } = shootRound(players, 1);
  let topScorer = rankedPlayers[0].score;
  let tiedPlayers = rankedPlayers.filter(player => player.score === topScorer);

  if (tiedPlayers.length > 1) {
    const tieResult = tieBreaker(tiedPlayers, players);
    log += tieResult.log;
    log += `<div class="champion">\n🏆 The champion is ${tieResult.winner.name}!</div>`;
    currentWinner = tieResult.winner;
  } else {
    log += `<div class="champion">\n🏆 The champion is ${tiedPlayers[0].name}!</div>`;
    currentWinner = tiedPlayers[0];
  }

  document.getElementById('gameLog').innerHTML = log;
  updatePlayersList();
}