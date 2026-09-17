import React from 'react';
import { NavigationTab } from '../types';
import { SHOWCASE_INFO } from '../data/showcaseData';
import { Gamepad2, Cpu, GitCommit, ScrollText, Eye, GitBranch } from 'lucide-react';

interface ShowcaseHeaderProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const ShowcaseHeader: React.FC<ShowcaseHeaderProps> = ({ currentTab, onTabChange }) => {
  return (
    <header className="relative w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      {/* Top Banner Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/80">
                {SHOWCASE_INFO.engine}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-neutral-900 text-neutral-300 border border-neutral-800">
                C++ & Blueprints
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800/70">
                Marco: {SHOWCASE_INFO.currentMilestone}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-gothic font-black text-neutral-100 tracking-tight">
              {SHOWCASE_INFO.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-serif-gothic text-rose-300/90 italic tracking-wide">
              “{SHOWCASE_INFO.tagline}”
            </p>
          </div>

          {/* Repository & Meta Info */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
              <GitBranch className="w-4 h-4 text-neutral-300" />
              <span className="text-neutral-300">{SHOWCASE_INFO.githubRepo}</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Showcase Público & Laboratório de Arquitetura 2.5D
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-8 overflow-x-auto pb-1 border-b border-neutral-900/80">
          <button
            id="tab-demo"
            onClick={() => onTabChange('demo')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'demo'
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/80 shadow-md shadow-rose-950/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-rose-400" />
            <span>Protótipo Jogável (v0.0.1)</span>
          </button>

          <button
            id="tab-architecture"
            onClick={() => onTabChange('architecture')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'architecture'
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/80 shadow-md shadow-rose-950/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-rose-400" />
            <span>Arquitetura de Sistemas C++</span>
          </button>

          <button
            id="tab-roadmap"
            onClick={() => onTabChange('roadmap')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'roadmap'
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/80 shadow-md shadow-rose-950/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <GitCommit className="w-4 h-4 text-rose-400" />
            <span>Decisões (ADRs) & Roadmap</span>
          </button>

          <button
            id="tab-standards"
            onClick={() => onTabChange('standards')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'standards'
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/80 shadow-md shadow-rose-950/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <ScrollText className="w-4 h-4 text-rose-400" />
            <span>Padrões de Engenharia</span>
          </button>

          <button
            id="tab-lore"
            onClick={() => onTabChange('lore')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'lore'
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/80 shadow-md shadow-rose-950/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Eye className="w-4 h-4 text-rose-400" />
            <span>Universo & Lore</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
