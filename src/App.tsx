import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Layers, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  Palette, 
  Maximize2, 
  Minimize2,
  Edit,
  Save,
  Clock,
  Play,
  Pause,
  Download,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PresentationData, SlideItem } from "./types";

// Dynamic font and visual theme designs
const VIBE_STYLES: Record<string, {
  name: string;
  titleFont: string;
  bodyFont: string;
  badgeBg: string;
  accentColor: string;
}> = {
  "sleek-dark": {
    name: "Sleek Obsidian",
    titleFont: "font-display font-extrabold tracking-tight",
    bodyFont: "font-sans",
    badgeBg: "bg-white/10 text-white/90",
    accentColor: "text-blue-400"
  },
  "minimal-light": {
    name: "Minimalist Light",
    titleFont: "font-sans font-bold tracking-tight text-slate-900",
    bodyFont: "font-sans text-slate-700 font-light",
    badgeBg: "bg-black/10 text-slate-800",
    accentColor: "text-indigo-600"
  },
  "creative-vibrant": {
    name: "Syne Creative",
    titleFont: "font-syne font-extrabold tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]",
    bodyFont: "font-sans",
    badgeBg: "bg-white/20 text-white font-medium",
    accentColor: "text-pink-400"
  },
  "corporate-blue": {
    name: "Corporate Modern",
    titleFont: "font-jakarta font-bold tracking-tight",
    bodyFont: "font-sans",
    badgeBg: "bg-blue-600/15 text-blue-400 border border-blue-500/10",
    accentColor: "text-blue-500"
  },
  "cyber-retro": {
    name: "Cyberpunk Terminal",
    titleFont: "font-mono font-bold tracking-tighter text-teal-400 [text-shadow:0_0_8px_rgba(45,212,191,0.5)]",
    bodyFont: "font-mono text-cyan-200/90",
    badgeBg: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
    accentColor: "text-teal-400"
  },
  "sand-warm": {
    name: "Earthy Sand Warm",
    titleFont: "font-serif text-[#3B2C1A] italic font-semibold",
    bodyFont: "font-serif text-[#4A3D2C]",
    badgeBg: "bg-[#EFE7DC] text-[#4A3B2A] border border-[#DDD3C5]",
    accentColor: "text-amber-700"
  },
  "slate-clean": {
    name: "Slate Technical",
    titleFont: "font-display font-bold tracking-tight text-slate-100",
    bodyFont: "font-sans text-slate-300",
    badgeBg: "bg-slate-700/40 text-slate-200 border border-slate-600/30",
    accentColor: "text-indigo-300"
  },
  "emerald-green": {
    name: "Luxurious Emerald",
    titleFont: "font-serif text-emerald-950 font-bold",
    bodyFont: "font-sans text-emerald-800/90",
    badgeBg: "bg-emerald-900/10 text-emerald-800 border border-emerald-900/20",
    accentColor: "text-emerald-500"
  }
};

// Physics sliding variants for transitions
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] // seamless custom cubic-bezier
    }
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -400 : 400,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

// Elegant initial presentation pre-loaded so they can test fonts & PDF export immediately
const initialDeck: PresentationData = {
  presentationTitle: "SlideCraft AI • Intelligent Companion Decks",
  slides: [
    {
      title: "Elevate Presentations with Google Gemini",
      bulletPoints: [
        "Synthesize raw documents or outlines into executive cards instantly",
        "Choose custom design theme vibe pairs to shift tone gracefully",
        "Generate multi-page PDF assets with precise landscape vector layouts",
        "Access instant speaker teleprompter advice per slide to sound polished"
      ],
      backgroundColor: "#0F172A",
      isDark: true,
      presenterNotes: "Welcome to SlideCraft AI v2.6. Today, we demonstrate a premium slide presentation engine. Try navigating with sliding animations or toggle Speaker Mode to rehearse with our real-time chronometer."
    },
    {
      title: "Typography Pairings & Visual Themes",
      bulletPoints: [
        "Interactive Font-Shifting maps display weights dynamically",
        "Cyberpunk: Mono terminal look using customized JetBrains spacing",
        "Warm Sand: Elegant classy editorial structure utilizing Georgia serif",
        "Emerald Luxury: botanical organic accents that command attention"
      ],
      backgroundColor: "#FAF9F6",
      isDark: false,
      presenterNotes: "Typography makes the message clear. Standard presentations often look static, but here, each theme vibing changes the typeface to match the communication style, keeping audience eyes engaged."
    },
    {
      title: "Interactive Presenter Studio Pro",
      bulletPoints: [
        "Complete slide counts expansion now supports decks up to 20 slides",
        "Outline jump grids allow navigating 20 slides instantly at a glance",
        "Live markdown layout preview allows rapid copying outlines on-the-go",
        "Rehearse with precision with our custom active rehearsal stop stopwatch"
      ],
      backgroundColor: "#0B0F19",
      isDark: true,
      presenterNotes: "This slide outlines our custom tools. Slide outlines provide a scrollable dock so presenters don't get lost clicking 'Next' 15 times. You can also view live markdown for copying content."
    },
    {
      title: "Frictionless Inline Editing Layouts",
      bulletPoints: [
        "Double click any slide or tap 'Edit Slide Copy' to make instant inline edits",
        "Add, delete or translate bullet points dynamically on the fly",
        "Modify speaker transcripts directly and save locally in real-time"
      ],
      backgroundColor: "#EBF3FC",
      isDark: false,
      presenterNotes: "We know that presentations are rarely perfect on the first draft. Tap the 'Edit Slide Copy' button to open our live content sheet. Type changes, save them, and they reflect instantly on screen."
    },
    {
      title: "Zero-Loss Vector PDF Printing Assets",
      bulletPoints: [
        "Native browser printing bypasses flat low-res clipping blocks",
        "Pipes slides directly into separate printable vector-perfect sheets",
        "Ready to export in any high resolution or share with stakeholders"
      ],
      backgroundColor: "#1E3A8A",
      isDark: true,
      presenterNotes: "Finally, check the 'Export to PDF' mechanism. It uses clean CSS paged stylesheets to print clean high-contrast slides directly to standard print PDF format cleanly and elegantly."
    }
  ]
};

