import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  init() {
    this.score = 0;
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0).setScale(0.7);

    this.wing_sound = this.sound.add('wing_sound');

    this.point_sound = this.sound.add('point_sound');

    this.hit_sound = this.sound.add('hit_sound');

    this.bird = this.physics.add.sprite(50, 100, 'bird').setScale(1.4);

    this.bird.setGravityY(1000);

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.cursorKeys.space.on('down', () => {
      this.fly();
    });

    this.time.addEvent({
      delay: 1500,
      callback: this.addTubes,
      callbackScope: this,
      loop: true,
    });

    this.tubes = this.physics.add.group();

    this.gates = this.physics.add.group();

    this.physics.add.overlap(this.bird, this.gates, this.increaseScore);

    this.labelScore = this.add.text(
      this.game.renderer.width / 2,
      50,
      '0',
      {
        font: '25px Sans-serif',
        fill: '#ffffff',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#000',
          blur: 3,
          stroke: false,
          fill: true,
        },
      },
    );

    this.labelScore.setDepth(1);

    this.physics.add.overlap(this.bird, this.tubes, this.hitTube, null, this);

    // Fly if the user clicks on the screen.
    this.input.on('pointerdown', this.fly, this);

    this.anims.create({
      key: 'fly',
      frameRate: 5,
      repeat: 0,
      frames: this.anims.generateFrameNumbers('bird', {
        frames: [0, 1, 2],
      }),
    });
  }

  update() {
    if (this.bird.y < 0 || this.bird.y > 512) {
      this.gameOver();
      this.sound.add('die_sound').play();
    }

    if (this.bird.angle < 30) {
      this.bird.angle += 1;
    }
  }

  hitTube(bird, tube) {
    if (this.bird.alive) return;
    
    const birdBounds = bird.getBounds();
    const tubeBounds = tube.getBounds();
    
    // Define the x-axis bounds for collision detection
    const COLLISION_X_MIN = 10;  // Left boundary
    const COLLISION_X_MAX = 20;  // Right boundary
    
    // Only check for collision if the tube is within the x-axis bounds
    if (tube.x >= COLLISION_X_MIN && tube.x <= COLLISION_X_MAX) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(birdBounds, tubeBounds)) {
        this.bird.alive = false;
        this.hit_sound.play();
        this.gameOver();
      }
    }
  }

  fly() {
    this.wing_sound.play();

    this.bird.setVelocityY(-300);

    this.tweens.add({
      targets: this.bird,
      angle: -30,
      ease: 'Linear',
      duration: 100,
      repeat: 0,
      yoyo: false,
    });

    this.bird.play('fly');
  }

  addTopTube(x, y) {
    const topPipe = this.physics.add.sprite(x, y, 'top_tube').setScale(0.5).setOrigin(0, 1);

    this.tubes.add(topPipe);

    topPipe.setVelocityX(-200);
  }

  addBottomTube(x, y) {
    const bottomPipe = this.physics.add.sprite(x, y, 'bottom_tube').setScale(0.5).setOrigin(0, 0);

    this.tubes.add(bottomPipe);

    bottomPipe.setVelocityX(-200);
  }

  addTubes() {
    const hole = Math.floor(Math.random() * 5) + 1;

    this.addTopTube(288, hole * 50 + 20);

    this.addBottomTube(288, hole * 50 + 20 + 120);

    this.time.addEvent({
      delay: 1500,
      callback: this.incrementScore,
      callbackScope: this,
      repeat: 0,
    });
  }

  incrementScore() {
    this.score += 1;
    this.labelScore.setText(this.score);

    this.point_sound.play();
  }

  gameOver() {
    this.scene.pause();
    this.scene.launch('GameOverScene', { prev: this.scene, currentScore: this.score });
  }
}