// Grille de points selon la difficulté
const BAREME_POINTS = {
  1: 80,
  2: 100,
  3: 150,
  4: 200,
  5: 300,
};

// Fonction helper pour récupérer automatiquement les points
export function getPointsDefi(difficulte) {
  return BAREME_POINTS[difficulte] ?? 80; // 80 par défaut si la difficulté est inconnue
}