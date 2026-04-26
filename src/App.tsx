/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Telescope, Rocket, Sparkles, Satellite, RefreshCw, Loader2 } from 'lucide-react';
import { SpaceImage, fetchAllImages, fetchAPOD, fetchMarsRover, fetchEPIC } from './services/nasaService';
import { ImageCard } from './components/ImageCard';
import { ImageModal } from './components/ImageModal';

export default function App() {
  const [images, setImages] = useState<SpaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SpaceImage | null>(null);
  const [filter, setFilter] = useState<'All' | 'APOD' | 'Mars Rover' | 'EPIC' | 'NASA Library' | 'Copernicus'>('All');

  const loadData = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    setError(null);
    try {
      const nextPage = isLoadMore ? page + 1 : 1;
      const data = await fetchAllImages(nextPage);
      
      if (isLoadMore) {
        // Append new images and filter unique ones
        setImages(prev => {
          const combined = [...prev, ...data];
          const unique = Array.from(new Map(combined.map(img => [img.id, img])).values());
          return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        setPage(nextPage);
      } else {
        setImages(data);
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con la base de datos galáctica.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredImages = images.filter(img => filter === 'All' || img.source === filter);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-nebula-glow/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-bento-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter text-white">COSMO<span className="text-bento-accent">VIEW</span></h1>
              <div className="w-2 h-2 bg-bento-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mt-1">Satellite Imagery & Space Observation Registry</p>
          </div>

          <nav className="hidden md:flex items-center gap-8 mb-1">
            <button 
              onClick={() => setFilter('All')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'All' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Omniverse
            </button>
            <button 
              onClick={() => setFilter('Copernicus')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'Copernicus' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Copernicus
            </button>
            <button 
              onClick={() => setFilter('Mars Rover')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'Mars Rover' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Red Planet
            </button>
            <button 
              onClick={() => setFilter('EPIC')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'EPIC' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Terra
            </button>
            <button 
              onClick={() => setFilter('NASA Library')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'NASA Library' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Lunar
            </button>
            <button 
              onClick={() => setFilter('APOD')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${filter === 'APOD' ? 'text-bento-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Cosmos
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex gap-3 text-[9px] font-mono">
              <div className="border border-zinc-800 p-2 bg-zinc-900/50 rounded-lg">
                <span className="text-zinc-600 uppercase">Latency:</span> <span className="text-bento-accent">142ms</span>
              </div>
            </div>
            <button 
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-10 relative group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bento-hero-gradient opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-bento-accent text-black text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                Featured Registry
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-none"
              >
                SENTINEL-2 <br/><span className="text-zinc-500">Multispectral Imagery</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg max-w-xl leading-relaxed"
              >
                High-resolution optical imagery for land monitoring and coastal areas via Copernicus.
              </motion.p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="glass-card p-8 flex flex-col justify-between bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="text-zinc-500 text-xs font-mono uppercase">Active Feeds</div>
              <div className="text-6xl font-black text-white">{images.length > 0 ? images.length * 5 + 3 : '...'}</div>
              <div className="text-[10px] text-emerald-500 font-mono tracking-tight uppercase">+12 Since Last Sync</div>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white uppercase text-xs tracking-widest">NASA GIBS</h3>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">Global Imagery Browse</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10">
        {/* Mobile Filters */}
        <div className="flex md:hidden overflow-x-auto gap-4 pb-6 mb-4 scrollbar-hide text-zinc-500">
          {['All', 'Copernicus', 'Mars Rover', 'EPIC', 'NASA Library', 'APOD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-bento-accent text-black shadow-lg shadow-bento-accent/20' : 'bg-white/5 text-zinc-500'
              }`}
            >
              {f === 'All' ? 'Omniverse' : f === 'Copernicus' ? 'Copernicus' : f === 'Mars Rover' ? 'Mars' : f === 'EPIC' ? 'Terra' : f === 'NASA Library' ? 'Lunar' : 'Cosmos'}
            </button>
          ))}
        </div>

        {loading && images.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/40 gap-4">
            <Loader2 className="animate-spin text-bento-accent" size={32} />
            <p className="font-mono text-xs uppercase tracking-widest">Sincronizando con satélites...</p>
          </div>
        ) : error && images.length === 0 ? (
          <div className="max-w-2xl mx-auto p-12 glass-card bg-red-900/10 border-red-900/20 text-center">
            <Rocket className="mx-auto text-red-500 mb-6" size={48} />
            <h3 className="text-xl font-bold text-white mb-4">Fallo en la Secuencia de Carga</h3>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              {error}
            </p>
            <div className="text-left bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
              <p className="text-xs font-mono text-bento-accent uppercase tracking-widest">Protocolo de Restauración:</p>
              <ol className="text-sm text-zinc-300 space-y-3 list-decimal list-inside">
                <li>Ve a <a href="https://api.nasa.gov/" target="_blank" className="text-white underline decoration-bento-accent">api.nasa.gov</a> y obtén tu propia clave.</li>
                <li>Abre el panel de <b>Secrets</b> en el menú lateral izquierdo de AI Studio.</li>
                <li>Añade un secreto llamado <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-bento-accent">VITE_NASA_API_KEY</code>.</li>
                <li>Pega tu clave como valor y reinicia la app.</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <ImageCard 
                    key={image.id} 
                    image={image} 
                    index={index} 
                    onClick={setSelectedImage} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            
            {/* Load More Button */}
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => loadData(true)}
                disabled={loadingMore}
                className="group relative px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-bold transition-all hover:bg-zinc-800 hover:border-bento-accent/50 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  {loadingMore ? (
                    <Loader2 className="animate-spin text-bento-accent" size={20} />
                  ) : (
                    <Rocket className="text-zinc-500 group-hover:text-bento-accent transition-colors rotate-45" size={20} />
                  )}
                  <span>{loadingMore ? 'SOLICITANDO DATOS...' : 'SIGUIENTE ITERACIÓN'}</span>
                </div>
              </button>
            </div>
          </>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-24 text-white/30 italic">
            No se encontraron transmisiones activas en este cuadrante.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-bento-black/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
            <span>© 2026 Planetary Systems</span>
            <span className="hidden sm:inline">Terms of Discovery</span>
            <span className="hidden sm:inline">Focus Protocol</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500">
            <span className="uppercase tracking-widest">v1.5.0-Bento</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="uppercase">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
