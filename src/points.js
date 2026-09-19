// Grille de points selon la difficulté
const POINTS_BY_DIFFICULTY = {
  1: 80,
  2: 100,
  3: 150,
  4: 200,
  5: 300,
};

// Fonction helper pour récupérer automatiquement les points
export function getChallengePoints(difficulty) {
  return POINTS_BY_DIFFICULTY[difficulty] ?? 80; // 80 par défaut si la difficulté est inconnue
}
