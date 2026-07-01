import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Copy, 
  Check, 
  Sparkles, 
  Code, 
  Cpu, 
  Terminal, 
  Palette, 
  ExternalLink,
  Layers,
  MousePointerClick
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SYSTEM_PROMPT_CONTENT = `You are a Lead UI/UX Frontend Engineer specializing in modern, high-fidelity developer dashboards and premium SaaS interfaces (similar to Stripe, Vercel, and DigitalOcean's dark modes).

Your task is to implement the exact design system, tokens, layout structure, and responsive behaviors of the CynexVM virtualization platform on the new CynexCloud website.

## 🎨 1. CORE DESIGN TOKENS

### Typography
- **Primary Font:** 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Monospace Font:** 'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, Consolas, monospace (used for IDs, terminal windows, IP addresses, and key hashes).

### Theme Colors (Ultra-Dark Concept)
- **Base Background:** \`#0f0f0f\` (solid pitch black-grey background).
- **Secondary Card Background:** \`#1a1a1a\` (light card container layer).
- **Muted Input Background:** \`#141414\` (dark input fields).
- **Base Text / Body:** \`#a3a3a3\` (neutral, soft grey for readability).
- **Headers / Titles:** \`#f0f0f0\` (clean off-white for headers).
- **Pure White / Accent:** \`#ffffff\` (used for high-priority primary buttons and status highlights).

### Component Board Styles
- **Cards / Containers:**
  - Background: \`#1a1a1a\`
  - Border: \`1px solid #2a2a2a\`
  - Corner Radius: \`16px\`
- **Interactive Inputs:**
  - Background: \`#141414\`
  - Border: \`1px solid #333333\`
  - Corner Radius: \`10px\`
  - Focus Ring: \`border-color: rgba(255, 255, 255, 0.45); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);\`
  - Placeholder text: \`#555555\`

---

## ⚡ 2. INTERACTIVE COMPONENT STATES

### Primary Buttons
- **Style:** Background \`#ffffff\`, text \`#0f0f0f\` (contrast black), font-weight \`500\`, radius \`10px\`.
- **Hover:** Background \`#e5e5e5\`.
- **Disabled:** \`opacity: 0.5; cursor: not-allowed;\`

### Secondary Buttons
- **Style:** Background \`#1a1a1a\`, border \`1px solid #2a2a2a\`, text \`#a3a3a3\`, radius \`10px\`.
- **Hover:** Background \`#252525\`, border \`#333333\`, text \`#f0f0f0\`.

### Danger / Destructive Actions
- **Style:** Background \`rgba(239, 68, 68, 0.1)\` (tinted translucent red), border \`rgba(239, 68, 68, 0.2)\`, text \`#ef4444\`, radius \`10px\`.
- **Hover:** Background \`#ef4444\`, text \`#ffffff\`.

### Glassmorphism Tab Anchors (e.g. Navigation Headers / Sidebar Links)
- **Active State:** Background \`rgba(255, 255, 255, 0.1)\`, border \`1px solid rgba(255, 255, 255, 0.15)\`, text \`#ffffff\`, radius \`12px\`.
- **Inactive Hover State:** Background \`rgba(255, 255, 255, 0.05)\`, text \`#ffffff\`.

---

## 📐 3. LAYOUT & VIEWPORT PRESENTATION RULES

### Hidden Scrollbars (Clean Dashboard Presentation)
Hide native scrollbar bars globally, retaining scrolling actions:
\`\`\`css
::-webkit-scrollbar {
  display: none;
}
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
\`\`\`

### Sidebar Layout
- **Container:** Fixed \`56rem\` (or \`224px\`) width sidebar anchored on the left.
- **Background:** \`rgba(20, 20, 20, 0.8)\` with a thin vertical border-r (\`1px solid rgba(255, 255, 255, 0.05)\`).
- **Navigation Links:** Spaced margins (\`mx-4 my-1\`), padding \`py-1.5 px-4\`, corner radius \`12px\` or \`16px\`. Active nav elements utilize a solid background overlay with matching light outlines.

### Auth Split Layout (Sign In / Register / Reset Pages)
- **Desktop (md+):** A 100vh flexbox container split. Left side is a clean vertical form panel containing fields with a fixed width of \`420px\` (background: \`#1a1a1a\`, border-r: \`1px solid rgba(255, 255, 255, 0.08)\`). Right side is a full-viewport cover image/wallpaper context.
- **Mobile (sm):** The form panel stretches to \`100%\` width, and the right-hand cover image is hidden (\`display: none\`).

### Grid Alignment
- Grid columns should have a spacing gutter of \`6\` (\`gap-6\` or \`24px\`).
- Panels use a maximum width of \`5xl\` (\`1024px\`) or \`6xl\` (\`1152px\`) centered on the page using \`mx-auto px-4 md:px-8\`.`;

