/**
 * BlockPalette - Visual block picker for Python code editor
 *
 * Features:
 * - Search blocks by name/tag
 * - Filter by category
 * - Recently used blocks
 * - Favorites system
 * - Click to insert into code
 */

import React, { useState, useEffect, useMemo } from 'react';
import blocksData from '../../../public/blocks.json';

interface Block {
  id: string;
  textureFile: string;
  displayName: string;
  category: string;
  tags: string[];
  kidFriendly: boolean;
  hasVariants: boolean;
  isDecorative: boolean;
  isTransparent: boolean;
}

interface BlockPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: '✨ All Blocks', emoji: '✨' },
  { id: 'kid-friendly', name: '⭐ Kid Favorites', emoji: '⭐' },
  { id: 'recent', name: '🕐 Recently Used', emoji: '🕐' },
  { id: 'favorites', name: '❤️ My Favorites', emoji: '❤️' },
  { id: 'wood', name: '🪵 Wood & Planks', emoji: '🪵' },
  { id: 'stone', name: '🪨 Stone & Bricks', emoji: '🪨' },
  { id: 'glass', name: '🔳 Glass', emoji: '🔳' },
  { id: 'concrete', name: '🧱 Concrete', emoji: '🧱' },
  { id: 'wool', name: '🧶 Wool & Carpet', emoji: '🧶' },
  { id: 'ores', name: '💎 Ores & Gems', emoji: '💎' },
  { id: 'nature', name: '🌿 Plants & Nature', emoji: '🌿' },
  { id: 'nether', name: '🔥 Nether', emoji: '🔥' },
  { id: 'end', name: '🌌 The End', emoji: '🌌' },
  { id: 'lighting', name: '💡 Lighting', emoji: '💡' },
  { id: 'doors', name: '🚪 Doors & Gates', emoji: '🚪' },
  { id: 'redstone', name: '⚡ Redstone', emoji: '⚡' },
  { id: 'decoration', name: '🎨 Decorative', emoji: '🎨' },
  { id: 'other', name: '📦 Other', emoji: '📦' },
];

export default function BlockPalette({ isOpen, onClose, onSelectBlock }: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('kid-friendly');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  const blocks = blocksData.blocks as Block[];

  // Load favorites and recent from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('blockcraft_favorites');
    const savedRecent = localStorage.getItem('blockcraft_recent');

    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    if (savedRecent) {
      setRecentlyUsed(JSON.parse(savedRecent));
    }
  }, []);

  // Save to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    setFavorites(newFavorites);
    localStorage.setItem('blockcraft_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const saveRecent = (newRecent: string[]) => {
    setRecentlyUsed(newRecent);
    localStorage.setItem('blockcraft_recent', JSON.stringify(newRecent));
  };

  // Toggle favorite
  const toggleFavorite = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(blockId)) {
      newFavorites.delete(blockId);
    } else {
      newFavorites.add(blockId);
    }
    saveFavorites(newFavorites);
  };

  // Handle block selection
  const handleBlockClick = (blockId: string) => {
    // Add to recently used (max 20)
    const newRecent = [blockId, ...recentlyUsed.filter(id => id !== blockId)].slice(0, 20);
    saveRecent(newRecent);

    // Call parent handler
    onSelectBlock(blockId);
  };

  // Filter blocks
  const filteredBlocks = useMemo(() => {
    let result = blocks;

    // Category filter
    if (selectedCategory === 'kid-friendly') {
      result = result.filter(b => b.kidFriendly);
    } else if (selectedCategory === 'favorites') {
      result = result.filter(b => favorites.has(b.id));
    } else if (selectedCategory === 'recent') {
      const recentSet = new Set(recentlyUsed);
      result = blocks.filter(b => recentSet.has(b.id));
      // Sort by recency
      result.sort((a, b) => recentlyUsed.indexOf(a.id) - recentlyUsed.indexOf(b.id));
    } else if (selectedCategory !== 'all') {
      result = result.filter(b => b.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.displayName.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [blocks, selectedCategory, searchQuery, favorites, recentlyUsed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col relative z-10 animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              📦 Block Palette
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none p-1"
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white focus:outline-none"
          />
        </div>

        {/* Category chips */}
        <div className="p-3 bg-gray-50 border-b overflow-x-auto">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.emoji} {cat.name.replace(/^.*?\s/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-2 bg-blue-50 text-sm text-blue-900">
          {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''} found
        </div>

        {/* Block grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredBlocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>No blocks found</div>
              <div className="text-sm mt-1">Try a different search or category</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredBlocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => handleBlockClick(block.id)}
                  className="relative group bg-white border-2 border-gray-200 rounded-lg p-2 hover:border-purple-500 hover:shadow-lg transition-all text-left"
                  title={`${block.displayName}\nID: ${block.id}\nClick to insert`}
                >
                  {/* Texture */}
                  <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                    <img
                      src={`/textures/block/${block.textureFile}`}
                      alt={block.displayName}
                      className="w-full h-full object-contain pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>

                  {/* Name */}
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {block.displayName}
                  </div>

                  {/* ID */}
                  <div className="text-[10px] text-gray-500 truncate font-mono">
                    {block.id}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1 mt-1">
                    {block.kidFriendly && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded">⭐</span>
                    )}
                    {block.isTransparent && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">▢</span>
                    )}
                  </div>

                  {/* Favorite button */}
                  <div
                    onClick={(e) => toggleFavorite(block.id, e)}
                    className="absolute top-1 right-1 text-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 cursor-pointer"
                    title={favorites.has(block.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.has(block.id) ? '❤️' : '🤍'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 text-center">
          💡 <strong>Tip:</strong> Click a block to insert its ID into your code
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
