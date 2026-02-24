import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Trophy, Shield, Zap, Target, Crosshair, Heart, Info, Coins, ShoppingBag, Sparkles } from 'lucide-react';
import { GameState, Achievement, PowerUpType } from '../types';
import { POWERUP_CONFIG } from '../constants';

interface UIProps {
  gameState: GameState;
  score: number;
  health: number;
  level: number;
  achievements: Achievement[];
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onPause: () => void;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl ${className}`}>
    {children}
  </div>
);

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 flex items-center justify-center z-50 p-4"
  >
    <GlassCard className="max-w-md w-full p-8 text-center text-white">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        eason&nalu星际先锋
      </h1>
      <p className="text-blue-200 mb-8">守护星系的和平，成为最强飞行员</p>
      
      <div className="space-y-4 mb-8 text-left text-sm text-gray-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Info size={16} /></div>
          <span>使用 WASD 或 方向键 移动</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Zap size={16} /></div>
          <span>空格键 射击，P键 暂停</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Shield size={16} /></div>
          <span>拾取道具获得 三向弹 或 护盾</span>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-bold flex items-center justify-center gap-2 group"
      >
        <Play size={20} className="group-hover:scale-110 transition-transform" />
        开始游戏
      </button>
    </GlassCard>
  </motion.div>
);

export const HUD: React.FC<{ 
  score: number; 
  health: number; 
  level: number; 
  coins: number;
  ultimateCharge: number;
  onPause: () => void;
  onOpenShop: () => void;
}> = ({ score, health, level, coins, ultimateCharge, onPause, onOpenShop }) => (
  <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-40">
    <div className="flex flex-col gap-2">
      <GlassCard className="px-4 py-2 flex items-center gap-4 text-white pointer-events-auto">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-blue-400" />
          <span className="font-mono text-xl">{score.toLocaleString()}</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-yellow-400" />
          <span className="font-mono text-xl">{coins}</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-purple-400" />
          <span className="font-bold">LV.{level}</span>
        </div>
      </GlassCard>
      
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ scale: i < health ? 1 : 0.8, opacity: i < health ? 1 : 0.3 }}
            >
              <Heart size={24} className={i < health ? "text-red-500 fill-red-500" : "text-gray-500"} />
            </motion.div>
          ))}
        </div>

        {/* Ultimate Bar */}
        <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden border border-white/20 relative">
          <motion.div 
            className="h-full bg-blue-500"
            animate={{ width: `${ultimateCharge}%` }}
          />
          {ultimateCharge >= 100 && (
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white uppercase"
            >
              按 E 释放大招
            </motion.div>
          )}
        </div>
      </div>
    </div>

    <div className="flex gap-2 pointer-events-auto">
      <button 
        onClick={onOpenShop}
        className="p-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
      >
        <ShoppingBag size={24} />
      </button>
      <button 
        onClick={onPause}
        className="p-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
      >
        <Pause size={24} />
      </button>
    </div>
  </div>
);

export const PauseScreen: React.FC<{ onResume: () => void; onRestart: () => void }> = ({ onResume, onRestart }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <GlassCard className="max-w-xs w-full p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-8">游戏暂停</h2>
      <div className="space-y-4">
        <button 
          onClick={onResume}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Play size={20} />
          继续游戏
        </button>
        <button 
          onClick={onRestart}
          className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          重新开始
        </button>
      </div>
    </GlassCard>
  </motion.div>
);

export const GameOverScreen: React.FC<{ score: number; level: number; achievements: Achievement[]; onRestart: () => void }> = ({ score, level, achievements, onRestart }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
  >
    <GlassCard className="max-w-md w-full p-8 text-center text-white my-auto">
      <h2 className="text-3xl font-bold mb-2 text-red-500">任务失败</h2>
      <p className="text-gray-400 mb-8">你的英勇表现将被铭记</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">最终得分</div>
          <div className="text-2xl font-mono font-bold">{score.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">到达关卡</div>
          <div className="text-2xl font-bold">LV.{level}</div>
        </div>
      </div>

      <div className="mb-8 text-left">
        <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
          <Trophy size={14} /> 获得成就
        </h3>
        <div className="space-y-2">
          {achievements.filter(a => a.unlocked).map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-blue-400">
                {a.icon === 'Target' && <Target size={18} />}
                {a.icon === 'Shield' && <Shield size={18} />}
                {a.icon === 'Zap' && <Zap size={18} />}
                {a.icon === 'Crosshair' && <Crosshair size={18} />}
                {a.icon === 'Trophy' && <Trophy size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold">{a.title}</div>
                <div className="text-xs text-gray-400">{a.description}</div>
              </div>
            </div>
          ))}
          {achievements.filter(a => a.unlocked).length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm italic">暂未获得成就</div>
          )}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        <RotateCcw size={20} />
        再试一次
      </button>
    </GlassCard>
  </motion.div>
);

export const MilestoneVictoryScreen: React.FC<{ onContinue: () => void; onExit: () => void }> = ({ onContinue, onExit }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <GlassCard className="max-w-md w-full p-8 text-center text-white">
      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500">
          <Trophy size={48} />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2 text-yellow-500">阶段性胜利!</h2>
      <p className="text-gray-300 mb-8">你已经达到了 5,000 分的里程碑。你可以选择带着荣誉退出，或者继续挑战更高难度（死亡将视为失败）。</p>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onContinue}
          className="py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Play size={20} />
          继续挑战
        </button>
        <button 
          onClick={onExit}
          className="py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          见好就收
        </button>
      </div>
    </GlassCard>
  </motion.div>
);

export const AchievementPopup: React.FC<{ achievement: Achievement | null }> = ({ achievement }) => (
  <AnimatePresence>
    {achievement && (
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed bottom-8 right-8 z-[100]"
      >
        <GlassCard className="p-4 flex items-center gap-4 border-yellow-500/50 bg-yellow-500/10">
          <div className="p-2 bg-yellow-500 rounded-lg text-black">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest">成就达成!</div>
            <div className="text-white font-bold">{achievement.title}</div>
          </div>
        </GlassCard>
      </motion.div>
    )}
  </AnimatePresence>
);

export const ShopScreen: React.FC<{ 
  coins: number; 
  onClose: () => void; 
  onBuy: (type: string) => void 
}> = ({ coins, onClose, onBuy }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
  >
    <GlassCard className="max-w-lg w-full p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="text-blue-400" /> 星际商店
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
          <Coins size={18} className="text-yellow-500" />
          <span className="font-mono font-bold text-xl">{coins}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ShopItem 
          title="三向子弹" 
          desc="火力全开，覆盖更广" 
          price={POWERUP_CONFIG.TRIPLE_SHOT.price} 
          icon={<Zap />} 
          onBuy={() => onBuy('TRIPLE_SHOT')}
          disabled={coins < (POWERUP_CONFIG.TRIPLE_SHOT.price || 0)}
        />
        <ShopItem 
          title="能量护盾" 
          desc="抵挡一次致命撞击" 
          price={POWERUP_CONFIG.SHIELD.price} 
          icon={<Shield />} 
          onBuy={() => onBuy('SHIELD')}
          disabled={coins < (POWERUP_CONFIG.SHIELD.price || 0)}
        />
        <ShopItem 
          title="紧急维修" 
          desc="恢复 1 点生命值" 
          price={POWERUP_CONFIG.HEALTH.price} 
          icon={<Heart />} 
          onBuy={() => onBuy('HEALTH')}
          disabled={coins < (POWERUP_CONFIG.HEALTH.price || 0)}
        />
        <ShopItem 
          title="大招充能" 
          desc="瞬间充满大招能量" 
          price={POWERUP_CONFIG.ULTIMATE.price} 
          icon={<Sparkles />} 
          onBuy={() => onBuy('ULTIMATE')}
          disabled={coins < (POWERUP_CONFIG.ULTIMATE.price || 0)}
        />
      </div>

      <button 
        onClick={onClose}
        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
      >
        返回游戏
      </button>
    </GlassCard>
  </motion.div>
);

const ShopItem: React.FC<{ 
  title: string; 
  desc: string; 
  price: number; 
  icon: React.ReactNode; 
  onBuy: () => void;
  disabled: boolean;
}> = ({ title, desc, price, icon, onBuy, disabled }) => (
  <div className={`p-4 rounded-xl border transition-all ${disabled ? 'bg-white/5 border-white/10 opacity-50' : 'bg-white/10 border-white/20 hover:border-blue-500/50 hover:bg-white/15'}`}>
    <div className="flex items-start gap-3 mb-3">
      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-[10px] text-gray-400 leading-tight">{desc}</div>
      </div>
    </div>
    <button 
      onClick={onBuy}
      disabled={disabled}
      className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${disabled ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
    >
      <Coins size={12} />
      {price} 购买
    </button>
  </div>
);