interface SavedDeck extends PresentationData {
  id: string;
  createdAt: number;
  vibe?: string;
}

// Format timestamp helper
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

// Convert hex to RGB to be 100% safe with all versions of jsPDF
const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};

export default function App() {
  const [topic, setTopic] = useState("");
  // Now supports up to 20 slides
  const [slideCount, setSlideCount] = useState<string>("5");
  const [vibe, setVibe] = useState<
    | "sleek-dark"
    | "minimal-light"
    | "creative-vibrant"
    | "corporate-blue"
    | "cyber-retro"
    | "sand-warm"
    | "slate-clean"
    | "emerald-green"
  >("sleek-dark");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Local storage history of decks
  const [history, setHistory] = useState<SavedDeck[]>(() => {
    try {
      const stored = localStorage.getItem("slidecraft_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      
      // Default initial blueprint slide deck baseline seed
      const seed: SavedDeck = {
        id: "initial_blueprint",
        presentationTitle: "SlideCraft AI • Intelligent Companion Decks",
        slides: initialDeck.slides,
        createdAt: Date.now() - 3600000,
        vibe: "sleek-dark"
      };
      
      try {
        localStorage.setItem("slidecraft_history", JSON.stringify([seed]));
      } catch (innerErr) {}
      
      return [seed];
    } catch (e) {
      return [];
    }
  });

  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("slidecraft_active_id");
      if (stored) return stored;
    } catch (e) {}
    return "initial_blueprint";
  });

  // Start with gorgeous initial default presentation instead of empty state
  const [presentation, setPresentation] = useState<PresentationData | null>(() => {
    try {
      const storedActiveId = localStorage.getItem("slidecraft_active_id") || "initial_blueprint";
      const stored = localStorage.getItem("slidecraft_history");
      if (stored) {
        const parsed = JSON.parse(stored) as SavedDeck[];
        const found = parsed.find(d => d.id === storedActiveId);
        if (found) return found;
        if (parsed.length > 0) return parsed[0];
      }
    } catch (e) {}
    return initialDeck;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = right, -1 = left
  
  // Inline card editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBulletsStr, setEditBulletsStr] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  // Presenter Stopwatch Rehearsal Timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Synchronize history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("slidecraft_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  }, [history]);

  // Synchronize active deck ID change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("slidecraft_active_id", activeDeckId);
    } catch (e) {
      console.error("Failed to save active ID to localStorage:", e);
    }
  }, [activeDeckId]);

  // Auto-sync theme selection changes back into history representation
  useEffect(() => {
    if (presentation && activeDeckId) {
      setHistory(prev => prev.map(deck => {
        if (deck.id === activeDeckId) {
          return { ...deck, vibe };
        }
        return deck;
      }));
    }
  }, [vibe]);

  // Design wizard loading phases
  const loadingPhases = [
    "Analyzing topic input & extracting core presentation narrative...",
    "Drafting slide content hierarchy & executive summaries with Gemini AI...",
    "Injecting detailed speaker transcripts & timing notes for transition pacing...",
    "Mapping custom high-contrast color palettes per tone selection...",
    "Assembling fine typography styles & finalizing interactive presentation layout..."
  ];

  // Curated topics for presentation testing
  const presets = [
    {
      title: "🚀 Quantum Physics",
      text: "Introduction to Quantum Computing. Highlight qubits, quantum superposition, quantum entanglement, and the race for supremacy with simple, clear analogies."
    },
    {
      title: "🌱 Sustainable Cities",
      text: "Eco-friendly sustainable cities. Cover solar skyscrapers, high-density bento grids, electric avenues, urban food gardens, and rainwater harvesting networks."
    },
    {
      title: "🧘 Mindfulness & Focus",
      text: "A guide to deep focus and digital detox. Detail practical rule of thirds, daily breathing mechanics, micro-meditation, and cognitive recovery techniques."
    }
  ];

  // Rehearsal Stopwatch effect
  useEffect(() => {
    let intervalId: any = null;
    if (timerActive) {
      intervalId = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerActive]);

  const startTimer = () => setTimerActive(true);
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  const handlePresetSelect = (text: string) => {
    setTopic(text);
    setError(null);
  };

  const generatePresentation = async () => {
    if (!topic.trim()) {
      setError("Please write down a topic or paste reference text first.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep(0);
    setIsEditing(false); // Close editor on generate

    // Cycle through loader simulation
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingPhases.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slideCount, vibe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation API endpoint failed.");
      }

      const newId = "deck_" + Date.now();
      const newDeck: SavedDeck = {
        id: newId,
        presentationTitle: data.presentationTitle,
        slides: data.slides,
        createdAt: Date.now(),
        vibe: vibe
      };

      setHistory(prev => [newDeck, ...prev]);
      setPresentation(newDeck);
      setActiveDeckId(newId);
      setCurrentIndex(0);
      setDirection(0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to reach SlideCraft slide generation server. Please make sure the API is active.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!presentation) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % presentation.slides.length);
  };

  const handlePrev = () => {
    if (!presentation) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + presentation.slides.length) % presentation.slides.length);
  };

  // Direct client-side PDF export bypasses sandboxed iframe limitations
  const exportPDFWithJsPDF = () => {
    if (!presentation || !presentation.slides.length) return;
    
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4" // 297mm x 210mm
      });
      
      presentation.slides.forEach((slide, idx) => {
        if (idx > 0) {
          doc.addPage("a4", "landscape");
        }
        
        // 1. Draw solid background
        const bg = slide.backgroundColor || "#0a0a0a";
        const rgb = hexToRgb(bg);
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(0, 0, 297, 210, "F");
        
        // Use markerColor for the elegant left slide rail
        const textColor = slide.isDark ? [255, 255, 255] : [15, 23, 42]; // white vs deep slate
        const secondaryTextColor = slide.isDark ? [220, 225, 235] : [71, 85, 105]; // high readability
        const lineDrawColor = slide.isDark ? [60, 70, 90] : [210, 215, 225];
        const markerColor = slide.isDark ? [129, 140, 248] : [79, 70, 229]; // Indigo-400 vs Indigo-600
        const tagBgColor = slide.isDark ? [30, 41, 59] : [241, 245, 249];
        
        // A. Draw elegant Left Side Rail Accent Bar (8mm width)
        doc.setFillColor(markerColor[0], markerColor[1], markerColor[2]);
        doc.rect(0, 0, 8, 210, "F");

        // Helper to set text color
        const setDocTextColor = (rgbArr: number[]) => {
          doc.setTextColor(rgbArr[0], rgbArr[1], rgbArr[2]);
        };
        
        // 2. Draw Header Area
        setDocTextColor(secondaryTextColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const slideNoString = `DECK SLIDE — ${String(idx + 1).padStart(2, '0')} OF ${String(presentation.slides.length).padStart(2, '0')}`;
        doc.text(slideNoString, 24, 20);
        
        doc.setFont("helvetica", "bold");
        const themeLabel = `DESIGN SCHEMA: ${vibe.replace('-', ' ').toUpperCase()}`;
        doc.text(themeLabel, 273, 20, { align: "right" });
        
        // Draw Header subtle divider line
        doc.setDrawColor(lineDrawColor[0], lineDrawColor[1], lineDrawColor[2]);
        doc.setLineWidth(0.4);
        doc.line(24, 25, 273, 25);
        
        // 3. Draw Slide Title with custom large size and modern layout
        setDocTextColor(textColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(32); // Increased from 26
        
        const titleText = slide.title || "Untitled Slide";
        const maxTitleWidth = 245; // 297 - 52 margin spaces 
        const wrappedTitle = doc.splitTextToSize(titleText, maxTitleWidth);
        
        let currentY = 44;
        doc.text(wrappedTitle, 24, currentY);
        
        // Advance currentY based on title lines with extra breathing room
        currentY += (wrappedTitle.length * 12) + 8;
        
        // Draw a small custom accent line under the title for structural polish
        doc.setDrawColor(markerColor[0], markerColor[1], markerColor[2]);
        doc.setLineWidth(1.0);
        doc.line(24, currentY - 4, 44, currentY - 4); // 20mm accent line
        
        currentY += 8; // Extra padding before content

        // 4. Draw Slide Bullet Points with gorgeous spacing & clean tag pills
        const bullets = slide.bulletPoints || [];
        bullets.forEach((bullet, bIdx) => {
          // Draw a soft background pill of tag list item
          doc.setFillColor(tagBgColor[0], tagBgColor[1], tagBgColor[2]);
          // Draw bullet badge or side-bar card pill
          doc.rect(24, currentY - 6, 8, 8, "F");
          
          // Draw bullet badge number inside the pill
          setDocTextColor(slide.isDark ? [255, 255, 255] : [79, 70, 229]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(String(bIdx + 1).padStart(2, '0'), 28, currentY - 0.5, { align: "center" });

          // Bullet text wrap
          setDocTextColor(textColor);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14.5); // Large, excellent readability font
          
          const maxBulletWidth = 228;
          const wrappedBullet = doc.splitTextToSize(bullet, maxBulletWidth);
          doc.text(wrappedBullet, 38, currentY);
          
          // Move currentY down: proportional to lines + generous spacing
          currentY += (wrappedBullet.length * 7.5) + 10;
        });
        
        // 5. Draw Footer line & metadata details
        doc.setDrawColor(lineDrawColor[0], lineDrawColor[1], lineDrawColor[2]);
        doc.setLineWidth(0.4);
        doc.line(24, 184, 273, 184);
        
        setDocTextColor(secondaryTextColor);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        const docTitleTrimmed = presentation.presentationTitle.length > 95 
          ? presentation.presentationTitle.substring(0, 92) + "..." 
          : presentation.presentationTitle;
        doc.text(docTitleTrimmed, 24, 192);
        
        doc.setFont("helvetica", "bold");
        doc.text("SLIDECRAFT AI • CORE GENERATOR", 273, 192, { align: "right" });
      });
      
      const cleanTitle = presentation.presentationTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .substring(0, 55);
      const fileName = `slidecraft_${cleanTitle || "presentation"}.pdf`;
      doc.save(fileName);
    } catch (err: any) {
      console.error("Direct PDF generator error:", err);
      alert("Encountered an issue compile-rendering client-side PDF: " + err.message);
    }
  };

  // Load a deck from history
  const handleLoadHistoryDeck = (deck: SavedDeck) => {
    setPresentation({
      presentationTitle: deck.presentationTitle,
      slides: deck.slides
    });
    setActiveDeckId(deck.id);
    setCurrentIndex(0);
    setDirection(0);
    setIsEditing(false);
    if (deck.vibe) {
      setVibe(deck.vibe as any);
    }
  };

  // Delete a deck from history
  const handleDeleteHistoryDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading the deck when clicking delete
    
    setHistory(prev => {
      const filtered = prev.filter(d => d.id !== deckId);
      
      // If we deleted the active deck, load another deck or clear/default
      if (activeDeckId === deckId) {
        if (filtered.length > 0) {
          const nextDeck = filtered[0];
          setPresentation({
            presentationTitle: nextDeck.presentationTitle,
            slides: nextDeck.slides
          });
          setActiveDeckId(nextDeck.id);
          if (nextDeck.vibe) {
            setVibe(nextDeck.vibe as any);
          }
        } else {
          const seed: SavedDeck = {
            id: "initial_blueprint_" + Date.now(),
            presentationTitle: "SlideCraft AI • Intelligent Companion Decks",
            slides: initialDeck.slides,
            createdAt: Date.now(),
            vibe: "sleek-dark"
          };
          // Sync state fallback
          setTimeout(() => {
            setHistory([seed]);
            setPresentation(seed);
            setActiveDeckId(seed.id);
            setVibe("sleek-dark");
          }, 0);
        }
      }
      return filtered;
    });
  };

  // Open the inline editors
  const startEditing = () => {
    if (!presentation) return;
    const slide = presentation.slides[currentIndex];
    setEditTitle(slide.title);
    setEditBulletsStr(slide.bulletPoints.join("\n"));
    setEditNotes(slide.presenterNotes || "");
    setIsEditing(true);
  };

  // Save the inline changes locally
  const saveEditing = () => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentIndex] = {
      ...updatedSlides[currentIndex],
      title: editTitle,
      bulletPoints: editBulletsStr.split("\n").filter(b => b.trim() !== ""),
      presenterNotes: editNotes
    };
    
    const updatedDeck = {
      ...presentation,
      slides: updatedSlides
    };
    
    setPresentation(updatedDeck);
    
    // Sync the edit inside history listing
    setHistory(prev => {
      const exists = prev.some(d => d.id === activeDeckId);
      if (exists) {
        return prev.map(deck => {
          if (deck.id === activeDeckId) {
            return {
              ...deck,
              presentationTitle: updatedDeck.presentationTitle,
              slides: updatedDeck.slides,
              vibe: vibe
            };
          }
          return deck;
        });
      } else {
        const newDeck: SavedDeck = {
          id: activeDeckId || "deck_" + Date.now(),
          presentationTitle: updatedDeck.presentationTitle,
          slides: updatedDeck.slides,
          createdAt: Date.now(),
          vibe: vibe
        };
        return [newDeck, ...prev];
      }
    });

    setIsEditing(false);
  };

  // Resolve current theme class mappings
  const themeAccent = VIBE_STYLES[vibe] || VIBE_STYLES["sleek-dark"];

  return (
    <div className="min-h-screen bg-[#050b18] font-sans text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Self-Contained Custom CSS Style Block for PDF Breakages printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #print-only-deck {
            display: none !important;
          }
        }
        @media print {
          #header-nav, #control-dock, #presentation-workspace, #workspace-footer, .no-print {
            display: none !important;
          }
          #print-only-deck {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: transparent !important;
          }
          .print-slide-page {
            width: 297mm !important;
            height: 210mm !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 3rem !important;
            box-sizing: border-box !important;
            border: none !important;
            border-radius: 0 !important;
            position: relative !important;
            background-color: var(--bg-print) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* Decorative Gradient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Panel Header */}
      <header id="header-nav" className="no-print flex items-center justify-between px-6 md:px-10 py-6 relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Presentation className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-sans">
              SlideCraft AI
            </span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400 font-mono tracking-widest uppercase">
              v2.6 Pro
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gemini GenAI Active
          </span>
        </div>
      </header>

      {/* Main Full-Scale Workspace Layout Grid */}
      <main id="main-content" className="no-print flex-1 max-w-7xl w-full mx-auto px-6 md:px-10 pb-8 flex flex-col lg:grid lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Hand: Controller & Formulation Deck Drawer */}
        <section id="control-dock" className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                <Layers className="h-5 w-5 text-blue-400" />
                Configure Deck
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your topic, outline details or raw notes to let Gemini design a comprehensive slide show.
              </p>
            </div>

            {/* Input Textarea for Narrative */}
            <div className="flex flex-col gap-2">
              <label htmlFor="topic-input" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                Topic, Target outline, Or text data
              </label>
              <textarea
                id="topic-input"
                className="w-full h-40 bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-all placeholder:text-slate-600 outline-none font-sans"
                placeholder="Examples: A business proposal on sustainable urbanism / A study outline of quantum physics qubits... Paste anything to rewrite elegantly."
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            {/* Curated Pre-loads Sample Links */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5 flex items-center gap-1">
                <FileText className="h-3 w-3 text-indigo-400" /> Or pick a sample preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(preset.text)}
                    className="text-[11px] px-3 py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800 hover:border-white/15 transition text-slate-300 text-left cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Double Column Configuration Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Slides Select configuration from 3 to 20 */}
              <div className="flex flex-col gap-2">
                <label htmlFor="slide-count-select" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Slide Count
                </label>
                <div className="relative">
                  <select
                    id="slide-count-select"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    value={slideCount}
                    onChange={(e: any) => setSlideCount(e.target.value)}
                  >
                    <option value="3">3 Slides</option>
                    <option value="5">5 Slides</option>
                    <option value="8">8 Slides</option>
                    <option value="10">10 Slides</option>
                    <option value="12">12 Slides</option>
                    <option value="15">15 Slides</option>
                    <option value="20">20 Slides</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[9px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Theme selection expanded mapping */}
              <div className="flex flex-col gap-2">
                <label htmlFor="design-vibe-select" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Theme Style
                </label>
                <div className="relative">
                  <select
                    id="design-vibe-select"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    value={vibe}
                    onChange={(e: any) => setVibe(e.target.value)}
                  >
                    <option value="sleek-dark">Sleek Obsidian</option>
                    <option value="minimal-light">Serene Light</option>
                    <option value="creative-vibrant">Syne Creative</option>
                    <option value="corporate-blue">Corporate Blue</option>
                    <option value="cyber-retro">Cyber Neon</option>
                    <option value="sand-warm">Sand Warm</option>
                    <option value="slate-clean"> Slate Clean</option>
                    <option value="emerald-green">Lux Emerald</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[9px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Error notifications block */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-xs flex gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <span className="font-semibold block">Design issue encountered</span>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Trigger Button */}
            <button
              id="generate-button"
              type="button"
              disabled={loading}
              onClick={generatePresentation}
              className={`w-full py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-900/10 ${
                loading
                  ? "bg-slate-800 text-slate-500 border border-white/5 pointer-events-none"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                  <span>Drafting {slideCount} Slides...</span>
                </>
              ) : (
                <>
                  <span>Create Intelligent Deck</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Saved Presentation Decks History Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-2xl relative z-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Saved Decks History
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold">
                {history.length} Saved
              </span>
            </div>

            {/* List scroll wrapper */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {history.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 italic">
                  No saved history yet.
                </div>
              ) : (
                history.map((deck) => {
                  const isActive = deck.id === activeDeckId;
                  const deckStyle = VIBE_STYLES[deck.vibe || "sleek-dark"] || VIBE_STYLES["sleek-dark"];
                  
                  return (
                    <div
                      key={deck.id}
                      onClick={() => handleLoadHistoryDeck(deck)}
                      className={`group p-2.5 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-start gap-1 ${
                        isActive
                          ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/5"
                          : "bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className={`text-[8px] font-mono tracking-wider font-bold ${isActive ? "text-cyan-400" : "text-indigo-400"}`}>
                          {deck.vibe ? deckStyle.name.toUpperCase() : "SLEEK OBSIDIAN"}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 leading-tight">
                          {deck.presentationTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1">
                          <span>{deck.slides.length} Slides</span>
                          <span>•</span>
                          <span>{formatDate(deck.createdAt)}</span>
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryDeck(deck.id, e)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition active:scale-95"
                        title="Delete deck from history"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Helper to back-up database */}
            <div className="flex gap-2 text-[10px] text-slate-500 justify-between items-center border-t border-white/5 pt-2">
              <span>Automatic Sync active</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    const dataStr = JSON.stringify(history, null, 2);
                    const blob = new Blob([dataStr], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `slidecraft-history-export-${Date.now()}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    alert("Unable to download backup JSON file.");
                  }
                }}
                className="text-indigo-400 hover:text-indigo-300 transition underline cursor-pointer font-medium"
              >
                Export Backup
              </button>
            </div>
          </div>

          {/* Core Telemetry metadata */}
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-semibold text-indigo-300">Active Typography Engine Loaded</p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fonts dynamic: <strong>Space Grotesk</strong> headers standard, shifting to <strong>Playfair</strong> or <strong>JetBrains Mono</strong> based on Vibe.
            </p>
          </div>
        </section>

        {/* Right Hand: Project Carousel Board and Workspace panels */}
        <section id="presentation-workspace" className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Slide Theater & Preview Studio
            </span>
            {presentation && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-xl transition cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Presenter Stage View
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[440px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {loading ? (
                /* Gemini Draft loading display */
                <motion.div
                  key="loading-stage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full min-h-[440px] bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 text-center backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="relative flex items-center justify-center w-20 h-20">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute w-14 h-14 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
                    <Presentation className="h-5 w-5 text-blue-400 relative z-10" />
                  </div>

                  <div className="flex flex-col gap-2 max-w-sm">
                    <h3 className="font-semibold text-lg text-white">
                      Synthesized Layout Generating
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono min-h-[40px]">
                      {loadingPhases[loadingStep]}
                    </p>
                  </div>

                  <div className="w-44 h-1 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300" 
                      style={{ width: `${((loadingStep + 1) / loadingPhases.length) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ) : presentation ? (
                /* Interactive Display Deck and controls wrapper */
                <motion.div
                  key="presentation-carousel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="px-1 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#4f46e5] uppercase font-bold">
                        Generated Dynamic Deck
                      </span>
                      <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-none mt-1">
                        {presentation.presentationTitle}
                      </h1>
                    </div>
                    {/* Active indicators */}
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono">
                      FONT SCHEMA: {themeAccent.name.toUpperCase()}
                    </span>
                  </div>

                  {/* Projected Slide wrapper with overflow-hidden to accommodate sliding motions */}
                  <div className="relative w-full aspect-[4/5] xs:aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9.5] flex items-center justify-center overflow-hidden bg-slate-900/30 rounded-[1.8rem] xs:rounded-[2.5rem] border border-white/5">
                    {/* Background Plate Stack style decor */}
                    <div className="absolute w-[92%] h-[85%] bg-white/5 rounded-[1.2rem] xs:rounded-[2rem] translate-y-3 xs:translate-y-4 scale-95 border border-white/5 pointer-events-none transition-all duration-300" />
                    
                    <div className="w-full h-full relative overflow-hidden rounded-[1.8rem] xs:rounded-[2.5rem]">
                      <AnimatePresence initial={false} custom={direction} mode="wait">
                        {/* Slide Projection Frame */}
                        <motion.div 
                          key={currentIndex} 
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          id="slide-card-container" 
                          className="absolute inset-0 p-5 xs:p-8 md:p-11 shadow-2xl flex flex-col justify-between transition-all"
                          style={{ 
                            backgroundColor: presentation.slides[currentIndex].backgroundColor,
                            color: presentation.slides[currentIndex].isDark ? "#ffffff" : "#0f172a"
                          }}
                        >
                          {/* Inner glowing vectors depending on light/dark mode */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-44 h-44 bg-black/5 rounded-full blur-3xl pointer-events-none" />

                          {/* Slide Card Header info */}
                          <div className="flex items-center justify-between relative z-10 w-full no-print">
                            <span className={`px-2.5 py-0.5 xs:px-3 xs:py-1 text-[9px] xs:text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              presentation.slides[currentIndex].isDark 
                                ? "bg-white/10 text-white/90" 
                                : "bg-black/10 text-slate-900"
                            }`}>
                              Slide {String(currentIndex + 1).padStart(2, '0')} of {String(presentation.slides.length).padStart(2, '0')}
                            </span>
                            <span className={`text-[9px] xs:text-[10px] py-0.5 px-2 xs:py-1 xs:px-2.5 rounded-full font-medium border shadow-sm backdrop-blur-md uppercase font-mono ${
                              presentation.slides[currentIndex].isDark 
                                ? "bg-white/5 border-white/10 text-white/80" 
                                : "bg-black/5 border-black/10 text-slate-800"
                            }`}>
                              {vibe.replace('-', ' ')}
                            </span>
                          </div>

                          {/* Slide core Copy blocks */}
                          <div className="my-auto py-2 relative z-10 flex flex-col justify-center">
                            <h2 className={`text-lg xs:text-2xl sm:text-3xl md:text-4.5xl font-extrabold tracking-tight leading-tight mb-3 xs:mb-5 ${themeAccent.titleFont}`}>
                              {presentation.slides[currentIndex].title}
                            </h2>
                            
                            <div className="space-y-2 xs:space-y-3.5 md:space-y-4">
                              {presentation.slides[currentIndex].bulletPoints.map((bullet, idx) => (
                                <div key={idx} className="flex items-start gap-2 xs:gap-3">
                                  <div className={`w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 xs:mt-1 transition-all ${
                                    presentation.slides[currentIndex].isDark 
                                      ? "bg-white/10 border border-white/20" 
                                      : "bg-black/10 border border-black/20"
                                  }`}>
                                    <div className={`w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full ${
                                      presentation.slides[currentIndex].isDark ? "bg-white" : "bg-slate-900"
                                    }`} />
                                  </div>
                                  <p className={`text-xs xs:text-sm sm:text-base md:text-[17px] leading-relaxed opacity-90 ${themeAccent.bodyFont}`}>
                                    {bullet}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Slide Card Footer Info */}
                          <div className={`flex items-center justify-between text-[9px] xs:text-[10px] font-medium border-t pt-2.5 xs:pt-3 relative z-10 ${
                            presentation.slides[currentIndex].isDark 
                              ? "border-white/10 text-white/50" 
                              : "border-black/10 text-slate-700"
                          }`}>
                            <span className="truncate max-w-[150px] xs:max-w-[220px] font-medium tracking-tight">
                              {presentation.presentationTitle}
                            </span>
                            <span className="font-mono tracking-widest uppercase opacity-75">SLIDECRAFT AI</span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Horizontally scrollable Slide Outline jumping navigation nodes (For decks up to 20 slides) */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#4f46e5] uppercase font-bold">
                      Slide Index outline grid ({presentation.slides.length} slides)
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {presentation.slides.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                          }}
                          className={`flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                            idx === currentIndex 
                              ? "bg-indigo-600/30 border-blue-500 text-white shadow-md shadow-blue-500/10 scale-102"
                              : "bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-300"
                          }`}
                        >
                          <div className="text-[9px] font-bold opacity-60">Slide {String(idx + 1).padStart(2, '0')}</div>
                          <div className="text-xs font-semibold truncate max-w-[120px]">{slide.title || "Untitled slide"}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Speaker transcript drawer notes */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Speaker Guidance Speech notes
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const text = presentation.slides[currentIndex].presenterNotes || "";
                          navigator.clipboard.writeText(text);
                          alert("Notes copied successfully to clipboard!");
                        }}
                        className="text-[9px] uppercase font-mono px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition"
                      >
                        Copy Notes
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans italic">
                      "{presentation.slides[currentIndex].presenterNotes || "No notes written. Press Edit Slide Copy below to jot notes."}"
                    </p>
                  </div>

                  {/* Carousel Left / Right slide buttons strip */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl">
                    <div className="flex gap-1.5">
                      {presentation.slides.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentIndex ? "w-5 bg-blue-500" : "w-1.5 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="h-10 w-12 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition active:scale-95"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="h-10 w-12 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition active:scale-95"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Slide Editor / Multi-page PDF print trigger buttons row */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          saveEditing();
                        } else {
                          startEditing();
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        isEditing
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-white/10 hover:bg-white/15 text-slate-200"
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      {isEditing ? "Save Inline Copy" : "Edit Slide Copy"}
                    </button>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const text = presentation.slides.map((s, idx) => `## Slide ${idx+1}: ${s.title}\n` + s.bulletPoints.map(b => `* ${b}`).join('\n') + `\n\n*Speaker Notes: ${s.presenterNotes || ""}`).join('\n\n');
                          navigator.clipboard.writeText(`# ${presentation.presentationTitle}\n\n${text}`);
                          alert("Presentation outline copied in clean Markdown syntax!");
                        }}
                        className="px-4 py-2.5 bg-white/10 hover:bg-[#12182c] border border-white/5 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Copy Markdown
                      </button>

                      <button
                        type="button"
                        onClick={exportPDFWithJsPDF}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 shadow-xl shadow-blue-500/10"
                        title="Download high-resolution, responsive multi-page PDF presentation deck"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export PDF Deck
                      </button>
                    </div>
                  </div>

                  {/* Inline Copy Editor Panel rendering */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 border border-white/10 overflow-hidden p-5 rounded-2xl flex flex-col gap-4 mt-2"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Live Inline Slide Editor: Slide {currentIndex + 1}
                        </h4>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 ml-1">Title</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 ml-1">Bullet Points (One bullet per line)</label>
                          <textarea 
                            rows={4}
                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono transition resize-none"
                            value={editBulletsStr}
                            onChange={(e) => setEditBulletsStr(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 ml-1">Speaker Speech Transcripts</label>
                          <textarea 
                            rows={3}
                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                          <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 rounded-xl transition"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={saveEditing}
                            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md"
                          >
                            Apply Changes
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ) : (
                /* Empty / Prompt Placeholder default */
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full min-h-[440px] bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-center backdrop-blur-xl"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-500">
                    <Presentation className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-sm mx-auto">
                    <h3 className="font-semibold text-white">Slide Studio Idle</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Select custom topic presets on the left or enter detailed notes, pick slides count up to 20, and click generate presentation.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Screen Split full screen overlay: "Presenter Stage View" */}
      <AnimatePresence>
        {isFullscreen && presentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col p-6 overflow-y-auto"
          >
            {/* Top Command row */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse animate-[pulse_1.5s_infinite]" />
                <span className="font-semibold text-white tracking-tight text-xs uppercase font-sans">
                  SlideCraft Presenter Stage Pro
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 font-mono hidden sm:inline-block">
                  Press ESC or Exit button to return
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer"
              >
                <Minimize2 className="h-4 w-4" /> Exit Presenter Stage
              </button>
            </div>

            {/* Split layout: Slide Projection Left, Teleprompter Sidebar Right */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              
              {/* Left Column: Slide container (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-4 h-full">
                
                {/* Visual projection wrap */}
                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-900/40 rounded-3xl p-4 border border-slate-800">
                  <div className="absolute w-[95%] h-[90%] bg-white/5 rounded-3xl translate-y-3 scale-98 pointer-events-none" />
                  
                  {/* Aspect projection screen layout with overflow-hidden */}
                  <div id="theater-slide-wrap" className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                      <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 p-8 sm:p-14 md:p-16 flex flex-col justify-between"
                        style={{ 
                          backgroundColor: presentation.slides[currentIndex].backgroundColor,
                          color: presentation.slides[currentIndex].isDark ? "#ffffff" : "#0f172a"
                        }}
                      >
                        {/* Slide decor */}
                        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Top layout info */}
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-[11px] font-mono tracking-widest uppercase font-semibold opacity-75">
                            Slide {currentIndex + 1} of {presentation.slides.length}
                          </span>
                          <span className="text-[11px] py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/5">
                            {presentation.presentationTitle}
                          </span>
                        </div>

                        {/* Slide core headings and list */}
                        <div className="my-auto relative z-10 flex flex-col gap-6 md:gap-7">
                          <h2 className={`text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-left ${themeAccent.titleFont}`}>
                            {presentation.slides[currentIndex].title}
                          </h2>
                          <div className={`h-0.5 w-16 bg-current opacity-30`} />
                          <div className="flex flex-col gap-4 md:gap-6 max-w-4xl font-sans">
                            {presentation.slides[currentIndex].bulletPoints.map((bullet, idx) => (
                              <div key={idx} className="flex items-start gap-4">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1.5 bg-white/10 border border-white/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                </div>
                                <p className={`text-sm sm:text-base md:text-2xl leading-relaxed opacity-95 ${themeAccent.bodyFont}`}>
                                  {bullet}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Projected page style footer info */}
                        <div className="flex items-center justify-between text-xs font-semibold border-t pt-4 border-white/10 opacity-60 relative z-10">
                          <span className="truncate max-w-[280px]">{presentation.presentationTitle}</span>
                          <span className="font-mono tracking-widest uppercase text-[10px]">SLIDECRAFT PRO STAGE</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Lower Action navigation bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer text-xs font-semibold active:scale-98"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" /> Previous Slide
                  </button>

                  <div className="flex gap-1 overflow-x-auto max-w-[250px] hide-scrollbar py-1 px-2 bg-slate-950/50 rounded-full">
                    {presentation.slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx > currentIndex ? 1 : -1);
                          setCurrentIndex(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                          idx === currentIndex ? "bg-cyan-400 scale-125" : "bg-slate-700 hover:bg-slate-600"
                        }`}
                        aria-label={`Jump to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer text-xs font-semibold active:scale-98 shadow-md"
                  >
                    Next Slide <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Speaker teleprompter and rehearsal timing statistics (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                
                {/* Stopwatch telemetry chronometer widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} /> Live Speech Chronometer
                    </span>
                    <span className={`w-2 h-2 rounded-full ${timerActive ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-mono text-3xl font-extrabold text-white tracking-widest bg-slate-950 py-1.5 px-4 rounded-xl border border-slate-800 shadow-inner">
                      {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{ (timerSeconds % 60).toString().padStart(2, '0') }
                    </div>
                    <div className="flex gap-1.5">
                      {!timerActive ? (
                        <button
                          type="button"
                          onClick={startTimer}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl active:scale-95 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={pauseTimer}
                          className="p-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl active:scale-95 flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={resetTimer}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl active:scale-95 border border-slate-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teleprompter box container */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 min-h-[160px]">
                  <span className="text-[10px] font-mono tracking-widest text-[#4f46e5] uppercase font-bold">
                    Slide {currentIndex + 1} Teleprompter Notes
                  </span>
                  <div className="flex-1 overflow-y-auto bg-slate-950 p-4 border border-slate-800 rounded-xl leading-relaxed text-sm text-slate-200 whitespace-pre-wrap font-sans max-h-[220px] lg:max-h-60 shadow-inner">
                    {presentation.slides[currentIndex].presenterNotes || "No notes available for this slide. Go back to previews to edit slide."}
                  </div>
                </div>

                {/* Quick Slide jumping sidebar lists */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 max-h-[240px]">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                    Deck Navigator ({presentation.slides.length} slides)
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[140px] scrollbar-thin">
                    {presentation.slides.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx > currentIndex ? 1 : -1);
                          setCurrentIndex(idx);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex justify-between items-center ${
                          idx === currentIndex
                            ? "bg-indigo-600 text-white font-semibold"
                            : "bg-slate-950 hover:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="truncate max-w-[170px]">{(idx + 1).toString().padStart(2, '0')}. {s.title}</span>
                        <span className="text-[9px] opacity-75 font-mono">{s.bulletPoints.length}b</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HTML Layout structure rendered EXCLUSIVELY for browsers print-to-PDF engine - invisible in app mode */}
      {presentation && (
        <div id="print-only-deck">
          {presentation.slides.map((slide, idx) => {
            const currentVibe = VIBE_STYLES[vibe] || VIBE_STYLES["sleek-dark"];
            return (
              <div 
                key={idx} 
                className="print-slide-page text-left"
                style={{
                  "--bg-print": slide.backgroundColor,
                  backgroundColor: slide.backgroundColor,
                  color: slide.isDark ? "#ffffff" : "#0f172a"
                } as any}
              >
                <div>
                  <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
                    <span className="text-[11px] font-mono tracking-widest uppercase opacity-75">
                      Slide {currentIndex + 1} of {presentation.slides.length}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {presentation.presentationTitle}
                    </span>
                  </div>
                  <h2 className={`font-extrabold leading-tight text-3.5xl mb-6 ${currentVibe.titleFont}`}>
                    {slide.title}
                  </h2>
                  <div className="space-y-4">
                    {slide.bulletPoints.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-4">
                        <span className="mt-2 shrink-0 block w-2 w-2 h-2 rounded-full bg-current opacity-75" />
                        <p className={`text-lg opacity-90 ${currentVibe.bodyFont}`}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4 flex flex-col justify-start text-[10px] opacity-60 font-mono gap-1">
                  <div><strong>Speaker Rehearsal Speech:</strong> {slide.presenterNotes || "No notes."}</div>
                  <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                    <span>DESIGN THEME: {vibe.toUpperCase()} | SLIDECRAFT AI GENERATOR</span>
                    <span>AI Analysis Engine v2.6</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Elegant minimalist Workspace Footer */}
      <footer id="workspace-footer" className="no-print px-6 md:px-10 py-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-600 border-t border-white/5">
        <span>AI Analysis Engine v2.6</span>
        <span>SlideCraft AI © 2026 • Built with Gemini</span>
      </footer>
    </div>
  );
}
