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

// Mob templates extracted from OpenRhynn server content (actual GitHub data)
export const MOB_TEMPLATES: MobTemplate[] = [
  { id: 100000, name: "Sheep", level: 1, health: 300, aggressive: false, peaceful: true, legendary: false },
  { id: 100001, name: "Mosquito", level: 2, health: 400, aggressive: true, peaceful: false, legendary: false },
  { id: 100002, name: "Cursed Sheep", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false },
  { id: 100003, name: "Mummy", level: 5, health: 700, aggressive: true, peaceful: false, legendary: false },
  { id: 100005, name: "Zombie", level: 7, health: 900, aggressive: true, peaceful: false, legendary: false },
  { id: 100006, name: "Zombie", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100007, name: "Spider", level: 9, health: 1100, aggressive: true, peaceful: false, legendary: false },
  { id: 100008, name: "Crab", level: 0, health: 1500, aggressive: false, peaceful: true, legendary: false },
  { id: 100009, name: "Cursed Sheep", level: 2, health: 400, aggressive: true, peaceful: false, legendary: false },
  { id: 100010, name: "Worm", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false },
  { id: 100011, name: "Bug", level: 55, health: 360, aggressive: true, peaceful: false, legendary: false },
  { id: 100012, name: "Spider", level: 14, health: 130, aggressive: true, peaceful: false, legendary: false },
  { id: 100013, name: "Mummy", level: 13, health: 130, aggressive: true, peaceful: false, legendary: false },
  { id: 100014, name: "Zombie", level: 23, health: 200, aggressive: true, peaceful: false, legendary: false },
  { id: 100015, name: "Spider", level: 55, health: 3600, aggressive: true, peaceful: false, legendary: false },
  { id: 100016, name: "Spider", level: 56, health: 3600, aggressive: true, peaceful: false, legendary: false },
  { id: 100017, name: "Spider", level: 57, health: 3800, aggressive: true, peaceful: false, legendary: false },
  { id: 100018, name: "Mummy", level: 70, health: 4600, aggressive: true, peaceful: false, legendary: false },
  { id: 100019, name: "Skeleton", level: 70, health: 4600, aggressive: true, peaceful: false, legendary: false },
  { id: 100020, name: "Orc", level: 60, health: 3900, aggressive: true, peaceful: false, legendary: false },
  { id: 100021, name: "Zombie", level: 53, health: 3200, aggressive: true, peaceful: false, legendary: false },
  { id: 100022, name: "Blood Claw", level: 81, health: 6700, aggressive: true, peaceful: false, legendary: true },
  { id: 100023, name: "Ghoul", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false },
  { id: 100024, name: "Ghoul", level: 8, health: 1000, aggressive: true, peaceful: false, legendary: false },
  { id: 100025, name: "Ghoul", level: 9, health: 1100, aggressive: true, peaceful: false, legendary: false },
  { id: 100026, name: "Ghoul", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100027, name: "Ghoul", level: 11, health: 1500, aggressive: true, peaceful: false, legendary: false },
  { id: 100028, name: "Ghoul", level: 14, health: 1300, aggressive: true, peaceful: false, legendary: false },
  { id: 100029, name: "Ghoul", level: 31, health: 2400, aggressive: true, peaceful: false, legendary: false },
  { id: 100030, name: "Ghoul", level: 34, health: 1500, aggressive: true, peaceful: false, legendary: false },
  { id: 100031, name: "Ghost", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false },
  { id: 100032, name: "Ghost", level: 65, health: 4200, aggressive: true, peaceful: false, legendary: false },
  { id: 100033, name: "Mummy", level: 15, health: 1400, aggressive: true, peaceful: false, legendary: false },
  { id: 100034, name: "Zombie", level: 57, health: 3800, aggressive: true, peaceful: false, legendary: false },
  { id: 100035, name: "Mummy", level: 64, health: 4200, aggressive: true, peaceful: false, legendary: false },
  { id: 100036, name: "Mummy", level: 69, health: 4500, aggressive: true, peaceful: false, legendary: false },
  { id: 100037, name: "Mummy", level: 84, health: 6800, aggressive: true, peaceful: false, legendary: false },
  { id: 100040, name: "Orc", level: 64, health: 4200, aggressive: true, peaceful: false, legendary: false },
  { id: 100050, name: "Spider", level: 61, health: 3900, aggressive: true, peaceful: false, legendary: false },
];

export function getMobTemplateById(id: number): MobTemplate | undefined {
  return MOB_TEMPLATES.find(t => t.id === id);
}

export function getMobTemplateName(id: number): string {
  const template = getMobTemplateById(id);
  return template ? `${template.name} (Lv.${template.level})` : `Mob #${id}`;
}
