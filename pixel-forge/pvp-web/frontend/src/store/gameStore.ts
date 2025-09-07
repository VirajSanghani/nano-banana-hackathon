import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  MatchState, 
  PlayerState, 
  Weapon, 
  PhysicsModification, 
  GameStats,
  UIState,
  Notification,
  GameError,
  InputState,
  WeaponGenerationResponse
} from '@/types/game';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface GameStore {
  // Connection state
  connectionStatus: ConnectionStatus;
  playerId: string | null;
  playerName: string | null;
  ping: number;
  
  // Game state
  currentMatch: MatchState | null;
  myPlayer: PlayerState | null;
  gameStats: GameStats;
  inputState: InputState;
  
  // UI state
  ui: UIState;
  notifications: Notification[];
  
  // Errors
  lastError: GameError | null;
  
  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setPlayerInfo: (id: string, name: string) => void;
  setCurrentMatch: (match: MatchState | null) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerState>) => void;
  updateInputState: (input: Partial<InputState>) => void;
  updateGameStats: (stats: Partial<GameStats>) => void;
  
  // UI actions
  setUIState: (ui: Partial<UIState>) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Weapon actions
  addWeapon: (weapon: Weapon) => void;
  removeWeapon: (weaponId: string) => void;
  setWeaponCooldown: (cooldown: number) => void;
  
  // Physics actions
  applyPhysicsModification: (modification: PhysicsModification) => void;
  
  // Error handling
  setError: (error: GameError | null) => void;
  clearError: () => void;
  
  // Reset
  resetGameState: () => void;
}

const initialInputState: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  mouseX: 0,
  mouseY: 0,
  timestamp: 0,
};

const initialGameStats: GameStats = {
  ping: 0,
  fps: 60,
  packetsReceived: 0,
  packetsSent: 0,
  interpolationDelay: 100,
};

const initialUIState: UIState = {
  showWeaponGen: true,
  showMasterPrompt: false,
  showStats: false,
  showLeaderboard: false,
  weaponCooldown: 0,
  currentWeapon: undefined,
  notifications: [],
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    connectionStatus: 'disconnected',
    playerId: null,
    playerName: null,
    ping: 0,
    
    currentMatch: null,
    myPlayer: null,
    gameStats: initialGameStats,
    inputState: initialInputState,
    
    ui: initialUIState,
    notifications: [],
    
    lastError: null,
    
    // Actions
    setConnectionStatus: (status: ConnectionStatus) => {
      set({ connectionStatus: status });
    },
    
    setPlayerInfo: (id: string, name: string) => {
      set({ playerId: id, playerName: name });
    },
    
    setCurrentMatch: (match: MatchState | null) => {
      set({ currentMatch: match });
      
      // Update my player reference
      if (match && get().playerId) {
        const myPlayer = match.players.find(p => p.id === get().playerId);
        set({ myPlayer: myPlayer || null });
      } else {
        set({ myPlayer: null });
      }
    },
    
    updatePlayer: (playerId: string, updates: Partial<PlayerState>) => {
      const { currentMatch } = get();
      if (!currentMatch) return;
      
      const updatedMatch = {
        ...currentMatch,
        players: currentMatch.players.map(player => 
          player.id === playerId 
            ? { ...player, ...updates }
            : player
        )
      };
      
      set({ currentMatch: updatedMatch });
      
      // Update myPlayer if it's me
      if (playerId === get().playerId) {
        const myPlayer = updatedMatch.players.find(p => p.id === playerId);
        set({ myPlayer: myPlayer || null });
      }
    },
    
    updateInputState: (input: Partial<InputState>) => {
      set({
        inputState: {
          ...get().inputState,
          ...input,
          timestamp: Date.now(),
        }
      });
    },
    
    updateGameStats: (stats: Partial<GameStats>) => {
      set({
        gameStats: {
          ...get().gameStats,
          ...stats,
        }
      });
    },
    
    // UI actions
    setUIState: (ui: Partial<UIState>) => {
      set({
        ui: {
          ...get().ui,
          ...ui,
        }
      });
    },
    
    addNotification: (notification: Notification) => {
      const notifications = get().notifications;
      set({
        notifications: [...notifications, notification]
      });
      
      // Auto-remove after duration
      if (notification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, notification.duration);
      }
    },
    
    removeNotification: (id: string) => {
      set({
        notifications: get().notifications.filter(n => n.id !== id)
      });
    },
    
    clearNotifications: () => {
      set({ notifications: [] });
    },
    
    // Weapon actions
    addWeapon: (weapon: Weapon) => {
      const { myPlayer } = get();
      if (!myPlayer) return;
      
      const updatedPlayer = {
        ...myPlayer,
        weapons: [...myPlayer.weapons, weapon]
      };
      
      get().updatePlayer(myPlayer.id, { weapons: updatedPlayer.weapons });
      
      // Set as current weapon if it's the first one
      if (myPlayer.weapons.length === 0) {
        get().setUIState({ currentWeapon: weapon });
      }
    },
    
    removeWeapon: (weaponId: string) => {
      const { myPlayer, ui } = get();
      if (!myPlayer) return;
      
      const updatedWeapons = myPlayer.weapons.filter(w => w.id !== weaponId);
      get().updatePlayer(myPlayer.id, { weapons: updatedWeapons });
      
      // Clear current weapon if it was removed
      if (ui.currentWeapon?.id === weaponId) {
        const newCurrentWeapon = updatedWeapons.length > 0 ? updatedWeapons[0] : undefined;
        get().setUIState({ currentWeapon: newCurrentWeapon });
      }
    },
    
    setWeaponCooldown: (cooldown: number) => {
      get().setUIState({ weaponCooldown: cooldown });
      
      // Update player state
      if (get().myPlayer) {
        get().updatePlayer(get().myPlayer!.id, { weapon_cooldown: Date.now() + cooldown });
      }
    },
    
    // Physics actions
    applyPhysicsModification: (modification: PhysicsModification) => {
      const { currentMatch } = get();
      if (!currentMatch) return;
      
      const updatedMatch = {
        ...currentMatch,
        physics: {
          ...currentMatch.physics,
          active_modifications: [
            ...currentMatch.physics.active_modifications,
            modification
          ]
        }
      };
      
      set({ currentMatch: updatedMatch });
      
      // Add notification
      get().addNotification({
        id: `physics_${modification.id}`,
        type: 'info',
        message: `Physics Modified: ${modification.description}`,
        duration: 3000,
        timestamp: Date.now()
      });
    },
    
    // Error handling
    setError: (error: GameError | null) => {
      set({ lastError: error });
      
      if (error) {
        get().addNotification({
          id: `error_${Date.now()}`,
          type: 'error',
          message: error.message,
          duration: 5000,
          timestamp: Date.now()
        });
      }
    },
    
    clearError: () => {
      set({ lastError: null });
    },
    
    // Reset
    resetGameState: () => {
      set({
        currentMatch: null,
        myPlayer: null,
        gameStats: initialGameStats,
        inputState: initialInputState,
        ui: initialUIState,
        notifications: [],
        lastError: null,
      });
    },
  }))
);

