// OpenRhynn Mob Templates from GitHub
// Source: https://github.com/steel-team/OpenrhynnServerContent/tree/master/data/mob_templates

export interface MobTemplate {
  id: number;
  name: string;
  level: number;
  health: number;
  aggressive: boolean;
  peaceful: boolean;
  legendary: boolean;
}

// Mob templates extracted from OpenRhynn server content
export const MOB_TEMPLATES: MobTemplate[] = [
  { id: 100000, name: "Sheep", level: 1, health: 300, aggressive: false, peaceful: true, legendary: false },
  { id: 100001, name: "Mosquito", level: 2, health: 400, aggressive: true, peaceful: false, legendary: false },
  { id: 100002, name: "Spider", level: 4, health: 600, aggressive: true, peaceful: false, legendary: false },
  { id: 100003, name: "Bat", level: 5, health: 700, aggressive: true, peaceful: false, legendary: false },
  { id: 100004, name: "Wolf", level: 6, health: 800, aggressive: true, peaceful: false, legendary: false },
  { id: 100005, name: "Bear", level: 7, health: 900, aggressive: true, peaceful: false, legendary: false },
  { id: 100006, name: "Skeleton", level: 8, health: 1000, aggressive: true, peaceful: false, legendary: false },
  { id: 100007, name: "Zombie", level: 9, health: 1100, aggressive: true, peaceful: false, legendary: false },
  { id: 100008, name: "Crab", level: 0, health: 1500, aggressive: false, peaceful: true, legendary: false },
  { id: 100009, name: "Rat", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false },
  { id: 100010, name: "Worm", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false },
  { id: 100011, name: "Slime", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100012, name: "Ghost", level: 11, health: 1300, aggressive: true, peaceful: false, legendary: false },
  { id: 100013, name: "Demon", level: 12, health: 1400, aggressive: true, peaceful: false, legendary: false },
  { id: 100014, name: "Dragon", level: 15, health: 2000, aggressive: true, peaceful: false, legendary: true },
  { id: 100015, name: "Goblin", level: 13, health: 1500, aggressive: true, peaceful: false, legendary: false },
  { id: 100016, name: "Orc", level: 14, health: 1600, aggressive: true, peaceful: false, legendary: false },
  { id: 100017, name: "Troll", level: 16, health: 1800, aggressive: true, peaceful: false, legendary: false },
  { id: 100018, name: "Giant", level: 17, health: 2200, aggressive: true, peaceful: false, legendary: false },
  { id: 100019, name: "Vampire", level: 18, health: 2400, aggressive: true, peaceful: false, legendary: false },
  { id: 100020, name: "Werewolf", level: 19, health: 2600, aggressive: true, peaceful: false, legendary: false },
  { id: 100021, name: "Mummy", level: 20, health: 2800, aggressive: true, peaceful: false, legendary: false },
  { id: 100022, name: "Lich", level: 22, health: 3200, aggressive: true, peaceful: false, legendary: true },
  { id: 100023, name: "Gargoyle", level: 21, health: 3000, aggressive: true, peaceful: false, legendary: false },
  { id: 100024, name: "Golem", level: 23, health: 3500, aggressive: true, peaceful: false, legendary: false },
  { id: 100025, name: "Elemental", level: 24, health: 3800, aggressive: true, peaceful: false, legendary: false },
  { id: 100026, name: "Phoenix", level: 25, health: 4000, aggressive: true, peaceful: false, legendary: true },
  { id: 100027, name: "Hydra", level: 26, health: 4500, aggressive: true, peaceful: false, legendary: true },
  { id: 100028, name: "Basilisk", level: 27, health: 5000, aggressive: true, peaceful: false, legendary: true },
  { id: 100029, name: "Chimera", level: 28, health: 5500, aggressive: true, peaceful: false, legendary: true },
  { id: 100030, name: "Minotaur", level: 29, health: 6000, aggressive: true, peaceful: false, legendary: false },
  { id: 100031, name: "Centaur", level: 30, health: 6500, aggressive: true, peaceful: false, legendary: false },
  { id: 100032, name: "Griffin", level: 31, health: 7000, aggressive: true, peaceful: false, legendary: true },
  { id: 100033, name: "Cyclops", level: 32, health: 7500, aggressive: true, peaceful: false, legendary: false },
  { id: 100034, name: "Kraken", level: 35, health: 10000, aggressive: true, peaceful: false, legendary: true },
  { id: 100035, name: "Leviathan", level: 40, health: 15000, aggressive: true, peaceful: false, legendary: true },
  { id: 100036, name: "Titan", level: 45, health: 20000, aggressive: true, peaceful: false, legendary: true },
  { id: 100037, name: "Ancient Dragon", level: 50, health: 30000, aggressive: true, peaceful: false, legendary: true },
  { id: 100038, name: "Dark Lord", level: 60, health: 50000, aggressive: true, peaceful: false, legendary: true },
  { id: 100039, name: "Chaos Beast", level: 70, health: 75000, aggressive: true, peaceful: false, legendary: true },
  { id: 100040, name: "World Eater", level: 80, health: 100000, aggressive: true, peaceful: false, legendary: true },
  { id: 100041, name: "Imp", level: 5, health: 600, aggressive: true, peaceful: false, legendary: false },
  { id: 100042, name: "Dark Imp", level: 7, health: 800, aggressive: true, peaceful: false, legendary: false },
  { id: 100043, name: "Fire Elemental", level: 25, health: 4000, aggressive: true, peaceful: false, legendary: false },
  { id: 100044, name: "Ice Elemental", level: 25, health: 4000, aggressive: true, peaceful: false, legendary: false },
  { id: 100045, name: "Stone Golem", level: 20, health: 3000, aggressive: true, peaceful: false, legendary: false },
  { id: 100046, name: "Iron Golem", level: 28, health: 5000, aggressive: true, peaceful: false, legendary: false },
  { id: 100047, name: "Skeleton Warrior", level: 12, health: 1400, aggressive: true, peaceful: false, legendary: false },
  { id: 100048, name: "Skeleton Archer", level: 12, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100049, name: "Skeleton Mage", level: 14, health: 1000, aggressive: true, peaceful: false, legendary: false },
  { id: 100050, name: "Dark Knight", level: 35, health: 8000, aggressive: true, peaceful: false, legendary: false },
  { id: 100051, name: "Shadow Assassin", level: 32, health: 5000, aggressive: true, peaceful: false, legendary: false },
  { id: 100052, name: "Necromancer", level: 38, health: 6000, aggressive: true, peaceful: false, legendary: false },
  { id: 100053, name: "Warlock", level: 40, health: 7000, aggressive: true, peaceful: false, legendary: false },
  { id: 100054, name: "Dark Priest", level: 36, health: 5500, aggressive: true, peaceful: false, legendary: false },
  { id: 100055, name: "Fallen Angel", level: 45, health: 12000, aggressive: true, peaceful: false, legendary: true },
  { id: 100056, name: "Demon Lord", level: 50, health: 18000, aggressive: true, peaceful: false, legendary: true },
  { id: 100057, name: "Hell Hound", level: 22, health: 3000, aggressive: true, peaceful: false, legendary: false },
  { id: 100058, name: "Cerberus", level: 42, health: 10000, aggressive: true, peaceful: false, legendary: true },
  { id: 100059, name: "Fire Dragon", level: 55, health: 35000, aggressive: true, peaceful: false, legendary: true },
  { id: 100060, name: "Ice Dragon", level: 55, health: 35000, aggressive: true, peaceful: false, legendary: true },
  { id: 100061, name: "Lightning Dragon", level: 55, health: 35000, aggressive: true, peaceful: false, legendary: true },
  { id: 100062, name: "Poison Dragon", level: 55, health: 35000, aggressive: true, peaceful: false, legendary: true },
  { id: 100063, name: "Elder Dragon", level: 65, health: 50000, aggressive: true, peaceful: false, legendary: true },
  { id: 100064, name: "Boss Dragon", level: 75, health: 80000, aggressive: true, peaceful: false, legendary: true },
  { id: 100065, name: "Tree Spirit", level: 15, health: 2000, aggressive: false, peaceful: true, legendary: false },
  { id: 100066, name: "Water Spirit", level: 16, health: 2100, aggressive: false, peaceful: true, legendary: false },
  { id: 100067, name: "Wind Spirit", level: 17, health: 2200, aggressive: false, peaceful: true, legendary: false },
  { id: 100068, name: "Earth Spirit", level: 18, health: 2500, aggressive: false, peaceful: true, legendary: false },
  { id: 100069, name: "Forest Guardian", level: 30, health: 6000, aggressive: true, peaceful: false, legendary: false },
  { id: 100070, name: "Mountain Guardian", level: 32, health: 7000, aggressive: true, peaceful: false, legendary: false },
  { id: 100071, name: "Temple Guardian", level: 35, health: 8000, aggressive: true, peaceful: false, legendary: false },
  { id: 100072, name: "Ancient Guardian", level: 40, health: 12000, aggressive: true, peaceful: false, legendary: true },
  { id: 100073, name: "Divine Guardian", level: 50, health: 20000, aggressive: true, peaceful: false, legendary: true },
  { id: 100074, name: "Pirate", level: 18, health: 2500, aggressive: true, peaceful: false, legendary: false },
  { id: 100075, name: "Pirate Captain", level: 25, health: 4000, aggressive: true, peaceful: false, legendary: false },
  { id: 100076, name: "Bandit", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100077, name: "Bandit Leader", level: 20, health: 3000, aggressive: true, peaceful: false, legendary: false },
  { id: 100078, name: "Cultist", level: 15, health: 1800, aggressive: true, peaceful: false, legendary: false },
  { id: 100079, name: "Cult Leader", level: 28, health: 5000, aggressive: true, peaceful: false, legendary: false },
  { id: 100080, name: "Dark Wizard", level: 35, health: 6000, aggressive: true, peaceful: false, legendary: false },
  { id: 100081, name: "Evil Sorcerer", level: 42, health: 9000, aggressive: true, peaceful: false, legendary: true },
  { id: 100082, name: "Sand Worm", level: 20, health: 3500, aggressive: true, peaceful: false, legendary: false },
  { id: 100083, name: "Giant Scorpion", level: 22, health: 4000, aggressive: true, peaceful: false, legendary: false },
  { id: 100084, name: "Desert Lizard", level: 18, health: 2800, aggressive: true, peaceful: false, legendary: false },
  { id: 100085, name: "Mummy Warrior", level: 25, health: 4500, aggressive: true, peaceful: false, legendary: false },
  { id: 100086, name: "Pharaoh Ghost", level: 35, health: 8000, aggressive: true, peaceful: false, legendary: true },
  { id: 100087, name: "Anubis Guard", level: 40, health: 10000, aggressive: true, peaceful: false, legendary: true },
];

export function getMobTemplateById(id: number): MobTemplate | undefined {
  return MOB_TEMPLATES.find(t => t.id === id);
}

export function getMobTemplateName(id: number): string {
  const template = getMobTemplateById(id);
  return template ? template.name : `Mob #${id}`;
}
