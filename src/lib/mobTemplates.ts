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
  graphicsId: number;
}

// Graphics ID to sprite path mapping from definition.json
const GRAPHICS_TO_SPRITE: Record<number, string> = {
  100000: 'sheep01.png',
  100001: 'earth_golem01.png',
  100002: 'ghoul01.png',
  100003: 'dragon01.png',
  100004: 'ghost01.png',
  100180: 'crab01.png',
  100181: 'knight01.png',
  100182: 'worm01.png',
  100183: 'mosquito01.png',
  100184: 'mummy01.png',
  100185: 'spider01.png',
  100186: 'zombie01.png',
  100187: 'sceleton01.png',
  100188: 'orc_captain01.png',
  100189: 'black_point.png',
  100190: 'ice_wyrm01.png',
  100191: 'sheep02.png',
  100192: 'dark_elf01.png',
  100193: 'citizen01.png',
  100194: 'black_hat01.png',
  200000: 'citizen02.png',
  200001: 'wizard01.png',
  200002: 'players01.png',
  200003: 'wizard02.png',
  200004: 'orc_captain0.png',
  200005: 'skeleton_warrior01.png',
  200006: 'leech01.png',
  200007: 'orc_captain01-1.png',
  200008: 'heavy_knight01.png',
  200009: 'sand_golem01.png',
  200010: 'one_eye02.png',
  200011: 'one_eye01.png',
  200012: 'spore_plant01.png',
};

// Get the sprite URL for a graphics ID
export function getMobSpriteUrl(graphicsId: number): string {
  const spritePath = GRAPHICS_TO_SPRITE[graphicsId];
  if (spritePath) {
    return `https://raw.githubusercontent.com/steel-team/OpenrhynnServerContent/master/data/tiles/character/${spritePath}`;
  }
  return '';
}

