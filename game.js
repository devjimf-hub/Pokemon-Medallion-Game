// ── Pokemon visual data ──────────────────────────────────────
const POKEMON_PORTRAITS = {
    Charizard: '🦎', Blastoise: '🐢', Venusaur: '🌱',
    Pikachu: '🐭', Geodude: '🪨', Alakazam: '🔮',
    Machamp: '💪', Gengar: '👻', Dragonite: '🐲',
    Mewtwo: '👾', Snorlax: '😴', Lapras: '🌊',
    Articuno: '🦅', Zapdos: '⚡', Moltres: '🔥'
};

const TYPE_EMOJIS = {
    Fire: '🔥', Water: '💧', Grass: '🌿', Electric: '⚡',
    Rock: '🪨', Psychic: '🔮', Fighting: '👊', Ghost: '👻',
    Dragon: '🐉', Normal: '⭐', Ice: '❄️'
};

const TYPE_EFFECT_COLORS = {
    Fire:     'rgba(255,100,0,0.55)',
    Water:    'rgba(30,143,227,0.55)',
    Grass:    'rgba(46,204,113,0.5)',
    Electric: 'rgba(241,196,15,0.65)',
    Rock:     'rgba(139,105,20,0.5)',
    Psychic:  'rgba(224,86,253,0.55)',
    Fighting: 'rgba(192,57,43,0.55)',
    Ghost:    'rgba(124,77,255,0.6)',
    Dragon:   'rgba(249,115,22,0.55)',
    Normal:   'rgba(120,144,156,0.45)',
    Ice:      'rgba(0,188,212,0.55)'
};

// ── Game state ────────────────────────────────────────────────
let gameState = {
    screen: 'collection',
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
    battleAnimation: 'waiting',
    showPoints: false,
    throwingAnimation: false,
    showRoundResult: false
};

// ── DOM references ────────────────────────────────────────────
const screens = {
    collection: document.getElementById('collection-screen'),
    teamSelect:  document.getElementById('team-select-screen'),
    battle:      document.getElementById('battle-screen'),
    gameOver:    document.getElementById('game-over-screen')
};

const elements = {
    coinsAmount:          document.getElementById('coins-amount'),
    buyPokemonBtn:        document.getElementById('buy-pokemon-btn'),
    battleModeBtn:        document.getElementById('battle-mode-btn'),
    collectionGrid:       document.getElementById('collection-grid'),
    teamCount:            document.getElementById('team-count'),
    backToCollectionBtn:  document.getElementById('back-to-collection-btn'),
    startBattleBtn:       document.getElementById('start-battle-btn'),
    selectedTeam:         document.getElementById('selected-team'),
    selectedTeamGrid:     document.getElementById('selected-team-grid'),
    teamSelectionGrid:    document.getElementById('team-selection-grid'),
    currentRound:         document.getElementById('current-round'),
    playerScore:          document.getElementById('player-score'),
    opponentScore:        document.getElementById('opponent-score'),
    battleStatus:         document.getElementById('battle-status'),
    battleArena:          document.getElementById('battle-arena'),
    arenaContent:         document.getElementById('arena-content'),
    opponentTeamGrid:     document.getElementById('opponent-team-grid'),
    playerTeamGrid:       document.getElementById('player-team-grid'),
    forfeitBtn:           document.getElementById('forfeit-btn'),
    gameOverTitle:        document.getElementById('game-over-title'),
    gameOverIcon:         document.getElementById('game-over-icon'),
    finalScore:           document.getElementById('final-score'),
    gameOverMessage:      document.getElementById('game-over-message'),
    returnToCollectionBtn:document.getElementById('return-to-collection-btn'),
    roundResultModal:     document.getElementById('round-result-modal'),
    roundResultTitle:     document.getElementById('round-result-title'),
    roundResultPokemon:   document.getElementById('round-result-pokemon'),
    roundResultText:      document.getElementById('round-result-text'),
    battleLogElement:     document.getElementById('battle-log'),
    countdownBar:         document.getElementById('countdown-bar')
};

