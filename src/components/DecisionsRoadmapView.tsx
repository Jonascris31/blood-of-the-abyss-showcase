import React from 'react';
import { ADR_LIST, ROADMAP_DATA } from '../data/showcaseData';
import { GitCommit, CheckCircle, Clock, FileText, Sparkles } from 'lucide-react';

export const DecisionsRoadmapView: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* SECTION 1: Architecture Decision Records (ADRs) */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            <FileText className="w-4 h-4" />
            Registro de Decisões Técnicas
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-gothic font-bold text-neutral-100">
            Architectural Decision Records (ADRs)
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Decisões estruturais registradas para assegurar estabilidade conceitual, clareza técnica e preservação do foco durante a produção.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADR_LIST.map((adr) => (
            <div key={adr.id} className="rounded-2xl bg-neutral-900/70 border border-neutral-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800/80">
                    {adr.id}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Status: {adr.status}
                  </span>
                </div>

                <h3 className="text-lg font-serif-gothic font-bold text-neutral-100 mb-3">
                  {adr.title}
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-mono text-neutral-500 uppercase text-[10px]">Contexto:</span>
                    <p className="text-neutral-300 mt-0.5">{adr.context}</p>
                  </div>

                  <div>
                    <span className="font-mono text-neutral-500 uppercase text-[10px]">Decisão:</span>
                    <p className="text-rose-200 mt-0.5 font-medium">{adr.decision}</p>
                  </div>

                  <div>
                    <span className="font-mono text-neutral-500 uppercase text-[10px]">Consequências:</span>
                    <ul className="mt-1 space-y-1.5">
                      {adr.consequences.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-neutral-400">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Technical Roadmap */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            <GitCommit className="w-4 h-4" />
            Evolução Incremental
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-gothic font-bold text-neutral-100">
            Roadmap Técnico & Marcos Jogáveis
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Cronograma estruturado do projeto, dividindo a evolução em validação mecânica (v0.0.1), vertical slice (v0.0.2) e persistência de dados (v0.0.3).
          </p>
        </div>

        <div className="space-y-6">
          {ROADMAP_DATA.map((milestone) => {
            const isCurrent = milestone.status === 'current';
            const totalTasks = milestone.items.length;
            const doneTasks = milestone.items.filter((i) => i.done).length;
            const progressPct = Math.round((doneTasks / totalTasks) * 100);

            return (
              <div 
                key={milestone.version} 
                className={`rounded-2xl border p-6 transition ${
                  isCurrent 
                    ? 'bg-neutral-900/90 border-rose-800/90 shadow-xl shadow-rose-950/20' 
                    : 'bg-neutral-900/40 border-neutral-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        isCurrent 
                          ? 'bg-rose-950 text-rose-200 border-rose-700' 
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {milestone.version}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/80 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          Marco Jogável Atual
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif-gothic font-bold text-neutral-100">
                      {milestone.title}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="min-w-[160px] flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>Progresso:</span>
                      <span className="font-semibold text-rose-300">{progressPct}% ({doneTasks}/{totalTasks})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isCurrent ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-neutral-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Milestone Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {milestone.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                        item.done 
                          ? 'bg-neutral-950/80 border-neutral-800 text-neutral-200' 
                          : 'bg-neutral-950/40 border-neutral-800/50 text-neutral-500'
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      )}
                      <span className={item.done ? 'font-medium' : ''}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Completion Criteria (if available) */}
                {milestone.completionCriteria && (
                  <div className="mt-4 pt-3 border-t border-neutral-800/60">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-2">
                      Critérios de Conclusão do Marco:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                      {milestone.completionCriteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
