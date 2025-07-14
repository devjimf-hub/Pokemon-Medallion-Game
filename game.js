// Game state variables
let gameState = {
    screen: 'collection', // 'collection', 'teamSelect', 'battle', 'gameOver'
    playerCollection: [],
    playerTeam: [],
    opponentTeam: [],
    currentRound: 1,
    playerScore: 0,
    opponentScore: 0,
    playerThrown: null,
    opponentThrown: null,
    usedPlayerPokemon: [],
    usedOpponentPokemon: [],
    roundWinner: null,
    battleLog: [],
    coins: 200,
    selectedPokemon: null,
    battleAnimation: 'waiting', // 'waiting', 'revealing', 'battle', 'result'
    showPoints: false,
    throwingAnimation: false,
    showRoundResult: false
};

// DOM elements
const screens = {
    collection: document.getElementById('collection-screen'),
    teamSelect: document.getElementById('team-select-screen'),
    battle: document.getElementById('battle-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const elements = {
    coinsAmount: document.getElementById('coins-amount'),
    buyPokemonBtn: document.getElementById('buy-pokemon-btn'),
    battleModeBtn: document.getElementById('battle-mode-btn'),
    collectionGrid: document.getElementById('collection-grid'),
    teamCount: document.getElementById('team-count'),
    backToCollectionBtn: document.getElementById('back-to-collection-btn'),
    startBattleBtn: document.getElementById('start-battle-btn'),
    selectedTeam: document.getElementById('selected-team'),
    selectedTeamGrid: document.getElementById('selected-team-grid'),
    teamSelectionGrid: document.getElementById('team-selection-grid'),
    currentRound: document.getElementById('current-round'),
    playerScore: document.getElementById('player-score'),
    opponentScore: document.getElementById('opponent-score'),
    battleStatus: document.getElementById('battle-status'),
    battleArena: document.getElementById('battle-arena'),
    arenaContent: document.getElementById('arena-content'),
    opponentTeamGrid: document.getElementById('opponent-team-grid'),
    playerTeamGrid: document.getElementById('player-team-grid'),
    forfeitBtn: document.getElementById('forfeit-btn'),
    gameOverTitle: document.getElementById('game-over-title'),
    finalScore: document.getElementById('final-score'),
    gameOverMessage: document.getElementById('game-over-message'),
    returnToCollectionBtn: document.getElementById('return-to-collection-btn'),
    roundResultModal: document.getElementById('round-result-modal'),
    roundResultTitle: document.getElementById('round-result-title'),
    roundResultPokemon: document.getElementById('round-result-pokemon'),
    roundResultText: document.getElementById('round-result-text'),
    battleLogElement: document.getElementById('battle-log'),
    countdownBar: document.getElementById('countdown-bar')
};

// Initialize lucide icons
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Utility functions
function generateRandomPokemon() {
    const base = pokemonData.types[Math.floor(Math.random() * pokemonData.types.length)];
    const pointsVariation = Math.floor(Math.random() * 21) - 10; // -10 to +10
    return {
        ...base,
        id: Date.now() + Math.random(),
        points: Math.max(50, base.points + pointsVariation)
    };
}

function getRarityClass(rarity) {
    return rarity.toLowerCase();
}

function createPokemonCard(pokemon, context = 'collection') {
    const card = document.createElement('div');
    card.className = `pokemon-card ${pokemon.color} ${getRarityClass(pokemon.rarity)}`;
    card.dataset.pokemonId = pokemon.id;
    
    let content = `
        <h3>${pokemon.name}</h3>
        <div class="type-rarity">${pokemon.type} • ${pokemon.rarity}</div>
        <div class="points">
            <i data-lucide="trophy"></i>
            <span>${pokemon.points} Points</span>
        </div>
    `;
    
    if (context === 'teamSelect') {
        const isSelected = gameState.playerTeam.find(p => p.id === pokemon.id);
        if (isSelected) {
            content += '<div class="selected-badge">SELECTED</div>';
            card.classList.add('disabled');
        }
    } else if (context === 'battle') {
        const isUsed = gameState.usedPlayerPokemon.includes(pokemon.id);
        const isSelected = gameState.selectedPokemon?.id === pokemon.id;
        
        if (isUsed) {
            card.classList.add('used');
            content += '<div class="status">USED</div>';
            content += '<div class="used-overlay">×</div>';
        } else if (gameState.battleAnimation === 'waiting') {
            if (isSelected) {
                card.classList.add('selected');
                content += '<div class="status">SELECTED - Click battlefield!</div>';
            } else {
                content += '<div class="status">Click to select</div>';
            }
        } else {
            card.classList.add('disabled');
        }
    } else if (context === 'teamDisplay') {
        content += '<div class="status">Click to remove</div>';
    }
    
    card.innerHTML = content;
    
    // Add event listeners based on context
    if (context === 'collection') {
        // No special click behavior for collection view
    } else if (context === 'teamSelect') {
        card.addEventListener('click', () => selectForTeam(pokemon));
    } else if (context === 'battle') {
        card.addEventListener('click', () => selectPokemon(pokemon));
    } else if (context === 'teamDisplay') {
        card.addEventListener('click', () => removeFromTeam(pokemon));
    }
    
    return card;
}

function createHiddenPokemonCard(pokemon, isUsed = false) {
    const card = document.createElement('div');
    card.className = `pokemon-card hidden-pokemon ${isUsed ? 'used' : ''}`;
    
    let content = `
        <div class="mystery-icon">?</div>
        <h3>Hidden Pokemon</h3>
        <div class="type-rarity">??? Type</div>
        <div class="points">??? Points</div>
    `;
    
    if (isUsed) {
        content += '<div class="status">USED</div>';
        content += '<div class="used-overlay">×</div>';
    }
    
    card.innerHTML = content;
    return card;
}

function createBattlePokemonCard(pokemon, isWinner = false) {
    const card = document.createElement('div');
    card.className = `battle-pokemon ${pokemon.color}`;
    
    if (isWinner) {
        card.classList.add('winner');
    } else if (gameState.roundWinner && gameState.roundWinner !== 'tie') {
        card.classList.add('defeated');
    }
    
    let content = `
        <h3>${pokemon.name}</h3>
        <div class="type">${pokemon.type}</div>
    `;
    
    if (gameState.showPoints) {
        content += `<div class="points">${pokemon.points} Points</div>`;
    }
    
    card.innerHTML = content;
    
    if (gameState.battleAnimation === 'result' && !isWinner && gameState.roundWinner !== 'tie') {
        card.innerHTML += '<div class="defeat-overlay">×</div>';
    }
    
    return card;
}

// Screen management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    gameState.screen = screenName;
    initializeLucideIcons();
}

