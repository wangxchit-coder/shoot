/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen, HUD, PauseScreen, GameOverScreen, AchievementPopup, MilestoneVictoryScreen, ShopScreen } from './components/UI';
import { GameState, Achievement } from './types';
import { Zap, Shield, Target, Info, Sparkles } from 'lucide-react';
import { POWERUP_CONFIG } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('pioneer_coins');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [ultimateCharge, setUltimateCharge] = useState(0);

  // Save coins to localStorage
  useEffect(() => {
    localStorage.setItem('pioneer_coins', coins.toString());
  }, [coins]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const gameRef = useRef<any>(null);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setHealth(3);
    setLevel(1);
    setUltimateCharge(0);
  };

  const handlePause = () => {
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
  };

  const handleResume = () => {
    if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setHealth(3);
    setLevel(1);
    setUltimateCharge(0);
  };

  const handleExit = () => {
    setGameState(GameState.GAME_OVER);
  };

  const handleGameOver = useCallback((finalScore: number, finalLevel: number, finalAchievements: Achievement[]) => {
    setScore(finalScore);
    setLevel(finalLevel);
    setAchievements(finalAchievements);
    setGameState(GameState.GAME_OVER);
  }, []);

  const handleAchievementUnlocked = useCallback((achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setTimeout(() => setCurrentAchievement(null), 3000);
  }, []);

  const handleOpenShop = () => {
    setIsShopOpen(true);
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
  };

  const handleCloseShop = () => {
    setIsShopOpen(false);
    setGameState(GameState.PLAYING);
  };

  const handleBuyItem = (type: string) => {
    const config = POWERUP_CONFIG as any;
    const price = config[type]?.price || 0;
    if (gameRef.current?.buyItem(type, price)) {
      // Purchase successful
    }
  };

  // Keyboard Pause & Ultimate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
        else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
      }
      if (e.code === 'KeyB') {
        handleOpenShop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col lg:flex-row">
      {/* Sidebar - Large Screens Only */}
      <aside className="hidden lg:flex w-80 flex-col p-8 border-r border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="mb-12">
          <h1 className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            星际先锋
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Interstellar Pioneers</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={14} /> 操作指南
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-400">移动</span>
                <span className="font-mono text-blue-400">WASD / 方向键</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-400">射击</span>
                <span className="font-mono text-blue-400">空格键</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-400">暂停</span>
                <span className="font-mono text-blue-400">P 键</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={14} /> 特殊技能
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-400">大招</span>
                <span className="font-mono text-blue-400">E 键 (100% 能量)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-400">商店</span>
                <span className="font-mono text-blue-400">B 键 / 按钮</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap size={14} /> 道具说明
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">三向子弹</div>
                  <div className="text-xs text-gray-500">增强火力，覆盖更广范围</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">能量护盾</div>
                  <div className="text-xs text-gray-500">抵挡一次敌机撞击</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target size={14} /> 敌机情报
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-400">基础型: 标准速度与生命</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-400">快速型: 极高移动速度</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-400">重型: 极高生命值</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5 text-[10px] text-gray-600 text-center">
          © 2026 EASON & NALU STUDIO
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
        <div className="relative w-full max-w-[800px] aspect-[4/3] bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <GameCanvas 
            ref={gameRef}
            gameState={gameState}
            initialCoins={coins}
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            onHealthUpdate={setHealth}
            onLevelUpdate={setLevel}
            onCoinsUpdate={setCoins}
            onUltimateUpdate={setUltimateCharge}
            onAchievementUnlocked={handleAchievementUnlocked}
            onMilestoneReached={() => setGameState(GameState.MILESTONE_VICTORY)}
          />

          {/* UI Overlays */}
          {gameState === GameState.START && (
            <StartScreen onStart={handleStart} />
          )}

          {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && !isShopOpen && (
            <HUD 
              score={score} 
              health={health} 
              level={level} 
              coins={coins}
              ultimateCharge={ultimateCharge}
              onPause={handlePause} 
              onOpenShop={handleOpenShop}
            />
          )}

          {isShopOpen && (
            <ShopScreen 
              coins={coins}
              onClose={handleCloseShop}
              onBuy={handleBuyItem}
            />
          )}

          {gameState === GameState.PAUSED && (
            <PauseScreen 
              onResume={handleResume} 
              onRestart={handleRestart} 
            />
          )}

          {gameState === GameState.GAME_OVER && (
            <GameOverScreen 
              score={score} 
              level={level} 
              achievements={achievements} 
              onRestart={handleRestart} 
            />
          )}

          {gameState === GameState.MILESTONE_VICTORY && (
            <MilestoneVictoryScreen 
              onContinue={handleResume}
              onExit={handleExit}
            />
          )}
        </div>

        <AchievementPopup achievement={currentAchievement} />
      </main>
    </div>
  );
}
