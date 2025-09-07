/**
 * Frontend type definitions that match the backend game_types.py
 * Ensures type safety across the client-server boundary
 */

export enum WeaponCategory {
  PROJECTILE = 'projectile',
  MELEE = 'melee',
  AREA_EFFECT = 'area_effect',
  UTILITY = 'utility',
  MAGIC = 'magic'
}

export enum PhysicsModType {
  GRAVITY = 'gravity',
  FRICTION = 'friction',
  BOUNCE = 'bounce',
  TIME_SCALE = 'time_scale',
  WEAPON_BEHAVIOR = 'weapon_behavior'
}

export enum MatchStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export interface WeaponProperties {
  damage: number;      // 10-100
  speed: number;       // 10-100
  range: number;       // 20-200
  ammo: number;        // 1-30
  cooldown: number;    // 1000-5000 ms
  special_effect: string;
  effect_parameters: Record<string, any>;
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  properties: WeaponProperties;
  sprite_url: string;
  generated_at: number;
  balance_score: number;
  player_id: string;
}

export interface PhysicsModification {
  id: string;
  type: PhysicsModType;
  description: string;
  parameters: Record<string, number>;
  duration: number;
  start_time: number;
  match_id: string;
}

export interface PhysicsState {
  gravity: number;
  friction: number;
  restitution: number;
  time_scale: number;
  active_modifications: PhysicsModification[];
}

export interface PlayerState {
  id: string;
  name: string;
  health: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  weapons: Weapon[];
  weapon_cooldown: number;
  is_alive: boolean;
  kills: number;
  deaths: number;
}

export interface Projectile {
  id: string;
  weapon_id: string;
  player_id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  created_at: number;
  expires_at: number;
}

export interface MatchState {
  id: string;
  status: MatchStatus;
  players: PlayerState[];
  projectiles: Projectile[];
  physics: PhysicsState;
  start_time?: number;
  end_time?: number;
  winner_id?: string;
  last_master_prompt: number;
}

export enum MessageType {
  // Connection
  PLAYER_CONNECT = 'player_connect',
  PLAYER_DISCONNECT = 'player_disconnect',
  
  // Matchmaking
  FIND_MATCH = 'find_match',
  MATCH_FOUND = 'match_found',
  MATCH_START = 'match_start',
  MATCH_END = 'match_end',
  
  // Gameplay
  PLAYER_INPUT = 'player_input',
  GAME_STATE_UPDATE = 'game_state_update',
  WEAPON_GENERATE = 'weapon_generate',
  WEAPON_GENERATED = 'weapon_generated',
  WEAPON_USE = 'weapon_use',
  
  // Physics
  MASTER_PROMPT = 'master_prompt',
  PHYSICS_CHANGED = 'physics_changed',
  
  // Combat
  PROJECTILE_FIRED = 'projectile_fired',
  PLAYER_HIT = 'player_hit',
  PLAYER_DEATH = 'player_death'
}

export interface GameMessage {
  type: MessageType;
  data: Record<string, any>;
  timestamp: number;
  player_id?: string;
}

export interface WeaponGenerationRequest {
  prompt: string;
  player_id: string;
  match_id: string;
}

export interface WeaponGenerationResponse {
  success: boolean;
  weapon?: Weapon;
  error?: string;
  generation_time: number;
}

export interface MasterPromptRequest {
  prompt: string;
  match_id: string;
}

export interface MasterPromptResponse {
  success: boolean;
  modification?: PhysicsModification;
  error?: string;
}

// Frontend-specific types
export interface GameConfig {
  arena: {
    width: number;
    height: number;
  };
  physics: {
    gravity: number;
    friction: number;
    restitution: number;
  };
  networking: {
    maxLatency: number;
    interpolationDelay: number;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  mouseX: number;
  mouseY: number;
  timestamp: number;
}

export interface GameStats {
  ping: number;
  fps: number;
  packetsReceived: number;
  packetsSent: number;
  interpolationDelay: number;
}

export interface UIState {
  showWeaponGen: boolean;
  showMasterPrompt: boolean;
  showStats: boolean;
  showLeaderboard: boolean;
  weaponCooldown: number;
  currentWeapon?: Weapon;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  timestamp: number;
}

// Phaser-specific types
export interface PhaserGameObject extends Phaser.GameObjects.Sprite {
  playerId?: string;
  weaponId?: string;
  health?: number;
}

export interface GameScene extends Phaser.Scene {
  players: Map<string, PhaserGameObject>;
  projectiles: Map<string, PhaserGameObject>;
  currentMatch?: MatchState;
  inputState: InputState;
}

// Network interpolation types
export interface NetworkState {
  timestamp: number;
  players: Record<string, {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    rotation: number;
    health: number;
  }>;
  projectiles: Record<string, {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    rotation: number;
  }>;
}

export interface InterpolationBuffer {
  states: NetworkState[];
  maxSize: number;
  targetDelay: number;
}

// AI weapon generation types
export interface WeaponTemplate {
  category: WeaponCategory;
  name_patterns: string[];
  property_ranges: {
    damage: [number, number];
    speed: [number, number];
    range: [number, number];
    ammo: [number, number];
    cooldown: [number, number];
  };
  special_effects: string[];
  sprite_templates: string[];
}

// Physics modification system types
export interface PhysicsPreset {
  name: string;
  type: PhysicsModType;
  description: string;
  parameters: Record<string, number>;
  duration: number;
  keywords: string[];
  visual_effects?: {
    particle_color: string;
    screen_tint: string;
    camera_shake: number;
  };
}

// Game event types
export interface GameEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface WeaponFireEvent extends GameEvent {
  type: 'weapon_fire';
  data: {
    playerId: string;
    weaponId: string;
    position: { x: number; y: number };
    direction: { x: number; y: number };
    damage: number;
  };
}

export interface PlayerHitEvent extends GameEvent {
  type: 'player_hit';
  data: {
    targetId: string;
    attackerId: string;
    damage: number;
    weaponId: string;
    position: { x: number; y: number };
  };
}

export interface PhysicsChangeEvent extends GameEvent {
  type: 'physics_change';
  data: {
    modification: PhysicsModification;
    autoGenerated: boolean;
  };
}

// Error types
export interface GameError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface NetworkError extends GameError {
  code: 'NETWORK_ERROR';
  details: {
    type: 'connection' | 'timeout' | 'protocol' | 'authentication';
    retryable: boolean;
  };
}

export interface GameplayError extends GameError {
  code: 'GAMEPLAY_ERROR';
  details: {
    type: 'weapon_generation' | 'physics_modification' | 'match_state' | 'player_action';
    playerId?: string;
    matchId?: string;
  };
}