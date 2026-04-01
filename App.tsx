
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Dumbbell, 
  Upload, 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  ExternalLink, 
  FileJson, 
  Activity,
  Target,
  Download,
  Terminal,
  MapPin,
  Maximize2,
  Cpu,
  Layers,
  Box,
  RotateCw,
  Zap,
  Navigation,
  Sparkles,
  Link as LinkIcon,
  Box as BoxIcon
} from 'lucide-react';
import * as gemini from './services/geminiService';
import { AnalysisState } from './types';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [charImg, setCharImg] = useState<string | null>(null);
  const [charDesc, setCharDesc] = useState('Maniquí plateado, musculoso, sin rostro');
  const [refImg, setRefImg] = useState<string | null>(null);
  const [refDesc, setRefDesc] = useState('');
  const [exercise, setExercise] = useState('CURL FEMORAL');
  
  const [state, setState] = useState<AnalysisState>({
    syncData: null,
    groundingSources: [],
    visualUrl: null,
    videoUrl: null,
    videoPrompt: '',
    isAnalyzing: false,
    isVideoGenerating: false
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'char' | 'ref') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'char') setCharImg(reader.result as string);
        else setRefImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runSyncV3 = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const { data, sources } = await gemini.runBiomechSyncV3(
        { image: charImg || undefined, text: charDesc },
        { image: refImg || undefined, text: refDesc },
        exercise
      );
      
      const visual = await gemini.generateVisualV3(data, refImg || undefined, charImg || undefined, charDesc);
      
      const initialVideoPrompt = data.video_prompt_en || `Cinematic 3D animation of a silver muscular mannequin performing a ${data.verificacion_grounding.ejercicio_solicitado}. 
The character smoothly executes the movement. The gym machine remains completely solid and stationary. 
The character's hands and feet stay firmly glued to the machine's pads and handles without slipping. 
Motion: The character pushes the weight, then slowly returns to the starting position.
The working muscles glow slightly to show activation. Smooth, slow, controlled, physically accurate motion.`;

      setState({
        syncData: data,
        groundingSources: sources,
        visualUrl: visual,
        videoUrl: null,
        videoPrompt: initialVideoPrompt,
        isAnalyzing: false,
        isVideoGenerating: false
      });
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      alert("Error en la validación de coherencia mecánica.");
    }
  };

  const handleGenerateVideo = async () => {
    if (!state.syncData || !state.visualUrl || !state.videoPrompt) return;
    
    // Check for API key
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Assume key is selected after this
      }
    }

    setState(prev => ({ ...prev, isVideoGenerating: true }));
    try {
      const videoUrl = await gemini.generateVideo(state.visualUrl, state.videoPrompt);
      setState(prev => ({ ...prev, videoUrl, isVideoGenerating: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isVideoGenerating: false }));
      alert("Error al generar el video.");
    }
  };

  const downloadImage = () => {
    if (!state.visualUrl) return;
    const link = document.createElement('a');
    link.href = state.visualUrl;
    link.download = `${state.syncData?.verificacion_grounding.ejercicio_solicitado.replace(/\s+/g, '_') || 'render'}_visual.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-orange-500/30 font-sans">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl py-6 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-orange-600 p-2.5 rounded-2xl shadow-2xl shadow-orange-500/40">
              <BoxIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">BiomechSync <span className="text-indigo-500">v4.0</span></h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Animation & Video Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Animation Engine: Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sujeto */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass-panel p-8 rounded-[2.5rem] border-white/5 bg-slate-950 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <User className="w-4 h-4 text-indigo-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sujeto a Insertar</h2>
              </div>
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="relative aspect-video bg-black border border-white/5 rounded-3xl overflow-hidden group/img cursor-pointer">
                  {charImg ? <img src={charImg} className="w-full h-full object-cover grayscale-[0.2]" /> : <div className="flex flex-col items-center justify-center h-full text-slate-700 font-black"><Upload className="w-6 h-6 mb-3" /> <span className="text-[10px] uppercase">Subir Sujeto</span></div>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFile(e, 'char')} />
                </div>
                <textarea 
                  placeholder="Describe al sujeto (ej. complexión, ropa)..." 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium focus:ring-1 focus:ring-indigo-500 outline-none flex-1 min-h-[80px] resize-none"
                  value={charDesc}
                  onChange={e => setCharDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Máquina */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/20 to-transparent rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass-panel p-8 rounded-[2.5rem] border-white/5 bg-slate-950 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <Settings className="w-4 h-4 text-orange-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Persona en Máquina</h2>
              </div>
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="relative aspect-video bg-black border border-white/5 rounded-3xl overflow-hidden group/img cursor-pointer">
                  {refImg ? <img src={refImg} className="w-full h-full object-cover grayscale-[0.2]" /> : <div className="flex flex-col items-center justify-center h-full text-slate-700 font-black"><Upload className="w-6 h-6 mb-3" /> <span className="text-[10px] uppercase">Subir Referencia</span></div>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFile(e, 'ref')} />
                </div>
                <textarea 
                  placeholder="Describe el ejercicio y la máquina..." 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium focus:ring-1 focus:ring-orange-500 outline-none flex-1 min-h-[80px] resize-none"
                  value={refDesc}
                  onChange={e => setRefDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Procesamiento */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500/20 to-transparent rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass-panel p-8 rounded-[2.5rem] border-white/5 bg-slate-950 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <Cpu className="w-4 h-4 text-violet-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Generación de Animación</h2>
              </div>
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Ejercicio a Analizar</label>
                  <input 
                    type="text" 
                    value={exercise}
                    onChange={e => setExercise(e.target.value)}
                    className="w-full bg-transparent text-3xl font-black italic uppercase outline-none focus:text-indigo-400 border-b border-white/10 pb-4"
                  />
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">Analizando biomecánica, puntos de anclaje y rangos de movimiento para generar una animación 3D precisa.</p>
                  </div>
                </div>

                <button 
                  onClick={runSyncV3}
                  disabled={state.isAnalyzing || !exercise}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  {state.isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  <span className="uppercase tracking-widest">Analizar Biomecánica</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {state.syncData && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Simulation Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-black group">
                  {state.videoUrl ? (
                    <video src={state.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={state.visualUrl!} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                  
                  <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    {state.videoUrl && (
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = state.videoUrl!;
                          link.download = `${state.syncData!.verificacion_grounding.ejercicio_solicitado.replace(/\s+/g, '_')}_ANIMATION.mp4`;
                          link.click();
                        }}
                        className="flex items-center gap-2 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl transition-all text-white shadow-xl"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Download Video</span>
                      </button>
                    )}
                    <button 
                      onClick={downloadImage}
                      className="flex items-center gap-2 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl transition-all text-white shadow-xl"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Download Image</span>
                    </button>
                  </div>

                  <div className="absolute bottom-12 left-12 right-12 pointer-events-none">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">{state.syncData.verificacion_grounding.ejercicio_solicitado}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instrucciones de Animación (Editable)</h4>
                    </div>
                    <textarea 
                      value={state.videoPrompt}
                      onChange={e => setState(prev => ({ ...prev, videoPrompt: e.target.value }))}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-[11px] font-mono text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[120px] resize-y"
                      placeholder="Instrucciones para la generación de video..."
                    />
                    <p className="text-[10px] text-slate-500 mt-3 font-medium">Revisa y ajusta la descripción de la biomecánica, rangos de movimiento y músculos a resaltar antes de generar el video.</p>
                  </div>

                  <button 
                    onClick={handleGenerateVideo}
                    disabled={state.isVideoGenerating || !state.videoPrompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                  >
                    {state.isVideoGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    <span className="uppercase tracking-widest">{state.isVideoGenerating ? 'Generando Animación (Toma unos minutos)...' : (state.videoUrl ? 'Regenerar Animación' : 'Generar Animación de Biomecánica')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-white/5 mt-20 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
        <p>BiomechSync Animation Engine v4.0</p>
        <div className="flex gap-12">
           <span>AI Video Generation</span>
           <span>Biomechanics Analysis</span>
        </div>
      </footer>
    </div>
  );
}
