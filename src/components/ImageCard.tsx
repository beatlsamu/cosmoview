import React from 'react';
import { motion } from 'motion/react';
import { SpaceImage } from '../services/nasaService';
import { Maximize2, Calendar } from 'lucide-react';

interface ImageCardProps {
  image: SpaceImage;
  onClick: (image: SpaceImage) => void;
  index: number;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(image)}
      className="group relative glass-card cursor-pointer"
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bento-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex justify-between items-end">
            <div className="max-w-[80%]">
              <p className="text-[10px] font-mono text-bento-accent uppercase tracking-tighter mb-1">
                {image.source}
              </p>
              <h3 className="text-white text-sm font-semibold truncate leading-tight">
                {image.title}
              </h3>
            </div>
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
              <Maximize2 size={16} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between text-zinc-500">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider">
            <Calendar size={12} className="text-bento-accent" />
            {image.date}
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
            {image.source === 'APOD' ? 'COSMOS' : 
             image.source === 'Mars Rover' ? 'RED PLANET' : 
             image.source === 'EPIC' ? 'TERRA' : 
             image.source === 'Copernicus' ? 'COPERNICUS' : 'LUNAR'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
