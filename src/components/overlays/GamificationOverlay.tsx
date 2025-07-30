
import React, { useState, useMemo } from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import './GamificationOverlay.css';

// Import placeholder components
import Badges from '../modules/gamification/achievements/Badges';
import Certificates from '../modules/gamification/achievements/Certificates';
import Showcases from '../modules/gamification/achievements/Showcases';
import EduCoinWallet from '../modules/gamification/rewards/EduCoinWallet';
import RewardStore from '../modules/gamification/rewards/RewardStore';
import TradingPost from '../modules/gamification/rewards/TradingPost';
import CharityDonations from '../modules/gamification/rewards/CharityDonations';
import GameLibrary from '../modules/gamification/challenges/GameLibrary';
import LearningChallenges from '../modules/gamification/challenges/LearningChallenges';
import Leaderboards from '../modules/gamification/community/Leaderboards';

// NEW - Import learning game components
import LanguageGame from '../modules/gamification/learning-games/LanguageGame';
import MathGame from '../modules/gamification/learning-games/MathGame';
import ScienceGame from '../modules/gamification/learning-games/ScienceGame';


type L1Tab = 'Achievements' | 'Rewards' | 'Challenges' | 'Community' | 'Learning Games';
interface L2Item {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

const gamificationData: Record<L1Tab, L2Item[]> = {
  Achievements: [
    { id: 'achievements.badges', name: 'Badges', icon: Icons.Badges, component: Badges },
    { id: 'achievements.certificates', name: 'Certificates', icon: Icons.Certificates, component: Certificates },
    { id: 'achievements.showcases', name: 'Showcases', icon: Icons.Showcases, component: Showcases },
  ],
  Rewards: [
    { id: 'rewards.wallet', name: 'EduCoin Wallet', icon: Icons.EduCoinWallet, component: EduCoinWallet },
    { id: 'rewards.store', name: 'Reward Store', icon: Icons.RewardStore, component: RewardStore },
    { id: 'rewards.trading', name: 'Trading Post', icon: Icons.TradingPost, component: TradingPost },
    { id: 'rewards.charity', name: 'Charity Donations', icon: Icons.CharityDonations, component: CharityDonations },
  ],
  Challenges: [
    { id: 'challenges.library', name: 'Game Library', icon: Icons.GameLibrary, component: GameLibrary },
    { id: 'challenges.learning', name: 'Learning Challenges', icon: Icons.LearningChallenges, component: LearningChallenges },
  ],
  'Learning Games': [
    { id: 'learning.language', name: 'Language', icon: Icons.LanguageGame, component: LanguageGame },
    { id: 'learning.math', name: 'Math', icon: Icons.MathGame, component: MathGame },
    { id: 'learning.science', name: 'Science', icon: Icons.ScienceGame, component: ScienceGame },
  ],
  Community: [
    { id: 'community.leaderboards', name: 'Leaderboards', icon: Icons.Leaderboards, component: Leaderboards },
  ]
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ElementType }[] = [
  { id: 'Achievements', name: 'Achievements', icon: Icons.Achievements },
  { id: 'Rewards', name: 'Rewards', icon: Icons.Rewards },
  { id: 'Challenges', name: 'Challenges', icon: Icons.Challenges },
  { id: 'Learning Games', name: 'Learning Games', icon: Icons.LearningGames },
  { id: 'Community', name: 'Community', icon: Icons.Community },
];

interface GamificationOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

const GamificationOverlay: React.FC<GamificationOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Learning Games');
  const [activeL2Id, setActiveL2Id] = useState<string>(gamificationData['Learning Games'][0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(gamificationData[tabId][0].id);
  };
  
  const l2Items = useMemo(() => gamificationData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(item => item.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <GlassmorphicContainer className="hobbies-overlay-bordered w-full h-full rounded-2xl flex flex-col overflow-hidden">
        <header className="hobbies-header">
          <div className="hobbies-l1-nav">
            {L1_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleL1Click(tab.id)}
                className={`hobbies-l1-btn ${activeL1 === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="hobbies-window-controls">
            <button onClick={onMinimize} className="hobbies-control-btn" aria-label="Minimize">
                <Icons.Minimize size={20} />
            </button>
            <button onClick={onClose} className="hobbies-control-btn close" aria-label="Close">
                <Icons.Close size={20} />
            </button>
          </div>
        </header>
        <div className="hobbies-body">
            <div className="hobbies-l2-sidebar">
                {l2Items.map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => setActiveL2Id(item.id)}
                                className={`hobbies-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
                                aria-label={item.name}
                            >
                                <Icon size={24} />
                            </button>
                            <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
                                {item.name}
                            </div>
                        </div>
                    );
                })}
            </div>
            <main className="hobbies-content-pane">
                {ActiveComponent ? <ActiveComponent /> : null}
            </main>
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default GamificationOverlay;