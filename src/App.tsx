/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Lock, 
  Unlock, 
  Clock, 
  Search, 
  User, 
  LogOut, 
  Sparkles, 
  History, 
  MessageSquare, 
  Video, 
  Mic, 
  ChevronRight,
  Send,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { cn, formatDate } from './lib/utils';
import { createMemory, subscribeToMemories, Memory } from './lib/memories';
import confetti from 'canvas-confetti';
import Markdown from 'react-markdown';

// --- Components ---

const Atmosphere = () => (
  <div className="atmosphere pointer-events-none">
    <div className="atmosphere-pulses">
      <div className="pulse-1" />
      <div className="pulse-2" />
    </div>
    <div className="bg-dot-pattern" />
  </div>
);

const GlassCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    onClick={onClick}
    className={cn("glass-card p-8 relative overflow-hidden group border-white/10", className)}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className, 
  disabled,
  isLoading
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'ghost',
  className?: string,
  disabled?: boolean,
  isLoading?: boolean
}) => {
  const base = "px-10 py-5 rounded-none font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none border";
  const variants = {
    primary: "bg-white text-black border-white hover:bg-[#D4CFC9] hover:border-[#D4CFC9]",
    secondary: "bg-transparent text-[#D4CFC9] border-[#D4CFC9] hover:bg-[#D4CFC9] hover:text-[#0A0806]",
    ghost: "bg-transparent text-[#D4CFC9] border-transparent hover:opacity-70"
  };

  return (
    <button 
      onClick={onClick} 
      className={cn(base, variants[variant], className)}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeMemories = subscribeToMemories(setMemories);
      return () => unsubscribeMemories();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Atmosphere />
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between relative px-12 overflow-hidden">
        <Atmosphere />
        
        {/* Floating UI Detail */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 opacity-20 hidden md:flex">
          <div className="w-[1px] h-32 bg-[#D4CFC9]"></div>
          <div className="rotate-90 origin-center whitespace-nowrap text-[10px] tracking-[0.5em] font-bold">SCROLL CHRONICLES</div>
          <div className="w-[1px] h-32 bg-[#D4CFC9]"></div>
        </div>

        <nav className="relative z-10 flex justify-between items-center py-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#D4CFC9] flex items-center justify-center">
              <div className="w-2 h-2 bg-[#FF4E00]"></div>
            </div>
            <span className="tracking-[0.4em] font-bold text-xs uppercase">MemoryVault</span>
          </div>
          <div className="flex gap-10 text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
            <span className="hover:opacity-100 transition-opacity cursor-pointer">Archive</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer">Security</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer text-[#FF4E00] opacity-100">Future</span>
          </div>
        </nav>

        <main className="relative z-10 flex flex-col justify-center flex-1 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-[#FF4E00] font-serif italic text-2xl mb-8 block">Preserved in perpetuity.</span>
            <h1 className="text-7xl md:text-9xl leading-[0.85] tracking-tight font-serif mb-12">
              A Bridge<br/>Built of <br/><span className="italic opacity-60">Light & Memory.</span>
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center gap-12 max-w-2xl">
              <p className="text-xl leading-relaxed opacity-60 font-light font-serif">
                Your digital heritage preserved in a stasis of emotion. Digital capsules, future-locked letters, and AI-narrated chronicles.
              </p>
              <div className="flex-shrink-0">
                <Button onClick={handleLogin} className="px-12 py-6 text-xs transform hover:scale-105">
                  Seal Your Legacy
                </Button>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="relative z-10 border-t border-white/10 py-10 flex justify-between items-center text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
          <div>Est. 2024 — Secured Digitally</div>
          <div className="hidden md:flex gap-12">
            <span>Quantum Encrypted</span>
            <span>Switzerland-Alpha Node</span>
            <span>UTC {new Date().toISOString().split('T')[1].split('.')[0]}</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <Atmosphere />
      
      {/* Header */}
      <header className="px-12 py-8 border-b border-white/5 bg-transparent backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 border border-[#D4CFC9] flex items-center justify-center">
              <div className="w-1.5 h-1.5 accent-bg"></div>
            </div>
            <span className="font-bold text-xs uppercase tracking-[0.4em]">MemoryVault</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-widest font-bold opacity-40">
              <span className="hover:opacity-100 cursor-pointer">Archive</span>
              <span className="hover:opacity-100 cursor-pointer">Shared</span>
            </div>
            <div className="flex items-center gap-3 pl-8 border-l border-white/10">
              <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-none grayscale" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{user.displayName}</span>
              <button onClick={handleLogout} className="opacity-40 hover:opacity-100 transform active:scale-90">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-12 py-20">
        <div className="grid grid-cols-12 gap-12 mb-24">
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-end">
            <h2 className="text-8xl font-serif leading-[0.85] tracking-tighter mb-8">
              Digital <br/><span className="italic opacity-60">Chronicles.</span>
            </h2>
            <p className="text-xl text-white/50 font-serif italic max-w-xl">
              Exploring the intersection of time and emotion. {memories.length} entries archived in the vault.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 flex items-end justify-end">
            <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto px-12">
              <Plus className="w-4 h-4 mr-2" /> Seal New Memory
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-white/10 mb-24 divide-x divide-white/10">
          <div className="p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">Locked</div>
            <div className="text-4xl font-display font-medium leading-none">{memories.filter(m => m.isLocked).length.toString().padStart(2, '0')}</div>
          </div>
          <div className="p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">Unlocked</div>
            <div className="text-4xl font-display font-medium leading-none">{memories.filter(m => !m.isLocked).length.toString().padStart(2, '0')}</div>
          </div>
          <div className="p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">Active AI</div>
            <div className="text-4xl font-display font-medium leading-none">{memories.filter(m => m.aiSummary).length.toString().padStart(2, '0')}</div>
          </div>
          <div className="p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-2">Storage</div>
            <div className="text-4xl font-display font-medium leading-none">0.{memories.length} TB</div>
          </div>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/10 border border-white/10">
          {memories.map((memory) => (
            <MemoryCard 
              key={memory.id} 
              memory={memory} 
              onClick={() => setSelectedMemory(memory)}
            />
          ))}
          {memories.length === 0 && (
            <div className="col-span-full py-32 text-center bg-[#0A0806]">
              <p className="text-white/20 text-lg font-serif italic">Your chronicles are empty. Begin the stasis.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-12 py-10 border-t border-white/5 opacity-40 text-[9px] uppercase tracking-[0.4em] font-bold flex justify-between">
        <div>Vault Status: High Command Encrypted</div>
        <div className="flex gap-12">
          <span>Stasis Level: Stable</span>
          <span>Time: {new Date().toISOString()}</span>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <CreationModal 
            onClose={() => setIsCreating(false)} 
            onSuccess={() => {
              setIsCreating(false);
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffffff', '#FF4E00', '#D4CFC9']
              });
            }}
          />
        )}
        {selectedMemory && (
          <MemoryModal 
            memory={selectedMemory} 
            onClose={() => setSelectedMemory(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function MemoryCard({ memory, onClick }: { memory: Memory, onClick: () => void }) {
  const isLocked = memory.isLocked && new Date() < memory.unlockDate.toDate();
  
  return (
    <div 
      onClick={onClick} 
      className="bg-[#0A0806] p-10 h-[400px] flex flex-col justify-between cursor-pointer group hover:bg-white/5 transition-colors relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
            {isLocked ? 'Chronos Locked' : 'Unlocked Entry'}
          </span>
          <div className={cn("w-2 h-2 rounded-full", isLocked ? "bg-white/20" : "accent-bg animate-pulse")} />
        </div>
        
        <span className="accent-text font-serif italic text-lg mb-4 block">
          {memory.emotion || 'Preserved Essence'}
        </span>
        <h3 className="text-4xl font-serif leading-tight mb-8 group-hover:italic transition-all">
          {memory.title}
        </h3>
        <p className="text-white/40 line-clamp-4 text-sm leading-relaxed font-light">
          {memory.aiSummary || memory.content}
        </p>
      </div>
      
      <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">
          {formatDate(memory.createdAt.toDate())}
        </div>
        <div className="px-3 py-1 border border-white/20 text-[8px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:border-white transition-all">
          View Capsule
        </div>
      </div>
    </div>
  );
}

function CreationModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'letter' as 'text' | 'video' | 'audio' | 'letter',
    unlockDate: '',
    emotion: '',
    aiSummary: '',
    aiCaption: ''
  });

  const analyzeContent = async () => {
    if (!formData.content) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content })
      });
      const aiData = await res.json();
      setFormData(prev => ({ 
        ...prev, 
        emotion: aiData.emotion, 
        aiSummary: aiData.summary,
        aiCaption: aiData.caption
      }));
      setStep(3);
    } catch (e) {
      console.error(e);
      setStep(3); // Continue anyway
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createMemory({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        unlockDate: Timestamp.fromDate(new Date(formData.unlockDate)),
        emotion: formData.emotion,
        aiCaption: formData.aiCaption,
        aiSummary: formData.aiSummary
      });
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 bg-[#0A0806]"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border accent-border flex items-center justify-center">
              <div className="w-2 h-2 accent-bg animate-pulse" />
            </div>
            <h3 className="text-xl font-bold font-serif italic accent-text">Seal New Chronicle</h3>
          </div>
          <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex gap-1 mb-12">
          {[1,2,3].map(s => (
            <div key={s} className={cn("h-0.5 flex-1 transition-colors", step >= s ? "accent-bg" : "bg-white/10")} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Capsule Identification</label>
              <input 
                type="text" 
                placeholder="Entry #001: The Pacific Coast..."
                className="w-full bg-transparent border-b border-white/20 py-4 focus:border-white outline-none font-serif text-3xl italic"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Medium Selection</label>
              <div className="grid grid-cols-2 gap-4">
                {['letter', 'text', 'video', 'audio'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({...formData, type: t as any})}
                    className={cn(
                      "p-6 border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                      formData.type === t ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/40"
                    )}
                  >
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!formData.title} className="w-full">
              Proceed to Composition <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Emotional Imprint</label>
              <textarea 
                placeholder="Preserve your essence here..."
                className="w-full bg-transparent border border-white/10 p-8 min-h-[300px] focus:border-white outline-none font-serif text-xl leading-relaxed italic"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
              <p className="text-[10px] text-white/20 mt-4 tracking-wider italic">AI will synthesize the soul-frequency from this input.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button 
                onClick={analyzeContent} 
                disabled={!formData.content} 
                isLoading={loading}
                className="flex-[2]"
              >
                Synthesize Capsule <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10">
            <div className="p-8 border accent-border/30 bg-[#FF4E00]/5">
              <div className="flex items-center gap-2 mb-6 accent-text">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Synthesis Complete</span>
              </div>
              <p className="text-xl italic font-serif text-white/80 mb-8 leading-relaxed">"{formData.aiSummary}"</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1 border border-white/10 text-[9px] uppercase font-bold text-white/40">
                  Sentiment: {formData.emotion}
                </span>
                <span className="px-4 py-1 border border-white/10 text-[9px] uppercase font-bold text-white/40">
                  Focus: {formData.aiCaption}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Activation Coordinate (Time)</label>
              <input 
                type="date" 
                className="w-full bg-transparent border-b border-white/20 py-4 focus:border-white outline-none font-serif text-2xl italic"
                value={formData.unlockDate}
                onChange={e => setFormData({...formData, unlockDate: e.target.value})}
              />
              <p className="text-[10px] text-white/20 mt-4 tracking-wider italic">Set the temporal coordinates for delivery.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.unlockDate} 
                isLoading={loading}
                className="flex-[2] accent-bg text-white border-none"
              >
                Sealing Entry <Lock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MemoryModal({ memory, onClose }: { memory: Memory, onClose: () => void }) {
  const [sharingEmail, setSharingEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const isLocked = memory.isLocked && new Date() < memory.unlockDate.toDate();
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    if (!isLocked) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = memory.unlockDate.toDate().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLocked, memory.unlockDate]);

  const handleShare = async () => {
    if (!sharingEmail) return;
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      setSharingEmail('');
      alert("Shared with family member!");
    }, 1000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-none flex flex-col bg-[#0A0806] border border-white/10"
      >
        <div className="flex-1 overflow-y-auto p-12 md:p-16">
          <div className="flex items-start justify-between mb-20">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                 {isLocked ? <Lock className="w-6 h-6 text-white/20" /> : <Unlock className="w-6 h-6 accent-text" />}
               </div>
               <div>
                  <h3 className="text-5xl font-serif leading-none mb-4 italic tracking-tight">{memory.title}</h3>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em]">
                    Entries Established {formatDate(memory.createdAt.toDate())} • {memory.type} Series
                  </div>
               </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-none transition-all">
              <Plus className="w-8 h-8 rotate-45 opacity-40" />
            </button>
          </div>

          {isLocked ? (
            <div className="py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="text-center md:text-left">
                  <div className="text-[#FF4E00] font-serif italic text-2xl mb-6">Locked in Chonostatic Stasis.</div>
                  <h4 className="text-6xl font-serif leading-[0.85] tracking-tighter mb-8">Delivery<br/>Scheduled for<br/><span className="italic opacity-60">Succession.</span></h4>
                  <p className="text-lg text-white/40 font-serif italic max-w-sm">
                    This chronicle is traveling through the digital void. Access will be granted on {formatDate(memory.unlockDate.toDate())}.
                  </p>
                </div>
                
                {timeLeft && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Years/Days', val: timeLeft.days },
                      { label: 'Hours', val: timeLeft.hours },
                      { label: 'Minutes', val: timeLeft.minutes },
                      { label: 'Seconds', val: timeLeft.seconds }
                    ].map(t => (
                      <div key={t.label} className="p-8 border border-white/10 bg-white/5">
                        <div className="text-4xl font-mono tracking-tighter accent-text mb-2">{t.val.toString().padStart(2, '0')}</div>
                        <div className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-30">{t.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
              <div className="md:col-span-12">
                <div className="p-12 border border-white/10 font-serif text-3xl leading-relaxed text-white/90 italic bg-white/2 backdrop-blur-sm">
                  <Markdown>{memory.content}</Markdown>
                </div>
              </div>
              
              <div className="md:col-span-7">
                {memory.aiSummary && (
                  <div className="p-10 border accent-border/30 bg-[#FF4E00]/5 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-8 accent-text">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Chronos Analysis</span>
                    </div>
                    <p className="text-2xl font-serif text-white/80 italic leading-relaxed mb-10">
                      "{memory.aiSummary}"
                    </p>
                    <div className="mt-auto flex flex-wrap gap-3 pt-8 border-t border-white/10">
                      <div className="px-5 py-2 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40">
                        Frequency: {memory.emotion}
                      </div>
                      <div className="px-5 py-2 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40">
                        Tag: {memory.aiCaption}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 flex flex-col gap-6">
                <div className="p-10 border border-white/10 bg-white/5 flex flex-col h-full">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-2">
                    <User className="w-4 h-4" /> Heritage Sharing
                  </h5>
                  <p className="text-sm font-serif italic opacity-50 mb-8">Grant access to a secondary observer to ensure the legacy survives.</p>
                  <div className="space-y-4">
                    <input 
                      type="email" 
                      placeholder="Family Email..."
                      className="w-full bg-transparent border-b border-white/20 py-3 outline-none focus:border-white font-serif italic text-lg"
                      value={sharingEmail}
                      onChange={e => setSharingEmail(e.target.value)}
                    />
                    <Button onClick={handleShare} isLoading={isSharing} className="w-full">Initialize Share</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

