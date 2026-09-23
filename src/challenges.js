// src/challenges.js

import { BADGES } from "./badges";
import { CHALLENGES } from "./data";


// Helper pour calculer le badge en fonction des points
export function getBadge(points) {
  return [...BADGES].reverse().find((b) => points >= b.threshold) ?? BADGES[0];
}
export function getChallengesByIds(ids) {
  return ids.map((id) => CHALLENGES.find((c) => c.id === id)).filter(Boolean);
}
export function pickChallenges(typology, elements, options) {
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const compatible = CHALLENGES.filter((c) => {
    const matchProfile = c.profiles.includes(typology);
    const matchElement = !c.elements || c.elements.some((e) => elements.includes(e));
    const matchOption = !c.options || c.options.some((o) => options.includes(o));
    return matchProfile && matchElement && matchOption;
  });

  const easy = compatible.filter((c) => c.difficulty <= 3);
  const hard = compatible.filter((c) => c.difficulty >= 4);

  const hardPool = hard.length > 0 ? hard : CHALLENGES.filter((c) => c.difficulty >= 4);
  const easyPool = easy.length >= 2 ? easy : CHALLENGES.filter((c) => c.difficulty <= 3);

  // 1. On tire le défi corsé
  const chosenHard = shuffle(hardPool)[0];

  const usedGroups = new Set();
  if (chosenHard?.group) usedGroups.add(chosenHard.group);

  // 2. On tire les 2 défis faciles/moyens en évitant les groupes déjà utilisés
  const chosenEasy = [];
  for (const c of shuffle(easyPool)) {
    if (chosenEasy.length === 2) break;
    if (c.group && usedGroups.has(c.group)) continue;
    chosenEasy.push(c);
    if (c.group) usedGroups.add(c.group);
  }

  // Filet de sécurité : si les règles de groupe empêchent d'atteindre 2 défis
  // (cas rare, peu de défis compatibles), on complète quand même sans la contrainte
  if (chosenEasy.length < 2) {
    for (const c of shuffle(easyPool)) {
      if (chosenEasy.length === 2) break;
      if (!chosenEasy.includes(c)) chosenEasy.push(c);
    }
  }

  const selection = chosenHard ? [chosenHard, ...chosenEasy] : chosenEasy;
  return selection.sort((a, b) => b.difficulty - a.difficulty);
}

export function getAlternativeChallenges(currentChallenge, typology, elements, options, otherDisplayedChallenges) {
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const displayedIds = otherDisplayedChallenges.map((c) => c.id);
  const displayedGroups = otherDisplayedChallenges.filter((c) => c.group).map((c) => c.group);

  const compatible = CHALLENGES.filter((c) => {
    if (c.id === currentChallenge.id || displayedIds.includes(c.id)) return false;
    if (c.difficulty !== currentChallenge.difficulty) return false;
    if (c.group && displayedGroups.includes(c.group)) return false;
    const matchProfile = c.profiles.includes(typology);
    const matchElement = !c.elements || c.elements.some((e) => elements.includes(e));
    const matchOption = !c.options || c.options.some((o) => options.includes(o));
    return matchProfile && matchElement && matchOption;
  });

  const pool =
    compatible.length > 0
      ? compatible
      : CHALLENGES.filter(
          (c) => c.difficulty === currentChallenge.difficulty && c.id !== currentChallenge.id && !displayedIds.includes(c.id)
        );

  if (pool.length === 0) return null;
  return shuffle(pool)[0];
}