function updateCoinsDisplay() {
    elements.coinsAmount.textContent = gameState.coins;
    elements.buyPokemonBtn.disabled = gameState.coins < 50;
}

// Collection screen functions
function renderCollection() {
    elements.collectionGrid.innerHTML = '';
    gameState.playerCollection.forEach(pokemon => {
        const card = createPokemonCard(pokemon, 'collection');
        elements.collectionGrid.appendChild(card);
    });
    initializeLucideIcons();
}

function buyPokemon() {
    if (gameState.coins >= 50) {
        gameState.coins -= 50;
        const newPokemon = generateRandomPokemon();
        gameState.playerCollection.push(newPokemon);
        updateCoinsDisplay();
        renderCollection();
    }
}

// Team selection functions
function renderTeamSelection() {
    // Update team count
    elements.teamCount.textContent = gameState.playerTeam.length;
    elements.startBattleBtn.disabled = gameState.playerTeam.length !== 3;
    
    // Show/hide selected team section
    if (gameState.playerTeam.length > 0) {
        elements.selectedTeam.classList.remove('hidden');
        elements.selectedTeamGrid.innerHTML = '';
        gameState.playerTeam.forEach(pokemon => {
            const card = createPokemonCard(pokemon, 'teamDisplay');
            elements.selectedTeamGrid.appendChild(card);
        });
    } else {
        elements.selectedTeam.classList.add('hidden');
    }
    
    // Render collection for team selection
    elements.teamSelectionGrid.innerHTML = '';
    gameState.playerCollection.forEach(pokemon => {
        const card = createPokemonCard(pokemon, 'teamSelect');
        elements.teamSelectionGrid.appendChild(card);
    });
    
    initializeLucideIcons();
}

