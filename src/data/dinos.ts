export type DinoRarity = 'common' | 'rare' | 'legendary';

export interface Dino {
  id: string;
  name: string;
  emoji: string;
  rarity: DinoRarity;
  xpRequired: number;
  funFact: string;
}

export const DINOS: Dino[] = [
  { id: 'rex', name: 'T-Rex', emoji: '🦖', rarity: 'common', xpRequired: 0, funFact: 'Le T-Rex avait des bras minuscules mais une mâchoire ultra-puissante !' },
  { id: 'bronto', name: 'Brontosaure', emoji: '🦕', rarity: 'common', xpRequired: 100, funFact: 'Le Brontosaure pouvait peser autant que 4 éléphants !' },
  { id: 'tricera', name: 'Tricératops', emoji: '🦏', rarity: 'common', xpRequired: 200, funFact: 'Les 3 cornes du Tricératops pouvaient mesurer 1 mètre !' },
  { id: 'ptero', name: 'Ptérosaure', emoji: '🦅', rarity: 'common', xpRequired: 350, funFact: 'Le Ptérosaure n\'était pas un dinosaure, mais un reptile volant !' },
  { id: 'stego', name: 'Stégosaure', emoji: '🦎', rarity: 'rare', xpRequired: 500, funFact: 'Le cerveau du Stégosaure était aussi petit qu\'une balle de golf !' },
  { id: 'ankylo', name: 'Ankylosaure', emoji: '🐢', rarity: 'rare', xpRequired: 700, funFact: 'L\'Ankylosaure avait une armure si dure qu\'elle pouvait briser des os !' },
  { id: 'raptor', name: 'Vélociraptor', emoji: '🐦', rarity: 'rare', xpRequired: 900, funFact: 'Les Vélociraptors chassaient en groupe comme des loups !' },
  { id: 'spino', name: 'Spinosaure', emoji: '🐊', rarity: 'rare', xpRequired: 1200, funFact: 'Le Spinosaure était plus grand que le T-Rex et adorait nager !' },
  { id: 'diplo', name: 'Diplodocus', emoji: '🐍', rarity: 'rare', xpRequired: 1500, funFact: 'Le cou du Diplodocus mesurait 8 mètres — comme un bus !' },
  { id: 'para', name: 'Parasaurolophus', emoji: '🎺', rarity: 'rare', xpRequired: 1800, funFact: 'Le Parasaurolophus faisait des sons avec sa crête comme une trompette !' },
  { id: 'iguano', name: 'Iguanodon', emoji: '👍', rarity: 'common', xpRequired: 250, funFact: 'L\'Iguanodon avait un pouce en forme de pique pour se défendre !' },
  { id: 'compso', name: 'Compsognathus', emoji: '🐓', rarity: 'common', xpRequired: 150, funFact: 'Le Compsognathus était aussi petit qu\'un poulet !' },
  { id: 'pachycephalo', name: 'Pachycéphalosaurus', emoji: '🪖', rarity: 'rare', xpRequired: 1100, funFact: 'Ce dino se battait en fonçant tête baissée comme un bélier !' },
  { id: 'carno', name: 'Carnotaurus', emoji: '🐂', rarity: 'rare', xpRequired: 1400, funFact: 'Le Carnotaurus avait de vraies cornes et courait à 50 km/h !' },
  { id: 'bary', name: 'Baryonyx', emoji: '🎣', rarity: 'rare', xpRequired: 1600, funFact: 'Le Baryonyx pêchait le poisson avec ses grandes griffes !' },
  { id: 'theri', name: 'Therizinosaurus', emoji: '🦅', rarity: 'legendary', xpRequired: 2000, funFact: 'Ses griffes de 70 cm sont les plus longues de tout le règne animal !' },
  { id: 'argento', name: 'Argentinosaurus', emoji: '🏔️', rarity: 'legendary', xpRequired: 2500, funFact: 'L\'Argentinosaurus est le plus grand animal ayant jamais marché sur Terre !' },
  { id: 'draco', name: 'Dracorex', emoji: '🐉', rarity: 'legendary', xpRequired: 3000, funFact: 'Son nom signifie "roi dragon" — il ressemblait vraiment à un dragon !' },
  { id: 'microraptor', name: 'Microraptor', emoji: '🦋', rarity: 'legendary', xpRequired: 3500, funFact: 'Le Microraptor avait 4 ailes et pouvait planer entre les arbres !' },
  { id: 'yutyrannus', name: 'Yutyrannus', emoji: '❄️', rarity: 'legendary', xpRequired: 4000, funFact: 'Le Yutyrannus était un T-Rex géant… couvert de plumes !' },
];
