import React from 'react';
import { Play } from 'lucide-react';

interface VideoProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
  };
}

export const VideoThumbnail: React.FC<VideoProps> = ({ video }) => {
  return (
    <div className="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-[360px] snap-center sm:snap-start group cursor-pointer flex flex-col gap-3">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-elevated shadow-lg border border-dark-surface">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Play className="text-dark-bg ml-1" size={24} fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 group-hover:text-neon-green transition-colors">
          {video.title}
        </h3>
        <p className="text-text-secondary text-sm mt-1 font-medium">
          {video.views} views • MacroPlate Academy
        </p>
      </div>
    </div>
  );
};
