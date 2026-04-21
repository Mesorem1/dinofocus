export type MissionType = 'real' | 'ingame';
export type MissionCategory = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Mission {
  id: string;
  type: MissionType;
  category: MissionCategory;
  dinoTitle: string;
  dinoDescription: string;
  realTitle?: string;
  icon: string;
  xpReward: number;
  isCustom?: boolean;
}

export const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', type: 'real', category: 'morning', dinoTitle: 'Nourris ton dino !', dinoDescription: 'Rex a faim ! Brosse tes dents pour lui donner de l\'énergie.', realTitle: 'Se brosser les dents', icon: '🦷', xpReward: 40 },
  { id: 'm2', type: 'real', category: 'morning', dinoTitle: 'Prépare l\'armure !', dinoDescription: 'Ton dino a besoin que tu t\'habilles pour partir à l\'aventure.', realTitle: 'S\'habiller', icon: '👕', xpReward: 30 },
  { id: 'm3', type: 'real', category: 'afternoon', dinoTitle: 'Prépare le repaire !', dinoDescription: 'Un bon dresseur garde son repaire en ordre. Range ta chambre !', realTitle: 'Ranger sa chambre', icon: '🏠', xpReward: 50 },
  { id: 'm4', type: 'real', category: 'afternoon', dinoTitle: 'Entraînement cérébral !', dinoDescription: 'Les dinos les plus forts font leurs devoirs. À toi !', realTitle: 'Faire ses devoirs', icon: '📚', xpReward: 50 },
  { id: 'm5', type: 'real', category: 'evening', dinoTitle: 'Recharge les batteries !', dinoDescription: 'Ton dino se repose mieux quand tu vas au lit à l\'heure.', realTitle: 'Aller se coucher', icon: '🌙', xpReward: 40 },
  { id: 'm6', type: 'real', category: 'anytime', dinoTitle: 'Hydrate ton dino !', dinoDescription: 'Rex adore quand tu bois un grand verre d\'eau !', realTitle: 'Boire de l\'eau', icon: '💧', xpReward: 20 },
  { id: 'm7', type: 'ingame', category: 'anytime', dinoTitle: 'Entraîne ta mémoire !', dinoDescription: 'Joue au jeu de mémoire pour rendre ton dino plus intelligent.', icon: '🧠', xpReward: 25 },
  { id: 'm8', type: 'ingame', category: 'anytime', dinoTitle: 'Chasse aux œufs !', dinoDescription: 'Trouve les œufs cachés pour faire évoluer ton dino.', icon: '🥚', xpReward: 25 },
  { id: 'm9', type: 'ingame', category: 'anytime', dinoTitle: 'Assemble le fossile !', dinoDescription: 'Reconstitue le squelette mystère pour débloquer un nouveau dino.', icon: '🦴', xpReward: 30 },
  { id: 'm10', type: 'real', category: 'morning', dinoTitle: 'Ravitaille ton dino !', dinoDescription: 'Un bon petit-déjeuner donne de l\'énergie à Rex pour la journée.', realTitle: 'Prendre son petit-déjeuner', icon: '🍳', xpReward: 35 },
];
