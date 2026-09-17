import React from 'react';
import { Eye, Compass, BookOpen } from 'lucide-react';

export const LoreView: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Central Question Banner */}
      <div className="rounded-2xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-rose-950/80 p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono uppercase tracking-widest mb-4">
          <Eye className="w-3.5 h-3.5" />
          Visão Narrativa & Horror Cósmico
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-gothic font-bold text-neutral-100 max-w-2xl mx-auto leading-tight">
          “Por que o homem teme a Verdade?”
        </h2>

        <p className="mt-4 text-sm sm:text-base text-rose-200/80 italic font-serif max-w-xl mx-auto leading-relaxed">
          Toda memória possui um preço. Toda verdade exige um sacrifício. 
          O Abismo não é um vazio silencioso, mas a soma de todas as coisas que a mente humana preferiu esquecer.
        </p>
      </div>

      {/* The 3 Paths of the Garden */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif-gothic font-bold text-neutral-200 flex items-center gap-2">
          <Compass className="w-5 h-5 text-rose-400" />
          Os Três Caminhos do Jardim do Esquecimento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 font-serif-gothic font-bold text-lg">
              I
            </div>
            <h4 className="text-base font-serif-gothic font-bold text-neutral-100">
              Caminho do Conhecimento
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Onde as ruínas erguem-se contra a gravidade. Aquele que busca entender a estrutura do mundo é desafiado pelo peso das verdades acumuladas e pelas entidades geradas pela vaidade intelectual.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 font-serif-gothic font-bold text-lg">
              II
            </div>
            <h4 className="text-base font-serif-gothic font-bold text-neutral-100">
              Caminho do Esquecimento
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              A névoa escarlate que consome o passado. Para vencer os guardiões abissais, o guerreiro aprende a queimar memórias obsoletas e purificar seus instintos de combate na lâmina rubra.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 font-serif-gothic font-bold text-lg">
              III
            </div>
            <h4 className="text-base font-serif-gothic font-bold text-neutral-100">
              Caminho da Contemplação
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              O santuário terminal de v0.0.1. O ponto de convergência onde o protagonista encara a imensidão do Abismo e aceita a responsabilidade de mergulhar nos estratos mais profundos da Verdade.
            </p>
          </div>
        </div>
      </section>

      {/* Mechanics of Memory & Echoes */}
      <section className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-serif-gothic font-bold text-neutral-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-400" />
          A Mecânica dos Ecos & Testemunhos
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          No jogo, a narrativa ambiental não ocorre através de diálogos convencionais ou cutscenes passivas. 
          O jogador desvenda a história interagindo com monolitos e relíquias etéreas (Ecos). 
          Cada eco absorvido restaura fragmentos de Essência Abissal ao protagonista, liberando habilidades arcanas em combate mas alterando progressivamente sua percepção da realidade.
        </p>
      </section>
    </div>
  );
};
