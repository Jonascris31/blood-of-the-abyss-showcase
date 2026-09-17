import { ADRItem, ArchitectureComponent, RoadmapMilestone, RoomDefinition } from '../types';

export const SHOWCASE_INFO = {
  title: 'Blood of the Abyss',
  subtitle: 'Showcase & Protótipo Técnico',
  tagline: 'Toda memória possui um preço. Toda verdade exige um sacrifício.',
  engine: 'Unreal Engine 5.6',
  languages: ['C++', 'Blueprints'],
  perspective: 'Ação 2.5D com Horror Cósmico',
  currentMilestone: 'v0.0.1 — Jardim do Esquecimento',
  centralQuestion: 'Por que o homem teme a Verdade?',
  githubRepo: 'Jonascris31/blood-of-the-abyss-showcase',
};

export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  {
    name: 'ABloodCharacter',
    type: 'Actor',
    description: 'Classe base do protagonista que orquestra componentes de gameplay sem acoplá-los diretamente.',
    responsibilities: [
      'Encapsula malha esquelética, colisão de cápsula e câmera 2.5D com spring arm desacoplado.',
      'Recebe eventos de Enhanced Input do ABloodPlayerController e delega aos componentes.',
      'Implementa IDamageableInterface e IInteractableInterface para desacoplar contato com atores externos.'
    ],
    dependencies: ['UBloodMovementComponent', 'UHealthComponent', 'UCombatComponent', 'UInteractionComponent'],
    cppSignature: `class BLOOD_API ABloodCharacter : public ACharacter, public IDamageableInterface, public IInteractableInterface {
    GENERATED_BODY()
public:
    ABloodCharacter();
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    TObjectPtr<UBloodMovementComponent> BloodMovement;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    TObjectPtr<UHealthComponent> HealthComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    TObjectPtr<UCombatComponent> CombatComponent;
};`
  },
  {
    name: 'UBloodMovementComponent',
    type: 'Component',
    description: 'Controla a física 2.5D, aceleração de corrida, pulo responsivo e o sistema de esquiva abissal (Dash).',
    responsibilities: [
      'Gerencia a máquina de estados de locomoção (Idle, Walking, Air, Dashing).',
      'Executa janela de invulnerabilidade (i-frames) durante a esquiva rápida.',
      'Notifica delegados OnMovementStateChanged e OnDashTriggered.'
    ],
    dependencies: ['CharacterMovementComponent'],
    cppSignature: `DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMovementStateChanged, EMovementState, NewState);

class BLOOD_API UBloodMovementComponent : public UCharacterMovementComponent {
    GENERATED_BODY()
public:
    void PerformDash();
    bool CanDash() const;
    FOnMovementStateChanged OnMovementStateChanged;
};`
  },
  {
    name: 'UHealthComponent',
    type: 'Component',
    description: 'Controla a vitalidade, cálculo de dano mitigado e eventos de morte/renascimento.',
    responsibilities: [
      'Armazena e valida CurrentHealth e MaximumHealth sem lógica desnecessária no Tick.',
      'Aplica cálculos de mitigação de dano elemental / abissal via FDamageData.',
      'Dispara delegados OnHealthChanged e OnCharacterDied.'
    ],
    dependencies: ['FDamageData Struct'],
    cppSignature: `DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnHealthChanged, float, Current, float, Max);

class BLOOD_API UHealthComponent : public UActorComponent {
    GENERATED_BODY()
public:
    void ApplyDamage(const FDamageData& DamageData);
    void Heal(float Amount);
    bool IsDead() const { return CurrentHealth <= 0.0f; }
};`
  },
  {
    name: 'UCombatComponent',
    type: 'Component',
    description: 'Gerencia combos de ataque corpo-a-corpo, janelas de cancelamento e consumo de Estamina e Essência.',
    responsibilities: [
      'Executa combos em cadeia com janelas de input bufferizadas.',
      'Controla o ataque especial "Clivagem Abissal" consumindo Essência da Verdade.',
      'Realiza raycasts/sweep checks de colisão de arma com tags de filtro de equipe.'
    ],
    dependencies: ['UHealthComponent', 'AnimMontage'],
    cppSignature: `class BLOOD_API UCombatComponent : public UActorComponent {
    GENERATED_BODY()
public:
    void ExecuteLightAttack();
    void ExecuteAbyssalStrike();
    bool CanAttack() const;
};`
  },
  {
    name: 'UInteractionComponent',
    type: 'Component',
    description: 'Detecta e consome objetos interativos como Ecos e Testemunhos, portas e alavancas.',
    responsibilities: [
      'Realiza varredura de esfera ao redor do jogador para detectar instâncias de IInteractableInterface.',
      'Exibe prompt de contexto na HUD e aciona o evento Interact() no ator alvo.'
    ],
    dependencies: ['IInteractableInterface'],
    cppSignature: `class BLOOD_API UInteractionComponent : public UActorComponent {
    GENERATED_BODY()
public:
    void TryInteract();
    IInteractableInterface* GetBestInteractionTarget() const;
};`
  },
  {
    name: 'UBloodSaveSubsystem',
    type: 'Subsystem',
    description: 'Subsystem da GameInstance que persiste checkpoints, Ecos lidos e progresso do Jardim.',
    responsibilities: [
      'Serializa os dados do jogador em arquivos de save sem travar a thread de render.',
      'Restaura a última posição salva em ABloodCheckpoint quando o jogador sucumbe.'
    ],
    dependencies: ['USaveGame', 'ABloodCheckpoint'],
    cppSignature: `class BLOOD_API UBloodSaveSubsystem : public UGameInstanceSubsystem {
    GENERATED_BODY()
public:
    void SaveCheckpoint(const FString& CheckpointId, const FTransform& SpawnPoint);
    bool LoadLastCheckpoint();
};`
  }
];

