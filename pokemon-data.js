// Pokemon data and type advantages
const pokemonData = {
    types: [
        { name: 'Charizard', type: 'Fire', color: 'fire', points: 85, rarity: 'Rare' },
        { name: 'Blastoise', type: 'Water', color: 'water', points: 80, rarity: 'Rare' },
        { name: 'Venusaur', type: 'Grass', color: 'grass', points: 80, rarity: 'Rare' },
        { name: 'Pikachu', type: 'Electric', color: 'electric', points: 70, rarity: 'Common' },
        { name: 'Geodude', type: 'Rock', color: 'rock', points: 65, rarity: 'Common' },
        { name: 'Alakazam', type: 'Psychic', color: 'psychic', points: 90, rarity: 'Rare' },
        { name: 'Machamp', type: 'Fighting', color: 'fighting', points: 85, rarity: 'Uncommon' },
        { name: 'Gengar', type: 'Ghost', color: 'ghost', points: 75, rarity: 'Uncommon' },
        { name: 'Dragonite', type: 'Dragon', color: 'dragon', points: 95, rarity: 'Legendary' },
        { name: 'Mewtwo', type: 'Psychic', color: 'psychic', points: 100, rarity: 'Legendary' },
        { name: 'Snorlax', type: 'Normal', color: 'normal', points: 78, rarity: 'Uncommon' },
        { name: 'Lapras', type: 'Water', color: 'water', points: 82, rarity: 'Uncommon' },
        { name: 'Articuno', type: 'Ice', color: 'ice', points: 92, rarity: 'Legendary' },
        { name: 'Zapdos', type: 'Electric', color: 'electric', points: 92, rarity: 'Legendary' },
        { name: 'Moltres', type: 'Fire', color: 'fire', points: 92, rarity: 'Legendary' }
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