import React, { useEffect, useState } from 'react';
import { VideoThumbnail } from './VideoThumbnail';
import videosData from '../../data/videos.json';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const VideoCarousel: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVideos(videosData);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-dark-surface border-t border-dark-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-3">
              Level Up Your Knowledge
            </h2>
            <p className="text-text-secondary text-lg">
              Master the science behind muscle growth, fat loss, and performance nutrition.
            </p>
          </div>
          
          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-dark-bg border border-dark-elevated hover:border-white hover:text-neon-green transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-dark-bg border border-dark-elevated hover:border-white hover:text-neon-green transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative -mx-4 sm:mx-0">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 sm:px-0"
          >
            {videos.map((video) => (
              <VideoThumbnail key={video.id} video={video} />
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
};
