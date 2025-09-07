import Phaser from 'phaser';
import { MatchState, PlayerState, Projectile, PhysicsModification } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

export class GameScene extends Phaser.Scene {
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private projectiles: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private playerLabels: Map<string, Phaser.GameObjects.Text> = new Map();
  private background!: Phaser.GameObjects.Graphics;
  private walls!: Phaser.GameObjects.Group;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private currentMatch?: MatchState;
  
  // Physics properties
  private gravity = 800;
  private timeScale = 1.0;
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  create() {
    console.log('🎮 Game scene started');
    
    // Create background
    this.createBackground();
    
    // Create arena walls
    this.createArena();
    
    // Create particle systems
    this.createParticles();
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, 1200, 600);
    
    // Subscribe to game store updates
    this.subscribeToGameStore();
    
    // Start game loop
    this.startGameLoop();
  }
  
  private createBackground() {
    this.background = this.add.graphics();
    this.background.fillStyle(0x0a0a1a);
    this.background.fillRect(0, 0, 1200, 600);
    
    // Add grid pattern
    this.background.lineStyle(1, 0x222244, 0.3);
    for (let x = 0; x < 1200; x += 40) {
      this.background.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 40) {
      this.background.lineBetween(0, y, 1200, y);
    }
    
    // Add corner highlights
    this.background.lineStyle(3, 0x00ffff, 0.6);
    this.background.strokeRect(10, 10, 1180, 580);
  }
  
  private createArena() {
    this.walls = this.add.group();
    
    // Create invisible physics walls
    const wallThickness = 20;
    
    // Top wall
    const topWall = this.add.rectangle(600, -wallThickness/2, 1200, wallThickness, 0x00ffff, 0);
    // Bottom wall  
    const bottomWall = this.add.rectangle(600, 600 + wallThickness/2, 1200, wallThickness, 0x00ffff, 0);
    // Left wall
    const leftWall = this.add.rectangle(-wallThickness/2, 300, wallThickness, 600, 0x00ffff, 0);
    // Right wall
    const rightWall = this.add.rectangle(1200 + wallThickness/2, 300, wallThickness, 600, 0x00ffff, 0);
    
    this.walls.addMultiple([topWall, bottomWall, leftWall, rightWall]);
  }
  
  private createParticles() {
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      lifespan: 1000,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0 }
    });
  }
  
  private subscribeToGameStore() {
    // Poll the game store for updates
    // In a real implementation, you'd use a more efficient subscription method
    this.time.addEvent({
      delay: 16, // ~60 FPS
      callback: this.updateFromGameStore,
      callbackScope: this,
      loop: true
    });
  }
  
  private updateFromGameStore() {
    const gameState = useGameStore.getState();
    const newMatch = gameState.currentMatch;
    
    if (newMatch && newMatch !== this.currentMatch) {
      this.currentMatch = newMatch;
      this.updateGameState();
    }
  }
  
  private updateGameState() {
    if (!this.currentMatch) return;
    
    // Update physics
    this.updatePhysics();
    
    // Update players
    this.updatePlayers();
    
    // Update projectiles
    this.updateProjectiles();
  }
  
  private updatePhysics() {
    if (!this.currentMatch?.physics) return;
    
    const physics = this.currentMatch.physics;
    
    // Apply time scale
    this.physics.world.timeScale = physics.time_scale;
    this.timeScale = physics.time_scale;
    
    // Apply gravity changes
    if (this.physics.world.gravity) {
      this.physics.world.gravity.y = physics.gravity;
    }
    
    // Visual effects for physics changes
    this.updatePhysicsEffects();
  }
  
  private updatePhysicsEffects() {
    if (!this.currentMatch?.physics.active_modifications) return;
    
    const activeMods = this.currentMatch.physics.active_modifications.filter(mod => 
      Date.now() < (mod.start_time + mod.duration) * 1000
    );
    
    // Update background tint based on active modifications
    let tint = 0xffffff;
    activeMods.forEach(mod => {
      switch (mod.type) {
        case 'gravity':
          if (mod.parameters.multiplier < 0.5) {
            tint = 0xaaffff; // Light blue for low gravity
          } else if (mod.parameters.multiplier > 1.5) {
            tint = 0xffaaaa; // Light red for high gravity
          }
          break;
        case 'time_scale':
          if (mod.parameters.scale < 1) {
            tint = 0xffffaa; // Yellow for slow motion
          }
          break;
        case 'bounce':
          if (mod.parameters.multiplier > 2) {
            tint = 0xaaffaa; // Green for bouncy
          }
          break;
      }
    });
    
    this.background.tint = tint;
  }
  
  private updatePlayers() {
    if (!this.currentMatch?.players) return;
    
    // Update existing players and add new ones
    this.currentMatch.players.forEach(player => {
      this.updatePlayer(player);
    });
    
    // Remove disconnected players
    this.players.forEach((sprite, playerId) => {
      const playerExists = this.currentMatch?.players.some(p => p.id === playerId);
      if (!playerExists) {
        this.removePlayer(playerId);
      }
    });
  }
  
  private updatePlayer(player: PlayerState) {
    let playerSprite = this.players.get(player.id);
    let playerLabel = this.playerLabels.get(player.id);
    
    // Create player sprite if doesn't exist
    if (!playerSprite) {
      const isLocalPlayer = useGameStore.getState().playerId === player.id;
      const spriteKey = isLocalPlayer ? 'player' : 'enemy';
      
      playerSprite = this.add.sprite(player.position.x, player.position.y, spriteKey);
      playerSprite.setOrigin(0.5, 0.5);
      playerSprite.setScale(1.2);
      
      // Create name label
      playerLabel = this.add.text(player.position.x, player.position.y - 30, player.name, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        color: isLocalPlayer ? '#00ffff' : '#ff4444',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      
      this.players.set(player.id, playerSprite);
      this.playerLabels.set(player.id, playerLabel);
    }
    
    // Update position with smooth interpolation
    const currentX = playerSprite.x;
    const currentY = playerSprite.y;
    const targetX = player.position.x;
    const targetY = player.position.y;
    
    // Smooth movement
    const lerpFactor = 0.2;
    playerSprite.setPosition(
      Phaser.Math.Linear(currentX, targetX, lerpFactor),
      Phaser.Math.Linear(currentY, targetY, lerpFactor)
    );
    
    // Update label position
    if (playerLabel) {
      playerLabel.setPosition(playerSprite.x, playerSprite.y - 30);
    }
    
    // Update health indicator
    const healthPercent = player.health / 100;
    playerSprite.setTint(Phaser.Display.Color.GetColor(
      Math.floor(255 * (1 - healthPercent) + 255 * healthPercent),
      Math.floor(255 * healthPercent),
      Math.floor(255 * healthPercent)
    ));
    
    // Handle death state
    if (!player.is_alive) {
      playerSprite.setAlpha(0.3);
      playerSprite.setTint(0x666666);
      if (playerLabel) {
        playerLabel.setAlpha(0.3);
      }
    } else {
      playerSprite.setAlpha(1);
      if (playerLabel) {
        playerLabel.setAlpha(1);
      }
    }
  }
  
  private removePlayer(playerId: string) {
    const sprite = this.players.get(playerId);
    const label = this.playerLabels.get(playerId);
    
    if (sprite) {
      sprite.destroy();
      this.players.delete(playerId);
    }
    
    if (label) {
      label.destroy();
      this.playerLabels.delete(playerId);
    }
  }
  
  private updateProjectiles() {
    if (!this.currentMatch?.projectiles) return;
    
    // Update existing projectiles and add new ones
    this.currentMatch.projectiles.forEach(projectile => {
      this.updateProjectile(projectile);
    });
    
    // Remove expired projectiles
    this.projectiles.forEach((sprite, projectileId) => {
      const projectileExists = this.currentMatch?.projectiles.some(p => p.id === projectileId);
      if (!projectileExists) {
        this.removeProjectile(projectileId);
      }
    });
  }
  
  private updateProjectile(projectile: Projectile) {
    let projectileSprite = this.projectiles.get(projectile.id);
    
    // Create projectile sprite if doesn't exist
    if (!projectileSprite) {
      projectileSprite = this.add.sprite(projectile.position.x, projectile.position.y, 'projectile');
      projectileSprite.setOrigin(0.5, 0.5);
      
      // Add glow effect
      projectileSprite.setTint(0xffff00);
      
      // Add trail effect
      this.particles.createEmitter({
        follow: projectileSprite,
        quantity: 2,
        frequency: 50,
        lifespan: 300,
        scale: { start: 0.3, end: 0 },
        tint: 0xffff00,
        alpha: { start: 0.8, end: 0 }
      });
      
      this.projectiles.set(projectile.id, projectileSprite);
    }
    
    // Update position
    projectileSprite.setPosition(projectile.position.x, projectile.position.y);
    
    // Calculate rotation based on velocity
    const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
    projectileSprite.setRotation(angle);
  }
  
  private removeProjectile(projectileId: string) {
    const sprite = this.projectiles.get(projectileId);
    
    if (sprite) {
      // Create explosion effect
      this.particles.emitParticleAt(sprite.x, sprite.y, 10);
      
      sprite.destroy();
      this.projectiles.delete(projectileId);
    }
  }
  
  private startGameLoop() {
    // Additional game logic can go here
    this.time.addEvent({
      delay: 100,
      callback: this.gameLogicUpdate,
      callbackScope: this,
      loop: true
    });
  }
  
  private gameLogicUpdate() {
    // Handle any per-frame game logic
    // This is where you'd add collision detection, AI behavior, etc.
    
    // Update camera to follow local player
    const gameState = useGameStore.getState();
    if (gameState.playerId) {
      const localPlayerSprite = this.players.get(gameState.playerId);
      if (localPlayerSprite) {
        // Smooth camera follow
        const camera = this.cameras.main;
        const targetX = localPlayerSprite.x - camera.width / 2;
        const targetY = localPlayerSprite.y - camera.height / 2;
        
        camera.scrollX = Phaser.Math.Linear(camera.scrollX, targetX, 0.05);
        camera.scrollY = Phaser.Math.Linear(camera.scrollY, targetY, 0.05);
      }
    }
  }
  
  update(time: number, delta: number) {
    // Main update loop - called every frame
    // Most logic is handled in the polling system for this demo
    
    // Apply time scale to delta time
    delta *= this.timeScale;
  }
}