function selectForTeam(pokemon) {
    if (gameState.playerTeam.length < 3 && !gameState.playerTeam.find(p => p.id === pokemon.id)) {
        gameState.playerTeam.push(pokemon);
        renderTeamSelection();
    }
}

function removeFromTeam(pokemon) {
    gameState.playerTeam = gameState.playerTeam.filter(p => p.id !== pokemon.id);
    renderTeamSelection();
}

// Battle functions
function startBattle() {
    if (gameState.playerTeam.length !== 3) return;
    
    // Generate opponent team
    gameState.opponentTeam = [generateRandomPokemon(), generateRandomPokemon(), generateRandomPokemon()];
    
    // Reset battle state
    gameState.currentRound = 1;
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.usedPlayerPokemon = [];
    gameState.usedOpponentPokemon = [];
    gameState.playerThrown = null;
    gameState.opponentThrown = null;
    gameState.battleLog = [];
    gameState.battleAnimation = 'waiting';
    gameState.showPoints = false;
    gameState.selectedPokemon = null;
    gameState.throwingAnimation = false;
    gameState.showRoundResult = false;
    
    showScreen('battle');
    renderBattle();
}

function renderBattle() {
    // Update round and scores
    elements.currentRound.textContent = gameState.currentRound;
    elements.playerScore.textContent = gameState.playerScore;
    elements.opponentScore.textContent = gameState.opponentScore;
    
    // Update battle status
    updateBattleStatus();
    
    // Render battle arena
    renderBattleArena();
    
    // Render opponent team (hidden)
    elements.opponentTeamGrid.innerHTML = '';
    gameState.opponentTeam.forEach(pokemon => {
        const isUsed = gameState.usedOpponentPokemon.includes(pokemon.id);
        const card = createHiddenPokemonCard(pokemon, isUsed);
        elements.opponentTeamGrid.appendChild(card);
    });
    
    // Render player team
    elements.playerTeamGrid.innerHTML = '';
    gameState.playerTeam.forEach(pokemon => {
        const card = createPokemonCard(pokemon, 'battle');
        elements.playerTeamGrid.appendChild(card);
    });
    
    initializeLucideIcons();
}

function updateBattleStatus() {
    let status = '';
    
    switch (gameState.battleAnimation) {
        case 'waiting':
            status = gameState.selectedPokemon 
                ? "Click the battlefield to throw your Pokemon!" 
                : "Select a Pokemon first!";
            break;
        case 'revealing':
            status = "Pokemon are facing off...";
            break;
        case 'battle':
            status = "Battle in progress!";
            break;
        case 'result':
            status = "Round complete!";
            break;
    }
    
    elements.battleStatus.textContent = status;
}

function renderBattleArena() {
    const arena = elements.battleArena;
    const content = elements.arenaContent;
    
    // Update arena state classes
    arena.className = 'battle-arena';
    if (gameState.selectedPokemon && gameState.battleAnimation === 'waiting') {
        arena.classList.add('ready');
    }
    
    if (gameState.battleAnimation === 'waiting' && !gameState.throwingAnimation) {
        // Show default arena content
        content.innerHTML = `
            <div class="arena-text">
                <div class="arena-title">Battle Arena</div>
                <div class="arena-subtitle">${gameState.selectedPokemon ? "Click here to throw your Pokemon!" : "Select a Pokemon below"}</div>
                ${gameState.selectedPokemon ? `<div class="arena-ready">Ready to throw ${gameState.selectedPokemon.name}!</div>` : ''}
            </div>
        `;
        content.className = 'arena-content';
    } else if (gameState.throwingAnimation && gameState.selectedPokemon) {
        // Show throwing animation
        content.innerHTML = `
            <div class="battle-pokemon ${gameState.selectedPokemon.color}" style="transform: scale(0.75); animation: bounce 0.5s;">
                <h3>${gameState.selectedPokemon.name}</h3>
                <div class="type">Flying to battle!</div>
            </div>
        `;
        content.className = 'arena-content';
    } else if (gameState.playerThrown && gameState.opponentThrown && !gameState.throwingAnimation) {
        // Show battle between pokemon
        const playerCard = createBattlePokemonCard(
            gameState.playerThrown, 
            gameState.roundWinner === 'player'
        );
        const opponentCard = createBattlePokemonCard(
            gameState.opponentThrown, 
            gameState.roundWinner === 'opponent'
        );
        
        // Apply animation classes
        if (gameState.battleAnimation === 'revealing') {
            playerCard.classList.add('revealing');
            opponentCard.classList.add('revealing');
        } else if (gameState.battleAnimation === 'battle') {
            playerCard.classList.add('battling');
            opponentCard.classList.add('battling');
        }
        
        content.innerHTML = '';
        content.className = 'battle-vs';
        content.appendChild(playerCard);
        
        const vsElement = document.createElement('div');
        vsElement.className = 'vs-text';
        vsElement.textContent = 'VS';
        content.appendChild(vsElement);
        
        content.appendChild(opponentCard);
    }
}

