export const CHALLENGES = [
  {
    id: "d1",
    title: "Ramasser 3 déchets",
    category: "ecolo",
    difficulty: 1,
    group: "dechets",
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    explanation:
      "Les déchets abandonnés en pleine nature mettent parfois des siècles à se dégrader et menacent la faune locale.",

  },
  {
    id: "d2",
    title: "Déconstruire un petit barrage",
    category: "ecolo",
    difficulty: 2,
    profiles: ["foret", "montagne", "campagne"],
    elements: ["riviere"],
    explanation:
      "Les petits barrages artisanaux bloquent la circulation des poissons et perturbent le débit naturel des cours d'eau, créant un réchauffement et une prolifération d'algues.",

  },
  {
    id: "d3",
    title: "Identifier une essence d'arbre",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["foret", "montagne", "campagne", "garrigue"],
    explanation:
      "Prends une photo d'un arbre et essaie de l'identifier. Tu peux utiliser une application d'identification comme PlantNet. Reconnaître les essences locales aide à comprendre l'écosystème que tu traverses.",

  },
  {
    id: "d4",
    title: "Trouver du romarin",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["garrigue", "causse"],
    explanation:
      "Le romarin est une plante emblématique des milieux secs méditerranéens, adaptée à la sécheresse. Apprendre à la reconnaître, c'est déjà comprendre ce milieu.",

  },
  {
    id: "d5",
    title: "Observer et noter 1 espèce d'oiseau marin",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["littoral"],
    explanation:
      "Les oiseaux marins sont de bons indicateurs de la santé du littoral. Les observer, c'est apprendre à lire un écosystème.",

  },
  {
    id: "d6",
    title: "Repérer une source de pollution lumineuse ou sonore",
    category: "ecolo",
    difficulty: 2,
    profiles: ["urbaine"],
    explanation:
      "En ville, la pollution lumineuse et sonore perturbe la faune nocturne. Apprendre à la repérer, c'est un premier pas pour la limiter.",
  },
  {
    id: "d7",
    title: "Mesurer la clarté d'un point d'eau",
    category: "apprentissage",
    difficulty: 3,
    profiles: ["foret", "montagne", "garrigue", "campagne", "causse", "zone_humide"],
    elements: ["riviere", "lac"],
    explanation:
      "La clarté de l'eau donne une première idée de sa qualité. Observe, prends une photo, compare avec un point d'eau que tu connais.",

  },
  {
    id: "d8",
    title: "Repérer une haie ou une bande fleurie entre deux champs",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["campagne"],
    explanation:
      "Les haies et bandes fleuries abritent des pollinisateurs et des auxiliaires des cultures, essentiels à la biodiversité agricole.",
  },
  {
    id: "d9",
    title: "Observer un troupeau et comprendre son rôle sur le paysage",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["campagne", "causse", "montagne"],
    elements: ["troupeau"],
    explanation:
      "Le pastoralisme entretient des paysages ouverts typiques des causses et des montagnes, favorables à une flore spécifique.",
  },
  {
    id: "d10",
    title: "Observer une grotte ou une falaise et repérer une espèce adaptée à la roche",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["causse", "montagne"],
    elements: ["grotte_falaise"],
    explanation:
      "Les milieux rocheux et karstiques abritent des espèces spécialisées (chauves-souris, lichens) adaptées à ces conditions particulières.",
  },
  {
    id: "d11",
    title: "Observer les espèces typiques d'une zone humide",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["zone_humide"],
    explanation:
      "Batraciens, oiseaux d'eau, libellules... les zones humides comptent parmi les écosystèmes les plus riches en biodiversité, tout en filtrant naturellement l'eau.",
  },
  {
    id: "d12",
    title: "Repérer une trace d'atteinte à la zone humide (drainage, décharge sauvage...)",
    category: "ecolo",
    difficulty: 2,
    profiles: ["zone_humide"],
    explanation:
      "Les zones humides sont parmi les écosystèmes les plus menacés en France, malgré leur rôle essentiel pour l'eau et la biodiversité.",

  },
  {
    id: "d13",
    title: "Photographier des ruines ou un patrimoine bâti et te renseigner sur son histoire",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["campagne", "causse", "foret", "montagne"],
    elements: ["ruines"],
    explanation:
      "Le patrimoine bâti abandonné raconte souvent comment les activités humaines ont façonné le paysage au fil du temps.",

  },
  {
    id: "d14",
    title: "Identifier une plante adaptée à la sécheresse du causse",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["causse"],
    explanation:
      "Les sols fins et calcaires des causses imposent aux plantes de fortes adaptations à la sécheresse et au vent.",
  },

  {
    id: "d15",
    title: "Ramasser un sac complet de déchets",
    category: "ecolo",
    difficulty: 4,
    group: "dechets",
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    explanation:
      "Un vrai geste d'impact : prévois un sac et des gants, et nettoie une zone complète plutôt que quelques déchets isolés.",
  },
  {
    id: "d16",
    title: "Réaliser un inventaire de 5 espèces différentes",
    category: "apprentissage",
    difficulty: 4,
    profiles: ["foret", "montagne", "garrigue", "causse", "campagne", "zone_humide"],
    explanation:
      "Observe et identifie au moins 5 espèces (plantes, insectes, oiseaux...) sur ton parcours — un vrai exercice de naturaliste.",
  },
  {
    id: "d17",
    title: "Nettoyer 50 mètres de plage et trier les déchets par type",
    category: "ecolo",
    difficulty: 5,
    group: "dechets",
    profiles: ["littoral"],
    explanation:
      "Le tri par type (plastique, verre, mégots...) donne une vraie idée des sources de pollution locales.",
  },

    {
    id: "d18",
    title: "Choisir un emplacement de bivouac à faible impact",
    category: "ecolo",
    difficulty: 2,
    profiles: ["foret", "montagne", "garrigue", "causse", "campagne", "littoral", "zone_humide"],
    options: ["bivouac"],
    explanation:
      "Un bon emplacement de bivouac ne nécessite ni de creuser, ni de couper de végétation, ni de faire de feu à même le sol : on ne laisse aucune trace.",
  },
  {
    id: "d19",
    title: "Ramasser et emporter les déjections de ton chien",
    category: "ecolo",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["chien"],
    explanation:
      "Les déjections canines polluent les sols et peuvent transmettre des maladies à la faune sauvage si elles ne sont pas ramassées.",
  },
  {
    id: "d20",
    title: "Jouer à un jeu d'observation nature en famille",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "Chercher ensemble 5 formes différentes dans la nature (feuilles, cailloux, nuages...) est une façon ludique d'éveiller les enfants à leur environnement.",
  },
    {
    id: "d21",
    title: "Repérer un aménagement favorable à la biodiversité urbaine",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine"],
    explanation:
      "Nichoir, hôtel à insectes, passage à hérisson, mur végétalisé... la ville peut aussi accueillir la faune si on lui laisse une place.",
  },
  {
    id: "d22",
    title: "Se déplacer sans voiture pendant toute la sortie",
    category: "ecolo",
    difficulty: 2,
    profiles: ["urbaine", "campagne"],
    options: ["famille"],
    explanation:
      "Marche, vélo ou transports en commun : réduire l'usage de la voiture est l'un des gestes les plus efficaces pour limiter son impact carbone au quotidien.",
  },
  {
    id: "d23",
    title: "Repérer un compost ou un jardin partagé",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine", "campagne"],
    explanation:
      "Les composts collectifs et jardins partagés recréent du lien entre citadins et cycle naturel de la matière organique.",
  },
  {
    id: "d24",
    title: "Observer la laisse de mer sans la piétiner",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["littoral"],
    explanation:
      "La laisse de mer (algues, coquillages échoués) abrite de nombreux invertébrés et nourrit les oiseaux du littoral : elle ne doit pas être ramassée.",
  },
  {
    id: "d25",
    title: "Identifier une espèce de coquillage",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["littoral"],
    explanation:
      "Chaque coquillage renseigne sur l'espèce qui l'a produit et sur la santé du littoral où il a été trouvé.",
  },
  {
    id: "d26",
    title: "Repérer une zone de reconquête de dune ou de posidonie",
    category: "ecolo",
    difficulty: 3,
    profiles: ["littoral"],
    explanation:
      "Les dunes et herbiers de posidonie protègent le littoral de l'érosion et abritent une biodiversité marine essentielle, souvent menacée par la fréquentation.",
  },
  {
    id: "d27",
    title: "Repérer une trace d'animal nocturne (empreinte, terrier, crottes)",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["foret", "montagne", "campagne", "causse"],
    explanation:
      "Beaucoup d'espèces sont actives la nuit et passent inaperçues : leurs traces sont souvent le seul indice de leur présence.",
  },
  {
    id: "d28",
    title: "Écouter et distinguer 3 chants d'oiseaux différents",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["foret", "montagne", "campagne", "garrigue", "zone_humide"],
    explanation:
      "Le chant est souvent le meilleur moyen de repérer un oiseau avant même de le voir. S'entraîner à l'oreille affine l'écoute de la nature.",
  },
  {
    id: "d29",
    title: "Identifier un champignon sans le cueillir",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["foret"],
    explanation:
      "Les champignons jouent un rôle clé dans la décomposition et les réseaux souterrains de la forêt ; beaucoup d'espèces sont rares ou protégées.",
  },
  {
    id: "d30",
    title: "Repérer un point de captage ou une source et comprendre sa protection",
    category: "apprentissage",
    difficulty: 3,
    profiles: ["montagne", "causse", "campagne"],
    elements: ["riviere"],
    explanation:
      "Les sources et captages d'eau potable nécessitent des périmètres de protection pour éviter la pollution et le surprélèvement.",
  },
  {
    id: "d31",
    title: "Observer un rapace et essayer de l'identifier en vol",
    category: "apprentissage",
    difficulty: 3,
    profiles: ["causse", "montagne", "garrigue"],
    explanation:
      "Vautours, aigles, buses... la silhouette et le vol permettent souvent d'identifier un rapace sans jumelles.",
  },
  {
    id: "d32",
    title: "Remplir sa gourde plutôt qu'acheter une bouteille en plastique",
    category: "ecolo",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    explanation:
      "Une bouteille en plastique met des centaines d'années à se dégrader ; la gourde reste le geste le plus simple pour l'éviter en randonnée.",
  },
  {
    id: "d33",
    title: "Repérer une pratique agricole favorable à la biodiversité",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["campagne", "causse"],
    explanation:
      "Rotation des cultures, agroforesterie, fauche tardive... certaines pratiques agricoles préservent davantage les sols et les espèces.",
  },
  {
    id: "d34",
    title: "Faire un inventaire sonore : noter tous les sons entendus en 5 minutes, les yeux fermés",
    category: "apprentissage",
    difficulty: 2,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "S'arrêter et fermer les yeux révèle un paysage sonore souvent ignoré : vent, eau, insectes, oiseaux, activités humaines lointaines.",
  },
   {
    id: "d35",
    title: "Expliquer à un enfant un phénomène naturel observé pendant la balade",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "Pourquoi les feuilles tombent, pourquoi l'eau coule dans ce sens, pourquoi cet arbre a de la mousse d'un seul côté... transmettre en mots simples, c'est aussi mieux comprendre soi-même.",
  },
  {
    id: "d36",
    title: "Répondre ensemble à 3 'pourquoi' posés par un enfant",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "Chercher la réponse ensemble (en observant, en discutant, ou en cherchant plus tard) transforme la curiosité spontanée d'un enfant en vraie découverte.",
  },
  {
    id: "d37",
    title: "Reconnaître une plante au toucher, les yeux fermés",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["foret", "montagne", "garrigue", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "Écorce rugueuse, feuille douce, caillou froid... explorer avec d'autres sens que la vue aiguise l'attention à son environnement.",
  },
  {
    id: "d38",
    title: "Inventer une petite histoire à partir de 3 éléments trouvés sur le chemin",
    category: "apprentissage",
    difficulty: 1,
    profiles: ["urbaine", "foret", "montagne", "garrigue", "littoral", "campagne", "causse", "zone_humide"],
    options: ["famille"],
    explanation:
      "Une feuille, un caillou, une plume... raconter une histoire à partir de trouvailles naturelles stimule l'imagination tout en gardant l'attention sur ce qui nous entoure.",
  },
];