// ── Particle Background ───────────────────────────────────────
function initParticleSystem() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let raf;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function makeStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            vy: Math.random() * 0.15 + 0.03,
            base: Math.random() * 0.55 + 0.1,
            speed: Math.random() * 0.018 + 0.005,
            phase: Math.random() * Math.PI * 2
        };
    }

    function init() {
        resize();
        const n = Math.min(Math.floor(canvas.width * canvas.height / 7000), 130);
        stars = Array.from({ length: n }, makeStar);
    }

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.016;
        for (const s of stars) {
            s.y -= s.vy;
            if (s.y < -3) { s.y = canvas.height + 3; s.x = Math.random() * canvas.width; }
            const alpha = s.base * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); draw(); });
    init();
    draw();
}

// ── Visual Effects ────────────────────────────────────────────
function showBattleEffect(playerType, opponentType) {
    const arena = elements.battleArena;
    if (!arena) return;

    // Type color flash inside arena
    const color = TYPE_EFFECT_COLORS[playerType] || 'rgba(255,255,255,0.35)';
    const overlay = document.createElement('div');
    overlay.className = 'type-effect-overlay';
    overlay.style.background =
        `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`;
    arena.appendChild(overlay);
    setTimeout(() => overlay.remove(), 700);

    // Burst particles
    spawnBattleParticles(playerType, opponentType);

    // Screen shake for heavy hitters
    const heavyTypes = ['Dragon', 'Fighting', 'Ghost', 'Psychic', 'Electric'];
    if (heavyTypes.includes(playerType) || heavyTypes.includes(opponentType)) {
        document.body.classList.add('shake-screen');
        setTimeout(() => document.body.classList.remove('shake-screen'), 420);
    }
}

function spawnBattleParticles(playerType, opponentType) {
    const container = document.getElementById('battle-effects');
    if (!container) return;

    const arena = elements.battleArena;
    const rect  = arena ? arena.getBoundingClientRect() : null;
    const cx = rect ? rect.left + rect.width  / 2 : window.innerWidth  / 2;
    const cy = rect ? rect.top  + rect.height / 2 : window.innerHeight / 2;

    const color = (TYPE_EFFECT_COLORS[playerType] || 'rgba(255,200,0,0.9)')
        .replace(/[\d.]+\)$/, '0.9)');

    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'battle-particle';
        const size = Math.random() * 12 + 5;
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const dist  = Math.random() * 120 + 40;
        p.style.cssText = `
            left: ${cx}px; top: ${cy}px;
            width: ${size}px; height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size}px ${color};
            --tx: ${Math.cos(angle) * dist}px;
            --ty: ${Math.sin(angle) * dist}px;
            --dur: ${Math.random() * 0.4 + 0.5}s;
        `;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

