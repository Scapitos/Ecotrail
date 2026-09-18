// src/defis.js

import { BADGES } from "./badges";
import { DEFIS } from "./data";


// Helper pour calculer le badge en fonction des points
export function getBadge(points) {
  return [...BADGES].reverse().find((b) => points >= b.seuil) ?? BADGES[0];
}
export function getDefisParIds(ids) {
  return ids.map((id) => DEFIS.find((d) => d.id === id)).filter(Boolean);
}
export function pickDefis(typologie, elements, options) {
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const compatibles = DEFIS.filter((d) => {
    const matchProfil = d.profils.includes(typologie);
    const matchElement = !d.elements || d.elements.some((e) => elements.includes(e));
    const matchOption = !d.options || d.options.some((o) => options.includes(o));
    return matchProfil && matchElement && matchOption;
  });

  const faciles = compatibles.filter((d) => d.difficulte <= 3);
  const difficiles = compatibles.filter((d) => d.difficulte >= 4);

  const poolDifficiles = difficiles.length > 0 ? difficiles : DEFIS.filter((d) => d.difficulte >= 4);
  const poolFaciles = faciles.length >= 2 ? faciles : DEFIS.filter((d) => d.difficulte <= 3);

  // 1. On tire le défi corsé
  const difficileChoisi = shuffle(poolDifficiles)[0];

  const groupesUtilises = new Set();
  if (difficileChoisi?.groupe) groupesUtilises.add(difficileChoisi.groupe);

  // 2. On tire les 2 défis faciles/moyens en évitant les groupes déjà utilisés
  const facilesChoisis = [];
  for (const d of shuffle(poolFaciles)) {
    if (facilesChoisis.length === 2) break;
    if (d.groupe && groupesUtilises.has(d.groupe)) continue;
    facilesChoisis.push(d);
    if (d.groupe) groupesUtilises.add(d.groupe);
  }

  // Filet de sécurité : si les règles de groupe empêchent d'atteindre 2 défis
  // (cas rare, peu de défis compatibles), on complète quand même sans la contrainte
  if (facilesChoisis.length < 2) {
    for (const d of shuffle(poolFaciles)) {
      if (facilesChoisis.length === 2) break;
      if (!facilesChoisis.includes(d)) facilesChoisis.push(d);
    }
  }

  const tirage = difficileChoisi ? [difficileChoisi, ...facilesChoisis] : facilesChoisis;
  return tirage.sort((a, b) => b.difficulte - a.difficulte);
}