export const ADR_LIST: ADRItem[] = [
  {
    id: 'ADR-001',
    title: 'Gameplay principal em C++',
    status: 'Aceita',
    context: 'O projeto precisa demonstrar competências técnicas e manter regras centrais reutilizáveis.',
    decision: 'Sistemas principais de gameplay serão implementados em C++, enquanto Blueprints serão usados para composição, conteúdo e ajustes visuais.',
    consequences: [
      'Melhor organização e reutilização de código entre inimigos e protagonista.',
      'Maior valor técnico para portfólio de engenharia de jogos.',
      'Exige disciplina rigorosa na exposição de UPROPERTY e UFUNCTION ao Blueprint.'
    ]
  },
  {
    id: 'ADR-002',
    title: 'Salas modulares para o Jardim do Esquecimento',
    status: 'Aceita',
    context: 'Construir todo o mapa de uma vez aumenta retrabalho e dificulta validação e profiling de performance.',
    decision: 'O Jardim do Esquecimento será desenvolvido como conjunto de salas modulares, autônomas e testáveis.',
    consequences: [
      'Facilita blockout, testes unitários de gameplay e ajuste de ritmo.',
      'Permite reorganizar o fluxo das salas (Conhecimento vs. Esquecimento) sem quebrar o nível inteiro.',
      'Exige métricas consistentes de escala, salto, colisão e câmera 2.5D.'
    ]
  }
];

