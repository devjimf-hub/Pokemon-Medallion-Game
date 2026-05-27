// Pokemon data and type advantages
const pokemonData = {
    types: [
        // Fire Family
        { name: 'Charmander', type: 'Fire', color: 'fire', points: 60, tier: 'poke', family: 'Charmander', 
          ability: { name: 'Ember', desc: '+12 CP vs Grass/Ice' } },
        { name: 'Charizard', type: 'Fire', color: 'fire', points: 85, tier: 'great', family: 'Charmander', 
          ability: { name: 'Blaze', desc: '+25 CP if current CP is lower' } },
        
        // Water Family
        { name: 'Squirtle', type: 'Water', color: 'water', points: 60, tier: 'poke', family: 'Squirtle', 
          ability: { name: 'Bubble', desc: '+12 CP vs Fire/Rock' } },
        { name: 'Blastoise', type: 'Water', color: 'water', points: 80, tier: 'great', family: 'Squirtle', 
          ability: { name: 'Torrent', desc: 'Reduces CPU CP by 15' } },
        
        // Grass Family
        { name: 'Bulbasaur', type: 'Grass', color: 'grass', points: 60, tier: 'poke', family: 'Bulbasaur', 
          ability: { name: 'Vine Whip', desc: '+12 CP vs Water/Rock' } },
        { name: 'Venusaur', type: 'Grass', color: 'grass', points: 80, tier: 'great', family: 'Bulbasaur', 
          ability: { name: 'Overgrow', desc: 'Inflicts SEEDED next round' } },
        
        // Ghost Family
        { name: 'Gastly', type: 'Ghost', color: 'ghost', points: 55, tier: 'poke', family: 'Gengar', 
          ability: { name: 'Spook', desc: 'Steals 8 CP from opponent' } },
        { name: 'Gengar', type: 'Ghost', color: 'ghost', points: 82, tier: 'great', family: 'Gengar', 
          ability: { name: 'Shadow Tag', desc: 'Silences opponent special ability' } },

        // Legendaries (Ultra Ball)
        { name: 'Dragonite', type: 'Dragon', color: 'dragon', points: 95, tier: 'ultra', family: 'Dragonite', 
          ability: { name: 'Multiscale', desc: '+30 CP if facing Legendary' } },
        { name: 'Mewtwo', type: 'Psychic', color: 'psychic', points: 100, tier: 'ultra', family: 'Mewtwo', 
          ability: { name: 'Pressure', desc: 'Halves CPU base CP' } },
        { name: 'Articuno', type: 'Ice', color: 'ice', points: 92, tier: 'ultra', family: 'Articuno', 
          ability: { name: 'Pressure-Ice', desc: 'Freezes CPU next round (-15 CP)' } },
        { name: 'Zapdos', type: 'Electric', color: 'electric', points: 92, tier: 'ultra', family: 'Zapdos', 
          ability: { name: 'Pressure-Bolt', desc: '50% chance to PARALYZE CPU next round' } },
        { name: 'Moltres', type: 'Fire', color: 'fire', points: 92, tier: 'ultra', family: 'Moltres', 
          ability: { name: 'Pressure-Flame', desc: 'Burns CPU next round (-12 CP)' } },

        // Others
        { name: 'Pikachu', type: 'Electric', color: 'electric', points: 72, tier: 'poke', family: 'Pikachu', 
          ability: { name: 'Static', desc: '50% chance to PARALYZE (0 CP) on reveal' } },
        { name: 'Geodude', type: 'Rock', color: 'rock', points: 65, tier: 'poke', family: 'Geodude', 
          ability: { name: 'Sturdy', desc: 'Immune to CP reductions' } },
        { name: 'Alakazam', type: 'Psychic', color: 'psychic', points: 88, tier: 'great', family: 'Alakazam', 
          ability: { name: 'Kinesis', desc: 'Swaps CP values with opponent' } },
        { name: 'Machamp', type: 'Fighting', color: 'fighting', points: 85, tier: 'great', family: 'Machamp', 
          ability: { name: 'No Guard', desc: '+20 CP (Opponent gets +10)' } },
        { name: 'Snorlax', type: 'Normal', color: 'normal', points: 78, tier: 'great', family: 'Snorlax', 
          ability: { name: 'Thick Fat', desc: '+20 CP vs Fire or Ice' } },
        { name: 'Lapras', type: 'Water', color: 'water', points: 82, tier: 'great', family: 'Lapras', 
          ability: { name: 'Water Absorb', desc: 'Reverses type disadvantage & +15 CP' } }
    ],
    
    typeAdvantages: {
        Fire: ['Grass', 'Ice'],
        Water: ['Fire', 'Rock'],
        Grass: ['Water', 'Rock'],
        Electric: ['Water'],
        Rock: ['Fire', 'Ice'],
        Psychic: ['Fighting', 'Ghost'],
        Fighting: ['Normal', 'Rock'],
        Ghost: ['Psychic'],
        Dragon: ['Dragon'],
        Normal: [],
        Ice: ['Grass', 'Dragon']
    }
};