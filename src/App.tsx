import React, { useState } from 'react';
import { NavigationTab } from './types';
import { ShowcaseHeader } from './components/ShowcaseHeader';
import { GameCanvas } from './game/GameCanvas';
import { ArchitectureView } from './components/ArchitectureView';
import { DecisionsRoadmapView } from './components/DecisionsRoadmapView';
import { StandardsView } from './components/StandardsView';
import { LoreView } from './components/LoreView';
import { SHOWCASE_INFO } from './data/showcaseData';
import { 
  Gamepad2, 
  Cpu, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  GitBranch, 
  ArrowUpRight 
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('demo');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-900 selection:text-white">
      {/* Global Header */}
      <ShowcaseHeader currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'demo' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Playable Prototype Canvas Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
                    <Gamepad2 className="w-4 h-4" />
                    Recorte Técnico Jogável v0.0.1
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif-gothic font-bold text-neutral-100">
                    Jardim do Esquecimento — Simulação 2.5D
                  </h2>
                </div>
                <div className="text-xs font-mono text-neutral-400">
                  Validação de física, combate básico, HUD e transição de salas
                </div>
              </div>

              {/* Game Component */}
              <GameCanvas />
            </div>

            {/* Quick Architecture Feature Cards underneath the prototype */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setCurrentTab('architecture')}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-rose-800/80 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <Cpu className="w-4 h-4" />
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-300 transition" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-200">UBloodMovementComponent</div>
                <p className="text-[11px] text-neutral-400 mt-1">Máquina de estados desacoplada com janelas de i-frame e aceleração suave.</p>
              </div>

              <div 
                onClick={() => setCurrentTab('architecture')}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-rose-800/80 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <Layers className="w-4 h-4" />
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-300 transition" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-200">UCombatComponent</div>
                <p className="text-[11px] text-neutral-400 mt-1">Combo de 3 golpes, buffers de input e golpe especial "Clivagem Abissal".</p>
              </div>

              <div 
                onClick={() => setCurrentTab('roadmap')}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-rose-800/80 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-300 transition" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-200">ADR-002: Salas Modulares</div>
                <p className="text-[11px] text-neutral-400 mt-1">Nível particionado em 4 salas autônomas e testáveis sem carregar todo o mapa.</p>
              </div>

              <div 
                onClick={() => setCurrentTab('lore')}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-rose-800/80 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-300 transition" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-200">Ecos & Testemunhos</div>
                <p className="text-[11px] text-neutral-400 mt-1">Narrativa ambiental diegética guiada por absorção de memórias arcanas.</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'architecture' && <ArchitectureView />}
        {currentTab === 'roadmap' && <DecisionsRoadmapView />}
        {currentTab === 'standards' && <StandardsView />}
        {currentTab === 'lore' && <LoreView />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-semibold">{SHOWCASE_INFO.title}</span>
            <span>•</span>
            <span>Unreal Engine 5.6 Showcase</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`https://github.com/${SHOWCASE_INFO.githubRepo}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-rose-300 transition"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Repositório GitHub</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
