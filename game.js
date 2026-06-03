// ── Audio Engine ─────────────────────────────────────────────
const AudioEngine = {
    _enabled: true,
    _volume: 0.5,
    _bgm: null,
    _currentBGMName: null,
    _unlocked: false,
    init() {
        // Global interaction recovery: ensures music plays/changes even if blocked by autoplay
        const handleInteraction = () => {
            this._unlocked = true;
            if (this._currentBGMName && (!this._bgm || this._bgm.paused)) {
                this.playBGM(this._currentBGMName);
            }
        };
        document.addEventListener('click', handleInteraction);
    },
    play(name) {
        if (!this._enabled) return;
        try {
            const el = new Audio(`sounds/${name}.mp3`);
            const volMultiplier = (name === 'card-select') ? 0.6 : 1.0;
            el.volume = this._volume * volMultiplier;
            el.play().catch(() => {
                el.src = `sounds/${name}.wav`;
                el.play().catch(() => {});
            });
        } catch (e) {}
    },
    playBGM(name) {
        if (this._currentBGMName === name && this._bgm && !this._bgm.paused) return;
        // Fade out previous track if it exists
        if (this._bgm) this._fadeOutAndStop(this._bgm);
        
        this._currentBGMName = name;
        if (!this._enabled) return;

        try {
            const el = new Audio(`sounds/${name}.mp3`);
            el.loop = true;
            el.volume = 0; // Start at zero for fade-in
            this._bgm = el;

            const targetVol = this._volume * 0.5;
            el.play().then(() => this._fadeIn(el, targetVol)).catch((err) => {
                if (err.name !== 'NotAllowedError') {
                    // Try fallback to .wav if it's a file error, not a block
                    el.src = `sounds/${name}.wav`;
                    el.play().then(() => this._fadeIn(el, targetVol)).catch(() => { this._bgm = null; });
                } else {
                    this._bgm = null; // Autoplay blocked, handled by handleInteraction
                }
            });
        } catch (e) {}
    },
    stopBGM() {
        if (this._bgm) this._fadeOutAndStop(this._bgm);
        this._bgm = null;
        this._currentBGMName = null;
    },
    _fadeIn(el, targetVol) {
        const step = targetVol / 20; // 20 steps over 1 second
        const timer = setInterval(() => {
            try {
                if (el.volume + step >= targetVol) {
                    el.volume = targetVol;
                    clearInterval(timer);
                } else {
                    el.volume += step;
                }
            } catch (e) { clearInterval(timer); }
        }, 50);
    },
    _fadeOutAndStop(el) {
        const step = el.volume / 16; // 16 steps over 800ms
        const timer = setInterval(() => {
            try {
                if (el.volume - step <= 0) {
                    el.volume = 0;
                    el.pause();
                    clearInterval(timer);
                } else {
                    el.volume -= step;
                }
            } catch (e) { clearInterval(timer); }
        }, 50);
    },
    toggle() {
        this._enabled = !this._enabled;
        if (!this._enabled) this.stopBGM();
        else if (this._currentBGMName) this.playBGM(this._currentBGMName);
        return this._enabled;
    },
    setVolume(v) {
        this._volume = Math.max(0, Math.min(1, v));
    }
};

// ── Pokemon visual data ──────────────────────────────────────
const TYPE_EMOJIS = {
    Fire: '🔥', Water: '💧', Grass: '🌿', Electric: '⚡',
    Rock: '🪨', Psychic: '🔮', Fighting: '👊', Ghost: '👻',
    Dragon: '🐉', Normal: '⭐', Ice: '❄️'
};

const TYPE_ICONS = {
    Fire: 'flame', Water: 'droplets', Grass: 'leaf', Electric: 'zap',
    Rock: 'mountain', Psychic: 'brain', Fighting: 'swords', Ghost: 'ghost',
    Dragon: 'diamond', Normal: 'circle', Ice: 'snowflake',
    Poison: 'droplet', Ground: 'layers', Flying: 'cloud',
    Bug: 'bug', Dark: 'moon', Steel: 'shield', Fairy: 'sparkles'
};

function typeIconHTML(type) {
    const icon = TYPE_ICONS[type] || 'circle';
    return `<i data-lucide="${icon}" class="type-icon"></i>`;
}

let _activeTooltip = null;
let _tooltipTimer  = null;

function buildTypeTooltip(type) {
    const adv    = pokemonData.typeAdvantages[type] || [];
    const status = STATUS_EFFECTS[type];

    const chipsHtml = adv.length
        ? adv.map(t => `<span class="tt-chip">${typeIconHTML(t)} ${t}</span>`).join('')
        : '<span class="tt-no-adv">No type advantage</span>';

    const statusHtml = status
        ? `<div class="tt-status">
               <i data-lucide="${status.icon}" class="status-icon"></i>
               Inflicts <strong>${status.name}</strong> — ${status.desc}
           </div>`
        : '';

    const tip = document.createElement('div');
    tip.className = 'type-tooltip-popup';
    tip.innerHTML = `
        <div class="tt-header">${typeIconHTML(type)} ${type}</div>
        <div class="tt-section-label">Strong vs</div>
        <div class="tt-chips">${chipsHtml}</div>
        ${statusHtml}
    `;
    return tip;
}

function showTypeTooltip(badgeEl, type) {
    hideTypeTooltip();
    const tip = buildTypeTooltip(type);
    tip.style.visibility = 'hidden';
    document.body.appendChild(tip);
    initializeLucideIcons(tip);

    const rect  = badgeEl.getBoundingClientRect();
    const tipW  = tip.offsetWidth;
    const tipH  = tip.offsetHeight;
    let left = rect.right - tipW;
    let top  = rect.top  - tipH - 8;
    if (left < 8) left = 8;
    if (top  < 8) top  = rect.bottom + 8;
    tip.style.left = `${left}px`;
    tip.style.top  = `${top}px`;
    tip.style.visibility = '';
    _activeTooltip = tip;

    _tooltipTimer = setTimeout(hideTypeTooltip, 1500);
}