function launchConfetti() {
    const screen = document.getElementById('game-over-screen');
    if (!screen) return;
    const colors = ['#ff0080','#ff8c00','#ffd700','#00ff87','#00f5ff','#bf5af2','#ff4444','#44aaff'];
    const shapes = ['50%', '2px', '0'];

    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        const size = Math.random() * 9 + 6;
        p.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: -20px;
            width: ${size}px;
            height: ${size * (Math.random() * 0.8 + 0.5)}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${shapes[Math.floor(Math.random() * shapes.length)]};
            --fall-dur: ${Math.random() * 2 + 1.8}s;
            --fall-delay: ${Math.random() * 0.8}s;
            --spin: ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 540 + 180)}deg;
        `;
        screen.appendChild(p);
    }
    setTimeout(() => {
        screen.querySelectorAll('.confetti-piece').forEach(p => p.remove());
    }, 4500);
}

function animateCoinDisplay(from, to) {
    const el = elements.coinsAmount;
    if (!el || from === to) { if (el) el.textContent = to; return; }
    const duration = 550;
    const start = performance.now();
    const diff = to - from;
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + diff * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ── Utilities ─────────────────────────────────────────────────
function generateRandomPokemon() {
    const base = pokemonData.types[Math.floor(Math.random() * pokemonData.types.length)];
    const variation = Math.floor(Math.random() * 21) - 10;
    return { ...base, id: Date.now() + Math.random(), points: Math.max(50, base.points + variation) };
}

function getRarityClass(rarity) { return rarity.toLowerCase(); }

function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Card creation ─────────────────────────────────────────────
function createPokemonCard(pokemon, context = 'collection') {
    const card = document.createElement('div');
    card.className = `pokemon-card ${pokemon.color} ${getRarityClass(pokemon.rarity)}`;
    card.dataset.pokemonId = pokemon.id;

    const portrait  = POKEMON_PORTRAITS[pokemon.name] || '⭐';
    const typeEmoji = TYPE_EMOJIS[pokemon.type] || '';

    let content = `
        <span class="card-portrait">${portrait}</span>
        <h3>${pokemon.name}</h3>
        <div class="type-rarity">${typeEmoji} ${pokemon.type} · ${pokemon.rarity}</div>
        <div class="points"><i data-lucide="trophy"></i><span>${pokemon.points} pts</span></div>
    `;

    if (context === 'teamSelect') {
        const isSelected = gameState.playerTeam.find(p => p.id === pokemon.id);
        if (isSelected) {
            content += '<div class="selected-badge">✓ SELECTED</div>';
            card.classList.add('disabled');
        }
    } else if (context === 'battle') {
        const isUsed     = gameState.usedPlayerPokemon.includes(pokemon.id);
        const isSelected = gameState.selectedPokemon?.id === pokemon.id;
        if (isUsed) {
            card.classList.add('used');
            content += '<div class="status">USED</div><div class="used-overlay">✕</div>';
        } else if (gameState.battleAnimation === 'waiting') {
            card.classList.toggle('selected', !!isSelected);
            content += `<div class="status">${isSelected ? '⚔ SELECTED — tap arena!' : 'Tap to select'}</div>`;
        } else {
            card.classList.add('disabled');
        }
    } else if (context === 'teamDisplay') {
        content += '<div class="status">Tap to remove</div>';
    }

    card.innerHTML = content;

    if (context === 'teamSelect')  card.addEventListener('click', () => selectForTeam(pokemon));
    if (context === 'battle')      card.addEventListener('click', () => selectPokemon(pokemon));
    if (context === 'teamDisplay') card.addEventListener('click', () => removeFromTeam(pokemon));

    return card;
}

function createHiddenPokemonCard(pokemon, isUsed = false) {
    const card = document.createElement('div');
    card.className = `pokemon-card hidden-pokemon${isUsed ? ' used' : ''}`;
    card.innerHTML = `
        <div class="mystery-icon">?</div>
        <h3>Hidden</h3>
        <div class="type-rarity">??? Type</div>
        <div class="points">??? pts</div>
        ${isUsed ? '<div class="status">USED</div><div class="used-overlay">✕</div>' : ''}
    `;
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

    const portrait = POKEMON_PORTRAITS[pokemon.name] || '⭐';
    let content = `
        <span class="card-portrait">${portrait}</span>
        <h3>${pokemon.name}</h3>
        <div class="type">${pokemon.type}</div>
    `;
    if (gameState.showPoints) content += `<div class="points">${pokemon.points} pts</div>`;

    card.innerHTML = content;

    if (gameState.battleAnimation === 'result' && !isWinner && gameState.roundWinner !== 'tie') {
        const x = document.createElement('div');
        x.className = 'defeat-overlay';
        x.textContent = '✕';
        card.appendChild(x);
    }
    return card;
}

// ── Screen management ─────────────────────────────────────────
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    gameState.screen = screenName;
    initializeLucideIcons();
}

function updateCoinsDisplay() {
    const prev = parseInt(elements.coinsAmount.textContent) || 0;
    animateCoinDisplay(prev, gameState.coins);
    elements.buyPokemonBtn.disabled = gameState.coins < 50;
}

// ── Collection screen ─────────────────────────────────────────
function renderCollection() {
    elements.collectionGrid.innerHTML = '';
    gameState.playerCollection.forEach(pokemon => {
        elements.collectionGrid.appendChild(createPokemonCard(pokemon, 'collection'));
    });
    initializeLucideIcons();
}

function buyPokemon() {
    if (gameState.coins < 50) return;
    gameState.coins -= 50;
    const newPokemon = generateRandomPokemon();
    gameState.playerCollection.push(newPokemon);

    // Flash the new card
    updateCoinsDisplay();
    renderCollection();

    // Briefly highlight the last card
    const cards = elements.collectionGrid.querySelectorAll('.pokemon-card');
    const last = cards[cards.length - 1];
    if (last) {
        last.style.transform = 'scale(1.12)';
        last.style.zIndex = '10';
        setTimeout(() => { last.style.transform = ''; last.style.zIndex = ''; }, 400);
    }
}

// ── Team selection ────────────────────────────────────────────
function renderTeamSelection() {
    elements.teamCount.textContent = gameState.playerTeam.length;
    elements.startBattleBtn.disabled = gameState.playerTeam.length !== 3;

    if (gameState.playerTeam.length > 0) {
        elements.selectedTeam.classList.remove('hidden');
        elements.selectedTeamGrid.innerHTML = '';
        gameState.playerTeam.forEach(p => {
            elements.selectedTeamGrid.appendChild(createPokemonCard(p, 'teamDisplay'));
        });
    } else {
        elements.selectedTeam.classList.add('hidden');
    }

    elements.teamSelectionGrid.innerHTML = '';
    gameState.playerCollection.forEach(p => {
        elements.teamSelectionGrid.appendChild(createPokemonCard(p, 'teamSelect'));
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

// ── Battle functions ──────────────────────────────────────────
function startBattle() {
    if (gameState.playerTeam.length !== 3) return;
    gameState.opponentTeam = [generateRandomPokemon(), generateRandomPokemon(), generateRandomPokemon()];
    Object.assign(gameState, {
        currentRound: 1, playerScore: 0, opponentScore: 0,
        usedPlayerPokemon: [], usedOpponentPokemon: [],
        playerThrown: null, opponentThrown: null,
        battleLog: [], battleAnimation: 'waiting',
        showPoints: false, selectedPokemon: null,
        throwingAnimation: false, showRoundResult: false
    });
    showScreen('battle');
    renderBattle();
}

function renderBattle() {
    elements.currentRound.textContent = gameState.currentRound;
    elements.playerScore.textContent  = gameState.playerScore;
    elements.opponentScore.textContent = gameState.opponentScore;
    updateBattleStatus();
    renderBattleArena();

    elements.opponentTeamGrid.innerHTML = '';
    gameState.opponentTeam.forEach(p => {
        elements.opponentTeamGrid.appendChild(
            createHiddenPokemonCard(p, gameState.usedOpponentPokemon.includes(p.id))
        );
    });

    elements.playerTeamGrid.innerHTML = '';
    gameState.playerTeam.forEach(p => {
        elements.playerTeamGrid.appendChild(createPokemonCard(p, 'battle'));
    });
    initializeLucideIcons();
}

function updateBattleStatus() {
    const msgs = {
        waiting:   gameState.selectedPokemon
                     ? `⚡ Tap the arena to throw ${gameState.selectedPokemon.name}!`
                     : '👇 Select a Pokemon below!',
        revealing: '🔥 Pokemon facing off...',
        battle:    '💥 Battle in progress!',
        result:    '🏁 Round complete!'
    };
    elements.battleStatus.textContent = msgs[gameState.battleAnimation] || '';
}

function renderBattleArena() {
    const arena   = elements.battleArena;
    const content = elements.arenaContent;
    arena.className = 'battle-arena';

    if (gameState.selectedPokemon && gameState.battleAnimation === 'waiting') {
        arena.classList.add('ready');
    }

    if (gameState.battleAnimation === 'waiting' && !gameState.throwingAnimation) {
        content.innerHTML = `
            <div class="arena-text">
                <div class="arena-title">⚡ BATTLE ARENA ⚡</div>
                <div class="arena-subtitle">
                    ${gameState.selectedPokemon
                        ? `Tap here to throw ${gameState.selectedPokemon.name}!`
                        : 'Select a Pokemon below'}
                </div>
                ${gameState.selectedPokemon
                    ? `<div class="arena-ready">🎯 READY — TAP TO BATTLE!</div>`
                    : ''}
            </div>`;
        content.className = 'arena-content';

    } else if (gameState.throwingAnimation && gameState.selectedPokemon) {
        const portrait = POKEMON_PORTRAITS[gameState.selectedPokemon.name] || '⭐';
        content.innerHTML = `
            <div class="arena-text">
                <div style="font-size:2.5rem;animation:bounce 0.4s infinite">${portrait}</div>
                <div class="arena-subtitle" style="color:#22c55e;font-weight:800">Flying to battle!</div>
            </div>`;
        content.className = 'arena-content';

    } else if (gameState.playerThrown && gameState.opponentThrown && !gameState.throwingAnimation) {
        const playerCard   = createBattlePokemonCard(gameState.playerThrown, gameState.roundWinner === 'player');
        const opponentCard = createBattlePokemonCard(gameState.opponentThrown, gameState.roundWinner === 'opponent');

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
        const vs = document.createElement('div');
        vs.className = 'vs-text';
        vs.textContent = 'VS';
        content.appendChild(vs);
        content.appendChild(opponentCard);
    }
}

function selectPokemon(pokemon) {
    if (gameState.usedPlayerPokemon.includes(pokemon.id) || gameState.battleAnimation !== 'waiting') return;
    gameState.selectedPokemon = gameState.selectedPokemon?.id === pokemon.id ? null : pokemon;
    renderBattle();
}

// ── Throw animation: fly a card clone from its position into the arena ──
function flyCardToArena(cardEl) {
    return new Promise(resolve => {
        const src = cardEl.getBoundingClientRect();
        const dst = elements.battleArena.getBoundingClientRect();

        // Clone the card for the flight
        const clone = cardEl.cloneNode(true);
        clone.className = 'card-in-flight ' + cardEl.className;
        clone.style.left   = src.left + 'px';
        clone.style.top    = src.top  + 'px';
        clone.style.width  = src.width  + 'px';
        clone.style.height = src.height + 'px';
        document.body.appendChild(clone);

        // Where the card center needs to land (left quadrant of arena = player side)
        const targetCX = dst.left + dst.width * 0.28;
        const targetCY = dst.top  + dst.height * 0.5;

        // Translate from top-left corner of clone to where the center lands
        const srcCX = src.left + src.width  / 2;
        const srcCY = src.top  + src.height / 2;
        const tx = targetCX - srcCX;
        const ty = targetCY - srcCY;

        // Mid-point of arc (card arcs upward and slightly inward before landing)
        const arcX = tx * 0.45;
        const arcY = ty * 0.3 - Math.min(Math.abs(ty) * 0.4, 80);

        // Scale the card up as it enters the arena
        const targetScale = Math.min(
            (dst.height * 0.55) / src.height,
            (dst.width  * 0.38) / src.width,
            2.2
        );

        // Animate with Web Animations API
        const anim = clone.animate([
            {
                transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
                opacity: '1'
            },
            {
                transform: `translate(${arcX}px, ${arcY}px) scale(1.18) rotate(-22deg)`,
                opacity: '1',
                offset: 0.38
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(${targetScale}) rotate(-6deg)`,
                opacity: '1',
                offset: 0.82
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(${targetScale * 0.88}) rotate(-8deg)`,
                opacity: '0'
            }
        ], {
            duration: 580,
            easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
            fill: 'forwards'
        });

        anim.onfinish = () => {
            clone.remove();
            // Flash the arena on impact
            elements.battleArena.classList.add('arena-impact');
            setTimeout(() => elements.battleArena.classList.remove('arena-impact'), 420);
            resolve();
        };
    });
}

// Async throw: animate the card flying, then trigger battle logic
async function throwToBattlefield() {
    if (!gameState.selectedPokemon || gameState.battleAnimation !== 'waiting' || gameState.throwingAnimation) return;

    const pokemon = gameState.selectedPokemon;
    // Lock input immediately
    gameState.throwingAnimation = true;

    // Find the selected card element and animate it into the arena
    const cardEl = elements.playerTeamGrid.querySelector('.pokemon-card.selected');
    if (cardEl) {
        // Dim the source card while it flies
        cardEl.style.opacity = '0.2';
        cardEl.style.transform = 'scale(0.9)';
        await flyCardToArena(cardEl);
        cardEl.style.opacity = '';
        cardEl.style.transform = '';
    }

    // Execute the battle (skip the old 500ms throw delay)
    executeBattle(pokemon);
}

// Core battle resolution (extracted so throwToBattlefield can call it directly)
function executeBattle(pokemon) {
    gameState.playerThrown = pokemon;
    gameState.usedPlayerPokemon.push(pokemon.id);
    gameState.battleAnimation = 'revealing';
    gameState.showPoints = false;
    gameState.throwingAnimation = false;
    gameState.selectedPokemon = null;

    const available = gameState.opponentTeam.filter(p => !gameState.usedOpponentPokemon.includes(p.id));
    const opponentChoice = available[Math.floor(Math.random() * available.length)];
    gameState.opponentThrown = opponentChoice;
    gameState.usedOpponentPokemon.push(opponentChoice.id);

    renderBattle();

    // Show points + battle effect
    setTimeout(() => {
        gameState.showPoints = true;
        gameState.battleAnimation = 'battle';
        renderBattle();
        showBattleEffect(pokemon.type, opponentChoice.type);
    }, 1000);

    // Resolve round
    setTimeout(() => {
        const winner = calculateRoundWinner(pokemon, opponentChoice);
        gameState.roundWinner = winner;
        gameState.battleAnimation = 'result';

        const log = [
            `Round ${gameState.currentRound}: ${pokemon.name} (${pokemon.points}) vs ${opponentChoice.name} (${opponentChoice.points})`
        ];
        if (winner === 'player') {
            gameState.playerScore++;
            log.push(`✓ ${pokemon.name} wins this round!`);
        } else if (winner === 'opponent') {
            gameState.opponentScore++;
            log.push(`✗ ${opponentChoice.name} wins this round!`);
        } else {
            log.push("🤝 It's a tie!");
        }
        gameState.battleLog.push(...log);

        renderBattle();
        showRoundResult();

        const isLast = gameState.currentRound === 3 || gameState.usedPlayerPokemon.length === 3;
        setTimeout(isLast ? endGame : nextRound, 5000);
    }, 5000);
}

// Keep throwPokemon for any direct calls (uses old 500ms delay)
function throwPokemon(pokemon) {
    if (gameState.usedPlayerPokemon.includes(pokemon.id) || gameState.battleAnimation !== 'waiting') return;
    gameState.throwingAnimation = true;
    gameState.selectedPokemon = null;
    renderBattle();
    setTimeout(() => executeBattle(pokemon), 500);
}

function calculateRoundWinner(playerPokemon, opponentPokemon) {
    let pp = playerPokemon.points;
    let op = opponentPokemon.points;
    if (pokemonData.typeAdvantages[playerPokemon.type]?.includes(opponentPokemon.type))   pp += 15;
    if (pokemonData.typeAdvantages[opponentPokemon.type]?.includes(playerPokemon.type))  op += 15;
    return pp > op ? 'player' : op > pp ? 'opponent' : 'tie';
}

function showRoundResult() {
    const { roundResultModal: modal, roundResultTitle: title,
            roundResultPokemon: pokemonDiv, roundResultText: text,
            battleLogElement: log, countdownBar } = elements;

    if (gameState.roundWinner === 'player') {
        title.textContent = '🏆 You Win This Round!';
    } else if (gameState.roundWinner === 'opponent') {
        title.textContent = '💀 Opponent Wins!';
    } else {
        title.textContent = "🤝 It's a Tie!";
    }

    pokemonDiv.innerHTML = '';
    const pCard = createBattlePokemonCard(gameState.playerThrown,   gameState.roundWinner === 'player');
    const oCard = createBattlePokemonCard(gameState.opponentThrown, gameState.roundWinner === 'opponent');
    if (gameState.roundWinner === 'player')   pCard.classList.add('winner');
    if (gameState.roundWinner === 'opponent') oCard.classList.add('winner');
    pokemonDiv.appendChild(pCard);
    pokemonDiv.appendChild(oCard);

    text.textContent = `Round ${gameState.currentRound} complete! ${
        gameState.currentRound < 3 ? 'Next round soon…' : 'Final results coming!'
    }`;

    log.innerHTML = '';
    gameState.battleLog.slice(-3).forEach(entry => {
        const p = document.createElement('p');
        p.textContent = entry;
        log.appendChild(p);
    });

    countdownBar.style.animation = 'none';
    void countdownBar.offsetHeight;
    countdownBar.style.animation = 'countdown 5s linear';

    modal.classList.remove('hidden');
    initializeLucideIcons();
}

function nextRound() {
    elements.roundResultModal.classList.add('hidden');
    gameState.currentRound++;
    Object.assign(gameState, {
        playerThrown: null, opponentThrown: null,
        roundWinner: null, battleAnimation: 'waiting',
        showPoints: false, selectedPokemon: null, throwingAnimation: false
    });
    renderBattle();
}

function endGame() {
    elements.roundResultModal.classList.add('hidden');
    const won    = gameState.playerScore > gameState.opponentScore;
    const isDraw = gameState.playerScore === gameState.opponentScore;

    if (won) { gameState.coins += 100; updateCoinsDisplay(); }

    if (won) {
        elements.gameOverTitle.textContent   = '🏆 Victory!';
        elements.gameOverIcon.textContent    = '🏆';
        elements.gameOverMessage.textContent = 'Incredible! You won the battle and earned 100 coins!';
    } else if (isDraw) {
        elements.gameOverTitle.textContent   = '🤝 Draw!';
        elements.gameOverIcon.textContent    = '🤝';
        elements.gameOverMessage.textContent = "It's a draw! No coins earned this time.";
    } else {
        elements.gameOverTitle.textContent   = '💀 Defeated!';
        elements.gameOverIcon.textContent    = '💀';
        elements.gameOverMessage.textContent = 'Better luck next time! Train harder and try again.';
    }

    elements.finalScore.textContent = `${gameState.playerScore} — ${gameState.opponentScore}`;
    showScreen('gameOver');

    if (won) setTimeout(launchConfetti, 300);
}

function returnToCollection() {
    gameState.playerTeam   = [];
    gameState.opponentTeam = [];
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
}

// ── Event listeners ───────────────────────────────────────────
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

// ── Init ──────────────────────────────────────────────────────
function initGame() {
    for (let i = 0; i < 6; i++) {
        gameState.playerCollection.push(generateRandomPokemon());
    }
    setupEventListeners();
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
    initializeLucideIcons();
    initParticleSystem();
}

document.addEventListener('DOMContentLoaded', initGame);
