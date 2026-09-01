// src/config.js
import {
  Building2,
  TreePine,
  Mountain,
  Shrub,
  Fish,
  Wheat,
  Layers,
  CloudFog,
  Droplet,
  Waves,
  MountainSnow,
  Landmark,
  PawPrint,
} from "lucide-react";

export const TYPOLOGIES = [
  { id: "urbaine", label: "Zone urbaine / Parc", icon: Building2 },
  { id: "foret", label: "Forêt", icon: TreePine },
  { id: "montagne", label: "Montagne", icon: Mountain },
  { id: "garrigue", label: "Garrigue", icon: Shrub },
  { id: "littoral", label: "Littoral", icon: Fish },
  { id: "campagne", label: "Campagne", icon: Wheat },
  { id: "causse", label: "Causse / Plateau", icon: Layers },
  { id: "zone_humide", label: "Zone humide / Marais", icon: CloudFog },
];

export const ELEMENTS = [
  { id: "riviere", label: "Rivière", icon: Droplet },
  { id: "lac", label: "Lac", icon: Waves },
  { id: "grotte_falaise", label: "Grotte / Falaise", icon: MountainSnow },
  { id: "ruines", label: "Ruines / Patrimoine", icon: Landmark },
  { id: "troupeau", label: "Troupeau / Pâturage", icon: PawPrint },
];

export const BADGES = [
  { seuil: 0, nom: "Bourgeon", desc: "Tu commences l'aventure" },
  { seuil: 300, nom: "Pousse", desc: "Premiers défis relevés" },
  { seuil: 800, nom: "Arbre", desc: "Un vrai habitué du terrain" },
  { seuil: 1500, nom: "Forêt", desc: "Ton impact commence à compter" },
];