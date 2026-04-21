export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: { missionsCompleted: number; streak: number; gamesWon: number; totalXP: number }) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first_mission', title: 'Premier Pas', description: 'Complète ta première mission', icon: '⭐', condition: (s) => s.missionsCompleted >= 1 },
  { id: 'five_missions', title: 'Chasseur', description: 'Complète 5 missions', icon: '🎯', condition: (s) => s.missionsCompleted >= 5 },
  { id: 'streak_3', title: '3 Jours de Suite', description: 'Reviens 3 jours d\'affilée', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak_7', title: 'Une Semaine !', description: 'Reviens 7 jours d\'affilée', icon: '🌟', condition: (s) => s.streak >= 7 },
  { id: 'first_game', title: 'Joueur', description: 'Gagne ton premier mini-jeu', icon: '🎮', condition: (s) => s.gamesWon >= 1 },
  { id: 'ten_games', title: 'Champion', description: 'Gagne 10 mini-jeux', icon: '🏆', condition: (s) => s.gamesWon >= 10 },
  { id: 'xp_500', title: 'Explorateur', description: 'Atteins 500 XP', icon: '🗺️', condition: (s) => s.totalXP >= 500 },
  { id: 'xp_2000', title: 'Maître Dresseur', description: 'Atteins 2000 XP', icon: '👑', condition: (s) => s.totalXP >= 2000 },
];
