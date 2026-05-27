// ── Pokemon visual data ──────────────────────────────────────
const POKEMON_PORTRAITS = {
    Charmander: '🔥', Charizard: '🦎', Squirtle: '💧', Blastoise: '🐢',
    Bulbasaur: '🌿', Venusaur: '🌱', Gastly: '🌫️', Gengar: '👻',
    Pikachu: '🐭', Geodude: '🪨', Alakazam: '🔮',
    Machamp: '💪', Dragonite: '🐲', Mewtwo: '👾', Snorlax: '😴',
    Lapras: '🌊', Articuno: '🦅', Zapdos: '⚡', Moltres: '🔥'
};

const TYPE_EMOJIS = {
    Fire: '🔥', Water: '💧', Grass: '🌿', Electric: '⚡',
    Rock: '🪨', Psychic: '🔮', Fighting: '👊', Ghost: '👻',
    Dragon: '🐉', Normal: '⭐', Ice: '❄️'
};

const TIER_NAMES = { poke: 'Poke Ball', great: 'Great Ball', ultra: 'Ultra Ball' };

// Sprite sheet: 6 columns × 3 rows, percentage-based positions
// Row 0: Charmander Charizard Squirtle Blastoise Bulbasaur Venusaur
// Row 1: Gastly Gengar Dragonite Mewtwo Articuno Zapdos
// Row 2: Moltres Pikachu Geodude Alakazam Machamp Lapras
const SPRITE_POSITIONS = {
    Charmander: '0% 0%',   Charizard: '20% 0%',  Squirtle:  '40% 0%',
    Blastoise:  '60% 0%',  Bulbasaur: '80% 0%',  Venusaur:  '100% 0%',
    Gastly:     '0% 50%',  Gengar:    '20% 50%',  Dragonite: '40% 50%',
    Mewtwo:     '60% 50%', Articuno:  '80% 50%',  Zapdos:    '100% 50%',
    Moltres:    '0% 100%', Pikachu:   '20% 100%', Geodude:   '40% 100%',
    Alakazam:   '60% 100%',Machamp:   '80% 100%', Lapras:    '100% 100%'
};

function portraitHTML(name) {
    if (name === 'Snorlax') {
        return `<div class="card-portrait sprite-portrait" style="background-image:url('sprite.png');background-size:500% 300%;background-position:100% 50%"></div>`;
    }
    const pos = SPRITE_POSITIONS[name];
    if (!pos) return `<span class="card-portrait">${POKEMON_PORTRAITS[name] || '⭐'}</span>`;
    return `<div class="card-portrait sprite-portrait" style="background-position:${pos}"></div>`;
}

const TRAINER_NAMES = [
    'Red', 'Blue', 'Gary', 'Misty', 'Brock', 'Lance', 'Cynthia', 'Giovanni',
    'Erika', 'Sabrina', 'Blaine', 'Surge', 'Koga', 'Steven', 'Wallace',
    'Drake', 'Bruno', 'Lorelei', 'Agatha', 'N', 'Iris', 'Alder', 'Diantha',
    'Kukui', 'Leon', 'Raihan', 'Nemona', 'Geeta', 'Penny'
];

// ── Status effects (inflicted by type advantage on the loser) ─
const STATUS_EFFECTS = {
    Fire:     { type: 'burned',    name: 'BURNED',    emoji: '🔥', desc: '−12 pts',      pointMod: -12 },
    Water:    { type: 'soaked',    name: 'SOAKED',    emoji: '💧', desc: '−8 pts',       pointMod: -8  },
    Grass:    { type: 'seeded',    name: 'SEEDED',    emoji: '🌿', desc: '−10 pts',      pointMod: -10 },
    Electric: { type: 'paralyzed', name: 'PARALYZED', emoji: '⚡', desc: '50% → 0 pts'                },
    Psychic:  { type: 'confused',  name: 'CONFUSED',  emoji: '🔮', desc: 'pts ±20'                    },
    Ghost:    { type: 'cursed',    name: 'CURSED',    emoji: '👻', desc: '−10 pts',      pointMod: -10 },
    Fighting: { type: 'flinched',  name: 'FLINCHED',  emoji: '👊', desc: '−8 pts',       pointMod: -8  },
    Ice:      { type: 'frozen',    name: 'FROZEN',    emoji: '❄️', desc: '−15 pts',      pointMod: -15 },
    Rock:     { type: 'stunned',   name: 'STUNNED',   emoji: '🪨', desc: '−6 pts',       pointMod: -6  },
    Dragon:   { type: 'crushed',   name: 'CRUSHED',   emoji: '🐉', desc: '−12 pts',      pointMod: -12 },
    Normal:   null
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
    activeTurn: 'player', // 'player' | 'opponent' | 'clash'
    battleAnimation: 'waiting',
    whoThrewFirst: null,
    showPoints: false,
    throwingAnimation: false,
    showRoundResult: false,
    playerStatus: null,
    opponentStatus: null,
    lastBattleInfo: null,
    usedPlayerAbilities: [],
    usedOpponentAbilities: [],
    playerRating: 1520,
    opponentRating: 1495,
    playerFaceDown: false,
    opponentFaceDown: false,
    opponentName: 'Trainer'
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
    gameOverModal:         document.getElementById('game-over-modal'),
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
    countdownBar:         document.getElementById('countdown-bar'),
    validationErrors:     document.getElementById('validation-errors')
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

    spawnBattleParticles(playerType, opponentType);

    // Shake on every collision, not just heavy types
    document.body.classList.add('shake-screen');
    setTimeout(() => document.body.classList.remove('shake-screen'), 420);
}

// ── Floating Battle Texts ──
function triggerFloatingBattleTexts() {
    const playerCardEl = elements.arenaContent.querySelector('.battle-pokemon:first-child');
    const opponentCardEl = elements.arenaContent.querySelector('.battle-pokemon:last-child');
    const info = gameState.lastBattleInfo;
    if (!info || !playerCardEl || !opponentCardEl) return;

    if (info.playerAdv) {
        createFloatingText(playerCardEl, '+15 ADVANTAGE!', 'advantage');
        createFloatingText(opponentCardEl, 'WEAKNESS!', 'weakness');
    } else if (info.opponentAdv) {
        createFloatingText(opponentCardEl, '+15 ADVANTAGE!', 'advantage');
        createFloatingText(playerCardEl, 'WEAKNESS!', 'weakness');
    }

    setTimeout(() => {
        if (info.prevPlayerStatus) {
            const status = info.prevPlayerStatus;
            if (status.type === 'paralyzed' && info.playerFinal === 0) {
                createFloatingText(playerCardEl, '⚡ PARALYZED (→ 0)', 'weakness');
            } else if (status.pointMod) {
                createFloatingText(playerCardEl, `${status.pointMod} pts (${status.name})`, 'status-minus');
            }
        }
        if (info.prevOpponentStatus) {
            const status = info.prevOpponentStatus;
            if (status.type === 'paralyzed' && info.opponentFinal === 0) {
                createFloatingText(opponentCardEl, '⚡ PARALYZED (→ 0)', 'weakness');
            } else if (status.pointMod) {
                createFloatingText(opponentCardEl, `${status.pointMod} pts (${status.name})`, 'status-minus');
            }
        }
    }, 850);
}

