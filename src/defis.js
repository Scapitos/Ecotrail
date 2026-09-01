// src/defis.js

import { BADGES } from "./config";

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

// Helper pour calculer le badge en fonction des points
export function getBadge(points) {
  return [...BADGES].reverse().find((b) => points >= b.seuil) ?? BADGES[0];
}

// Algorithme de sélection aléatoire des défis
export function pickDefis(typologie, elements) {
  const compatibles = DEFIS.filter((d) => {
    const matchProfil = d.profils.includes(typologie);
    const matchElement =
      !d.elements || d.elements.some((e) => elements.includes(e));
    return matchProfil && matchElement;
  });
  const pool =
    compatibles.length >= 3
      ? compatibles
      : DEFIS.filter((d) => d.profils.includes(typologie));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export const DEFIS = [
  {
    id: "d1",
    titre: "Ramasser 3 déchets",
    categorie: "ecolo",
    difficulte: 1,
    profils: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    explication:
      "Les déchets abandonnés en pleine nature mettent parfois des siècles à se dégrader et menacent la faune locale.",
    remplacement: {
      titre: "Ramasser des déchets dans ta rue pendant 5 minutes",
    },
  },
  {
    id: "d2",
    titre: "Déconstruire un petit barrage",
    categorie: "ecolo",
    difficulte: 2,
    profils: ["foret", "montagne"],
    elements: ["riviere"],
    explication:
      "Les petits barrages artisanaux bloquent la circulation des poissons et perturbent le débit naturel des cours d'eau.",
    remplacement: {
      titre: "Installer un composteur ou commencer à composter tes déchets",
    },
  },
  {
    id: "d3",
    titre: "Identifier une essence d'arbre",
    categorie: "apprentissage",
    difficulte: 1,
    profils: ["foret", "montagne", "campagne"],
    explication:
      "Prends une photo d'un arbre et essaie de l'identifier. Reconnaître les essences locales aide à comprendre l'écosystème que tu traverses.",
    remplacement: {
      titre: "Identifier 3 plantes de ton quartier ou de ton jardin",
    },
  },
  {
    id: "d4",
    titre: "Trouver du romarin",
    categorie: "apprentissage",
    difficulte: 1,
    profils: ["garrigue", "causse"],
    explication:
      "Le romarin est une plante emblématique des milieux secs méditerranéens, adaptée à la sécheresse. Apprendre à la reconnaître, c'est déjà comprendre ce milieu.",
    remplacement: {
      titre: "Tester une recette avec des herbes aromatiques que tu cultives ou achètes en circuit court",

    },
  },
  {
    id: "d5",
    titre: "Observer et noter 3 espèces d'oiseaux marins",
    categorie: "apprentissage",
    difficulte: 2,
    profils: ["littoral"],
    explication:
      "Les oiseaux marins sont de bons indicateurs de la santé du littoral. Les observer, c'est apprendre à lire un écosystème.",
    remplacement: {
      titre: "Regarder un documentaire sur la faune marine et noter 3 choses apprises",
    },
  },
  {
    id: "d6",
    titre: "Repérer une source de pollution lumineuse ou sonore",
    categorie: "ecolo",
    difficulte: 2,
    profils: ["urbaine"],
    explication:
      "En ville, la pollution lumineuse et sonore perturbe la faune nocturne. Apprendre à la repérer, c'est un premier pas pour la limiter.",
    remplacement: {
      titre: "Éteindre toutes les lumières inutiles chez toi ce soir et noter la différence",
    },
  },
  {
    id: "d7",
    titre: "Mesurer la clarté d'un point d'eau",
    categorie: "apprentissage",
    difficulte: 3,
    profils: ["foret", "montagne", "garrigue", "campagne", "causse", "zone_humide"],
    elements: ["riviere", "lac"],
    explication:
      "La clarté de l'eau donne une première idée de sa qualité. Observe, prends une photo, compare avec un point d'eau que tu connais.",
    remplacement: {
      titre: "Réduire ta consommation d'eau aujourd'hui et noter comment",

    },
  },
  {
    id: "d8",
    titre: "Repérer une haie ou une bande fleurie entre deux champs",
    categorie: "apprentissage",
    difficulte: 2,
    profils: ["campagne"],
    explication:
      "Les haies et bandes fleuries abritent des pollinisateurs et des auxiliaires des cultures, essentiels à la biodiversité agricole.",
    remplacement: {
      titre: "Installer une jardinière ou un pot mellifère pour les pollinisateurs chez toi",

    },
  },
  {
    id: "d9",
    titre: "Observer un troupeau et comprendre son rôle sur le paysage",
    categorie: "apprentissage",
    difficulte: 1,
    profils: ["campagne", "causse", "montagne"],
    elements: ["troupeau"],
    explication:
      "Le pastoralisme entretient des paysages ouverts typiques des causses et des montagnes, favorables à une flore spécifique.",
    remplacement: {
      titre: "Te renseigner sur un produit local issu du pastoralisme (fromage, laine) près de chez toi",
    },
  },
  {
    id: "d10",
    titre: "Observer une grotte ou une falaise et repérer une espèce adaptée à la roche",
    categorie: "apprentissage",
    difficulte: 2,
    profils: ["causse", "montagne"],
    elements: ["grotte_falaise"],
    explication:
      "Les milieux rocheux et karstiques abritent des espèces spécialisées (chauves-souris, lichens) adaptées à ces conditions particulières.",
    remplacement: {
      titre: "Te renseigner sur une espèce adaptée aux milieux rocheux et noter 3 informations",
    },
  },
  {
    id: "d11",
    titre: "Observer les espèces typiques d'une zone humide",
    categorie: "apprentissage",
    difficulte: 2,
    profils: ["zone_humide"],
    explication:
      "Batraciens, oiseaux d'eau, libellules... les zones humides comptent parmi les écosystèmes les plus riches en biodiversité, tout en filtrant naturellement l'eau.",
    remplacement: {
      titre: "Regarder un reportage sur les zones humides et noter 3 espèces qu'on y trouve",
    },
  },
  {
    id: "d12",
    titre: "Repérer une trace d'atteinte à la zone humide (drainage, décharge sauvage...)",
    categorie: "ecolo",
    difficulte: 2,
    profils: ["zone_humide"],
    explication:
      "Les zones humides sont parmi les écosystèmes les plus menacés en France, malgré leur rôle essentiel pour l'eau et la biodiversité.",
    remplacement: {
      titre: "Te renseigner sur une association locale de protection des zones humides",
    },
  },
  {
    id: "d13",
    titre: "Photographier des ruines ou un patrimoine bâti et te renseigner sur son histoire",
    categorie: "apprentissage",
    difficulte: 1,
    profils: ["campagne", "causse", "foret", "montagne"],
    elements: ["ruines"],
    explication:
      "Le patrimoine bâti abandonné raconte souvent comment les activités humaines ont façonné le paysage au fil du temps.",
    remplacement: {
      titre: "Te renseigner sur un monument ou lieu historique près de chez toi",
    },
  },
  {
    id: "d14",
    titre: "Identifier une plante adaptée à la sécheresse du causse",
    categorie: "apprentissage",
    difficulte: 1,
    profils: ["causse"],
    explication:
      "Les sols fins et calcaires des causses imposent aux plantes de fortes adaptations à la sécheresse et au vent.",
    remplacement: {
      titre: "Identifier une plante résistante à la sécheresse dans ton jardin ou un espace vert",
    },
  },
];