import { Star, Particle, Bullet, Enemy, PowerUp, Player, EnemyType, PowerUpType, Coin } from './types';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_CONFIG, BULLET_RADIUS, BULLET_SPEED, PLAYER_RADIUS, POWERUP_CONFIG, COIN_RADIUS, COIN_COLOR } from './constants';

export const createStar = (): Star => ({
  x: Math.random() * GAME_WIDTH,
  y: Math.random() * GAME_HEIGHT,
  size: Math.random() * 2,
  speed: Math.random() * 2 + 0.5,
  opacity: Math.random(),
});

export const createCoin = (x: number, y: number): Coin => ({
  x,
  y,
  radius: COIN_RADIUS,
  color: COIN_COLOR,
  speed: 1,
  value: 1,
});

export const createParticle = (x: number, y: number, color: string): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 3 + 1;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: Math.random() * 3 + 1,
    color,
    life: 1,
    maxLife: 1,
    alpha: 1,
  };
};

export const createEnemy = (level: number): Enemy => {
  const rand = Math.random();
  let type = EnemyType.BASIC;
  
  if (level >= 3 && rand > 0.7) type = EnemyType.FAST;
  if (level >= 5 && rand > 0.9) type = EnemyType.HEAVY;
  if (level >= 8 && rand > 0.6) type = EnemyType.FAST;
  if (level >= 10 && rand > 0.8) type = EnemyType.HEAVY;

  const config = ENEMY_CONFIG[type];
  return {
    x: Math.random() * (GAME_WIDTH - config.radius * 2) + config.radius,
    y: -config.radius,
    type,
    radius: config.radius,
    speed: config.speed + (level * 0.2),
    health: config.health + Math.floor(level / 5),
    scoreValue: config.scoreValue,
    color: config.color,
  };
};

export const createPowerUp = (x: number, y: number): PowerUp => {
  const type = Math.random() > 0.5 ? PowerUpType.TRIPLE_SHOT : PowerUpType.SHIELD;
  const config = POWERUP_CONFIG[type];
  return {
    x,
    y,
    type,
    radius: config.radius,
    color: config.color,
    speed: 1.5,
  };
};

export const checkCollision = (a: { x: number; y: number; radius: number }, b: { x: number; y: number; radius: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
};