function hideTypeTooltip() {
    clearTimeout(_tooltipTimer);
    _tooltipTimer = null;
    if (_activeTooltip) { _activeTooltip.remove(); _activeTooltip = null; }
}

const TIER_NAMES = { poke: 'Poke Ball', great: 'Great Ball', ultra: 'Ultra Ball' };

const POKEMON_PORTRAITS = {
    Charmander: '🔥', Charizard: '🦎', Squirtle: '💧', Blastoise: '🐢',
    Bulbasaur: '🌿', Venusaur: '🌱', Gastly: '🌫️', Gengar: '👻',
    Pikachu: '🐭', Geodude: '🪨', Alakazam: '🔮', Machamp: '💪',
    Dragonite: '🐲', Mewtwo: '👾', Snorlax: '😴', Lapras: '🌊',
    Articuno: '🦅', Zapdos: '⚡', Moltres: '🔥',
    Ninetales: '🦊', Vaporeon: '💙', Jolteon: '💛', Flareon: '🧡',
    Gyarados: '🐍', Dragonair: '🐉', Aerodactyl: '🦇', Scyther: '🦗',
    Poliwrath: '🐸', Exeggutor: '🌴', Rhydon: '🦏'
};

const POKEAPI_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const spriteCache = {};

function portraitHTML(nameOrPokemon) {
    const name = typeof nameOrPokemon === 'string' ? nameOrPokemon : nameOrPokemon?.name;
    const directId = typeof nameOrPokemon === 'object' ? nameOrPokemon?.pokedexId : null;
    const lookup = pokemonData.types.find(p => p.name === name);
    const id = directId || lookup?.pokedexId;
    const emoji = POKEMON_PORTRAITS[name] || '⭐';

    if (id) {
        const src = spriteCache[id] || `${POKEAPI_BASE}/${id}.png`;
        return `<span class="card-portrait portrait-wrapper"><img class="api-sprite" src="${src}" alt="${name}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><span class="portrait-fallback" style="display:none">${emoji}</span></span>`;
    }
    return `<span class="card-portrait">${emoji}</span>`;
}

async function preloadSprites() {
    const ids = [...new Set(pokemonData.types.map(p => p.pokedexId).filter(Boolean))];
    const results = await Promise.allSettled(ids.map(id =>
        new Promise(resolve => {
            const img = new Image();
            img.onload = () => { spriteCache[id] = `${POKEAPI_BASE}/${id}.png`; resolve(); };
            img.onerror = resolve;
            img.src = `${POKEAPI_BASE}/${id}.png`;
        })
    ));
}

async function loadRandomPokemonFromAPI() {
    const total = 1010;
    const id = Math.floor(Math.random() * total) + 1;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        const typeName = data.types[0].type.name;
        const type = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        const color = type.toLowerCase();
        const stats = data.stats.reduce((s, st) => s + st.base_stat, 0);
        const points = Math.max(50, Math.min(100, Math.round(stats / 5.5)));
        const tier = stats > 500 ? 'ultra' : stats > 380 ? 'great' : 'poke';
        return {
            name, type, color, points, tier, family: name,
            ability: null, pokedexId: id, id: Date.now() + Math.random()
        };
    } catch { return null; }
}

const TRAINER_NAMES = [
    'Red', 'Blue', 'Gary', 'Misty', 'Brock', 'Lance', 'Cynthia', 'Giovanni',
    'Erika', 'Sabrina', 'Blaine', 'Surge', 'Koga', 'Steven', 'Wallace',
    'Drake', 'Bruno', 'Lorelei', 'Agatha', 'N', 'Iris', 'Alder', 'Diantha',
    'Kukui', 'Leon', 'Raihan', 'Nemona', 'Geeta', 'Penny'
];

