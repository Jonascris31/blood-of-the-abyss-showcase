import React from 'react';
import { ScrollText, Check, X, FolderTree, GitBranch } from 'lucide-react';

export const StandardsView: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Introduction */}
      <div>
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
          <ScrollText className="w-4 h-4" />
          Engenharia & Governança de Código
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif-gothic font-bold text-neutral-100">
          Padrões de Código & Convenções
        </h2>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
          Diretrizes estritas para desenvolvimento em Unreal Engine 5.6 e C++, garantindo código autodocumentado, seguro e consistente.
        </p>
      </div>

      {/* Unreal Naming Conventions */}
      <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 space-y-6">
        <h3 className="text-lg font-serif-gothic font-bold text-neutral-200">
          Nomenclatura Oficial Unreal Engine
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-lg font-mono font-bold text-rose-400">A</span>
            <div className="text-xs font-semibold text-neutral-200 mt-1">Actors</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-1">ABloodCharacter</div>
            <div className="text-[11px] font-mono text-neutral-400">ABloodCheckpoint</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-lg font-mono font-bold text-cyan-400">U</span>
            <div className="text-xs font-semibold text-neutral-200 mt-1">UObjects & Components</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-1">UCombatComponent</div>
            <div className="text-[11px] font-mono text-neutral-400">UBloodMovementComponent</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-lg font-mono font-bold text-amber-400">F</span>
            <div className="text-xs font-semibold text-neutral-200 mt-1">Structs</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-1">FDamageData</div>
            <div className="text-[11px] font-mono text-neutral-400">FCombatComboState</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-lg font-mono font-bold text-purple-400">E</span>
            <div className="text-xs font-semibold text-neutral-200 mt-1">Enums</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-1">ECombatState</div>
            <div className="text-[11px] font-mono text-neutral-400">EMovementState</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-lg font-mono font-bold text-emerald-400">I</span>
            <div className="text-xs font-semibold text-neutral-200 mt-1">Interfaces</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-1">IDamageableInterface</div>
            <div className="text-[11px] font-mono text-neutral-400">IInteractableInterface</div>
          </div>
        </div>
      </section>

      {/* Good vs Bad Patterns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended */}
        <div className="rounded-2xl bg-neutral-950 border border-emerald-950/80 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase">
            <Check className="w-4 h-4" />
            Padrões Recomendados
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-neutral-200">Classes com Responsabilidade Clara:</div>
              <div className="font-mono text-emerald-300 mt-0.5">UHealthComponent, UBloodSaveSubsystem</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Verbos Explícitos e Perguntas Booleanas:</div>
              <div className="font-mono text-emerald-300 mt-0.5">InitializeCombat(), ApplyDamage(), CanAttack(), IsDead()</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Nomes Completos e Sem Abreviações Obscuras:</div>
              <div className="font-mono text-emerald-300 mt-0.5">CurrentHealth, MaximumHealth, AttackCooldown</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Boas Práticas de Performance:</div>
              <p className="text-neutral-400 mt-0.5">Validar ponteiros com IsValid(), evitar lógica complexa no Tick e reduzir casts frequentes.</p>
            </div>
          </div>
        </div>

        {/* Avoid */}
        <div className="rounded-2xl bg-neutral-950 border border-rose-950/80 p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase">
            <X className="w-4 h-4" />
            Padrões a Evitar
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-neutral-200">Classes Genéricas e "Lixeiras":</div>
              <div className="font-mono text-rose-300 mt-0.5">UManager, UHelper, UUtils, GameController</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Casts Encadeados e Hard References:</div>
              <p className="text-neutral-400 mt-0.5">Usar interfaces ou delegates em vez de Cast&lt;ABloodCharacter&gt; repetitivo.</p>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Regras de Gameplay no Level Blueprint:</div>
              <p className="text-neutral-400 mt-0.5">Mantém a lógica refém do mapa, impedindo reutilização entre salas modulares.</p>
            </div>
            <div>
              <div className="font-semibold text-neutral-200">Exposição Excessiva ao Blueprint:</div>
              <p className="text-neutral-400 mt-0.5">Expor apenas propriedades necessárias com BlueprintReadOnly quando possível.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Source Folder Structure */}
      <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 space-y-4">
        <h3 className="text-lg font-serif-gothic font-bold text-neutral-200 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-rose-400" />
          Estrutura Organizacional de Source C++
        </h3>
        
        <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 leading-relaxed overflow-x-auto">
{`Source/BloodOfTheAbyss/
├── Characters/     # ABloodCharacter e controladores
├── Components/     # UBloodMovementComponent, UHealthComponent, UCombatComponent
├── Combat/         # FDamageData, armas, colisores e cálculos de dano
├── Interaction/    # IInteractableInterface, UInteractionComponent, Ecos
├── AI/             # Behavior Trees, Tasks e controladores de inimigos
├── UI/             # HUD, widgets de vida e feedback visual
├── Save/           # UBloodSaveSubsystem, ABloodCheckpoint
├── World/          # Gerenciamento de salas modulares e transições
└── Core/           # GameMode, GameInstance e subsistemas globais`}
        </pre>
      </section>

      {/* Commit Convention */}
      <section className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            <GitBranch className="w-4 h-4" />
            Convenção de Commits
          </div>
          <h3 className="text-lg font-serif-gothic font-bold text-neutral-100">
            Formato: <span className="font-mono text-rose-300">ÁREA-NÚMERO: descrição objetiva</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Cada commit deve representar uma alteração coerente, atômica e compilável.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono">
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">GAME: Gameplay geral</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">WORLD: Níveis e salas</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">COMBAT: Dano e armas</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">PLAYER: Movimentação</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">AI: Inimigos</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">UI: HUD e menus</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">SAVE: Checkpoints</span>
          <span className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">AUDIO: Trilha e SFX</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5 text-xs font-mono">
          <div className="text-neutral-500 uppercase text-[10px] mb-2 font-semibold">Exemplos Práticos:</div>
          <div className="text-emerald-300">WORLD-003: cria blockout da sala de tutorial</div>
          <div className="text-emerald-300">COMBAT-002: adiciona janela de invulnerabilidade</div>
          <div className="text-emerald-300">SAVE-001: implementa estrutura inicial de checkpoint</div>
          <div className="text-emerald-300">FIX-004: corrige colisão nas plataformas móveis</div>
          <div className="text-emerald-300">DOCS-003: documenta arquitetura do sistema de combate</div>
        </div>
      </section>
    </div>
  );
};
