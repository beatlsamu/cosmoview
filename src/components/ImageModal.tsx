import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpaceImage } from '../services/nasaService';
import { Calendar, Info, Maximize2, X, Download } from 'lucide-react';

interface ImageModalProps {
  image: SpaceImage | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden glass-card flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="md:w-2/3 h-[40vh] md:h-auto relative bg-black">
            <img
              src={image.hdurl || image.url}
              alt={image.title}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="md:w-1/3 p-6 md:p-8 overflow-y-auto bg-zinc-900">
            <div className="flex items-center gap-2 text-bento-accent mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-bento-accent/30 bg-bento-accent/10">
                {image.source}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono opacity-70">
                <Calendar size={12} />
                {image.date}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white tracking-tight leading-tight">
              {image.title}
            </h2>

            <div className="prose prose-invert prose-sm">
              <p className="text-zinc-400 leading-relaxed text-sm italic mb-6">
                {image.description}
              </p>
            </div>

            {image.copyright && (
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-6">
                © {image.copyright}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-auto">
              <a
                href={image.hdurl || image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all"
              >
                <Download size={16} />
                Download HD
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
