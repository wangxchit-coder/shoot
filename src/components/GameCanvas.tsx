import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  GameState, Player, Enemy, Bullet, Particle, PowerUp, Star, 
  Achievement, PowerUpType, EnemyType, Shockwave, Coin 
} from '../types';
import { 
  GAME_WIDTH, GAME_HEIGHT, PLAYER_RADIUS, PLAYER_SPEED, 
  PLAYER_MAX_HEALTH, INVINCIBILITY_DURATION, BULLET_RADIUS, 
  BULLET_SPEED, INITIAL_ACHIEVEMENTS, POWERUP_CONFIG, COIN_COLOR 
} from '../constants';
import { 
  createStar, createEnemy, createParticle, 
  createPowerUp, checkCollision, createCoin 
} from '../utils';

// Helper to create bullets since I missed it in utils
const createBulletObj = (x: number, y: number, isPlayer: boolean, angle: number = -Math.PI / 2): Bullet => ({
  x,
  y,
  radius: BULLET_RADIUS,
  color: isPlayer ? '#fbbf24' : '#f87171',
  speed: BULLET_SPEED,
  damage: 1,
  isPlayerBullet: isPlayer,
  angle,
});

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number, level: number, achievements: Achievement[]) => void;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onLevelUpdate: (level: number) => void;
  onAchievementUnlocked: (achievement: Achievement) => void;
  onMilestoneReached: () => void;
  onCoinsUpdate: (coins: number) => void;
  onUltimateUpdate: (charge: number) => void;
  initialCoins: number;
}