// Selectors for commonly used combinations
export const usePlayerState = () => {
  return useGameStore((state) => ({
    player: state.myPlayer,
    isAlive: state.myPlayer?.is_alive ?? false,
    health: state.myPlayer?.health ?? 0,
    weapons: state.myPlayer?.weapons ?? [],
    position: state.myPlayer?.position ?? { x: 0, y: 0 },
  }));
};

export const useMatchState = () => {
  return useGameStore((state) => ({
    match: state.currentMatch,
    status: state.currentMatch?.status,
    players: state.currentMatch?.players ?? [],
    projectiles: state.currentMatch?.projectiles ?? [],
    physics: state.currentMatch?.physics,
    isInMatch: !!state.currentMatch,
  }));
};

export const useConnectionState = () => {
  return useGameStore((state) => ({
    status: state.connectionStatus,
    ping: state.ping,
    playerId: state.playerId,
    playerName: state.playerName,
    isConnected: state.connectionStatus === 'connected',
  }));
};

export const useUIControls = () => {
  return useGameStore((state) => ({
    ui: state.ui,
    notifications: state.notifications,
    setUI: state.setUIState,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
  }));
};

export const useGameInput = () => {
  return useGameStore((state) => ({
    inputState: state.inputState,
    updateInput: state.updateInputState,
  }));
};

// Subscribe to match state changes for analytics
useGameStore.subscribe(
  (state) => state.currentMatch,
  (match, prevMatch) => {
    if (match && !prevMatch) {
      console.log('🎮 Match started:', match.id);
    } else if (!match && prevMatch) {
      console.log('🏁 Match ended:', prevMatch.id);
    }
  }
);

// Subscribe to connection status for reconnection logic
useGameStore.subscribe(
  (state) => state.connectionStatus,
  (status, prevStatus) => {
    console.log(`🔌 Connection status: ${prevStatus} -> ${status}`);
  }
);