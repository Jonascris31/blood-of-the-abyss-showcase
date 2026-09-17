import React, { useState } from 'react';
import { ARCHITECTURE_COMPONENTS } from '../data/showcaseData';
import { ArchitectureComponent } from '../types';
import { Layers, CheckCircle2, Code2, ArrowDown, Boxes } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<ArchitectureComponent>(ARCHITECTURE_COMPONENTS[0]);

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-rose-400 mb-2">
          <Layers className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-widest font-semibold">Arquitetura de Software</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif-gothic font-bold text-neutral-100 mb-3">
          Design Desacoplado em C++ & Unreal Engine 5.6
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
          O objetivo central é manter os sistemas de gameplay desacoplados, testáveis e reutilizáveis, 
          evitando dependências diretas desnecessárias entre personagem, combate, interface e mundo. 
          As regras centrais residem no C++, enquanto Blueprints funcionam como camada de composição e iteração visual.
        </p>

        {/* 5 Architectural Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">01. Responsabilidade Única</div>
            <p className="text-xs text-neutral-400">Cada classe ou componente possui um propósito estrito e bem delimitado.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">02. Composição sobre Herança</div>
            <p className="text-xs text-neutral-400">Comportamentos reutilizáveis residem em componentes desacoplados anexáveis.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">03. Baixo Acoplamento</div>
            <p className="text-xs text-neutral-400">Sistemas se comunicam por delegados, interfaces da Unreal e contratos explícitos.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">04. Separação de Dados</div>
            <p className="text-xs text-neutral-400">Configurações de combate utilizam Data Assets e structs puras (FDamageData).</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">05. Blueprints como Composição</div>
            <p className="text-xs text-neutral-400">Lógica crítica protegida em C++; assets, VFX e curvas de áudio ajustados em Blueprint.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="text-xs font-mono text-rose-400 font-semibold mb-1">06. Subsystems Globais</div>
            <p className="text-xs text-neutral-400">Serviços como Save Game geridos via GameInstance Subsystems sem referências estáticas perigosas.</p>
          </div>
        </div>
      </div>

      {/* Layer Flow Diagram */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
        <h3 className="text-lg font-serif-gothic font-bold text-neutral-200 mb-4 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-rose-400" />
          Fluxo de Camadas de Execução
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <div className="w-full md:flex-1 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-xs font-mono text-rose-400 uppercase font-semibold">1. Input</div>
            <div className="text-[11px] text-neutral-400 mt-1">Enhanced Input Actions</div>
          </div>
          <ArrowDown className="w-4 h-4 text-neutral-600 md:-rotate-90 shrink-0" />
          <div className="w-full md:flex-1 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-xs font-mono text-rose-400 uppercase font-semibold">2. Controller</div>
            <div className="text-[11px] text-neutral-400 mt-1">ABloodPlayerController</div>
          </div>
          <ArrowDown className="w-4 h-4 text-neutral-600 md:-rotate-90 shrink-0" />
          <div className="w-full md:flex-1 p-3 rounded-xl bg-neutral-900 border border-rose-900/60 bg-rose-950/20">
            <div className="text-xs font-mono text-rose-300 uppercase font-semibold">3. Character & Components</div>
            <div className="text-[11px] text-neutral-300 mt-1">ABloodCharacter + UComponents</div>
          </div>
          <ArrowDown className="w-4 h-4 text-neutral-600 md:-rotate-90 shrink-0" />
          <div className="w-full md:flex-1 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-xs font-mono text-rose-400 uppercase font-semibold">4. Domain Systems</div>
            <div className="text-[11px] text-neutral-400 mt-1">Combat, Movement, Health</div>
          </div>
          <ArrowDown className="w-4 h-4 text-neutral-600 md:-rotate-90 shrink-0" />
          <div className="w-full md:flex-1 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-xs font-mono text-rose-400 uppercase font-semibold">5. World & UI</div>
            <div className="text-[11px] text-neutral-400 mt-1">HUD, Checkpoint, Save</div>
          </div>
        </div>
      </div>

      {/* Component Deep-Dive Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Component List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 px-1 mb-2 font-semibold">
            Componentes e Classes Centrais
          </div>
          {ARCHITECTURE_COMPONENTS.map((comp) => {
            const isSelected = selectedComp.name === comp.name;
            return (
              <button
                key={comp.name}
                onClick={() => setSelectedComp(comp)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-700/80 text-rose-100 shadow-md shadow-rose-950/40'
                    : 'bg-neutral-900/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-semibold text-neutral-100">{comp.name}</div>
                  <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{comp.description}</div>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${
                  comp.type === 'Actor' ? 'bg-amber-950/60 border-amber-800 text-amber-300' :
                  comp.type === 'Component' ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300' :
                  'bg-purple-950/60 border-purple-800 text-purple-300'
                }`}>
                  {comp.type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Component Details & C++ Header */}
        <div className="lg:col-span-8 rounded-2xl bg-neutral-950 border border-neutral-800 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-rose-400 tracking-wider">Especificação Técnica</span>
              <h3 className="text-xl sm:text-2xl font-serif-gothic font-bold text-neutral-100">
                {selectedComp.name}
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300">
              Tipo: {selectedComp.type}
            </span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            {selectedComp.description}
          </p>

          {/* Responsibilities */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
              Responsabilidades Diretas:
            </h4>
            <ul className="space-y-2">
              {selectedComp.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dependencies */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
              Contratos & Dependências:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedComp.dependencies.map((dep, idx) => (
                <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* C++ Code Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                Assinatura C++ Declarativa (.h)
              </h4>
              <span className="text-[10px] font-mono text-neutral-500">Unreal Engine 5.6 API</span>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 overflow-x-auto text-[11px] sm:text-xs font-mono text-rose-200/90 leading-relaxed">
              <code>{selectedComp.cppSignature}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