export default function DesignSystem() {
  const [copied, setCopied] = useState(false);
  const [testInputValue, setTestInputValue] = useState("");
  const [activeTabSample, setActiveTabSample] = useState<"general" | "network" | "security">("general");

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-24 bg-[#0f0f0f] text-[#a3a3a3] min-h-screen font-sans">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-zinc-500/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-xs font-medium text-white mb-6 tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            CynexVM Architecture
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase font-heading mb-6"
          >
            CynexCloud UI/UX <span className="text-zinc-500 font-light">System Prompt</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#a3a3a3] leading-relaxed"
          >
            Deploy high-fidelity developer dashboards with pre-tuned premium aesthetic rules, ultra-dark visual constants, and clean glassmorphism states.
          </motion.p>
        </div>

        {/* Live Interactive Token Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Interactive Token Previews */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2 mb-4 font-heading">
              <Palette className="w-4 h-4 text-zinc-400" />
              Live Interactive Tokens
            </h2>

            {/* Design Tokens Preview Box */}
            <div className="dashboard-card p-6 space-y-6">
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">1. Colors & Cards</h3>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-3 rounded-lg text-[#a3a3a3]">
                    <div className="font-bold text-white mb-1">Base BG</div>
                    #0f0f0f
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-lg text-[#a3a3a3]">
                    <div className="font-bold text-white mb-1">Card BG</div>
                    #1a1a1a
                  </div>
                  <div className="bg-[#141414] border border-[#333333] p-3 rounded-lg text-[#a3a3a3]">
                    <div className="font-bold text-white mb-1">Input BG</div>
                    #141414
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">2. Typography Fonts</h3>
                <div className="space-y-2">
                  <div className="bg-[#141414] border border-[#2a2a2a]/40 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-600 block uppercase font-mono mb-1">Primary Display</span>
                    <span className="font-heading text-white font-bold text-lg leading-none tracking-tight">General Sans</span>
                  </div>
                  <div className="bg-[#141414] border border-[#2a2a2a]/40 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-600 block uppercase font-mono mb-1">Monospace Data</span>
                    <span className="font-mono text-zinc-300 text-sm tracking-tight">JetBrains Mono (VM_ID: 9812-F)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Button States */}
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">3. Interactive Buttons</h3>
                <div className="space-y-3">
                  {/* Primary button */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-[#141414] rounded-xl border border-[#2a2a2a]/20">
                    <span className="text-xs text-zinc-400 font-mono">Primary Button</span>
                    <button className="btn-primary text-xs py-2 px-4 shadow-lg hover:scale-105 active:scale-95">
                      Confirm Action
                    </button>
                  </div>

                  {/* Secondary button */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-[#141414] rounded-xl border border-[#2a2a2a]/20">
                    <span className="text-xs text-zinc-400 font-mono">Secondary Button</span>
                    <button className="btn-secondary text-xs py-2 px-4 hover:scale-105 active:scale-95">
                      Cancel Request
                    </button>
                  </div>

                  {/* Danger action */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-[#141414] rounded-xl border border-[#2a2a2a]/20">
                    <span className="text-xs text-zinc-400 font-mono">Danger Action</span>
                    <button className="btn-danger text-xs py-2 px-4 hover:scale-105 active:scale-95">
                      Terminate VM
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Inputs */}
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">4. Dynamic Inputs</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={testInputValue}
                    onChange={(e) => setTestInputValue(e.target.value)}
                    placeholder="Enter virtual hostname..."
                    className="w-full px-4 py-2.5 text-sm dashboard-input font-mono"
                  />
                  <div className="text-[10px] text-zinc-600 font-mono">
                    Type inside the box above to feel the responsive focus glow states.
                  </div>
                </div>
              </div>

              {/* Glassmorphism Tab Anchors */}
              <div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">5. Glassmorphism Tab Anchors</h3>
                <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1.5 rounded-2xl border border-white/5">
                  {(["general", "network", "security"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTabSample(tab)}
                      className={`text-[10px] font-black uppercase tracking-wider py-2 text-center transition-all ${
                        activeTabSample === tab 
                          ? "tab-anchor-active" 
                          : "tab-anchor-inactive text-zinc-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Summary Tip */}
            <div className="bg-[#1a1a1a]/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden glass-dark">
              <div className="flex gap-4">
                <div className="p-2 bg-white/[0.02] border border-white/10 rounded-xl h-fit">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-tight mb-1 font-heading">Fully Standardized</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This entire developer platform is structured using these core design values to assure visual coherence across all routes.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Code prompt display and copy controls */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2 font-heading">
                <Terminal className="w-4 h-4 text-zinc-400" />
                System Design Prompt
              </h2>
              
              <Button
                onClick={handleCopy}
                className="bg-white text-black hover:bg-zinc-200 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="checked"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Prompt
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            {/* Terminal Window with prompt */}
            <div className="flex-1 bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
              
              {/* Terminal Title Bar */}
              <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between text-xs text-zinc-500 font-mono select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                  <span className="ml-2 font-semibold">CynexCloud_UI_UX_System_Prompt.md</span>
                </div>
                <Code className="w-4 h-4 text-zinc-600" />
              </div>

              {/* Code text content area */}
              <div className="p-6 font-mono text-xs text-zinc-400 overflow-y-auto max-h-[580px] leading-relaxed whitespace-pre-wrap select-all selection:bg-white selection:text-black">
                {SYSTEM_PROMPT_CONTENT}
              </div>

              {/* Prompt copy background watermarker */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/5 px-3 py-1.5 rounded-lg text-[9px] text-zinc-600 uppercase tracking-widest font-mono">
                Markdown Format
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
