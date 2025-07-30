'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import './MediaOverlay.css';

interface MediaOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'Movies' | 'Series' | 'Documentaries' | 'Educational';
  thumbnail: string;
  duration?: string;
  rating?: number;
  year?: number;
  description?: string;
}

const mediaData: MediaItem[] = [
  // Movies
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `movie_${i + 1}`,
    title: `Educational Film ${i + 1}`,
    type: 'Movies' as const,
    thumbnail: `https://source.unsplash.com/400x600?education,movie,${i}`,
    duration: `${90 + Math.floor(Math.random() * 60)}min`,
    rating: 4.0 + Math.random(),
    year: 2020 + Math.floor(Math.random() * 4),
    description: `An engaging educational film about learning and growth.`
  })),
  // Series
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `series_${i + 1}`,
    title: `Learning Series ${i + 1}`,
    type: 'Series' as const,
    thumbnail: `https://source.unsplash.com/400x600?education,series,${i}`,
    duration: `${8 + Math.floor(Math.random() * 12)} episodes`,
    rating: 4.2 + Math.random() * 0.8,
    year: 2021 + Math.floor(Math.random() * 3),
    description: `A comprehensive series covering important educational topics.`
  })),
  // Documentaries
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `doc_${i + 1}`,
    title: `Documentary ${i + 1}`,
    type: 'Documentaries' as const,
    thumbnail: `https://source.unsplash.com/400x600?documentary,nature,${i}`,
    duration: `${45 + Math.floor(Math.random() * 90)}min`,
    rating: 4.3 + Math.random() * 0.7,
    year: 2019 + Math.floor(Math.random() * 5),
    description: `An insightful documentary exploring real-world topics.`
  })),
  // Educational
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `edu_${i + 1}`,
    title: `Educational Content ${i + 1}`,
    type: 'Educational' as const,
    thumbnail: `https://source.unsplash.com/400x600?education,learning,${i}`,
    duration: `${15 + Math.floor(Math.random() * 45)}min`,
    rating: 4.1 + Math.random() * 0.9,
    year: 2022 + Math.floor(Math.random() * 2),
    description: `Interactive educational content for enhanced learning.`
  }))
];

const MediaOverlay: React.FC<MediaOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeCategory, setActiveCategory] = useState<'Movies' | 'Series' | 'Documentaries' | 'Educational'>('Movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const categories = ['Movies', 'Series', 'Documentaries', 'Educational'] as const;

  const filteredMedia = useMemo(() => {
    return mediaData.filter(item => {
      const matchesCategory = item.type === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handlePlayMedia = (item: MediaItem) => {
    setSelectedItem(item);
    // In a real app, this would open a video player
    console.log('Playing:', item.title);
  };

  return (
    <div className="media-overlay">
      <div className="media-overlay-header">
        <div className="media-overlay-header-left">
          <div className="media-overlay-icon">
            <Icons.Media size={24} />
          </div>
          <h1 className="media-overlay-title">Media Center</h1>
        </div>
        <div className="media-overlay-header-right">
          <button onClick={onMinimize} className="media-overlay-btn media-overlay-btn-minimize">
            <Icons.ChevronDown size={16} />
          </button>
          <button onClick={onClose} className="media-overlay-btn media-overlay-btn-close">
            <Icons.Close size={16} />
          </button>
        </div>
      </div>

      <div className="media-overlay-content">
        {/* Search and Categories */}
        <div className="media-overlay-controls">
          <div className="media-search-container">
            <Icons.Search size={18} className="media-search-icon" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="media-search-input"
            />
          </div>
          
          <div className="media-categories">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`media-category-btn ${activeCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="media-grid">
          {filteredMedia.length === 0 ? (
            <div className="media-empty-state">
              <Icons.Media size={48} />
              <p>No {activeCategory.toLowerCase()} found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            filteredMedia.map(item => (
              <div key={item.id} className="media-card">
                <div className="media-card-thumbnail">
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="media-card-overlay">
                    <button
                      onClick={() => handlePlayMedia(item)}
                      className="media-play-btn"
                    >
                      <Icons.ChevronRight size={24} />
                    </button>
                  </div>
                  {item.duration && (
                    <div className="media-duration">{item.duration}</div>
                  )}
                </div>
                
                <div className="media-card-content">
                  <h3 className="media-card-title">{item.title}</h3>
                  <div className="media-card-meta">
                    {item.year && <span>{item.year}</span>}
                    {item.rating && (
                      <div className="media-rating">
                        <Icons.Star size={12} />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <p className="media-card-description">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Media Player Modal */}
      {selectedItem && (
        <div className="media-player-modal" onClick={() => setSelectedItem(null)}>
          <div className="media-player-content" onClick={(e) => e.stopPropagation()}>
            <div className="media-player-header">
              <h2>{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)}>
                <Icons.Close size={20} />
              </button>
            </div>
            <div className="media-player-body">
              <div className="media-player-placeholder">
                <Icons.Media size={64} />
                <p>Media Player</p>
                <p className="text-sm">Playing: {selectedItem.title}</p>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="media-close-player-btn"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaOverlay;
