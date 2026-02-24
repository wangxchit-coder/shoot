export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_RADIUS = 20;
export const PLAYER_SPEED = 5;
export const PLAYER_MAX_HEALTH = 3;
export const INVINCIBILITY_DURATION = 120; // frames

export const BULLET_RADIUS = 4;
export const BULLET_SPEED = 7;

export const ENEMY_CONFIG = {
  BASIC: {
    radius: 15,
    speed: 2,
    health: 1,
    scoreValue: 100,
    color: '#3b82f6', // blue-500
  },
  FAST: {
    radius: 12,
    speed: 4,
    health: 1,
    scoreValue: 150,
    color: '#10b981', // emerald-500
  },
  HEAVY: {
    radius: 25,
    speed: 1,
    health: 3,
    scoreValue: 300,
    color: '#ef4444', // red-500
  },
};

export const POWERUP_CONFIG = {
  TRIPLE_SHOT: {
    radius: 15,
    color: '#f59e0b', // amber-500
    duration: 600, // 10 seconds at 60fps
    price: 50,
  },
  SHIELD: {
    radius: 15,
    color: '#8b5cf6', // violet-500
    price: 30,
  },
  ULTIMATE: {
    price: 100,
  },
  HEALTH: {
    price: 40,
  }
};

export const COIN_RADIUS = 10;
export const COIN_COLOR = '#fbbf24'; // yellow-400

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: '第一滴血',
    description: '击毁第一架敌机',
    unlocked: false,
    icon: 'Target',
  },
  {
    id: 'survivor',
    title: '生存者',
    description: '达到第5关',
    unlocked: false,
    icon: 'Shield',
  },
  {
    id: 'power_collector',
    title: '道具达人',
    description: '拾取5个道具',
    unlocked: false,
    icon: 'Zap',
  },
  {
    id: 'sharpshooter',
    title: '神枪手',
    description: '分数超过5000分',
    unlocked: false,
    icon: 'Crosshair',
  },
  {
    id: 'ace_pilot',
    title: '王牌飞行员',
    description: '击毁100架敌机',
    unlocked: false,
    icon: 'Trophy',
  },
];
