import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f23);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 100, 'PIXEL-FORGE PVP', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add glow effect
    title.setStroke('#00ffff', 2);
    title.setShadow(0, 0, '#00ffff', 20, true, true);
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 + 50, 'Initializing Combat Arena...', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Progress bar background
    const progressBg = this.add.rectangle(width / 2, height / 2 + 100, 400, 20, 0x333333);
    progressBg.setStrokeStyle(2, 0x00ffff);
    
    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 200, height / 2 + 100, 0, 16, 0x00ffff);
    progressBar.setOrigin(0, 0.5);
    
    // Loading progress
    this.load.on('progress', (value: number) => {
      progressBar.width = 400 * value;
      loadingText.setText(`Loading assets... ${Math.round(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      loadingText.setText('Ready for combat!');
      
      // Transition to game scene after short delay
      this.time.delayedCall(1000, () => {
        this.scene.start('GameScene');
      });
    });
    
    // Create some placeholder assets
    // In a real game, you'd load sprites, sounds, etc.
    this.createDummyAssets();
  }
  
  private createDummyAssets() {
    // Create colored rectangles as placeholder sprites
    const graphics = this.add.graphics();
    
    // Player sprite (blue rectangle)
    graphics.fillStyle(0x0088ff);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    
    // Enemy player sprite (red rectangle)
    graphics.clear();
    graphics.fillStyle(0xff4444);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('enemy', 32, 32);
    
    // Projectile sprite (yellow circle)
    graphics.clear();
    graphics.fillStyle(0xffff00);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('projectile', 16, 16);
    
    // Weapon sprites (various colored rectangles)
    const weaponColors = [0xff6600, 0x00ff88, 0xff0088, 0x8800ff, 0x00ffff];
    weaponColors.forEach((color, index) => {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillRect(0, 0, 24, 8);
      graphics.generateTexture(`weapon_${index}`, 24, 8);
    });
    
    // Particle textures
    graphics.clear();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('particle', 4, 4);
    
    graphics.destroy();
    
    // Simulate loading time
    for (let i = 0; i < 20; i++) {
      this.load.image(`dummy_${i}`, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
    
    // Start the actual loading
    this.load.start();
  }

  create() {
    // Scene is ready
    console.log('🎮 Loading scene ready');
  }
}