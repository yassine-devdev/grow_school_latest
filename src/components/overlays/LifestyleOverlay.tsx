'use client';

import React, { useState } from 'react';
import { Icons } from '../icons';
import './LifestyleOverlay.css';

interface LifestyleOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

interface LifestyleCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  items: LifestyleItem[];
}

interface LifestyleItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: string;
}

const lifestyleData: LifestyleCategory[] = [
  {
    id: 'wellness',
    name: 'Wellness',
    icon: Icons.Heart,
    description: 'Physical and mental health activities',
    items: [
      {
        id: 'meditation',
        title: 'Daily Meditation',
        description: 'Start your day with mindfulness and inner peace',
        image: 'https://source.unsplash.com/400x300?meditation',
        category: 'wellness',
        tags: ['mindfulness', 'stress-relief', 'mental-health'],
        difficulty: 'Easy',
        duration: '10-30 min'
      },
      {
        id: 'yoga',
        title: 'Morning Yoga',
        description: 'Gentle stretches and poses to energize your body',
        image: 'https://source.unsplash.com/400x300?yoga',
        category: 'wellness',
        tags: ['flexibility', 'strength', 'balance'],
        difficulty: 'Medium',
        duration: '20-45 min'
      },
      {
        id: 'breathing',
        title: 'Breathing Exercises',
        description: 'Techniques to improve focus and reduce anxiety',
        image: 'https://source.unsplash.com/400x300?breathing',
        category: 'wellness',
        tags: ['relaxation', 'focus', 'anxiety-relief'],
        difficulty: 'Easy',
        duration: '5-15 min'
      }
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: Icons.Apple,
    description: 'Healthy eating and meal planning',
    items: [
      {
        id: 'meal-prep',
        title: 'Weekly Meal Prep',
        description: 'Plan and prepare nutritious meals for the week',
        image: 'https://source.unsplash.com/400x300?meal-prep',
        category: 'nutrition',
        tags: ['planning', 'healthy-eating', 'time-saving'],
        difficulty: 'Medium',
        duration: '2-3 hours'
      },
      {
        id: 'smoothies',
        title: 'Healthy Smoothies',
        description: 'Nutrient-packed smoothie recipes for energy',
        image: 'https://source.unsplash.com/400x300?smoothie',
        category: 'nutrition',
        tags: ['vitamins', 'energy', 'quick'],
        difficulty: 'Easy',
        duration: '5-10 min'
      }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: Icons.Target,
    description: 'Time management and goal setting',
    items: [
      {
        id: 'time-blocking',
        title: 'Time Blocking',
        description: 'Organize your day with focused time blocks',
        image: 'https://source.unsplash.com/400x300?planning',
        category: 'productivity',
        tags: ['time-management', 'focus', 'organization'],
        difficulty: 'Medium',
        duration: 'Ongoing'
      },
      {
        id: 'goal-setting',
        title: 'SMART Goals',
        description: 'Set and track meaningful, achievable goals',
        image: 'https://source.unsplash.com/400x300?goals',
        category: 'productivity',
        tags: ['goals', 'planning', 'achievement'],
        difficulty: 'Medium',
        duration: '30-60 min'
      }
    ]
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Icons.Users,
    description: 'Building and maintaining connections',
    items: [
      {
        id: 'communication',
        title: 'Active Listening',
        description: 'Improve your communication and empathy skills',
        image: 'https://source.unsplash.com/400x300?conversation',
        category: 'relationships',
        tags: ['communication', 'empathy', 'listening'],
        difficulty: 'Medium',
        duration: 'Practice daily'
      },
      {
        id: 'gratitude',
        title: 'Gratitude Practice',
        description: 'Express appreciation to strengthen relationships',
        image: 'https://source.unsplash.com/400x300?gratitude',
        category: 'relationships',
        tags: ['gratitude', 'appreciation', 'positivity'],
        difficulty: 'Easy',
        duration: '5-10 min'
      }
    ]
  }
];

const LifestyleOverlay: React.FC<LifestyleOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeCategory, setActiveCategory] = useState<string>('wellness');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LifestyleItem | null>(null);

  const currentCategory = lifestyleData.find(cat => cat.id === activeCategory);
  const allItems = lifestyleData.flatMap(cat => cat.items);
  
  const filteredItems = searchQuery 
    ? allItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentCategory?.items || [];

  const handleStartActivity = (item: LifestyleItem) => {
    setSelectedItem(item);
    // In a real app, this would start the activity or open detailed instructions
    console.log('Starting activity:', item.title);
  };

  return (
    <div className="lifestyle-overlay">
      <div className="lifestyle-overlay-header">
        <div className="lifestyle-overlay-header-left">
          <div className="lifestyle-overlay-icon">
            <Icons.Lifestyle size={24} />
          </div>
          <h1 className="lifestyle-overlay-title">Lifestyle Hub</h1>
        </div>
        <div className="lifestyle-overlay-header-right">
          <button onClick={onMinimize} className="lifestyle-overlay-btn lifestyle-overlay-btn-minimize">
            <Icons.ChevronDown size={16} />
          </button>
          <button onClick={onClose} className="lifestyle-overlay-btn lifestyle-overlay-btn-close">
            <Icons.Close size={16} />
          </button>
        </div>
      </div>

      <div className="lifestyle-overlay-content">
        {/* Search */}
        <div className="lifestyle-search-container">
          <Icons.Search size={18} className="lifestyle-search-icon" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lifestyle-search-input"
          />
        </div>

        <div className="lifestyle-main">
          {/* Categories Sidebar */}
          {!searchQuery && (
            <div className="lifestyle-categories">
              <h3>Categories</h3>
              {lifestyleData.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`lifestyle-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  >
                    <IconComponent size={20} />
                    <div>
                      <div className="category-name">{category.name}</div>
                      <div className="category-description">{category.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Activities Grid */}
          <div className="lifestyle-activities">
            <div className="lifestyle-activities-header">
              <h2>{searchQuery ? 'Search Results' : currentCategory?.name}</h2>
              <p>{searchQuery ? `${filteredItems.length} activities found` : currentCategory?.description}</p>
            </div>

            <div className="lifestyle-activities-grid">
              {filteredItems.length === 0 ? (
                <div className="lifestyle-empty-state">
                  <Icons.Search size={48} />
                  <p>No activities found</p>
                  {searchQuery && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="lifestyle-activity-card">
                    <div className="lifestyle-activity-image">
                      <img src={item.image} alt={item.title} />
                      <div className="lifestyle-activity-overlay">
                        <button
                          onClick={() => handleStartActivity(item)}
                          className="lifestyle-start-btn"
                        >
                          Start Activity
                        </button>
                      </div>
                    </div>
                    
                    <div className="lifestyle-activity-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      
                      <div className="lifestyle-activity-meta">
                        {item.difficulty && (
                          <span className={`difficulty ${item.difficulty.toLowerCase()}`}>
                            {item.difficulty}
                          </span>
                        )}
                        {item.duration && (
                          <span className="duration">{item.duration}</span>
                        )}
                      </div>
                      
                      <div className="lifestyle-activity-tags">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedItem && (
        <div className="lifestyle-activity-modal" onClick={() => setSelectedItem(null)}>
          <div className="lifestyle-activity-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lifestyle-activity-modal-header">
              <h2>{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)}>
                <Icons.Close size={20} />
              </button>
            </div>
            <div className="lifestyle-activity-modal-body">
              <img src={selectedItem.image} alt={selectedItem.title} />
              <div className="modal-content">
                <p>{selectedItem.description}</p>
                <div className="modal-meta">
                  {selectedItem.difficulty && <span>Difficulty: {selectedItem.difficulty}</span>}
                  {selectedItem.duration && <span>Duration: {selectedItem.duration}</span>}
                </div>
                <div className="modal-tags">
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="lifestyle-close-modal-btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleOverlay;