export const ROADMAP_DATA: RoadmapMilestone[] = [
  {
    version: 'v0.0.1',
    title: 'Fundação Jogável — Jardim do Esquecimento',
    status: 'current',
    items: [
      { text: 'Projeto Unreal inicial configurado', done: true },
      { text: 'Estrutura de documentação técnica', done: true },
      { text: 'Direção de arte e lore do Jardim do Esquecimento', done: true },
      { text: 'Movimentação e física do personagem (Pulo, Corrida, Esquiva)', done: true },
      { text: 'Câmera com enquadramento 2.5D e amortecimento suave', done: true },
      { text: 'Combate básico com combos e feedback de impacto', done: true },
      { text: 'HUD funcional (Vida, Estamina, Essência Abissal)', done: true },
      { text: 'Checkpoints de restauração (ABloodCheckpoint)', done: true },
      { text: 'Transição entre salas modulares (Pórtico, Conhecimento, Esquecimento, Contemplação)', done: true },
      { text: 'Sistema de Ecos e Testemunhos ambientais', done: true }
    ],
    completionCriteria: [
      'Duração de 10 a 20 minutos de exploração e teste',
      'Fluxo completo do início ao fim sem travamentos críticos',
      'Combate e movimentação responsivos e com sensação de peso',
      'Identidade visual e sonora reconhecível de horror cósmico'
    ]
  },
  {
    version: 'v0.0.2',
    title: 'Vertical Slice Completo',
    status: 'planned',
    items: [
      { text: 'Entrada cinematográfica do Jardim', done: false },
      { text: 'Tutorial orgânico integrado à arquitetura', done: false },
      { text: 'Primeiro encontro com horda de Sombras Rastejantes', done: false },
      { text: 'Caminho alternativo curto para segredos de Essência', done: false },
      { text: 'Desafio vertical de plataformas móveis', done: false },
      { text: 'Arena com Miniboss "Sentinela do Vazio"', done: false },
      { text: 'Saída do nível para os Abismos Profundos', done: false }
    ]
  },
  {
    version: 'v0.0.3',
    title: 'Sistemas Persistentes & Polimento',
    status: 'planned',
    items: [
      { text: 'Serialização completa de Save Game', done: false },
      { text: 'Árvore de progressão de habilidades abissais', done: false },
      { text: 'Inventário de relíquias e fragmentos de memória', done: false },
      { text: 'Códice de Ecos e Testemunhos colecionados', done: false },
      { text: 'Menu de configurações gráficas e acessibilidade', done: false }
    ]
  }
];