export const GameCanvas = forwardRef<any, GameCanvasProps>(({
  gameState,
  onGameOver,
  onScoreUpdate,
  onHealthUpdate,
  onLevelUpdate,
  onAchievementUnlocked,
  onMilestoneReached,
  onCoinsUpdate,
  onUltimateUpdate,
  initialCoins,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  useImperativeHandle(ref, () => ({
    buyItem: (type: string, price: number) => {
      if (coinsCountRef.current < price) return false;
      
      const player = playerRef.current;
      switch (type) {
        case 'TRIPLE_SHOT':
          player.powerUps.tripleShot = POWERUP_CONFIG.TRIPLE_SHOT.duration;
          break;
        case 'SHIELD':
          player.powerUps.shield = true;
          break;
        case 'HEALTH':
          if (player.health < player.maxHealth) {
            player.health++;
            onHealthUpdate(player.health);
          } else {
            return false; // Already at max health
          }
          break;
        case 'ULTIMATE':
          player.ultimateCharge = 100;
          onUltimateUpdate(100);
          break;
        default:
          return false;
      }
      
      coinsCountRef.current -= price;
      onCoinsUpdate(coinsCountRef.current);
      return true;
    }
  }));
  
  // Game State Refs (to avoid closure issues in loop)
  const playerRef = useRef<Player>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 50,
    radius: PLAYER_RADIUS,
    color: '#60a5fa',
    speed: PLAYER_SPEED,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    invincible: false,
    invincibleTimer: 0,
    powerUps: { tripleShot: 0, shield: false },
    ultimateCharge: 0,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const starsRef = useRef<Star[]>(Array.from({ length: 100 }, createStar));
  
  const scoreRef = useRef(0);
  const coinsCountRef = useRef(0);
  const levelRef = useRef(1);
  const enemiesDestroyedRef = useRef(0);
  const powerUpsCollectedRef = useRef(0);
  const milestoneReachedRef = useRef(false);
  const achievementsRef = useRef<Achievement[]>(INITIAL_ACHIEVEMENTS);
  
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotTimeRef = useRef(0);
  const enemySpawnTimerRef = useRef(0);

  // Better approach: reset when entering PLAYING from START or GAME_OVER
  const prevStateRef = useRef<GameState>(gameState);
  useEffect(() => {
    if (gameState === GameState.PLAYING && (prevStateRef.current === GameState.START || prevStateRef.current === GameState.GAME_OVER)) {
      // Reset all refs
      playerRef.current = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 50,
        radius: PLAYER_RADIUS,
        color: '#60a5fa',
        speed: PLAYER_SPEED,
        health: PLAYER_MAX_HEALTH,
        maxHealth: PLAYER_MAX_HEALTH,
        invincible: false,
        invincibleTimer: 0,
        powerUps: { tripleShot: 0, shield: false },
        ultimateCharge: 0,
      };
      enemiesRef.current = [];
      bulletsRef.current = [];
      particlesRef.current = [];
      shockwavesRef.current = [];
      powerUpsRef.current = [];
      coinsRef.current = [];
      scoreRef.current = 0;
      coinsCountRef.current = initialCoins;
      levelRef.current = 1;
      enemiesDestroyedRef.current = 0;
      powerUpsCollectedRef.current = 0;
      milestoneReachedRef.current = false;
      // Note: achievements are usually persistent across runs in many games, 
      // but INITIAL_ACHIEVEMENTS has unlocked: false, so they reset if we re-assign.
      // If we want persistent achievements, we shouldn't reset achievementsRef.
    }
    prevStateRef.current = gameState;
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleTouch = (e: TouchEvent) => {
      if (gameState !== GameState.PLAYING) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      
      playerRef.current.x = (touch.clientX - rect.left) * scaleX;
      playerRef.current.y = (touch.clientY - rect.top) * scaleY;
      
      // Auto-shoot on touch
      keysRef.current['Space'] = true;
    };

    const handleTouchEnd = () => {
      keysRef.current['Space'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
      canvas.addEventListener('touchmove', handleTouch, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameState]);

  const unlockAchievement = (id: string) => {
    const achievement = achievementsRef.current.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      onAchievementUnlocked({ ...achievement });
    }
  };

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;
    
    // 1. Player Movement
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) player.y -= player.speed;
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) player.y += player.speed;
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) player.x -= player.speed;
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) player.x += player.speed;

    // Bounds
    player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y));

    // 2. Shooting & Ultimate
    const now = Date.now();
    if (keysRef.current['Space'] && now - lastShotTimeRef.current > 200) {
      if (player.powerUps.tripleShot > 0) {
        bulletsRef.current.push(createBulletObj(player.x, player.y, true, -Math.PI / 2));
        bulletsRef.current.push(createBulletObj(player.x, player.y, true, -Math.PI / 2 - 0.2));
        bulletsRef.current.push(createBulletObj(player.x, player.y, true, -Math.PI / 2 + 0.2));
      } else {
        bulletsRef.current.push(createBulletObj(player.x, player.y, true));
      }
      lastShotTimeRef.current = now;
    }

    // Ultimate Trigger (Key E)
    if (keysRef.current['KeyE'] && player.ultimateCharge >= 100) {
      player.ultimateCharge = 0;
      onUltimateUpdate(0);
      
      // Screen clear effect
      shockwavesRef.current.push({
        x: player.x,
        y: player.y,
        radius: 0,
        maxRadius: 1000,
        alpha: 1,
        color: '#60a5fa'
      });

      // Kill all visible enemies
      enemiesRef.current.forEach(enemy => {
        scoreRef.current += enemy.scoreValue;
        coinsRef.current.push(createCoin(enemy.x, enemy.y));
        for (let i = 0; i < 10; i++) {
          particlesRef.current.push(createParticle(enemy.x, enemy.y, enemy.color));
        }
      });
      enemiesRef.current = [];
      onScoreUpdate(scoreRef.current);
    }

    // 3. Timers
    if (player.invincible) {
      player.invincibleTimer--;
      if (player.invincibleTimer <= 0) player.invincible = false;
    }
    if (player.powerUps.tripleShot > 0) player.powerUps.tripleShot--;

    // 4. Enemy Spawning
    enemySpawnTimerRef.current++;
    const spawnRate = Math.max(20, 60 - levelRef.current * 2);
    if (enemySpawnTimerRef.current > spawnRate) {
      enemiesRef.current.push(createEnemy(levelRef.current));
      enemySpawnTimerRef.current = 0;
    }

    // 5. Update Entities
    // Stars
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_WIDTH;
      }
    });

    // Bullets
    for (let bIndex = bulletsRef.current.length - 1; bIndex >= 0; bIndex--) {
      const bullet = bulletsRef.current[bIndex];
      const angle = bullet.angle || -Math.PI / 2;
      bullet.x += Math.cos(angle) * bullet.speed;
      bullet.y += Math.sin(angle) * bullet.speed;

      // Proximity Fuse: Distance-based explosion
      if (bullet.isPlayerBullet) {
        const nearEnemy = enemiesRef.current.find(enemy => {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          return Math.sqrt(dx * dx + dy * dy) < 60; // Proximity threshold
        });

        if (nearEnemy) {
          shockwavesRef.current.push({
            x: bullet.x,
            y: bullet.y,
            radius: 0,
            maxRadius: 100,
            alpha: 1,
            color: '#fbbf24'
          });
          bulletsRef.current.splice(bIndex, 1);
          continue;
        }
      }

      if (bullet.y < 0 || bullet.y > GAME_HEIGHT || bullet.x < 0 || bullet.x > GAME_WIDTH) {
        bulletsRef.current.splice(bIndex, 1);
      }
    }

    // Enemies
    for (let eIndex = enemiesRef.current.length - 1; eIndex >= 0; eIndex--) {
      const enemy = enemiesRef.current[eIndex];
      enemy.y += enemy.speed;
      
      // Escape penalty
      if (enemy.y > GAME_HEIGHT + enemy.radius) {
        enemiesRef.current.splice(eIndex, 1);
        scoreRef.current = Math.max(0, scoreRef.current - 50);
        onScoreUpdate(scoreRef.current);
        continue;
      }

      // Collision with Player
      if (!player.invincible && checkCollision(player, enemy)) {
        if (player.powerUps.shield) {
          player.powerUps.shield = false;
          player.invincible = true;
          player.invincibleTimer = INVINCIBILITY_DURATION;
        } else {
          player.health--;
          onHealthUpdate(player.health);
          player.invincible = true;
          player.invincibleTimer = INVINCIBILITY_DURATION;
          
          if (player.health <= 0) {
            onGameOver(scoreRef.current, levelRef.current, achievementsRef.current);
          }
        }
        
        // Explosion
        for (let i = 0; i < 10; i++) {
          particlesRef.current.push(createParticle(enemy.x, enemy.y, enemy.color));
        }
        enemiesRef.current.splice(eIndex, 1);
      }
    }

    // PowerUps
    for (let pIndex = powerUpsRef.current.length - 1; pIndex >= 0; pIndex--) {
      const pu = powerUpsRef.current[pIndex];
      pu.y += pu.speed;
      if (checkCollision(player, pu)) {
        if (pu.type === PowerUpType.TRIPLE_SHOT) {
          player.powerUps.tripleShot = POWERUP_CONFIG.TRIPLE_SHOT.duration;
        } else if (pu.type === PowerUpType.SHIELD) {
          player.powerUps.shield = true;
        }
        powerUpsRef.current.splice(pIndex, 1);
        powerUpsCollectedRef.current++;
        if (powerUpsCollectedRef.current >= 5) unlockAchievement('power_collector');
        continue;
      }
      if (pu.y > GAME_HEIGHT) powerUpsRef.current.splice(pIndex, 1);
    }

    // Coins
    for (let cIndex = coinsRef.current.length - 1; cIndex >= 0; cIndex--) {
      const coin = coinsRef.current[cIndex];
      coin.y += coin.speed;
      if (checkCollision(player, coin)) {
        coinsCountRef.current += coin.value;
        onCoinsUpdate(coinsCountRef.current);
        coinsRef.current.splice(cIndex, 1);
        continue;
      }
      if (coin.y > GAME_HEIGHT) coinsRef.current.splice(cIndex, 1);
    }

    // Bullet-Enemy Collision (Direct Hit also triggers shockwave)
    for (let bIndex = bulletsRef.current.length - 1; bIndex >= 0; bIndex--) {
      const bullet = bulletsRef.current[bIndex];
      if (!bullet.isPlayerBullet) continue;
      
      for (let eIndex = enemiesRef.current.length - 1; eIndex >= 0; eIndex--) {
        const enemy = enemiesRef.current[eIndex];
        if (checkCollision(bullet, enemy)) {
          // Trigger shockwave on direct hit too
          shockwavesRef.current.push({
            x: bullet.x,
            y: bullet.y,
            radius: 0,
            maxRadius: 100,
            alpha: 1,
            color: '#fbbf24'
          });
          
          enemy.health -= bullet.damage;
          bulletsRef.current.splice(bIndex, 1);
          
          if (enemy.health <= 0) {
            scoreRef.current += enemy.scoreValue;
            onScoreUpdate(scoreRef.current);
            enemiesDestroyedRef.current++;
            
            if (enemiesDestroyedRef.current === 1) unlockAchievement('first_blood');
            if (enemiesDestroyedRef.current >= 100) unlockAchievement('ace_pilot');
            if (scoreRef.current >= 5000) {
              unlockAchievement('sharpshooter');
              if (!milestoneReachedRef.current) {
                milestoneReachedRef.current = true;
                onMilestoneReached();
              }
            }

            if (scoreRef.current >= levelRef.current * levelRef.current * 1000) {
              levelRef.current++;
              onLevelUpdate(levelRef.current);
              if (levelRef.current === 5) unlockAchievement('survivor');
              enemiesRef.current = [];
            }

            if (Math.random() < 0.1) {
              powerUpsRef.current.push(createPowerUp(enemy.x, enemy.y));
            }

            // Spawn coin
            coinsRef.current.push(createCoin(enemy.x, enemy.y));

            // Charge ultimate
            player.ultimateCharge = Math.min(100, player.ultimateCharge + 2);
            onUltimateUpdate(player.ultimateCharge);

            for (let i = 0; i < 15; i++) {
              particlesRef.current.push(createParticle(enemy.x, enemy.y, enemy.color));
            }
            enemiesRef.current.splice(eIndex, 1);
          }
          break; // Bullet is gone, stop checking enemies for this bullet
        }
      }
    }

    // Particles
    particlesRef.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.alpha = p.life;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    });

    // Shockwaves
    for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
      const sw = shockwavesRef.current[i];
      sw.radius += 5;
      sw.alpha -= 0.025;

      // Damage enemies in shockwave
      for (let eIndex = enemiesRef.current.length - 1; eIndex >= 0; eIndex--) {
        const enemy = enemiesRef.current[eIndex];
        const dx = sw.x - enemy.x;
        const dy = sw.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If enemy is within the expanding ring area
        if (dist < sw.radius + 20 && dist > sw.radius - 20) {
          enemy.health -= 0.2; // Increased damage for better feel
          if (enemy.health <= 0) {
            scoreRef.current += enemy.scoreValue;
            onScoreUpdate(scoreRef.current);
            enemiesDestroyedRef.current++;
            
            // Achievements
            if (enemiesDestroyedRef.current === 1) unlockAchievement('first_blood');
            if (enemiesDestroyedRef.current >= 100) unlockAchievement('ace_pilot');
            if (scoreRef.current >= 5000) {
              unlockAchievement('sharpshooter');
              if (!milestoneReachedRef.current) {
                milestoneReachedRef.current = true;
                onMilestoneReached();
              }
            }

            // Level Up
            if (scoreRef.current >= levelRef.current * levelRef.current * 1000) {
              levelRef.current++;
              onLevelUpdate(levelRef.current);
              if (levelRef.current === 5) unlockAchievement('survivor');
              enemiesRef.current = [];
              break; // Stop checking enemies for this shockwave if we cleared the screen
            }

            // Powerup spawn chance
            if (Math.random() < 0.1) {
              powerUpsRef.current.push(createPowerUp(enemy.x, enemy.y));
            }

            // Spawn coin
            coinsRef.current.push(createCoin(enemy.x, enemy.y));

            // Charge ultimate
            player.ultimateCharge = Math.min(100, player.ultimateCharge + 1);
            onUltimateUpdate(player.ultimateCharge);

            // Explosion particles
            for (let j = 0; j < 10; j++) {
              particlesRef.current.push(createParticle(enemy.x, enemy.y, enemy.color));
            }
            enemiesRef.current.splice(eIndex, 1);
          }
        }
      }

      if (sw.alpha <= 0) shockwavesRef.current.splice(i, 1);
    }

  }, [gameState, onGameOver, onScoreUpdate, onHealthUpdate, onLevelUpdate, onAchievementUnlocked]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 1. Stars
    starsRef.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Shockwaves
    shockwavesRef.current.forEach(sw => {
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner glow
      ctx.globalAlpha = sw.alpha * 0.3;
      ctx.fillStyle = sw.color;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 3. Coins
    coinsRef.current.forEach(coin => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = coin.color;
      ctx.fillStyle = coin.color;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin detail
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius - 3, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 3. PowerUps
    powerUpsRef.current.forEach(pu => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = pu.color;
      ctx.fillStyle = pu.color;
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon/Letter
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type === PowerUpType.TRIPLE_SHOT ? 'T' : 'S', pu.x, pu.y);
    });

    // 4. Enemies
    enemiesRef.current.forEach(enemy => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = enemy.color;
      ctx.fillStyle = enemy.color;
      
      // Draw different shapes for types
      ctx.beginPath();
      if (enemy.type === EnemyType.HEAVY) {
        ctx.rect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2);
      } else if (enemy.type === EnemyType.FAST) {
        ctx.moveTo(enemy.x, enemy.y + enemy.radius);
        ctx.lineTo(enemy.x - enemy.radius, enemy.y - enemy.radius);
        ctx.lineTo(enemy.x + enemy.radius, enemy.y - enemy.radius);
        ctx.closePath();
      } else {
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 5. Bullets
    bulletsRef.current.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Player
    const player = playerRef.current;
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = player.color;
      ctx.fillStyle = player.color;
      
      // Spaceship shape
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - player.radius);
      ctx.lineTo(player.x - player.radius, player.y + player.radius);
      ctx.lineTo(player.x + player.radius, player.y + player.radius);
      ctx.closePath();
      ctx.fill();
      
      // Cockpit
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(player.x, player.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shield
      if (player.powerUps.shield) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="w-full h-full object-contain bg-black rounded-lg shadow-2xl"
    />
  );
});