// All 88 mob templates from OpenRhynn server content (100000-100087)
export const MOB_TEMPLATES: MobTemplate[] = [
  { id: 100000, name: "Sheep", level: 1, health: 300, aggressive: false, peaceful: true, legendary: false, graphicsId: 100000 },
  { id: 100001, name: "Mosquito", level: 2, health: 400, aggressive: true, peaceful: false, legendary: false, graphicsId: 100183 },
  { id: 100002, name: "Cursed Sheep", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100191 },
  { id: 100003, name: "Mummy", level: 5, health: 700, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100004, name: "Spider", level: 7, health: 900, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100005, name: "Zombie", level: 7, health: 900, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100006, name: "Zombie", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100007, name: "Spider", level: 9, health: 1100, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100008, name: "Crab", level: 0, health: 1500, aggressive: false, peaceful: true, legendary: false, graphicsId: 100180 },
  { id: 100009, name: "Cursed Sheep", level: 2, health: 400, aggressive: true, peaceful: false, legendary: false, graphicsId: 100191 },
  { id: 100010, name: "Worm", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100182 },
  { id: 100011, name: "Bug", level: 55, health: 360, aggressive: true, peaceful: false, legendary: false, graphicsId: 100183 },
  { id: 100012, name: "Spider", level: 14, health: 130, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100013, name: "Mummy", level: 13, health: 130, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100014, name: "Zombie", level: 23, health: 200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100015, name: "Spider", level: 55, health: 3600, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100016, name: "Spider", level: 56, health: 3600, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100017, name: "Spider", level: 57, health: 3800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100018, name: "Mummy", level: 70, health: 4600, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100019, name: "Skeleton", level: 70, health: 4600, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100020, name: "Orc", level: 60, health: 3900, aggressive: true, peaceful: false, legendary: false, graphicsId: 100188 },
  { id: 100021, name: "Zombie", level: 53, health: 3200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100022, name: "Blood Claw", level: 81, health: 6700, aggressive: true, peaceful: false, legendary: true, graphicsId: 100189 },
  { id: 100023, name: "Ghoul", level: 3, health: 500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100024, name: "Ghoul", level: 8, health: 1000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100025, name: "Ghoul", level: 9, health: 1100, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100026, name: "Ghoul", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100027, name: "Ghoul", level: 11, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100028, name: "Ghoul", level: 14, health: 1300, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100029, name: "Ghoul", level: 31, health: 2400, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100030, name: "Ghoul", level: 34, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100031, name: "Ghost", level: 10, health: 1200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100004 },
  { id: 100032, name: "Ghost", level: 65, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100004 },
  { id: 100033, name: "Mummy", level: 15, health: 1400, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100034, name: "Zombie", level: 57, health: 3800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100035, name: "Mummy", level: 64, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100036, name: "Mummy", level: 69, health: 4500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100037, name: "Mummy", level: 84, health: 6800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100038, name: "Orc", level: 31, health: 2400, aggressive: true, peaceful: false, legendary: false, graphicsId: 100188 },
  { id: 100039, name: "Orc", level: 62, health: 4000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100188 },
  { id: 100040, name: "Orc", level: 64, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100188 },
  { id: 100041, name: "Sheep", level: 2, health: 400, aggressive: false, peaceful: true, legendary: false, graphicsId: 100000 },
  { id: 100042, name: "Sheep", level: 3, health: 500, aggressive: false, peaceful: true, legendary: false, graphicsId: 100000 },
  { id: 100043, name: "Sceleton", level: 71, health: 4800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100044, name: "Sceleton", level: 74, health: 6000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100045, name: "Sceleton", level: 89, health: 7000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100046, name: "Sceleton", level: 91, health: 7500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100047, name: "Sceleton", level: 94, health: 8000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100187 },
  { id: 100048, name: "Soul Catcher", level: 81, health: 6700, aggressive: true, peaceful: false, legendary: false, graphicsId: 100189 },
  { id: 100049, name: "Soul Catcher", level: 83, health: 6800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100189 },
  { id: 100050, name: "Spider", level: 61, health: 3900, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100051, name: "Spider", level: 63, health: 4000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100052, name: "Spider", level: 64, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100053, name: "Spider", level: 65, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100054, name: "Zombie", level: 66, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100055, name: "Zombie", level: 67, health: 4300, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100056, name: "Zombie", level: 69, health: 4500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100057, name: "Zombie", level: 72, health: 4600, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100058, name: "Zombie", level: 73, health: 5300, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100059, name: "Zombie", level: 74, health: 6000, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100060, name: "Worm", level: 69, health: 4500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100182 },
  { id: 100061, name: "Worm", level: 71, health: 4800, aggressive: true, peaceful: false, legendary: false, graphicsId: 100182 },
  { id: 100062, name: "Worm", level: 72, health: 5100, aggressive: true, peaceful: false, legendary: false, graphicsId: 100182 },
  { id: 100063, name: "Blade Wyrm", level: 99, health: 10000, aggressive: true, peaceful: false, legendary: true, graphicsId: 100190 },
  { id: 100064, name: "Red Hand Leader", level: 75, health: 6660, aggressive: true, peaceful: false, legendary: true, graphicsId: 100001 },
  { id: 100065, name: "Narg'x", level: 99, health: 10000, aggressive: true, peaceful: false, legendary: true, graphicsId: 200004 },
  { id: 100066, name: "Lortas", level: 99, health: 10000, aggressive: true, peaceful: false, legendary: true, graphicsId: 200006 },
  { id: 100067, name: "Dalron", level: 99, health: 10000, aggressive: true, peaceful: false, legendary: true, graphicsId: 200005 },
  { id: 100068, name: "Orc Captain", level: 80, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100188 },
  { id: 100069, name: "Orc Captain", level: 80, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 200007 },
  { id: 100070, name: "Spider", level: 66, health: 4200, aggressive: true, peaceful: false, legendary: false, graphicsId: 100185 },
  { id: 100071, name: "Ghoul", level: 70, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100002 },
  { id: 100072, name: "Heavy Knight", level: 90, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200008 },
  { id: 100073, name: "Heavy Knight", level: 88, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200008 },
  { id: 100074, name: "Sand Golem", level: 95, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200009 },
  { id: 100075, name: "Mummy", level: 83, health: 6500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100076, name: "Mummy", level: 82, health: 6500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100184 },
  { id: 100077, name: "Zombie", level: 71, health: 4500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100078, name: "Zombie", level: 75, health: 4500, aggressive: true, peaceful: false, legendary: false, graphicsId: 100186 },
  { id: 100079, name: "Sand Golem", level: 84, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200009 },
  { id: 100080, name: "Sand Golem", level: 79, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200009 },
  { id: 100081, name: "Sand Golem", level: 76, health: 1000, aggressive: true, peaceful: false, legendary: false, graphicsId: 200009 },
  { id: 100082, name: "One Eye Frog", level: 97, health: 10000, aggressive: true, peaceful: false, legendary: true, graphicsId: 200010 },
  { id: 100083, name: "Frog", level: 50, health: 360, aggressive: true, peaceful: false, legendary: false, graphicsId: 200011 },
  { id: 100084, name: "Frog", level: 47, health: 360, aggressive: true, peaceful: false, legendary: false, graphicsId: 200011 },
  { id: 100085, name: "Frog", level: 45, health: 360, aggressive: true, peaceful: false, legendary: false, graphicsId: 200011 },
  { id: 100086, name: "Spore Plant", level: 35, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200012 },
  { id: 100087, name: "Spore Plant", level: 40, health: 1500, aggressive: true, peaceful: false, legendary: false, graphicsId: 200012 },
];

export function getMobTemplateById(id: number): MobTemplate | undefined {
  return MOB_TEMPLATES.find(t => t.id === id);
}

export function getMobTemplateName(id: number): string {
  const template = getMobTemplateById(id);
  return template ? `${template.name} (Lv.${template.level})` : `Mob #${id}`;
}

export function getMobSpriteUrlByTplId(tplId: number): string {
  const template = getMobTemplateById(tplId);
  if (template) {
    return getMobSpriteUrl(template.graphicsId);
  }
  return '';
}
