export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  MILESTONE_VICTORY = 'MILESTONE_VICTORY',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  radius: number;
  color: string;
}

export interface Player extends Entity {
  speed: number;
  health: number;
  maxHealth: number;
  invincible: boolean;
  invincibleTimer: number;
  powerUps: {
    tripleShot: number; // duration
    shield: boolean;
  };
  ultimateCharge: number; // 0 to 100
}

export interface Enemy extends Entity {
  type: EnemyType;
  speed: number;
  health: number;
  scoreValue: number;
}

export interface Coin extends Entity {
  speed: number;
  value: number;
}

export interface Bullet extends Entity {
  speed: number;
  damage: number;
  isPlayerBullet: boolean;
  angle?: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  speed: number;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface Shockwave extends Point {
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface Star extends Point {
  size: number;
  speed: number;
  opacity: number;
}