export const GAME_ROOMS: RoomDefinition[] = [
  {
    id: 'room-01',
    title: 'Pórtico dos Ecos',
    subtitle: 'Marco Inicial — Entrada do Jardim do Esquecimento',
    theme: 'intro',
    width: 1400,
    height: 600,
    spawnX: 120,
    spawnY: 440,
    exitX: 1300,
    exitY: 440,
    platforms: [
      { x: 0, y: 500, w: 1400, h: 100, type: 'stone' }, // Chão principal
      { x: 340, y: 380, w: 180, h: 22, type: 'ruin' },
      { x: 580, y: 290, w: 200, h: 22, type: 'ruin' },
      { x: 860, y: 380, w: 190, h: 22, type: 'ruin' }
    ],
    checkpoints: [
      { id: 'cp-01', x: 220, y: 500, name: 'Tocha do Despertar' }
    ],
    echoes: [
      {
        id: 'echo-01',
        x: 680,
        y: 290,
        title: 'Eco I: O Peso da Lembrança',
        text: '“Aquele que busca o Abismo não procura apenas a escuridão, mas a remoção do fardo de quem um dia foi.”'
      },
      {
        id: 'echo-02',
        x: 1000,
        y: 500,
        title: 'Testemunho do Vigilante',
        text: '“As lâminas forjadas no sangue primordial vibram quando a verdade se aproxima. Guarde suas forças para os guardiões do Caminho.”'
      }
    ],
    enemies: [
      { id: 'en-01', x: 880, y: 500, type: 'creeper', patrolRange: 160 }
    ]
  },
  {
    id: 'room-02',
    title: 'Caminho do Conhecimento',
    subtitle: 'Ruínas Abissais & Plataformas Elevadas',
    theme: 'knowledge',
    width: 1700,
    height: 600,
    spawnX: 100,
    spawnY: 440,
    exitX: 1600,
    exitY: 440,
    platforms: [
      { x: 0, y: 500, w: 460, h: 100, type: 'stone' },
      { x: 520, y: 440, w: 160, h: 24, type: 'ruin' },
      { x: 740, y: 360, w: 180, h: 24, type: 'ruin' },
      { x: 980, y: 280, w: 220, h: 24, type: 'ruin' },
      { x: 1260, y: 380, w: 160, h: 24, type: 'ruin' },
      { x: 1400, y: 500, w: 300, h: 100, type: 'stone' }
    ],
    checkpoints: [
      { id: 'cp-02', x: 380, y: 500, name: 'Santuário da Sabedoria Fragmentada' }
    ],
    echoes: [
      {
        id: 'echo-03',
        x: 1090,
        y: 280,
        title: 'Eco II: Fragmento de C++ e Almas',
        text: '“Modularidade não é vaidade: cada componente do ser deve carregar apenas o que suporta. Caso contrário, a máquina rui sob o próprio peso.”'
      }
    ],
    enemies: [
      { id: 'en-02', x: 780, y: 360, type: 'creeper', patrolRange: 80 },
      { id: 'en-03', x: 1480, y: 500, type: 'sentinel', patrolRange: 120 }
    ]
  },
  {
    id: 'room-03',
    title: 'Caminho do Esquecimento',
    subtitle: 'Arena da Névoa Escarlate & Guardiões',
    theme: 'oblivion',
    width: 1600,
    height: 600,
    spawnX: 100,
    spawnY: 440,
    exitX: 1500,
    exitY: 440,
    platforms: [
      { x: 0, y: 500, w: 1600, h: 100, type: 'stone' },
      { x: 400, y: 390, w: 200, h: 22, type: 'ruin' },
      { x: 720, y: 310, w: 240, h: 22, type: 'altar' },
      { x: 1080, y: 390, w: 200, h: 22, type: 'ruin' }
    ],
    checkpoints: [
      { id: 'cp-03', x: 260, y: 500, name: 'Tocha do Esquecimento' }
    ],
    echoes: [
      {
        id: 'echo-04',
        x: 840,
        y: 310,
        title: 'Eco III: O Sacramento da Memória',
        text: '“Para aprender o novo, é imperativo queimar o obsoleto. O guerreiro que não esquece hesita diante da espada.”'
      }
    ],
    enemies: [
      { id: 'en-04', x: 500, y: 500, type: 'creeper', patrolRange: 150 },
      { id: 'en-05', x: 920, y: 500, type: 'sentinel', patrolRange: 180 },
      { id: 'en-06', x: 1250, y: 500, type: 'creeper', patrolRange: 120 }
    ]
  },
  {
    id: 'room-04',
    title: 'Caminho da Contemplação',
    subtitle: 'O Vórtice da Verdade — Conclusão do Marco v0.0.1',
    theme: 'contemplation',
    width: 1400,
    height: 600,
    spawnX: 100,
    spawnY: 440,
    exitX: 1280,
    exitY: 440,
    platforms: [
      { x: 0, y: 500, w: 1400, h: 100, type: 'stone' },
      { x: 380, y: 370, w: 220, h: 24, type: 'altar' },
      { x: 700, y: 280, w: 280, h: 26, type: 'altar' }
    ],
    checkpoints: [
      { id: 'cp-04', x: 200, y: 500, name: 'Pilar do Testemunho Supremo' }
    ],
    echoes: [
      {
        id: 'echo-05',
        x: 840,
        y: 280,
        title: 'Testemunho Final: O Marco v0.0.1',
        text: '“Você percorreu as três veredas do Jardim. Os sistemas de locomoção, combate, estados desacoplados e telemetria provaram sua solidez. A Verdade agora aguarda o Vertical Slice em v0.0.2.”'
      }
    ],
    enemies: []
  }
];