function selectPokemon(pokemon) {
    if (gameState.usedPlayerPokemon.includes(pokemon.id) || gameState.battleAnimation !== 'waiting') return;
    
    gameState.selectedPokemon = gameState.selectedPokemon?.id === pokemon.id ? null : pokemon;
    renderBattle();
}

function throwToBattlefield() {
    if (gameState.selectedPokemon && gameState.battleAnimation === 'waiting') {
        throwPokemon(gameState.selectedPokemon);
    }
}

function throwPokemon(pokemon) {
    if (gameState.usedPlayerPokemon.includes(pokemon.id) || gameState.battleAnimation !== 'waiting') return;
    
    gameState.throwingAnimation = true;
    gameState.selectedPokemon = null;
    renderBattle();
    
    setTimeout(() => {
        gameState.playerThrown = pokemon;
        gameState.usedPlayerPokemon.push(pokemon.id);
        gameState.battleAnimation = 'revealing';
        gameState.showPoints = false;
        gameState.throwingAnimation = false;
        
        // AI opponent throws a random unused pokemon
        const availableOpponent = gameState.opponentTeam.filter(p => !gameState.usedOpponentPokemon.includes(p.id));
        const opponentChoice = availableOpponent[Math.floor(Math.random() * availableOpponent.length)];
        gameState.opponentThrown = opponentChoice;
        gameState.usedOpponentPokemon.push(opponentChoice.id);
        
        renderBattle();
        
        // Animation sequence
        setTimeout(() => {
            gameState.showPoints = true;
            gameState.battleAnimation = 'battle';
            renderBattle();
        }, 1000);
        
        setTimeout(() => {
            // Calculate winner
            const winner = calculateRoundWinner(pokemon, opponentChoice);
            gameState.roundWinner = winner;
            gameState.battleAnimation = 'result';
            
            const newLog = [
                `Round ${gameState.currentRound}: ${pokemon.name} (${pokemon.points}) vs ${opponentChoice.name} (${opponentChoice.points})`
            ];
            
            if (winner === 'player') {
                gameState.playerScore++;
                newLog.push(`${pokemon.name} wins this round!`);
            } else if (winner === 'opponent') {
                gameState.opponentScore++;
                newLog.push(`${opponentChoice.name} wins this round!`);
            } else {
                newLog.push("It's a tie!");
            }
            
            gameState.battleLog = [...gameState.battleLog, ...newLog];
            
            renderBattle();
            showRoundResult();
            
            // Check if game is over (after 3 rounds or all pokemon used)
            if (gameState.currentRound === 3 || gameState.usedPlayerPokemon.length === 3) {
                setTimeout(() => {
                    endGame();
                }, 5000);
            } else {
                // Automatically proceed to next round after 10 seconds
                setTimeout(() => {
                    nextRound();
                }, 5000);
            }
        }, 5000);
    }, 500);
}

function calculateRoundWinner(playerPokemon, opponentPokemon) {
    let playerPoints = playerPokemon.points;
    let opponentPoints = opponentPokemon.points;
    
    // Check type advantages
    const playerType = playerPokemon.type;
    const opponentType = opponentPokemon.type;
    
    if (pokemonData.typeAdvantages[playerType]?.includes(opponentType)) {
        playerPoints += 15; // Type advantage bonus
    }
    if (pokemonData.typeAdvantages[opponentType]?.includes(playerType)) {
        opponentPoints += 15; // Type advantage bonus
    }
    
    if (playerPoints > opponentPoints) {
        return 'player';
    } else if (opponentPoints > playerPoints) {
        return 'opponent';
    } else {
        return 'tie';
    }
}