function createFloatingText(targetEl, text, className) {
    const rect = targetEl.getBoundingClientRect();
    const arenaRect = elements.battleArena.getBoundingClientRect();
    
    const el = document.createElement('div');
    el.className = `floating-battle-text float-${className}`;
    el.textContent = text;
    
    const x = (rect.left + rect.width / 2) - arenaRect.left;
    const y = rect.top - arenaRect.top + 15;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    elements.battleArena.appendChild(el);
    setTimeout(() => el.remove(), 1800);
}

function animateBattleCardPoints() {
    const pointElements = elements.arenaContent.querySelectorAll('.animated-points-val');
    pointElements.forEach(el => {
        const start = parseInt(el.dataset.start) || 0;
        const target = parseInt(el.dataset.target) || 0;
        if (start === target) {
            el.textContent = `${target} pts`;
            return;
        }

        const duration = 1400; // 1.4s smooth counting animation
        const startTime = performance.now();

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Smooth deceleration ease-out
            const current = Math.round(start + (target - start) * ease);
            el.textContent = `${current} pts`;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
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

function initializeLucideIcons(container) {
    if (typeof lucide === 'undefined') return;
    if (container) {
        lucide.createIcons({ nodes: Array.from(container.querySelectorAll('[data-lucide]')) });
    } else {
        lucide.createIcons();
    }
}

// ── Card creation ─────────────────────────────────────────────
function createPokemonCard(pokemon, context = 'collection') {
    const card = document.createElement('div');
    const tierClass = pokemon.tier || 'poke';
    card.className = `pokemon-card ${pokemon.color} ${tierClass}`;
    card.dataset.pokemonId = pokemon.id;

    const typeEmoji = TYPE_EMOJIS[pokemon.type] || '';

    // Map tier to friendly Poke Ball names
    const tierName = TIER_NAMES[tierClass] || 'Poke Ball';

    // Crown icon for legendary cards
    const crownHtml = tierClass === 'ultra' ? '<div class="crown-icon">👑</div>' : '';

    // Ability description display
    const abilityHtml = pokemon.ability
        ? `<div class="ability-desc" style="font-size:0.55rem; opacity:0.85; line-height:1.25; padding-top:0.25rem; color:#60a5fa; border-top: 1px dashed rgba(255,255,255,0.1); margin-top:0.2rem;">✨ ${pokemon.ability.name}: ${pokemon.ability.desc}</div>`
        : '';

    let content = `
        ${crownHtml}
        ${portraitHTML(pokemon.name)}
        <h3>${pokemon.name}</h3>
        <div class="type-rarity">${typeEmoji} ${pokemon.type} · ${tierName}</div>
        <div class="points"><i data-lucide="trophy"></i><span>${pokemon.points} CP</span></div>
        ${abilityHtml}
    `;

    if (context === 'teamSelect') {
        const isSelected = gameState.playerTeam.find(p => p.id === pokemon.id);
        if (isSelected) {
            content += '<div class="selected-badge">✓ DECKED</div>';
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

function createCardBack(tier = 'poke') {
    const back = document.createElement('div');
    back.className = `card-back ${tier}`;
    back.innerHTML = `
        <div class="ball-center"></div>
        <div class="ball-label">${tier === 'ultra' ? 'Ultra' : tier === 'great' ? 'Great' : 'Poke'}</div>
    `;
    return back;
}

function createBattlePokemonCard(pokemon, isWinner = false, side = 'player', forceFaceDown = false) {
    const isFaceDown = forceFaceDown || ((side === 'player' ? gameState.playerFaceDown : gameState.opponentFaceDown) && gameState.battleAnimation !== 'result');
    const card = document.createElement('div');
    card.className = `battle-pokemon ${side}-side ${pokemon.color} ${isFaceDown ? 'face-down' : ''}`;

    if (isFaceDown) {
        card.appendChild(createCardBack(pokemon.tier));
        return card;
    }

    let content = `
        ${portraitHTML(pokemon.name)}
        <h3>${pokemon.name}</h3>
        <div class="type">${pokemon.type}</div>
    `;

    if (gameState.showPoints) {
        const info = gameState.lastBattleInfo;
        if (info) {
            const hasAdv = side === 'player' ? info.playerAdv : info.opponentAdv;
            const hasDisadv = side === 'player' ? info.opponentAdv : info.playerAdv;
            const finalPts = side === 'player' ? info.playerFinal : info.opponentFinal;

            // Points Breakdown
            let formula = `${pokemon.points}`;
            if (hasAdv) formula += ` + 15`;
            
            const status = side === 'player' ? info.prevPlayerStatus : info.prevOpponentStatus;
            if (status) {
                if (status.type === 'paralyzed' && finalPts === 0) {
                    formula = `(PARALYZED) 0`;
                } else if (status.pointMod) {
                    formula += ` ${status.pointMod >= 0 ? '+' : ''}${status.pointMod}`;
                }
            }

            // Add advantage/disadvantage badges (only after points are calculated)
            if (hasAdv) {
                card.classList.add('has-advantage');
                content += `<div class="advantage-badge">🔥 ADVANTAGE</div>`;
            } else if (hasDisadv) {
                content += `<div class="disadvantage-badge">⚠️ WEAKNESS</div>`;
            }

            if (gameState.battleAnimation === 'battle') {
                content += `
                    <div class="points points-breakdown-main">
                        <span class="animated-points-val" data-start="${pokemon.points}" data-target="${finalPts}">${pokemon.points} pts</span>
                    </div>
                    <div class="points-breakdown">(${formula})</div>
                `;
            } else {
                content += `
                    <div class="points points-breakdown-main">${finalPts} pts</div>
                    <div class="points-breakdown">(${formula})</div>
                `;
            }
        } else {
            content += `<div class="points">${pokemon.points} pts</div>`;
        }
    }

    // Status badge: show the current active status for this side
    const activeStatus = side === 'player' ? gameState.playerStatus : gameState.opponentStatus;
    if (activeStatus) {
        const isResult = gameState.battleAnimation === 'result';
        const label    = isResult
            ? `${activeStatus.emoji} ${activeStatus.name} next round`
            : `${activeStatus.emoji} ${activeStatus.name}`;
        content += `<div class="status-badge status-${activeStatus.type}">${label}</div>`;
    }

    card.innerHTML = content;

    if (gameState.battleAnimation === 'result' && gameState.roundWinner !== 'tie' && ((side === 'player' && gameState.roundWinner === 'opponent') || (side === 'opponent' && gameState.roundWinner === 'player'))) {
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
    initializeLucideIcons(elements.collectionGrid);
}

function showPokemonRevealModal(pokemon) {
    return new Promise(resolve => {
        const tierClass = pokemon.tier || 'poke';
        const ballClass = tierClass === 'ultra' ? 'ultraball' : tierClass === 'great' ? 'greatball' : 'pokeball';
        const typeEmoji = TYPE_EMOJIS[pokemon.type] || '';
        const tierName  = TIER_NAMES[tierClass] || 'Poke Ball';
        const crownHtml = tierClass === 'ultra' ? '<div class="crown-icon">👑</div>' : '';

        const modal = document.createElement('div');
        modal.className = 'reveal-modal';
        modal.innerHTML = `
            <div class="reveal-content">
                <div class="reveal-card-wrapper">
                    <div class="reveal-float-wrap">
                        <div class="reveal-card-inner">
                            <div class="reveal-card-face reveal-card-front ${pokemon.color} ${tierClass}">
                                <div class="card-back ${ballClass}">
                                    <div class="ball-center"></div>
                                    <div class="ball-label">${tierName}</div>
                                </div>
                            </div>
                            <div class="reveal-card-face reveal-card-back-face ${pokemon.color} ${tierClass}">
                                ${crownHtml}
                                ${portraitHTML(pokemon.name)}
                                <h3>${pokemon.name}</h3>
                                <div class="type-rarity">${typeEmoji} ${pokemon.type} · ${tierName}</div>
                                <div class="points">⚡ ${pokemon.points} CP</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="reveal-congrats hidden">
                    <div class="reveal-congrats-text">🎉 Congratulations!</div>
                    <div class="reveal-congrats-name">You got <strong>${pokemon.name}</strong>!</div>
                </div>
                <button class="btn btn-blue reveal-ok-btn hidden">✨ Add to Collection</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Stop float then flip card
        setTimeout(() => modal.querySelector('.reveal-float-wrap').classList.add('stop-float'), 1600);
        setTimeout(() => modal.querySelector('.reveal-card-inner').classList.add('flipped'), 1700);

        // Show congrats after flip completes
        setTimeout(() => {
            modal.querySelector('.reveal-congrats').classList.remove('hidden');
            modal.querySelector('.reveal-ok-btn').classList.remove('hidden');
        }, 2600);

        modal.querySelector('.reveal-ok-btn').addEventListener('click', () => {
            modal.classList.add('reveal-modal-exit');
            setTimeout(() => { modal.remove(); resolve(); }, 350);
        });
    });
}

async function buyPokemon() {
    if (gameState.coins < 50) return;
    elements.buyPokemonBtn.disabled = true;
    gameState.coins -= 50;
    updateCoinsDisplay();

    const newPokemon = generateRandomPokemon();
    await showPokemonRevealModal(newPokemon);

    gameState.playerCollection.push(newPokemon);
    renderCollection();
    elements.buyPokemonBtn.disabled = gameState.coins < 50;

    const cards = elements.collectionGrid.querySelectorAll('.pokemon-card');
    const last = cards[cards.length - 1];
    if (last) {
        last.style.transform = 'scale(1.12)';
        last.style.zIndex = '10';
        setTimeout(() => { last.style.transform = ''; last.style.zIndex = ''; }, 450);
    }
}

// ── Team selection ────────────────────────────────────────────
function renderTeamSelection() {
    elements.teamCount.textContent = gameState.playerTeam.length;
    elements.startBattleBtn.disabled = gameState.playerTeam.length !== 6;
    
    const pRating = document.getElementById('player-rating-val');
    const oRating = document.getElementById('opponent-rating-val');
    if (pRating) pRating.textContent = gameState.playerRating;
    if (oRating) oRating.textContent = gameState.opponentRating;

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
    initializeLucideIcons(elements.teamSelectionGrid);
    if (gameState.playerTeam.length > 0) initializeLucideIcons(elements.selectedTeamGrid);
}

function validateDeck(proposedTeam) {
    const errors = [];
    
    // Constraint 1: Duplicates & Evolutions (same family)
    const families = {};
    proposedTeam.forEach(p => {
        if (p.family) {
            families[p.family] = (families[p.family] || 0) + 1;
        }
    });
    const dupFamilies = Object.keys(families).filter(f => families[f] > 1);
    if (dupFamilies.length > 0) {
        errors.push(`🚫 Duplicate Family: Cannot use multiple Pokémon from the '${dupFamilies.join(", ")}' family in the same deck.`);
    }
    
    // Constraint 2: Legendaries (Max 2, tier === 'ultra')
    const legendaryCount = proposedTeam.filter(p => p.tier === 'ultra').length;
    if (legendaryCount > 2) {
        errors.push(`👑 Legendary Limit: Maximum of 2 Legendaries allowed in your deck (you selected ${legendaryCount}).`);
    }
    
    return errors;
}

function syncValidationErrors(team) {
    const el = elements.validationErrors;
    if (!el) return;
    const errors = validateDeck(team);
    if (errors.length) {
        el.textContent = errors[0];
        el.classList.remove('hidden');
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = 'shake-error 0.4s ease-in-out';
    } else {
        el.classList.add('hidden');
        el.textContent = '';
    }
}

function selectForTeam(pokemon) {
    if (gameState.playerTeam.find(p => p.id === pokemon.id)) return;
    if (gameState.playerTeam.length >= 6) return;

    const proposed = [...gameState.playerTeam, pokemon];
    if (validateDeck(proposed).length > 0) {
        syncValidationErrors(proposed);
        return;
    }

    syncValidationErrors(proposed);
    gameState.playerTeam.push(pokemon);
    renderTeamSelection();
}

function removeFromTeam(pokemon) {
    gameState.playerTeam = gameState.playerTeam.filter(p => p.id !== pokemon.id);
    syncValidationErrors(gameState.playerTeam);
    renderTeamSelection();
}

// ── Battle functions ──────────────────────────────────────────
function showFindingOpponentModal(trainerName) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'finding-opponent-modal';
        modal.innerHTML = `
            <div class="finding-modal-content">
                <div class="finding-icon">🔍</div>
                <h2 class="finding-title">Finding a strong opponent...</h2>
                <div class="finding-dots"><span></span><span></span><span></span></div>
                <div class="found-reveal hidden">
                    <div class="found-vs">⚔️ VS</div>
                    <div class="found-name">Trainer ${trainerName}</div>
                    <div class="found-sub">Get ready to battle!</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.querySelector('.finding-title').textContent = 'Opponent Found!';
            modal.querySelector('.finding-dots').classList.add('hidden');
            modal.querySelector('.found-reveal').classList.remove('hidden');
        }, 1800);

        setTimeout(() => {
            modal.classList.add('finding-modal-exit');
            setTimeout(() => { modal.remove(); resolve(); }, 400);
        }, 3200);
    });
}

async function startBattle() {
    if (gameState.playerTeam.length !== 6) return;

    const trainerName = TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)];
    gameState.opponentName = trainerName;

    await showFindingOpponentModal(trainerName);

    const banner = document.createElement('div');
    banner.className = 'intro-banner';
    banner.innerHTML = '<h1>BATTLE START</h1>';
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 1200);

    const pool = [...pokemonData.types];
    const cpuTeam = [];
    while (cpuTeam.length < 6 && pool.length > 0) {
        const randIdx = Math.floor(Math.random() * pool.length);
        const candidate = pool[randIdx];

        const hasFamily = cpuTeam.some(p => p.family === candidate.family);
        const legendaryCount = cpuTeam.filter(p => p.tier === 'ultra').length;
        const isLegendary = candidate.tier === 'ultra';
        
        if (!hasFamily && (!isLegendary || legendaryCount < 2)) {
            cpuTeam.push({ ...candidate, id: Date.now() + Math.random() });
        }
        pool.splice(randIdx, 1);
    }
    gameState.opponentTeam = cpuTeam;
    
    // Higher ladder rating goes first
    const firstTurn = gameState.playerRating >= gameState.opponentRating ? 'player' : 'opponent';
    
    Object.assign(gameState, {
        currentRound: 1, playerScore: 0, opponentScore: 0,
        usedPlayerPokemon: [], usedOpponentPokemon: [],
        playerThrown: null, opponentThrown: null,
        battleLog: [], battleAnimation: 'waiting',
        showPoints: false, selectedPokemon: null,
        throwingAnimation: false, showRoundResult: false,
        playerStatus: null, opponentStatus: null, lastBattleInfo: null,
        usedPlayerAbilities: [],
        usedOpponentAbilities: [],
        playerFaceDown: true,
        opponentFaceDown: true,
        activeTurn: firstTurn,
        whoThrewFirst: firstTurn
    });
    
    showScreen('battle');

    // Bench Deal-Out Animation
    renderBattle();
    const playerBench = elements.playerTeamGrid.querySelectorAll('.pokemon-card');
    const opponentBench = elements.opponentTeamGrid.querySelectorAll('.pokemon-card');
    
    [...playerBench, ...opponentBench].forEach((card, i) => {
        card.classList.add('bench-deal-in');
        card.style.animationDelay = `${i * 0.05}s`;
    });

    if (gameState.activeTurn === 'opponent') setTimeout(executeOpponentTurn, 2000);
}

function renderBattle() {
    elements.currentRound.textContent = gameState.currentRound;
    elements.playerScore.textContent  = gameState.playerScore;
    elements.opponentScore.textContent = gameState.opponentScore;
    const n = gameState.opponentName;
    const nameChip  = document.getElementById('opponent-name-chip');
    const nameScore = document.getElementById('opponent-name-score');
    if (nameChip)  nameChip.textContent  = n;
    if (nameScore) nameScore.textContent = n;
    
    const pSection = document.querySelector('.player-section');
    const oSection = document.querySelector('.opponent-section');
    pSection.classList.toggle('active', gameState.activeTurn === 'player');
    oSection.classList.toggle('active', gameState.activeTurn === 'opponent');

    updateBattleStatus();
    renderBattleArena();

    elements.opponentTeamGrid.innerHTML = '';
    gameState.opponentTeam.forEach(p => {
        const isUsed = gameState.usedOpponentPokemon.includes(p.id);
        // Used cards are revealed (face-up + grayed); unused cards stay face-down
        const card = createBattlePokemonCard(p, false, 'opponent', !isUsed);
        if (isUsed) {
            card.classList.add('used');
            const overlay = document.createElement('div');
            overlay.className = 'used-overlay';
            overlay.textContent = '✕';
            card.appendChild(overlay);
        }
        elements.opponentTeamGrid.appendChild(card);
    });

    elements.playerTeamGrid.innerHTML = '';
    gameState.playerTeam.forEach(p => {
        elements.playerTeamGrid.appendChild(createPokemonCard(p, 'battle'));
    });
    initializeLucideIcons(elements.playerTeamGrid);
    updateStatusIndicators();
}

function updateStatusIndicators() {
    const playerEl   = document.getElementById('player-status-indicator');
    const opponentEl = document.getElementById('opponent-status-indicator');
    if (!playerEl || !opponentEl) return;

    function setIndicator(el, status, label) {
        if (status) {
            el.className = `status-indicator active status-${status.type}`;
            el.innerHTML = `${label} ${status.emoji} <strong>${status.name}</strong> <span class="status-desc">${status.desc}</span>`;
        } else {
            el.className = 'status-indicator';
            el.textContent = '';
        }
    }
    setIndicator(playerEl,   gameState.playerStatus,   'YOU');
    setIndicator(opponentEl, gameState.opponentStatus, gameState.opponentName);
}

function updateBattleStatus() {
    if (gameState.activeTurn === 'opponent') {
        elements.battleStatus.textContent = `🤖 ${gameState.opponentName}'s Turn — thinking...`;
        return;
    }

    const msgs = {
        waiting:   gameState.selectedPokemon
                     ? `YOUR TURN! ⚡ Tap the arena to throw ${gameState.selectedPokemon.name}!`
                     : 'YOUR TURN! 👇 Select a Pokemon below!',
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

    if (gameState.activeTurn === 'player' && gameState.selectedPokemon && gameState.battleAnimation === 'waiting') {
        arena.classList.add('ready');
    }

    if (gameState.battleAnimation === 'waiting' && !gameState.throwingAnimation) {
        if (!gameState.playerThrown && !gameState.opponentThrown) {
            content.innerHTML = `
                <div class="arena-text">
                    <div class="arena-title">⚡ BATTLE ARENA ⚡</div>
                    <div class="arena-subtitle">${gameState.selectedPokemon ? `Tap to throw ${gameState.selectedPokemon.name}!` : 'Select a Pokemon below'}</div>
                    ${gameState.selectedPokemon ? `<div class="arena-ready">🎯 READY</div>` : ''}
                </div>`;
            content.className = 'arena-content';
            return;
        }
    }

    if (gameState.battleAnimation === 'result') {
        const winner = gameState.roundWinner;
        const cls    = winner === 'player' ? 'result-win' : winner === 'opponent' ? 'result-lose' : 'result-draw';

        let spriteHTML, titleText;
        if (winner === 'player' && gameState.playerThrown) {
            spriteHTML = `<div class="slam-sprite">${portraitHTML(gameState.playerThrown.name)}</div>`;
            titleText  = 'YOU WIN!';
        } else if (winner === 'opponent' && gameState.opponentThrown) {
            spriteHTML = `<div class="slam-sprite">${portraitHTML(gameState.opponentThrown.name)}</div>`;
            titleText  = `${gameState.opponentName} WINS!`;
        } else {
            const ps = gameState.playerThrown   ? portraitHTML(gameState.playerThrown.name)   : '';
            const os = gameState.opponentThrown ? portraitHTML(gameState.opponentThrown.name) : '';
            spriteHTML = `<div class="slam-sprite slam-sprite-tie">${ps}<span class="slam-vs-tie">VS</span>${os}</div>`;
            titleText  = 'DRAW!';
        }

        content.innerHTML = `
            <div class="round-slam ${cls}">
                <div class="slam-round">ROUND ${gameState.currentRound}</div>
                ${spriteHTML}
                <div class="slam-title">${titleText}</div>
                <div class="slam-score">${gameState.playerScore} <span class="slam-dash">—</span> ${gameState.opponentScore}</div>
            </div>`;
        content.className = 'arena-content';
        return;
    }

    if ((gameState.playerThrown || gameState.opponentThrown) && !gameState.throwingAnimation) {
        content.innerHTML = '';
        content.className = 'battle-vs';

        if (gameState.playerThrown && gameState.opponentThrown) {
            const playerCard = createBattlePokemonCard(gameState.playerThrown, gameState.roundWinner === 'player', 'player');
            const opponentCard = createBattlePokemonCard(gameState.opponentThrown, gameState.roundWinner === 'opponent', 'opponent');

            if (gameState.battleAnimation === 'revealing') {
                playerCard.classList.add('revealing');
                opponentCard.classList.add('revealing');
            }

            content.appendChild(playerCard);
            const vs = document.createElement('div');
            vs.className = 'vs-text';
            vs.textContent = 'VS';
            content.appendChild(vs);
            content.appendChild(opponentCard);
        } else {
            if (gameState.playerThrown) {
                content.appendChild(createBattlePokemonCard(gameState.playerThrown, false, 'player'));
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'arena-placeholder-text';
                placeholder.innerHTML = `<div class="pulse-text">YOUR TURN</div>`;
                content.appendChild(placeholder);
            }

            const vs = document.createElement('div');
            vs.className = 'vs-text';
            vs.textContent = 'VS';
            content.appendChild(vs);

            if (gameState.opponentThrown) {
                content.appendChild(createBattlePokemonCard(gameState.opponentThrown, false, 'opponent'));
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'arena-placeholder-text';
                placeholder.innerHTML = `<div class="pulse-text">${gameState.opponentName.toUpperCase()}...</div>`;
                content.appendChild(placeholder);
            }
        }
    }
}

function selectPokemon(pokemon) {
    if (gameState.usedPlayerPokemon.includes(pokemon.id) || gameState.battleAnimation !== 'waiting') return;
    gameState.selectedPokemon = gameState.selectedPokemon?.id === pokemon.id ? null : pokemon;
    renderBattle();
}

// ── Throw animation: fly a card clone from its position into the arena ──
async function flyCardToArena(cardEl, side = 'player') {
    return new Promise(resolve => {
        const src = cardEl.getBoundingClientRect();
        const dst = elements.battleArena.getBoundingClientRect();

        const clone = cardEl.cloneNode(true);
        clone.className = 'card-in-flight ' + cardEl.className;
        clone.style.left   = src.left + 'px';
        clone.style.top    = src.top  + 'px';
        clone.style.width  = src.width  + 'px';
        clone.style.height = src.height + 'px';
        document.body.appendChild(clone);

        // Where the card center needs to land (left quadrant of arena = player side)
        const targetCX = side === 'player' ? dst.left + dst.width * 0.28 : dst.left + dst.width * 0.72;
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
                transform: `translate(${arcX}px, ${arcY}px) scale(1.18) rotate(${side === 'player' ? -22 : 22}deg)`,
                opacity: '1',
                offset: 0.38
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(${targetScale}) rotate(${side === 'player' ? -6 : 6}deg)`,
                opacity: '1',
                offset: 0.82
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(${targetScale * 0.88}) rotate(${side === 'player' ? -8 : 8}deg)`,
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
    if (gameState.activeTurn !== 'player' || !gameState.selectedPokemon || gameState.throwingAnimation) return;

    const pokemon = gameState.selectedPokemon;
    gameState.throwingAnimation = true;

    const cardEl = elements.playerTeamGrid.querySelector('.pokemon-card.selected');
    if (cardEl) {
        cardEl.style.opacity = '0.2';
        cardEl.style.transform = 'scale(0.9)';
        await flyCardToArena(cardEl, 'player');
        cardEl.style.opacity = '';
        cardEl.style.transform = '';
    }

    gameState.playerThrown = pokemon;
    gameState.usedPlayerPokemon.push(pokemon.id);
    gameState.throwingAnimation = false;
    gameState.selectedPokemon = null;

    if (gameState.opponentThrown) {
        startClashSequence();
    } else {
        gameState.activeTurn = 'opponent';
        renderBattle();
        executeOpponentTurn();
    }
}

async function executeOpponentTurn() {
    if (gameState.activeTurn !== 'opponent') return;
    gameState.throwingAnimation = true;
    updateBattleStatus();
    renderBattle();

    await new Promise(r => setTimeout(r, 1200));

    const available = gameState.opponentTeam.filter(p => !gameState.usedOpponentPokemon.includes(p.id));
    const pokemon = available[Math.floor(Math.random() * available.length)];

    // Find the grid card that matches the chosen pokemon (not just the next card in sequence)
    const pokemonIndex = gameState.opponentTeam.findIndex(p => p.id === pokemon.id);
    const cardEl = elements.opponentTeamGrid.children[pokemonIndex];

    if (cardEl) {
        await flyCardToArena(cardEl, 'opponent');
    }

    gameState.opponentThrown = pokemon;
    gameState.usedOpponentPokemon.push(pokemon.id);
    gameState.throwingAnimation = false;

    if (gameState.playerThrown) {
        startClashSequence();
    } else {
        gameState.activeTurn = 'player';
        renderBattle();
    }
}

function startClashSequence() {
    gameState.activeTurn = 'clash';
    gameState.battleAnimation = 'revealing';
    gameState.showPoints = false;
    renderBattle();

    const pokemon = gameState.playerThrown;
    const opponentChoice = gameState.opponentThrown;
    const winner = calculateRoundWinner(pokemon, opponentChoice);

    setTimeout(() => {
        gameState.playerFaceDown = false;
        gameState.opponentFaceDown = false;
        gameState.showPoints = true;
        gameState.battleAnimation = 'battle';
        renderBattle();

        // 3D Y-Axis Card Flip Animation
        const playerCardEl = elements.arenaContent.querySelector('.battle-pokemon:first-child');
        const opponentCardEl = elements.arenaContent.querySelector('.battle-pokemon:last-child');
        
        playerCardEl?.animate([
            { transform: 'scale(0.8) rotateY(180deg)', opacity: '0.5' },
            { transform: 'scale(1) rotateY(0deg)', opacity: '1' }
        ], { duration: 650, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'forwards' });

        opponentCardEl?.animate([
            { transform: 'scale(0.8) rotateY(-180deg)', opacity: '0.5' },
            { transform: 'scale(1) rotateY(0deg)', opacity: '1' }
        ], { duration: 650, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'forwards' });

        const info = gameState.lastBattleInfo;
        if (info && (info.playerAbilityMsg || info.opponentAbilityMsg)) {
            elements.battleArena.classList.add('arena-ready-pulse');
            setTimeout(() => elements.battleArena.classList.remove('arena-ready-pulse'), 800);
        }

        triggerFloatingBattleTexts();
        animateBattleCardPoints();
    }, 1500);

    setTimeout(() => {
        const playerCardEl = elements.arenaContent.querySelector('.battle-pokemon:first-child');
        const opponentCardEl = elements.arenaContent.querySelector('.battle-pokemon:last-child');

        // Cancel any Web Animations API animations still holding fill:forwards (e.g. the flip).
        // Without this, their fill overrides the subsequent CSS keyframe animations in some browsers,
        // causing the charge to be skipped or appear instant.
        [playerCardEl, opponentCardEl].forEach(el => {
            el?.getAnimations().forEach(a => { try { a.commitStyles(); } catch (_) {} a.cancel(); });
        });

        playerCardEl?.classList.remove('revealing');
        opponentCardEl?.classList.remove('revealing');

        playerCardEl?.classList.add('prep-right');
        opponentCardEl?.classList.add('prep-left');

        setTimeout(() => {
            playerCardEl?.classList.replace('prep-right', 'charge-right');
            opponentCardEl?.classList.replace('prep-left', 'charge-left');

            // fire impact 500ms into the 0.75s charge animation
            setTimeout(() => {
                showBattleEffect(pokemon.type, opponentChoice.type);
                triggerScreenFlash(winner);

                if (winner === 'player') {
                    opponentCardEl?.classList.remove('charge-left');
                    dissolveIntoLight(opponentCardEl);
                    setTimeout(() => {
                        playerCardEl?.classList.remove('charge-right');
                        playerCardEl?.classList.add('return-home');
                    }, 250);
                } else if (winner === 'opponent') {
                    playerCardEl?.classList.remove('charge-right');
                    dissolveIntoLight(playerCardEl);
                    setTimeout(() => {
                        opponentCardEl?.classList.remove('charge-left');
                        opponentCardEl?.classList.add('return-home');
                    }, 250);
                } else {
                    playerCardEl?.classList.remove('charge-right');
                    opponentCardEl?.classList.remove('charge-left');
                    playerCardEl?.classList.add('return-home');
                    opponentCardEl?.classList.add('return-home');
                }
                setTimeout(() => {
                    if (winner === 'player') playerCardEl?.classList.add('winner');
                    else if (winner === 'opponent') opponentCardEl?.classList.add('winner');
                }, 600);
            }, 500);
        }, 500);
    }, 2900);

    setTimeout(() => {
        gameState.roundWinner = winner;
        gameState.battleAnimation = 'result';

        const info = gameState.lastBattleInfo;
        if (info) {
            gameState.playerStatus = info.newPlayerStatus;
            gameState.opponentStatus = info.newOpponentStatus;
        }

        const log = [
            `Round ${gameState.currentRound}: ${pokemon.name} (${pokemon.points} CP) vs ${opponentChoice.name} (${opponentChoice.points} CP)`
        ];
        if (info) {
            if (info.playerAdv) {
                log.push(`🔥 Matchup: ${pokemon.name}'s ${pokemon.type} is Super Effective against ${opponentChoice.name}! (+15 CP)`);
            }
            if (info.opponentAdv) {
                log.push(`⚡ Matchup: ${opponentChoice.name}'s ${opponentChoice.type} is Super Effective against ${pokemon.name}! (+15 CP)`);
            }
            // Add Special Ability Logs
            if (info.playerAbilityMsg)   log.push(info.playerAbilityMsg);
            if (info.opponentAbilityMsg) log.push(info.opponentAbilityMsg);
        }
        
        if (winner === 'player') {
            spawnScoreOrb('player');
            gameState.playerScore++;
            log.push(`✓ ${pokemon.name} wins this round!`);
        } else if (winner === 'opponent') {
            spawnScoreOrb('opponent');
            gameState.opponentScore++;
            log.push(`✗ ${opponentChoice.name} wins this round!`);
        } else {
            log.push("🤝 It's a tie!");
        }

        if (info) {
            if (info.playerMsg)   log.push(info.playerMsg);
            if (info.opponentMsg) log.push(info.opponentMsg);
            if (info.newOpponentStatus) log.push(`${info.newOpponentStatus.emoji} ${gameState.opponentName}: ${info.newOpponentStatus.name} next round!`);
            if (info.newPlayerStatus)   log.push(`${info.newPlayerStatus.emoji} YOU: ${info.newPlayerStatus.name} next round!`);
        }

        gameState.battleLog.push(...log);

        renderBattle();

        // Enforce competitive match limits: first to reach 3 points wins!
        const isLast = gameState.playerScore === 3 || gameState.opponentScore === 3 || gameState.usedPlayerPokemon.length === 6;
        setTimeout(isLast ? endGame : nextRound, 1500);
    }, 5500);
}

function applyStatusEffect(basePoints, status) {
    if (!status) return { finalPoints: basePoints, msg: null };
    switch (status.type) {
        case 'paralyzed': {
            const hit = Math.random() < 0.5;
            return {
                finalPoints: hit ? 0 : basePoints,
                msg: hit ? `⚡ PARALYZED! Points zeroed out!` : `⚡ Paralysis fizzled — no effect!`
            };
        }
        case 'confused': {
            const shift = Math.floor(Math.random() * 41) - 20;
            const final = Math.max(1, basePoints + shift);
            return {
                finalPoints: final,
                msg: `🔮 CONFUSED! Points ${shift >= 0 ? '+' : ''}${shift} (${basePoints} → ${final})`
            };
        }
        default: {
            const mod   = status.pointMod || 0;
            const final = Math.max(1, basePoints + mod);
            return {
                finalPoints: final,
                msg: `${status.emoji} ${status.name}! ${mod} pts (${basePoints} → ${final})`
            };
        }
    }
}

function triggerShockwave(el) {
    if (!el) return;
    const wave = document.createElement('div');
    wave.className = 'ability-shockwave';
    el.appendChild(wave);
    setTimeout(() => wave.remove(), 800);
}

function triggerScreenFlash(winner) {
    const flash = document.createElement('div');
    flash.className = `screen-flash flash-${winner === 'player' ? 'win' : winner === 'opponent' ? 'lose' : 'draw'}`;
    document.getElementById('app').appendChild(flash);
    setTimeout(() => flash.remove(), 800);
}

function dissolveIntoLight(el) {
    if (!el) return;
    el.style.pointerEvents = 'none';
    el.animate([
        { filter: 'brightness(1)  blur(0px)',  transform: 'scale(1)',    opacity: '1'   },
        { filter: 'brightness(5)  blur(1px)',  transform: 'scale(1.12)', opacity: '1',  offset: 0.3  },
        { filter: 'brightness(10) blur(4px)',  transform: 'scale(1.28)', opacity: '0.7',offset: 0.6  },
        { filter: 'brightness(16) blur(10px)', transform: 'scale(1.45)', opacity: '0'               }
    ], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
}

function animateKnockback(el, direction) {
    if (!el) return;
    el.style.pointerEvents = 'none';

    const sideMult = direction === 'right' ? 1 : -1;
    // Randomize exit trajectory: 750-950px distance, -500 to -100px height arc
    const tx = sideMult * (Math.random() * 200 + 750);
    const ty = Math.random() * 400 - 500;
    // Randomize spinning: 3 to 5 full rotations
    const rotation = sideMult * (Math.random() * 720 + 1080);

    el.animate([
        { transform: 'translateX(0) rotate(0) scale(1)', opacity: 1, filter: 'grayscale(0)' },
        {
            transform: `translateX(${sideMult * -45}px) rotate(${sideMult * -18}deg) scale(1.05)`,
            filter: 'brightness(1.8) grayscale(0.5)',
            offset: 0.12
        },
        {
            transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(0.1)`,
            opacity: 0,
            offset: 1
        }
    ], {
        duration: 850,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
    });
}

function spawnScoreOrb(winner) {
    const arena = elements.battleArena.getBoundingClientRect();
    const target = (winner === 'player' ? elements.playerScore : elements.opponentScore).getBoundingClientRect();
    
    const orb = document.createElement('div');
    orb.className = 'score-orb';
    orb.style.left = (arena.left + arena.width / 2) + 'px';
    orb.style.top = (arena.top + arena.height / 2) + 'px';
    document.body.appendChild(orb);
    
    orb.animate([
        { left: orb.style.left, top: orb.style.top, transform: 'scale(1)', opacity: 1 },
        { left: (target.left + target.width/2) + 'px', top: (target.top + target.height/2) + 'px', transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        fill: 'forwards'
    }).onfinish = () => orb.remove();
}

// Resolves a single pokemon's special ability. Returns updated { selfPts, enemyPts, msg, newEnemyStatus }.
function resolveAbility(self, enemy, selfPts, enemyPts, selfAdv, enemyAdv, enemyLabel, usedAbilities) {
    let sp = selfPts, ep = enemyPts, msg = null, newEnemyStatus = null;
    usedAbilities.push(self.name);
    switch (self.name) {
        case 'Mewtwo':
            ep = Math.round(enemy.points / 2);
            msg = `✨ Mewtwo (Pressure): Halves ${enemyLabel} base CP to ${ep}!`;
            break;
        case 'Charizard':
            if (sp < ep) { sp += 25; msg = `✨ Charizard (Blaze): CP is lower! Blaze gives +25 CP (now ${sp} CP)!`; }
            else          {           msg = `✨ Charizard (Blaze): Blaze inactive — CP already higher.`; }
            break;
        case 'Venusaur':
            newEnemyStatus = STATUS_EFFECTS.Grass;
            msg = `✨ Venusaur (Overgrow): Inflicts SEEDED status next round!`;
            break;
        case 'Blastoise':
            ep = Math.max(1, ep - 15);
            msg = `✨ Blastoise (Torrent): Reduces ${enemyLabel} CP by 15 (now ${ep} CP)!`;
            break;
        case 'Pikachu':
            if (Math.random() < 0.5) { ep = 0; msg = `✨ Pikachu (Static): Static PARALYZED ${enemyLabel}! CP reduced to 0!`; }
            else                      {         msg = `✨ Pikachu (Static): Static sparks fizzled.`; }
            break;
        case 'Geodude': {
            // Sturdy reverts any reductions applied to self CP (status debuffs, etc.)
            const diff = self.points + (selfAdv ? 15 : 0) - sp;
            if (diff > 0) { sp += diff; msg = `✨ Geodude (Sturdy): Restored CP to full base! Debuffs negated.`; }
            else          {             msg = `✨ Geodude (Sturdy): CP immune to reductions.`; }
            break;
        }
        case 'Machamp':
            sp += 20; ep += 10;
            msg = `✨ Machamp (No Guard): Gains +20 CP, but ${enemyLabel} gets +10 CP!`;
            break;
        case 'Gastly':
            sp += 8; ep = Math.max(1, ep - 8);
            msg = `✨ Gastly (Spook): Steals 8 CP from the opponent!`;
            break;
        case 'Gengar':
            msg = `✨ Gengar (Shadow Tag): Silenced ${enemyLabel}'s Special Ability!`;
            break;
        case 'Snorlax':
            if (enemy.type === 'Fire' || enemy.type === 'Ice') {
                sp += 20;
                msg = `✨ Snorlax (Thick Fat): Opponent is ${enemy.type}! Thick Fat gives +20 CP!`;
            }
            break;
        case 'Lapras':
            sp += 15;
            if (enemyAdv) { ep -= 15; sp += 15; msg = `✨ Lapras (Water Absorb): Reverses ${enemyLabel} type advantage and gains +30 CP total!`; }
            else          {                      msg = `✨ Lapras (Water Absorb): Gains +15 CP.`; }
            break;
        case 'Bulbasaur':
        case 'Charmander':
        case 'Squirtle': {
            const boost = (self.name === 'Bulbasaur'  && (enemy.type === 'Water' || enemy.type === 'Rock'))
                       || (self.name === 'Charmander' && (enemy.type === 'Grass' || enemy.type === 'Ice'))
                       || (self.name === 'Squirtle'   && (enemy.type === 'Fire'  || enemy.type === 'Rock'));
            if (boost) { sp += 12; msg = `✨ ${self.name} (${self.ability.name}): Counter matchup boost! +12 CP!`; }
            break;
        }
        case 'Dragonite':
            if (enemy.tier === 'ultra') { sp += 30; msg = `✨ Dragonite (Multiscale): Facing a Legendary! Multiscale gives +30 CP!`; }
            else                        {           msg = `✨ Dragonite (Multiscale): Multiscale active.`; }
            break;
        case 'Articuno':
            newEnemyStatus = STATUS_EFFECTS.Ice;
            msg = `✨ Articuno (Pressure-Ice): Freezes ${enemyLabel} medallion benched grid next round (-15 CP)!`;
            break;
        case 'Zapdos':
            if (Math.random() < 0.5) { newEnemyStatus = STATUS_EFFECTS.Electric; msg = `✨ Zapdos (Pressure-Bolt): PARALYZES ${enemyLabel} benched grid next round!`; }
            else                     {                                             msg = `✨ Zapdos (Pressure-Bolt): Pressure Bolts missed benched grid.`; }
            break;
        case 'Moltres':
            newEnemyStatus = STATUS_EFFECTS.Fire;
            msg = `✨ Moltres (Pressure-Flame): Burns ${enemyLabel} medallion benched grid next round (-12 CP)!`;
            break;
    }
    return { selfPts: sp, enemyPts: ep, msg, newEnemyStatus };
}

function calculateRoundWinner(playerPokemon, opponentPokemon) {
    const prevPlayer   = gameState.playerStatus;
    const prevOpponent = gameState.opponentStatus;

    let pp = playerPokemon.points;
    let op = opponentPokemon.points;

    const playerAdv   = pokemonData.typeAdvantages[playerPokemon.type]?.includes(opponentPokemon.type);
    const opponentAdv = pokemonData.typeAdvantages[opponentPokemon.type]?.includes(playerPokemon.type);

    if (playerAdv)   pp += 15;
    if (opponentAdv) op += 15;

    const playerResult   = applyStatusEffect(pp, prevPlayer);
    const opponentResult = applyStatusEffect(op, prevOpponent);
    pp = playerResult.finalPoints;
    op = opponentResult.finalPoints;

    let playerAbilityMsg = null, opponentAbilityMsg = null;
    let newPlayerStatus = null, newOpponentStatus = null;

    const pCanTrigger = playerPokemon.ability && !gameState.usedPlayerAbilities.includes(playerPokemon.name);
    const oCanTrigger = opponentPokemon.ability && !gameState.usedOpponentAbilities.includes(opponentPokemon.name);
    const playerAbilitySilenced  = oCanTrigger && opponentPokemon.name === 'Gengar';
    const opponentAbilitySilenced = pCanTrigger && playerPokemon.name === 'Gengar';

    if (pCanTrigger && !playerAbilitySilenced) {
        const r = resolveAbility(playerPokemon, opponentPokemon, pp, op, playerAdv, opponentAdv, gameState.opponentName, gameState.usedPlayerAbilities);
        pp = r.selfPts; op = r.enemyPts;
        playerAbilityMsg = r.msg; newOpponentStatus = r.newEnemyStatus;
    }

    if (oCanTrigger && !opponentAbilitySilenced) {
        const r = resolveAbility(opponentPokemon, playerPokemon, op, pp, opponentAdv, playerAdv, 'Player', gameState.usedOpponentAbilities);
        op = r.selfPts; pp = r.enemyPts;
        opponentAbilityMsg = r.msg; newPlayerStatus = r.newEnemyStatus;
    }

    // Alakazam swaps run last so they always trump other ability modifications
    if (pCanTrigger && playerPokemon.name === 'Alakazam' && !playerAbilitySilenced) {
        [pp, op] = [op, pp];
        playerAbilityMsg = `✨ Alakazam (Kinesis): Swapped CP values with the opponent!`;
    }
    if (oCanTrigger && opponentPokemon.name === 'Alakazam' && !opponentAbilitySilenced) {
        [op, pp] = [pp, op];
        opponentAbilityMsg = `✨ Alakazam (Kinesis): Swapped CP values with the opponent!`;
    }

    // Determine tiebreaker: forced to lay first wins!
    const winner = pp > op ? 'player' : op > pp ? 'opponent' : gameState.whoThrewFirst;

    gameState.lastBattleInfo = {
        playerMsg:        playerResult.msg,
        opponentMsg:      opponentResult.msg,
        prevPlayerStatus: prevPlayer,
        prevOpponentStatus: prevOpponent,
        newPlayerStatus,
        newOpponentStatus,
        playerAdv,
        opponentAdv,
        playerBase: playerPokemon.points,
        opponentBase: opponentPokemon.points,
        playerFinal: pp,
        opponentFinal: op,
        playerAbilityMsg,
        opponentAbilityMsg
    };

    return winner;
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
    const pCard = createBattlePokemonCard(gameState.playerThrown,   gameState.roundWinner === 'player',   'player');
    const oCard = createBattlePokemonCard(gameState.opponentThrown, gameState.roundWinner === 'opponent', 'opponent');
    if (gameState.roundWinner === 'player')   pCard.classList.add('winner');
    if (gameState.roundWinner === 'opponent') oCard.classList.add('winner');
    pokemonDiv.appendChild(pCard);
    pokemonDiv.appendChild(oCard);

    text.textContent = `Round ${gameState.currentRound} complete! First to 3 points wins the match!`;

    log.innerHTML = '';
    gameState.battleLog.slice(-5).forEach(entry => {
        const p = document.createElement('p');
        p.textContent = entry;
        log.appendChild(p);
    });

    // Status & Ability notifications
    const statusLog = document.getElementById('status-log');
    if (statusLog) {
        statusLog.innerHTML = '';
        const info = gameState.lastBattleInfo;
        if (info) {
            const add = (text, cls, statusType) => {
                const n = document.createElement('div');
                n.className = `status-notification ${cls}${statusType ? ' status-' + statusType : ''}`;
                n.innerHTML = text;
                statusLog.appendChild(n);
            };
            
            // Ability Notifications
            if (info.playerAbilityMsg)
                add(info.playerAbilityMsg, 'triggered', 'psychic');
            if (info.opponentAbilityMsg)
                add(info.opponentAbilityMsg, 'triggered', 'psychic');

            // Status Debuffs
            if (info.prevPlayerStatus && info.playerMsg)
                add(info.playerMsg, 'triggered', info.prevPlayerStatus.type);
            if (info.prevOpponentStatus && info.opponentMsg)
                add(info.opponentMsg, 'triggered', info.prevOpponentStatus.type);
            if (info.newOpponentStatus) {
                const s = info.newOpponentStatus;
                add(`${s.emoji} ${gameState.opponentName}: <strong>${s.name}</strong> next round <span class="status-desc">(${s.desc})</span>`, 'inflicted', s.type);
            }
            if (info.newPlayerStatus) {
                const s = info.newPlayerStatus;
                add(`${s.emoji} YOU: <strong>${s.name}</strong> next round <span class="status-desc">(${s.desc})</span>`, 'inflicted', s.type);
            }
        }
    }

    countdownBar.style.animation = 'none';
    void countdownBar.offsetHeight;
    countdownBar.style.animation = 'countdown 5s linear';

    modal.classList.remove('hidden');
}

function nextRound() {
    gameState.currentRound++;
    
    // Whoever won the previous round goes first!
    const nextFirst = (gameState.roundWinner && gameState.roundWinner !== 'tie')
        ? gameState.roundWinner
        : gameState.whoThrewFirst;

    Object.assign(gameState, {
        playerThrown: null, opponentThrown: null,
        roundWinner: null, battleAnimation: 'waiting',
        showPoints: false, selectedPokemon: null, throwingAnimation: false,
        playerFaceDown: true,
        opponentFaceDown: true,
        activeTurn: nextFirst,
        whoThrewFirst: nextFirst
    });
    renderBattle();
    if (gameState.activeTurn === 'opponent') {
        setTimeout(executeOpponentTurn, 1000);
    }
}

function endGame() {
    elements.roundResultModal.classList.add('hidden');
    const won    = gameState.playerScore > gameState.opponentScore;
    const isDraw = gameState.playerScore === gameState.opponentScore;

    if (won) { gameState.coins += 100; updateCoinsDisplay(); }

    if (won) {
        elements.gameOverModal.className = 'game-over-modal victory';
        elements.gameOverTitle.textContent   = 'VICTORY';
        elements.gameOverIcon.innerHTML = '<span class="crown-animate">🏆</span>';
        elements.gameOverMessage.textContent = 'Incredible! You won the battle and earned 100 coins!';
    } else if (isDraw) {
        elements.gameOverModal.className = 'game-over-modal';
        elements.gameOverTitle.textContent   = '🤝 Draw!';
        elements.gameOverIcon.textContent    = '🤝';
        elements.gameOverMessage.textContent = "It's a draw! No coins earned this time.";
    } else {
        elements.gameOverModal.className = 'game-over-modal defeat';
        elements.gameOverTitle.textContent   = 'DEFEATED';
        elements.gameOverIcon.innerHTML = '<span class="shield-broken">🛡️</span>';
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
    gameState.playerRating = 1400 + Math.floor(Math.random() * 300);
    gameState.opponentRating = 1400 + Math.floor(Math.random() * 300);
    
    for (let i = 0; i < 12; i++) {
        gameState.playerCollection.push(generateRandomPokemon());
    }
    setupEventListeners();
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
    initParticleSystem();
}

document.addEventListener('DOMContentLoaded', initGame);