// ── Status effects (inflicted by type advantage on the loser) ─
const STATUS_EFFECTS = {
    Fire:     { type: 'burned',    name: 'BURNED',    emoji: '🔥', icon: 'flame',        desc: '−12 pts',   pointMod: -12 },
    Water:    { type: 'soaked',    name: 'SOAKED',    emoji: '💧', icon: 'droplets',     desc: '−8 pts',    pointMod: -8  },
    Grass:    { type: 'seeded',    name: 'SEEDED',    emoji: '🌿', icon: 'leaf',         desc: '−10 pts',   pointMod: -10 },
    Electric: { type: 'paralyzed', name: 'PARALYZED', emoji: '⚡', icon: 'zap',          desc: '50% → 0 pts'             },
    Psychic:  { type: 'confused',  name: 'CONFUSED',  emoji: '🔮', icon: 'brain',        desc: 'pts ±20'                 },
    Ghost:    { type: 'cursed',    name: 'CURSED',    emoji: '👻', icon: 'skull',        desc: '−10 pts',   pointMod: -10 },
    Fighting: { type: 'flinched',  name: 'FLINCHED',  emoji: '👊', icon: 'shield-off',   desc: '−8 pts',    pointMod: -8  },
    Ice:      { type: 'frozen',    name: 'FROZEN',    emoji: '❄️', icon: 'snowflake',    desc: '−15 pts',   pointMod: -15 },
    Rock:     { type: 'stunned',    name: 'STUNNED',    emoji: '🪨', icon: 'x-circle',      desc: '−6 pts',         pointMod: -6  },
    Dragon:   { type: 'crushed',   name: 'CRUSHED',    emoji: '🐉', icon: 'trending-down', desc: '−12 pts',        pointMod: -12 },
    Poison:   { type: 'poisoned',  name: 'POISONED',   emoji: '☠️', icon: 'biohazard',    desc: '−8, then −4',    pointMod: -8  },
    Ground:   { type: 'grounded',  name: 'GROUNDED',   emoji: '⛰️', icon: 'anchor',       desc: '−9 pts',         pointMod: -9  },
    Flying:   { type: 'swept',     name: 'SWEPT',      emoji: '🌬️', icon: 'feather',      desc: '50% chance −14', },
    Bug:      { type: 'swarmed',   name: 'SWARMED',    emoji: '🐛', icon: 'bug',          desc: '−7 pts',         pointMod: -7  },
    Dark:     { type: 'intimidated',name:'INTIMIDATED', emoji: '😰', icon: 'eye-off',      desc: '−11 pts',        pointMod: -11 },
    Steel:    { type: 'impaled',   name: 'IMPALED',    emoji: '⚙️', icon: 'sword',        desc: '−13 pts',        pointMod: -13 },
    Fairy:    { type: 'charmed',   name: 'CHARMED',    emoji: '💖', icon: 'heart',        desc: 'steals 10 pts'   },
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
    Ice:      'rgba(0,188,212,0.55)',
    Poison:   'rgba(156,39,176,0.6)',
    Ground:   'rgba(204,136,0,0.55)',
    Flying:   'rgba(79,195,247,0.55)',
    Bug:      'rgba(139,195,74,0.55)',
    Dark:     'rgba(78,52,46,0.6)',
    Steel:    'rgba(96,125,139,0.55)',
    Fairy:    'rgba(240,98,146,0.6)'
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
    showPoints: false, showPlayerPoints: false, showOpponentPoints: false,
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
        AudioEngine.play('type-advantage');
        createFloatingText(playerCardEl, '+15 ADVANTAGE!', 'advantage');
        createFloatingText(opponentCardEl, 'WEAKNESS!', 'weakness');
    } else if (info.opponentAdv) {
        AudioEngine.play('type-advantage');
        createFloatingText(opponentCardEl, '+15 ADVANTAGE!', 'advantage');
        createFloatingText(playerCardEl, 'WEAKNESS!', 'weakness');
    }

    setTimeout(() => {
        if (info.prevPlayerStatus) {
            AudioEngine.play('status-effect');
            const status = info.prevPlayerStatus;
            if (status.type === 'paralyzed' && info.playerFinal === 0) {
                createFloatingText(playerCardEl, '⚡ PARALYZED (→ 0)', 'weakness');
            } else if (status.pointMod) {
                createFloatingText(playerCardEl, `${status.pointMod} pts (${status.name})`, 'status-minus');
            }
        }
        if (info.prevOpponentStatus) {
            AudioEngine.play('status-effect');
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
    const rect      = targetEl.getBoundingClientRect();
    const arenaRect = elements.battleArena.getBoundingClientRect();

    const iconMap = {
        'advantage':    'trending-up',
        'weakness':     'trending-down',
        'status-minus': 'alert-circle'
    };
    const icon = iconMap[className] || 'zap';

    const el = document.createElement('div');
    el.className = `floating-battle-text float-${className}`;
    el.innerHTML = `<i data-lucide="${icon}" class="float-icon"></i><span>${text}</span>`;

    const x = (rect.left + rect.width / 2) - arenaRect.left;
    const y = rect.top - arenaRect.top + 20;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;

    elements.battleArena.appendChild(el);
    initializeLucideIcons(el);
    setTimeout(() => el.remove(), 3000);
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

        const duration = 2800; // slow, readable counting animation
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
    AudioEngine.play('confetti');
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
    AudioEngine.play('coins');
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
async function generateRandomPokemon() {
    const apiPokemon = await loadRandomPokemonFromAPI();
    if (apiPokemon) {
        const id = apiPokemon.pokedexId;
        if (id && !spriteCache[id]) {
            const img = new Image();
            img.onload = () => { spriteCache[id] = `${POKEAPI_BASE}/${id}.png`; };
            img.src = `${POKEAPI_BASE}/${id}.png`;
        }
        return { ...apiPokemon, id: Date.now() + Math.random() };
    }
    const base = pokemonData.types[Math.floor(Math.random() * pokemonData.types.length)];
    const variation = Math.floor(Math.random() * 21) - 10;
    return { ...base, id: Date.now() + Math.random(), points: Math.max(50, base.points + variation) };
}

function getRarityClass(rarity) { return rarity.toLowerCase(); }

function initializeLucideIcons(container) {
    if (typeof lucide === 'undefined') return;
    lucide.createIcons();
}

// ── Card creation ─────────────────────────────────────────────
function createPokemonCard(pokemon, context = 'collection') {
    const card = document.createElement('div');
    const tierClass = pokemon.tier || 'poke';
    card.className = `pokemon-card ${pokemon.color} ${tierClass}`;
    card.dataset.pokemonId = pokemon.id;

    const crownHtml = tierClass === 'ultra' ? '<i data-lucide="crown" class="crown-icon"></i>' : '';

    let overlayHtml = '';
    if (context === 'teamSelect') {
        const isSelected = gameState.playerTeam.find(p => p.id === pokemon.id);
        if (isSelected) {
            overlayHtml = '<div class="card-overlay overlay-decked"><i data-lucide="check-circle-2"></i></div>';
            card.classList.add('disabled');
        }
    } else if (context === 'battle') {
        const isUsed     = gameState.usedPlayerPokemon.includes(pokemon.id);
        const isSelected = gameState.selectedPokemon?.id === pokemon.id;
        if (isUsed) {
            card.classList.add('used');
            overlayHtml = '<div class="card-overlay overlay-used">✕</div>';
        } else if (gameState.battleAnimation === 'waiting') {
            card.classList.toggle('selected', !!isSelected);
        } else {
            card.classList.add('disabled');
        }
    }

    card.innerHTML = `
        ${crownHtml}
        <div class="card-header"><h3>${pokemon.name}</h3></div>
        <div class="card-portrait-ring">${portraitHTML(pokemon)}</div>
        <div class="card-footer">
            <div class="card-cp"><i data-lucide="zap"></i><span>${pokemon.points}</span></div>
            <div class="card-type-badge" data-type="${pokemon.type}">${typeIconHTML(pokemon.type)}</div>
        </div>
        ${overlayHtml}
    `;

    const badge = card.querySelector('.card-type-badge');
    if (badge) {
        badge.addEventListener('mouseenter', () => showTypeTooltip(badge, pokemon.type));
        badge.addEventListener('mouseleave', hideTypeTooltip);
    }

    if (context === 'teamSelect')  card.addEventListener('click', () => selectForTeam(pokemon));
    if (context === 'battle')      card.addEventListener('click', () => selectPokemon(pokemon));
    if (context === 'teamDisplay') card.addEventListener('click', () => removeFromTeam(pokemon));

    return card;
}

function createCardBack(tier = 'poke') {
    const ballClass = tier === 'ultra' ? 'ultraball' : tier === 'great' ? 'greatball' : 'pokeball';
    const ballLabel = tier === 'ultra' ? 'Ultra' : tier === 'great' ? 'Great' : 'Poke';
    const back = document.createElement('div');
    back.className = `card-back ${ballClass}`;
    back.innerHTML = `<div class="ball-center"></div><div class="ball-label">${ballLabel}</div>`;
    return back;
}

function createBattlePokemonCard(pokemon, isWinner = false, side = 'player', forceFaceDown = false) {
    const isFaceDown = forceFaceDown || ((side === 'player' ? gameState.playerFaceDown : gameState.opponentFaceDown) && gameState.battleAnimation !== 'result');
    const card = document.createElement('div');
    const tierClass = pokemon.tier || 'poke';
    card.className = `battle-pokemon ${side}-side ${pokemon.color} ${tierClass} ${isFaceDown ? 'face-down' : ''}`;

    if (isFaceDown) {
        card.appendChild(createCardBack(pokemon.tier));
        return card;
    }

    const crownHtml  = tierClass === 'ultra' ? '<i data-lucide="crown" class="crown-icon"></i>' : '';

    // ── CP / points section ──────────────────────────────────────
    let cpContent = `<span>${pokemon.points}</span>`;
    let formulaHtml = '';
    let advBadge = '';

    const shouldShowPoints = side === 'player' ? gameState.showPlayerPoints : gameState.showOpponentPoints;
    if (shouldShowPoints) {
        const info = gameState.lastBattleInfo;
        if (info) {
            const hasAdv   = side === 'player' ? info.playerAdv   : info.opponentAdv;
            const hasDisadv= side === 'player' ? info.opponentAdv : info.playerAdv;
            const finalPts = side === 'player' ? info.playerFinal : info.opponentFinal;
            const status   = side === 'player' ? info.prevPlayerStatus : info.prevOpponentStatus;

            let formula = `${pokemon.points}`;
            if (hasAdv) formula += '+15';
            if (status) {
                if (status.type === 'paralyzed' && finalPts === 0) formula = 'PARALYZED→0';
                else if (status.pointMod) formula += `${status.pointMod >= 0 ? '+' : ''}${status.pointMod}`;
            }

            if (hasAdv)   { card.classList.add('has-advantage'); advBadge = `<div class="battle-adv-badge adv"><i data-lucide="flame"></i></div>`; }
            else if (hasDisadv) advBadge = `<div class="battle-adv-badge disadv"><i data-lucide="alert-triangle"></i></div>`;

            cpContent = gameState.battleAnimation === 'battle'
                ? `<span class="animated-points-val" data-start="${pokemon.points}" data-target="${finalPts}">${pokemon.points}</span>`
                : `<span>${finalPts}</span>`;
            formulaHtml = `<div class="battle-formula">(${formula})</div>`;
        }
    }

    card.innerHTML = `
        ${crownHtml}
        ${advBadge}
        <div class="card-header"><h3>${pokemon.name}</h3></div>
        <div class="card-portrait-ring">${portraitHTML(pokemon)}</div>
        <div class="card-footer">
            <div class="card-cp"><i data-lucide="zap"></i>${cpContent}</div>
            <div class="card-type-badge">${typeIconHTML(pokemon.type)}</div>
        </div>
        ${formulaHtml}
    `;

    // Status badge
    const activeStatus = side === 'player' ? gameState.playerStatus : gameState.opponentStatus;
    if (activeStatus) {
        const isResult = gameState.battleAnimation === 'result';
        const iconHtml = activeStatus.icon ? `<i data-lucide="${activeStatus.icon}" class="status-icon"></i>` : '';
        const sb = document.createElement('div');
        sb.className = `status-badge status-${activeStatus.type}`;
        sb.innerHTML = `${iconHtml} ${activeStatus.name}${isResult ? ' next round' : ''}`;
        card.appendChild(sb);
    }

    // Defeat overlay
    if (gameState.battleAnimation === 'result' && gameState.roundWinner !== 'tie' &&
        ((side === 'player' && gameState.roundWinner === 'opponent') || (side === 'opponent' && gameState.roundWinner === 'player'))) {
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

    if (screenName === 'collection') {
        AudioEngine.playBGM('lobby-music');
    } else if (screenName === 'teamSelect') {
        AudioEngine.playBGM('battle-music');
    } else if (screenName === 'gameOver') {
        AudioEngine.stopBGM();
    }
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
        const tierName  = TIER_NAMES[tierClass] || 'Poke Ball';
        const crownHtml = tierClass === 'ultra' ? '<i data-lucide="crown" class="crown-icon"></i>' : '';

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
                                <div class="card-header"><h3>${pokemon.name}</h3></div>
                                <div class="card-portrait-ring">${portraitHTML(pokemon)}</div>
                                <div class="card-footer">
                                    <div class="card-cp"><i data-lucide="zap"></i><span>${pokemon.points}</span></div>
                                    <div class="card-type-badge">${typeIconHTML(pokemon.type)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="reveal-congrats hidden">
                    <div class="reveal-congrats-text"><i data-lucide="party-popper"></i> Congratulations!</div>
                    <div class="reveal-congrats-name">You got <strong>${pokemon.name}</strong>!</div>
                </div>
                <button class="btn btn-blue reveal-ok-btn hidden"><i data-lucide="sparkles"></i> Add to Collection</button>
            </div>
        `;
        document.body.appendChild(modal);
        initializeLucideIcons(modal);

        // Stop float then flip card
        setTimeout(() => modal.querySelector('.reveal-float-wrap').classList.add('stop-float'), 1600);
        setTimeout(() => { modal.querySelector('.reveal-card-inner').classList.add('flipped'); AudioEngine.play('card-flip'); }, 1700);

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
    AudioEngine.play('buy');
    updateCoinsDisplay();

    const newPokemon = await generateRandomPokemon();
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
    const errors = validateDeck(team);
    if (!errors.length) return;
    AudioEngine.play('error');
    showValidationModal(errors[0]);
}

function showValidationModal(message) {
    const existing = document.getElementById('validation-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'validation-modal';
    modal.className = 'validation-modal-overlay';
    modal.innerHTML = `
        <div class="validation-modal-box">
            <div class="validation-modal-header">
                <i data-lucide="alert-triangle" class="validation-modal-icon"></i>
                <span>Deck Error</span>
            </div>
            <div class="validation-modal-body">${message}</div>
            <button class="btn btn-red validation-modal-ok">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    initializeLucideIcons(modal);

    const close = () => {
        modal.classList.add('validation-modal-exit');
        setTimeout(() => modal.remove(), 250);
    };
    modal.querySelector('.validation-modal-ok').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

function selectForTeam(pokemon) {
    if (gameState.playerTeam.find(p => p.id === pokemon.id)) return;
    if (gameState.playerTeam.length >= 6) {
        AudioEngine.play('error');
        return;
    }

    const proposed = [...gameState.playerTeam, pokemon];
    if (validateDeck(proposed).length > 0) {
        syncValidationErrors(proposed);
        return;
    }

    syncValidationErrors(proposed);
    gameState.playerTeam.push(pokemon);
    AudioEngine.play('card-select');
    renderTeamSelection();
}

function removeFromTeam(pokemon) {
    gameState.playerTeam = gameState.playerTeam.filter(p => p.id !== pokemon.id);
    syncValidationErrors(gameState.playerTeam);
    AudioEngine.play('card-select');
    renderTeamSelection();
}

// ── Battle functions ──────────────────────────────────────────
function showFindingOpponentModal(trainerName) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'finding-opponent-modal';
        modal.innerHTML = `
            <div class="finding-modal-content">
                <i data-lucide="search" class="finding-icon"></i>
                <h2 class="finding-title">Finding a strong opponent...</h2>
                <div class="finding-dots"><span></span><span></span><span></span></div>
                <div class="found-reveal hidden">
                    <div class="found-vs"><i data-lucide="swords"></i> VS</div>
                    <div class="found-name">Trainer ${trainerName}</div>
                    <div class="found-sub">Get ready to battle!</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        initializeLucideIcons(modal);

        setTimeout(() => {
            AudioEngine.play('find-opponent');
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

    AudioEngine.play('battle-start');
    // Trigger music change immediately while user interaction is active
    AudioEngine.playBGM('arena-music');

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
        showPoints: false, showPlayerPoints: false, showOpponentPoints: false,
        selectedPokemon: null, throwingAnimation: false, showRoundResult: false,
        playerStatus: null, opponentStatus: null, lastBattleInfo: null,
        usedPlayerAbilities: [],
        usedOpponentAbilities: [],
        playerFaceDown: true,
        opponentFaceDown: true,
        activeTurn: firstTurn,
        whoThrewFirst: firstTurn
    });
    
    resetTurnModal();
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
    initializeLucideIcons(elements.opponentTeamGrid);
    initializeLucideIcons(elements.arenaContent);
    updateStatusIndicators();
}

function updateStatusIndicators() {
    const playerEl   = document.getElementById('player-status-indicator');
    const opponentEl = document.getElementById('opponent-status-indicator');
    if (!playerEl || !opponentEl) return;

    function setIndicator(el, status, label) {
        if (status) {
            const iconHtml = status.icon ? `<i data-lucide="${status.icon}" class="status-icon"></i>` : '';
            el.className = `status-indicator active status-${status.type}`;
            el.innerHTML = `${label} ${iconHtml} <strong>${status.name}</strong> <span class="status-desc">${status.desc}</span>`;
            initializeLucideIcons(el);
        } else {
            el.className = 'status-indicator';
            el.textContent = '';
        }
    }
    setIndicator(playerEl,   gameState.playerStatus,   'YOU');
    setIndicator(opponentEl, gameState.opponentStatus, gameState.opponentName);
}

let _lastShownTurn = null;
let _turnModalTimer = null;

function updateBattleStatus() {
    if (gameState.battleAnimation !== 'waiting') return;
    const key = gameState.activeTurn;
    if (key === _lastShownTurn) return;
    _lastShownTurn = key;
    showTurnModal(key === 'player');
}

function showTurnModal(isPlayer) {
    const existing = document.getElementById('turn-modal');
    if (existing) { existing.remove(); }
    if (_turnModalTimer) { clearTimeout(_turnModalTimer); _turnModalTimer = null; }

    const modal = document.createElement('div');
    modal.id = 'turn-modal';
    modal.className = `turn-modal ${isPlayer ? 'turn-modal-player' : 'turn-modal-opponent'}`;
    modal.innerHTML = isPlayer
        ? `<i data-lucide="zap"></i><span>YOUR TURN</span>`
        : `<i data-lucide="bot"></i><span>${gameState.opponentName}'s TURN</span>`;
    document.getElementById('app').appendChild(modal);
    initializeLucideIcons(modal);

    _turnModalTimer = setTimeout(() => {
        modal.classList.add('turn-modal-exit');
        setTimeout(() => modal.remove(), 300);
        _turnModalTimer = null;
    }, 1500);
}

function resetTurnModal() {
    _lastShownTurn = null;
    const el = document.getElementById('turn-modal');
    if (el) el.remove();
    if (_turnModalTimer) { clearTimeout(_turnModalTimer); _turnModalTimer = null; }
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
                    <div class="arena-title"><i data-lucide="swords"></i> BATTLE ARENA <i data-lucide="swords"></i></div>
                    <div class="arena-subtitle">${gameState.selectedPokemon ? `Tap to throw ${gameState.selectedPokemon.name}!` : 'Select a Pokemon below'}</div>
                    ${gameState.selectedPokemon ? `<div class="arena-ready"><i data-lucide="target"></i> READY</div>` : ''}
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
            spriteHTML = `<div class="slam-sprite">${portraitHTML(gameState.playerThrown)}</div>`;
            titleText  = 'YOU WIN!';
        } else if (winner === 'opponent' && gameState.opponentThrown) {
            spriteHTML = `<div class="slam-sprite">${portraitHTML(gameState.opponentThrown)}</div>`;
            titleText  = `${gameState.opponentName} WINS!`;
        } else {
            const ps = gameState.playerThrown   ? portraitHTML(gameState.playerThrown)   : '';
            const os = gameState.opponentThrown ? portraitHTML(gameState.opponentThrown) : '';
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
                // Player card is already face-up — no reveal animation needed
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
    AudioEngine.play('card-select');
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

        AudioEngine.play('throw-card');
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
            AudioEngine.play('arena-impact');
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
        AudioEngine.play('throw-card');
        await flyCardToArena(cardEl, 'player');
        cardEl.style.opacity = '';
        cardEl.style.transform = '';
    }

    gameState.playerThrown = pokemon;
    gameState.playerFaceDown = false;
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
        AudioEngine.play('throw-card');
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

function animateBattleCardPointsFor(cardEl) {
    if (!cardEl) return;
    cardEl.querySelectorAll('.animated-points-val').forEach(el => {
        const start  = parseInt(el.dataset.start)  || 0;
        const target = parseInt(el.dataset.target) || 0;
        if (start === target) { el.textContent = `${target} pts`; return; }
        const duration = 2200;
        const t0 = performance.now();
        (function update(now) {
            const p = Math.min((now - t0) / duration, 1);
            el.textContent = `${Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)))} pts`;
            if (p < 1) requestAnimationFrame(update);
        })(t0);
    });
}

function triggerFloatingTextsForSide(side, playerCardEl, opponentCardEl, info) {
    if (!info) return;
    const isPlayer  = side === 'player';
    const hasAdv    = isPlayer ? info.playerAdv    : info.opponentAdv;
    const targetEl  = isPlayer ? playerCardEl  : opponentCardEl;
    const otherEl   = isPlayer ? opponentCardEl : playerCardEl;

    if (hasAdv) {
        AudioEngine.play('type-advantage');
        if (targetEl) createFloatingText(targetEl, '+15 ADVANTAGE!', 'advantage');
        if (otherEl)  createFloatingText(otherEl,  'WEAKNESS!',      'weakness');
    }

    const prevStatus = isPlayer ? info.prevPlayerStatus : info.prevOpponentStatus;
    const finalPts   = isPlayer ? info.playerFinal      : info.opponentFinal;
    if (prevStatus) {
        setTimeout(() => {
            AudioEngine.play('status-effect');
            if (prevStatus.type === 'paralyzed' && finalPts === 0) {
                if (targetEl) createFloatingText(targetEl, '⚡ PARALYZED (→ 0)', 'weakness');
            } else if (prevStatus.pointMod) {
                if (targetEl) createFloatingText(targetEl, `${prevStatus.pointMod} pts (${prevStatus.name})`, 'status-minus');
            }
        }, 700);
    }

    const abilityMsg = isPlayer ? info.playerAbilityMsg : info.opponentAbilityMsg;
    if (abilityMsg && targetEl) {
        setTimeout(() => createFloatingText(targetEl, abilityMsg, 'advantage'), 1100);
    }
}

function startClashSequence() {
    gameState.activeTurn        = 'clash';
    gameState.battleAnimation   = 'revealing';
    gameState.showPlayerPoints  = false;
    gameState.showOpponentPoints= false;
    AudioEngine.playBGM('arena-music');
    renderBattle();

    const pokemon       = gameState.playerThrown;
    const opponentChoice= gameState.opponentThrown;
    const winner        = calculateRoundWinner(pokemon, opponentChoice);
    const info          = gameState.lastBattleInfo;
    const playerFirst   = gameState.whoThrewFirst === 'player';

    // ── Helpers ───────────────────────────────────────────────────
    function sideHasEffects(side) {
        if (!info) return false;
        const isPlayer = side === 'player';
        return !!(isPlayer ? (info.playerAdv || info.prevPlayerStatus)
                           : (info.opponentAdv || info.prevOpponentStatus));
    }

    function popCard(cardEl) {
        cardEl?.animate([
            { transform: 'scale(0.93)', opacity: '0.85' },
            { transform: 'scale(1.06)', opacity: '1'    },
            { transform: 'scale(1)',    opacity: '1'    }
        ], { duration: 380, easing: 'cubic-bezier(0.34,1.56,0.64,1)', fill: 'forwards' });
    }

    // ── Determine which sides have effects ────────────────────────
    const firstSide  = playerFirst ? 'player' : 'opponent';
    const secondSide = playerFirst ? 'opponent' : 'player';
    const p1HasFx    = sideHasEffects(firstSide);
    const p2HasFx    = sideHasEffects(secondSide);

    // ── Timing constants ──────────────────────────────────────────
    const FLIP_START = 600;
    const FLIP_DUR   = 650;
    const AFTER_FLIP = FLIP_START + FLIP_DUR + 400; // ~1650ms
    const PHASE_DUR  = 2400;
    const GAP        = 400;

    // Charge starts after all active phases
    const CHARGE = p1HasFx && p2HasFx ? AFTER_FLIP + PHASE_DUR + GAP + PHASE_DUR + GAP
                 : (p1HasFx || p2HasFx) ? AFTER_FLIP + PHASE_DUR + GAP
                 : FLIP_START + FLIP_DUR + 700; // no effects: charge right after flip
    const RESULT_T = CHARGE + 500 + 500 + 900 + 1100 + 600;

    // ── Pre-step: flip opponent face-up ───────────────────────────
    setTimeout(() => {
        gameState.opponentFaceDown   = false;
        gameState.showPlayerPoints   = true;
        gameState.showOpponentPoints = true;
        gameState.battleAnimation    = 'battle';
        renderBattle();
        const oEl = elements.arenaContent.querySelector('.battle-pokemon:last-child');
        oEl?.animate([
            { transform: 'scale(0.8) rotateY(-180deg)', opacity: '0.5' },
            { transform: 'scale(1)   rotateY(0deg)',    opacity: '1'   }
        ], { duration: FLIP_DUR, easing: 'cubic-bezier(0.25,1,0.5,1)', fill: 'forwards' });
        animateBattleCardPointsFor(elements.arenaContent.querySelector('.battle-pokemon:first-child'));
        animateBattleCardPointsFor(elements.arenaContent.querySelector('.battle-pokemon:last-child'));
    }, FLIP_START);

    // ── Phase 1: first thrower's effects (only if it has any) ─────
    if (p1HasFx) {
        setTimeout(() => {
            const pCard = elements.arenaContent.querySelector('.battle-pokemon:first-child');
            const oCard = elements.arenaContent.querySelector('.battle-pokemon:last-child');
            const target = firstSide === 'player' ? pCard : oCard;
            popCard(target);
            triggerFloatingTextsForSide(firstSide, pCard, oCard, info);
            if (info && (info.playerAbilityMsg || info.opponentAbilityMsg)) {
                elements.battleArena.classList.add('arena-ready-pulse');
                setTimeout(() => elements.battleArena.classList.remove('arena-ready-pulse'), 800);
            }
        }, AFTER_FLIP);
    }

    // ── Phase 2: second thrower's effects (only if it has any) ────
    if (p2HasFx) {
        const p2Time = p1HasFx ? AFTER_FLIP + PHASE_DUR + GAP : AFTER_FLIP;
        setTimeout(() => {
            const pCard = elements.arenaContent.querySelector('.battle-pokemon:first-child');
            const oCard = elements.arenaContent.querySelector('.battle-pokemon:last-child');
            const target = secondSide === 'player' ? pCard : oCard;
            popCard(target);
            triggerFloatingTextsForSide(secondSide, pCard, oCard, info);
            if (info && (info.playerAbilityMsg || info.opponentAbilityMsg)) {
                elements.battleArena.classList.add('arena-ready-pulse');
                setTimeout(() => elements.battleArena.classList.remove('arena-ready-pulse'), 800);
            }
        }, p2Time);
    }

    // ── Charge + impact ──────────────────────────────────────────
    setTimeout(() => {
        const playerCardEl   = elements.arenaContent.querySelector('.battle-pokemon:first-child');
        const opponentCardEl = elements.arenaContent.querySelector('.battle-pokemon:last-child');

        [playerCardEl, opponentCardEl].forEach(el => {
            el?.getAnimations().forEach(a => { try { a.commitStyles(); } catch (_) {} a.cancel(); });
        });
        playerCardEl?.classList.remove('revealing');
        opponentCardEl?.classList.remove('revealing');
        playerCardEl?.classList.add('prep-right');
        opponentCardEl?.classList.add('prep-left');
        AudioEngine.play('charge-up');

        setTimeout(() => {
            playerCardEl?.classList.replace('prep-right',  'charge-right');
            opponentCardEl?.classList.replace('prep-left', 'charge-left');

            setTimeout(() => {
                AudioEngine.play('clash');
                showBattleEffect(pokemon.type, opponentChoice.type);
                triggerScreenFlash(winner);

                if (winner === 'player') {
                    opponentCardEl?.classList.remove('charge-left');
                    dissolveIntoLight(opponentCardEl);
                    setTimeout(() => { playerCardEl?.classList.remove('charge-right'); dissolveIntoLight(playerCardEl); }, 900);
                } else if (winner === 'opponent') {
                    playerCardEl?.classList.remove('charge-right');
                    dissolveIntoLight(playerCardEl);
                    setTimeout(() => { opponentCardEl?.classList.remove('charge-left'); dissolveIntoLight(opponentCardEl); }, 900);
                } else {
                    playerCardEl?.classList.remove('charge-right');
                    opponentCardEl?.classList.remove('charge-left');
                    dissolveIntoLight(playerCardEl);
                    dissolveIntoLight(opponentCardEl);
                }
            }, 500);
        }, 500);
    }, CHARGE);

    // ── Result ───────────────────────────────────────────────────
    setTimeout(() => {
        gameState.roundWinner     = winner;
        gameState.battleAnimation = 'result';
        if (info) {
            gameState.playerStatus   = info.newPlayerStatus;
            gameState.opponentStatus = info.newOpponentStatus;
        }

        const log = [`Round ${gameState.currentRound}: ${pokemon.name} (${pokemon.points} CP) vs ${opponentChoice.name} (${opponentChoice.points} CP)`];
        if (info) {
            if (info.playerAdv)       log.push(`🔥 Matchup: ${pokemon.name}'s ${pokemon.type} is Super Effective against ${opponentChoice.name}! (+15 CP)`);
            if (info.opponentAdv)     log.push(`⚡ Matchup: ${opponentChoice.name}'s ${opponentChoice.type} is Super Effective against ${pokemon.name}! (+15 CP)`);
            if (info.playerAbilityMsg)  log.push(info.playerAbilityMsg);
            if (info.opponentAbilityMsg)log.push(info.opponentAbilityMsg);
        }
        if (winner === 'player')   { spawnScoreOrb('player');   AudioEngine.play('round-win');  gameState.playerScore++;   log.push(`✓ ${pokemon.name} wins this round!`); }
        else if (winner === 'opponent') { spawnScoreOrb('opponent'); AudioEngine.play('round-lose'); gameState.opponentScore++; log.push(`✗ ${opponentChoice.name} wins this round!`); }
        else                       { AudioEngine.play('round-draw'); log.push("🤝 It's a tie!"); }

        if (info) {
            if (info.playerMsg)         log.push(info.playerMsg);
            if (info.opponentMsg)       log.push(info.opponentMsg);
            if (info.newOpponentStatus) log.push(`${info.newOpponentStatus.emoji} ${gameState.opponentName}: ${info.newOpponentStatus.name} next round!`);
            if (info.newPlayerStatus)   log.push(`${info.newPlayerStatus.emoji} YOU: ${info.newPlayerStatus.name} next round!`);
        }
        gameState.battleLog.push(...log);
        renderBattle();

        const isLast = gameState.playerScore === 3 || gameState.opponentScore === 3 || gameState.usedPlayerPokemon.length === 6;
        setTimeout(isLast ? endGame : nextRound, 1500);
    }, RESULT_T);
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
        case 'swept': {
            const hit = Math.random() < 0.5;
            const final = hit ? Math.max(1, basePoints - 14) : basePoints;
            return {
                finalPoints: final,
                msg: hit ? `🌬️ SWEPT! −14 pts (${basePoints} → ${final})` : `🌬️ Swept away — landed safely, no effect!`
            };
        }
        case 'charmed': {
            const stolen = Math.min(10, Math.floor(basePoints * 0.15));
            const final  = Math.max(1, basePoints - stolen);
            return {
                finalPoints: final,
                stolen,
                msg: `💖 CHARMED! Stole ${stolen} pts (${basePoints} → ${final})`
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
    AudioEngine.play('dissolve');
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
    AudioEngine.play('score-orb');
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
    AudioEngine.play('ability-trigger');
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

    if (prevPlayer || prevOpponent) {
        // Play status sound if a pre-existing status is affecting the round
        AudioEngine.play('status-effect');
    }

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
    resetTurnModal();
    gameState.currentRound++;
    
    // Whoever won the previous round goes first!
    const nextFirst = (gameState.roundWinner && gameState.roundWinner !== 'tie')
        ? gameState.roundWinner
        : gameState.whoThrewFirst;

    Object.assign(gameState, {
        playerThrown: null, opponentThrown: null,
        roundWinner: null, battleAnimation: 'waiting',
        showPoints: false, showPlayerPoints: false, showOpponentPoints: false,
        selectedPokemon: null, throwingAnimation: false,
        playerFaceDown: true,
        opponentFaceDown: true,
        activeTurn: nextFirst,
        whoThrewFirst: nextFirst
    });
    AudioEngine.playBGM('arena-music');
    renderBattle();
    if (gameState.activeTurn === 'opponent') {
        setTimeout(executeOpponentTurn, 1000);
    }
}

function endGame() {
    elements.roundResultModal.classList.add('hidden');
    const won    = gameState.playerScore > gameState.opponentScore;
    const isDraw = gameState.playerScore === gameState.opponentScore;

    if (won) { AudioEngine.play('victory'); gameState.coins += 100; updateCoinsDisplay(); }

    if (won) {
        elements.gameOverModal.className = 'game-over-modal victory';
        AudioEngine.play('victory');
        elements.gameOverTitle.textContent   = 'VICTORY';
        elements.gameOverIcon.innerHTML = '<i data-lucide="trophy" class="crown-animate"></i>';
        initializeLucideIcons(elements.gameOverIcon);
        elements.gameOverMessage.textContent = 'Incredible! You won the battle and earned 100 coins!';
    } else if (isDraw) {
        elements.gameOverModal.className = 'game-over-modal';
        AudioEngine.play('round-draw');
        elements.gameOverTitle.textContent   = 'Draw!';
        elements.gameOverIcon.innerHTML      = '<i data-lucide="handshake"></i>';
        initializeLucideIcons(elements.gameOverIcon);
        elements.gameOverMessage.textContent = "It's a draw! No coins earned this time.";
    } else {
        elements.gameOverModal.className = 'game-over-modal defeat';
        AudioEngine.play('defeat');
        elements.gameOverTitle.textContent   = 'DEFEATED';
        elements.gameOverIcon.innerHTML = '<i data-lucide="shield-off" class="shield-broken"></i>';
        initializeLucideIcons(elements.gameOverIcon);
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
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => AudioEngine.play('button-click'));
    });

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
    
    const pool = [...pokemonData.types].sort(() => Math.random() - 0.5).slice(0, 6);
    pool.forEach(base => {
        const variation = Math.floor(Math.random() * 21) - 10;
        gameState.playerCollection.push({ ...base, id: Date.now() + Math.random(), points: Math.max(50, base.points + variation) });
    });
    setupEventListeners();
    AudioEngine.init();
    preloadSprites();
    showScreen('collection');
    renderCollection();
    updateCoinsDisplay();
    initParticleSystem();
    initializeLucideIcons();
}

document.addEventListener('DOMContentLoaded', initGame);