function showRoundResult() {
    const modal = elements.roundResultModal;
    const title = elements.roundResultTitle;
    const pokemonDiv = elements.roundResultPokemon;
    const text = elements.roundResultText;
    const log = elements.battleLogElement;
    
    // Set title based on winner
    if (gameState.roundWinner === 'player') {
        title.textContent = '🏆 You Win!';
    } else if (gameState.roundWinner === 'opponent') {
        title.textContent = '💀 You Lose!';
    } else {
        title.textContent = '🤝 It\'s a Tie!';
    }
    
    // Show pokemon comparison
    pokemonDiv.innerHTML = '';
    const playerCard = createBattlePokemonCard(gameState.playerThrown, gameState.roundWinner === 'player');
    const opponentCard = createBattlePokemonCard(gameState.opponentThrown, gameState.roundWinner === 'opponent');
    
    if (gameState.roundWinner === 'player') {
        playerCard.classList.add('winner');
    } else if (gameState.roundWinner === 'opponent') {
        opponentCard.classList.add('winner');
    }
    
    pokemonDiv.appendChild(playerCard);
    pokemonDiv.appendChild(opponentCard);
    
    // Set result text
    const nextText = gameState.currentRound < 3 ? 'Next round starting soon...' : 'Final results coming up!';
    text.textContent = `Round ${gameState.currentRound} complete! ${nextText}`;
    
    // Show battle log
    log.innerHTML = '';
    gameState.battleLog.slice(-3).forEach(logEntry => {
        const p = document.createElement('p');
        p.textContent = logEntry;
        log.appendChild(p);
    });
    
    // Start countdown animation
    elements.countdownBar.style.animation = 'none';
    elements.countdownBar.offsetHeight; // Trigger reflow
    elements.countdownBar.style.animation = 'countdown 5s linear';
    
    modal.classList.remove('hidden');
    initializeLucideIcons();
}

function nextRound() {
    elements.roundResultModal.classList.add('hidden');
    gameState.currentRound++;
    gameState.playerThrown = null;
    gameState.opponentThrown = null;
    gameState.roundWinner = null;
    gameState.battleAnimation = 'waiting';
    gameState.showPoints = false;
    gameState.selectedPokemon = null;
    gameState.throwingAnimation = false;
    renderBattle();
}

function endGame() {
    elements.roundResultModal.classList.add('hidden');
    
    const playerWon = gameState.playerScore > gameState.opponentScore;
    const isDraw = gameState.playerScore === gameState.opponentScore;
    
    // Update coins if player won
    if (playerWon) {
        gameState.coins += 100;
        updateCoinsDisplay();
    }
    
    // Set game over content
    if (playerWon) {
        elements.gameOverTitle.textContent = '🏆 Victory!';
        elements.gameOverMessage.textContent = 'Congratulations! You won the battle and earned 100 coins!';
    } else if (isDraw) {
        elements.gameOverTitle.textContent = '🤝 Draw!';
        elements.gameOverMessage.textContent = "It's a draw! No coins earned.";
    } else {
        elements.gameOverTitle.textContent = '💀 Defeat!';
        elements.gameOverMessage.textContent = 'Better luck next time!';
    }
    
    elements.finalScore.textContent = `Final Score: ${gameState.playerScore} - ${gameState.opponentScore}`;
    
    showScreen('gameOver');
}

function returnToCollection() {
    gameState.playerTeam = [];
    gameState.opponentTeam = [];
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
}

// Event listeners
function setupEventListeners() {
    elements.buyPokemonBtn.addEventListener('click', buyPokemon);
    elements.battleModeBtn.addEventListener('click', () => {
        showScreen('teamSelect');
        renderTeamSelection();
    });
    
    elements.backToCollectionBtn.addEventListener('click', () => {
        showScreen('collection');
        renderCollection();
    });
    
    elements.startBattleBtn.addEventListener('click', startBattle);
    
    elements.battleArena.addEventListener('click', throwToBattlefield);
    
    elements.forfeitBtn.addEventListener('click', returnToCollection);
    elements.returnToCollectionBtn.addEventListener('click', returnToCollection);
}

// Initialize game
function initGame() {
    // Start with 6 random Pokemon
    for (let i = 0; i < 6; i++) {
        gameState.playerCollection.push(generateRandomPokemon());
    }
    
    setupEventListeners();
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
    initializeLucideIcons();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);