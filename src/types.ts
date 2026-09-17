export type NavigationTab = 'demo' | 'architecture' | 'roadmap' | 'standards' | 'lore';

export interface ComponentTelemetry {
  characterState: 'Idle' | 'Running' | 'Jumping' | 'Falling' | 'Dashing' | 'Attacking' | 'Hurt' | 'Dead';
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  abyssEssence: number;
  maxAbyssEssence: number;
  comboIndex: number;
  activeDelegates: string[];
  currentRoomId: string;
  lastCheckpointId: string | null;
  collectedEchoes: string[];
}

export interface RoomDefinition {
  id: string;
  title: string;
  subtitle: string;
  theme: 'intro' | 'knowledge' | 'oblivion' | 'contemplation';
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  exitX: number;
  exitY: number;
  platforms: { x: number; y: number; w: number; h: number; type?: 'stone' | 'ruin' | 'altar' }[];
  checkpoints?: { id: string; x: number; y: number; name: string }[];
  echoes?: { id: string; x: number; y: number; title: string; text: string }[];
  enemies?: { id: string; x: number; y: number; type: 'creeper' | 'sentinel'; patrolRange: number }[];
}

export interface ADRItem {
  id: string;
  title: string;
  status: 'Aceita' | 'Proposta' | 'Rejeitada';
  context: string;
  decision: string;
  consequences: string[];
}

export interface RoadmapMilestone {
  version: string;
  title: string;
  status: 'completed' | 'current' | 'planned';
  items: { text: string; done: boolean }[];
  completionCriteria?: string[];
}

export interface ArchitectureComponent {
  name: string;
  type: 'Actor' | 'Component' | 'Subsystem' | 'GameInstance';
  description: string;
  responsibilities: string[];
  dependencies: string[];
  cppSignature: string;
}
