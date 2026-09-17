import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_ROOMS } from '../data/showcaseData';
import { ComponentTelemetry, RoomDefinition } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { 
  Flame, 
  ShieldAlert, 
  RefreshCw, 
  BookOpen, 
  Activity, 
  Volume2, 
  VolumeX, 
  Zap
} from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Enemy {
  id: string;
  type: 'creeper' | 'sentinel';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';
  facing: number;
  attackTimer: number;
  hurtTimer: number;
  patrolOriginX: number;
  patrolRange: number;
}

interface GhostTrail {
  x: number;
  y: number;
  facing: number;
  alpha: number;
}

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Room state
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const currentRoom: RoomDefinition = GAME_ROOMS[currentRoomIndex] || GAME_ROOMS[0];

  // Active echo modal
  const [activeEcho, setActiveEcho] = useState<{ title: string; text: string } | null>(null);
  const [checkpointNotif, setCheckpointNotif] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(soundEngine.getIsMuted());
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(soundEngine.getIsAmbientPlaying());
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);

  // Live telemetry state for UI panel
  const [telemetry, setTelemetry] = useState<ComponentTelemetry>({
    characterState: 'Idle',
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    abyssEssence: 40,
    maxAbyssEssence: 100,
    comboIndex: 0,
    activeDelegates: ['FOnMovementStateChanged: Idle', 'FOnHealthChanged: 100/100'],
    currentRoomId: currentRoom.id,
    lastCheckpointId: null,
    collectedEchoes: []
  });

  // Mutable Game Engine references (avoids stuttering in requestAnimationFrame)
  const engineRef = useRef({
    // Player
    player: {
      x: currentRoom.spawnX,
      y: currentRoom.spawnY,
      vx: 0,
      vy: 0,
      width: 28,
      height: 52,
      facing: 1, // 1: right, -1: left
      isGrounded: false,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      isAttacking: false,
      attackTimer: 0,
      comboStep: 0,
      comboResetTimer: 0,
      isHeavyAttacking: false,
      isHurt: false,
      hurtTimer: 0,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      abyssEssence: 40,
      maxAbyssEssence: 100,
      state: 'Idle' as ComponentTelemetry['characterState'],
    },
    camera: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    },
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      dash: false,
      attack: false,
      heavyAttack: false,
      interact: false,
    },
    particles: [] as Particle[],
    ghostTrails: [] as GhostTrail[],
    enemies: [] as Enemy[],
    activeCheckpoints: new Set<string>(),
    readEchoes: new Set<string>(),
    slashArcs: [] as { x: number; y: number; facing: number; radius: number; life: number; isHeavy: boolean }[],
    damageNumbers: [] as { x: number; y: number; vy: number; text: string; color: string; life: number }[],
    screenShake: 0,
    nearInteractable: null as { type: 'checkpoint' | 'echo' | 'portal'; id: string; name?: string; title?: string; text?: string } | null,
    lastCheckpointData: { roomId: 0, x: currentRoom.spawnX, y: currentRoom.spawnY },
  });

  // Spawn room enemies when room changes
  useEffect(() => {
    const engine = engineRef.current;
    engine.player.x = currentRoom.spawnX;
    engine.player.y = currentRoom.spawnY;
    engine.player.vx = 0;
    engine.player.vy = 0;
    engine.camera.x = Math.max(0, currentRoom.spawnX - 300);

    engine.enemies = (currentRoom.enemies || []).map((e) => ({
      id: e.id,
      type: e.type,
      x: e.x,
      y: e.y - 40,
      vx: 0,
      vy: 0,
      width: e.type === 'sentinel' ? 36 : 26,
      height: e.type === 'sentinel' ? 62 : 40,
      health: e.type === 'sentinel' ? 120 : 50,
      maxHealth: e.type === 'sentinel' ? 120 : 50,
      state: 'patrol',
      facing: -1,
      attackTimer: 0,
      hurtTimer: 0,
      patrolOriginX: e.x,
      patrolRange: e.patrolRange,
    }));

    setTelemetry((prev) => ({
      ...prev,
      currentRoomId: currentRoom.id,
      activeDelegates: [
        `FOnLevelTransition: Loaded ${currentRoom.title}`,
        ...prev.activeDelegates.slice(0, 3)
      ]
    }));
  }, [currentRoomIndex, currentRoom]);

  // Input listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when playing with Space / Arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const keys = engineRef.current.keys;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
      if (e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowUp') keys.jump = true;
      if (e.key === 'Shift' || e.key === 'k' || e.key === 'K') keys.dash = true;
      if (e.key === 'j' || e.key === 'J' || e.key === 'x' || e.key === 'X') keys.attack = true;
      if (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C') keys.heavyAttack = true;
      if (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') keys.interact = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const keys = engineRef.current.keys;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowUp') keys.jump = false;
      if (e.key === 'Shift' || e.key === 'k' || e.key === 'K') keys.dash = false;
      if (e.key === 'j' || e.key === 'J' || e.key === 'x' || e.key === 'X') keys.attack = false;
      if (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C') keys.heavyAttack = false;
      if (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') keys.interact = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let telemetryThrottle = 0;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Ensure canvas matches its container display size
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(520, window.innerHeight * 0.65);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      const engine = engineRef.current;
      const { player, keys, camera } = engine;
      const room = GAME_ROOMS[currentRoomIndex];

      // -------------------------------------------------------------
      // 1. UPDATE PLAYER PHYSICS & LOCOMOTION (UBloodMovementComponent)
      // -------------------------------------------------------------
      // Regenerate stamina
      if (!player.isDashing && !player.isAttacking) {
        player.stamina = Math.min(player.maxStamina, player.stamina + 22 * dt);
      }

      // Dash Cooldown
      if (player.dashCooldown > 0) player.dashCooldown -= dt;

      // Handle Dash Trigger
      if (keys.dash && player.dashCooldown <= 0 && player.stamina >= 25 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = 0.22;
        player.dashCooldown = 0.65;
        player.stamina -= 25;
        player.vx = player.facing * 520;
        player.vy = 0;
        soundEngine.playDash();

        // Spawn dash particles
        for (let i = 0; i < 14; i++) {
          engine.particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: -player.facing * (Math.random() * 200 + 50),
            vy: (Math.random() - 0.5) * 80,
            life: 0.35,
            maxLife: 0.35,
            color: '#e11d48',
            size: Math.random() * 4 + 2,
          });
        }
      }

      // Active Dash Update
      if (player.isDashing) {
        player.dashTimer -= dt;
        // Spawn ghost trail
        if (Math.random() < 0.6) {
          engine.ghostTrails.push({
            x: player.x,
            y: player.y,
            facing: player.facing,
            alpha: 0.65,
          });
        }
        if (player.dashTimer <= 0) {
          player.isDashing = false;
          player.vx *= 0.3;
        }
      } else {
        // Normal horizontal movement
        const moveSpeed = 240;
        if (keys.left) {
          player.vx = -moveSpeed;
          player.facing = -1;
        } else if (keys.right) {
          player.vx = moveSpeed;
          player.facing = 1;
        } else {
          player.vx *= 0.75;
          if (Math.abs(player.vx) < 5) player.vx = 0;
        }

        // Jump
        const gravity = 850;
        if (keys.jump && player.isGrounded) {
          player.vy = -440;
          player.isGrounded = false;
          soundEngine.playJump();
          for (let i = 0; i < 8; i++) {
            engine.particles.push({
              x: player.x + player.width / 2,
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 120,
              vy: -Math.random() * 50,
              life: 0.25,
              maxLife: 0.25,
              color: '#71717a',
              size: 2,
            });
          }
        }

        // Apply gravity
        player.vy += gravity * dt;
      }

      // Update position
      player.x += player.vx * dt;
      player.y += player.vy * dt;

      // Platform Collisions
      player.isGrounded = false;
      const playerBottom = player.y + player.height;
      const playerPrevBottom = playerBottom - player.vy * dt;

      room.platforms.forEach((plat) => {
        const inHorizontal = player.x + player.width > plat.x && player.x < plat.x + plat.w;
        if (inHorizontal) {
          // Landing on platform top
          if (player.vy >= 0 && playerPrevBottom <= plat.y + 10 && playerBottom >= plat.y) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        }
      });

      // Boundaries
      if (player.x < 10) player.x = 10;
      if (player.x > room.width - player.width - 10) player.x = room.width - player.width - 10;
      if (player.y > room.height + 100) {
        // Fall into abyss - respawn at checkpoint
        player.health = Math.max(10, player.health - 25);
        player.x = engine.lastCheckpointData.x;
        player.y = engine.lastCheckpointData.y - 40;
        player.vy = 0;
        player.vx = 0;
        soundEngine.playHit();
      }

      // -------------------------------------------------------------
      // 2. COMBAT SYSTEM (UCombatComponent)
      // -------------------------------------------------------------
      if (player.attackTimer > 0) player.attackTimer -= dt;
      if (player.comboResetTimer > 0) {
        player.comboResetTimer -= dt;
        if (player.comboResetTimer <= 0) player.comboStep = 0;
      }

      // Execute Light Attack Combo
      if (keys.attack && player.attackTimer <= 0 && player.stamina >= 15 && !player.isDashing) {
        player.isAttacking = true;
        player.attackTimer = 0.22;
        player.comboResetTimer = 0.75;
        player.comboStep = (player.comboStep % 3) + 1;
        player.stamina -= 15;
        soundEngine.playSlash();

        // Register attack hitbox
        const slashRadius = 45;
        const slashX = player.x + (player.facing === 1 ? player.width + 15 : -15);
        const slashY = player.y + player.height / 2;

        engine.slashArcs.push({
          x: slashX,
          y: slashY,
          facing: player.facing,
          radius: slashRadius,
          life: 0.18,
          isHeavy: false,
        });

        // Hit enemies
        engine.enemies.forEach((enemy) => {
          if (enemy.state === 'dead') return;
          const dist = Math.hypot(slashX - (enemy.x + enemy.width / 2), slashY - (enemy.y + enemy.height / 2));
          if (dist < slashRadius + enemy.width) {
            const damage = 25 + player.comboStep * 5;
            enemy.health -= damage;
            enemy.hurtTimer = 0.2;
            enemy.state = enemy.health <= 0 ? 'dead' : 'hurt';
            enemy.vx = player.facing * 180;
            soundEngine.playHit();
            engine.screenShake = 4;
            player.abyssEssence = Math.min(player.maxAbyssEssence, player.abyssEssence + 8);

            engine.damageNumbers.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y - 10,
              vy: -60,
              text: `${damage}`,
              color: '#f43f5e',
              life: 0.6,
            });

            // Blood particles
            for (let i = 0; i < 10; i++) {
              engine.particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: player.facing * (Math.random() * 140 + 40),
                vy: (Math.random() - 0.5) * 120,
                life: 0.35,
                maxLife: 0.35,
                color: '#be123c',
                size: Math.random() * 3 + 2,
              });
            }
          }
        });
      }

      // Execute Abyssal Strike (Heavy AOE)
      if (keys.heavyAttack && player.attackTimer <= 0 && player.abyssEssence >= 30 && !player.isDashing) {
        player.isAttacking = true;
        player.isHeavyAttacking = true;
        player.attackTimer = 0.35;
        player.abyssEssence -= 30;
        soundEngine.playHeavySlash();

        const blastX = player.x + player.width / 2 + player.facing * 40;
        const blastY = player.y + player.height / 2;

        engine.slashArcs.push({
          x: blastX,
          y: blastY,
          facing: player.facing,
          radius: 80,
          life: 0.3,
          isHeavy: true,
        });

        engine.screenShake = 9;

        engine.enemies.forEach((enemy) => {
          if (enemy.state === 'dead') return;
          const dist = Math.hypot(blastX - (enemy.x + enemy.width / 2), blastY - (enemy.y + enemy.height / 2));
          if (dist < 110) {
            const damage = 65;
            enemy.health -= damage;
            enemy.state = enemy.health <= 0 ? 'dead' : 'hurt';
            enemy.vx = player.facing * 320;
            enemy.vy = -180;
            soundEngine.playHit();

            engine.damageNumbers.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y - 15,
              vy: -80,
              text: `CRIT ${damage}`,
              color: '#fb7185',
              life: 0.7,
            });
          }
        });
      }

      if (player.attackTimer <= 0) {
        player.isAttacking = false;
        player.isHeavyAttacking = false;
      }

      // Determine Animation State
      if (player.health <= 0) player.state = 'Dead';
      else if (player.isHurt) player.state = 'Hurt';
      else if (player.isDashing) player.state = 'Dashing';
      else if (player.isAttacking) player.state = 'Attacking';
      else if (!player.isGrounded) player.state = player.vy < 0 ? 'Jumping' : 'Falling';
      else if (Math.abs(player.vx) > 10) player.state = 'Running';
      else player.state = 'Idle';

      // -------------------------------------------------------------
      // 3. ENEMY AI (Sombra Rastejante & Sentinela do Vazio)
      // -------------------------------------------------------------
      engine.enemies.forEach((enemy) => {
        if (enemy.state === 'dead') return;

        if (enemy.hurtTimer > 0) {
          enemy.hurtTimer -= dt;
          if (enemy.hurtTimer <= 0) enemy.state = 'patrol';
        }

        const distToPlayer = Math.hypot(
          player.x - enemy.x,
          player.y - enemy.y
        );

        if (enemy.state === 'patrol') {
          // Patrol within range
          const speed = enemy.type === 'sentinel' ? 60 : 80;
          enemy.vx = enemy.facing * speed;
          if (enemy.x > enemy.patrolOriginX + enemy.patrolRange) enemy.facing = -1;
          if (enemy.x < enemy.patrolOriginX - enemy.patrolRange) enemy.facing = 1;

          // Aggro check
          if (distToPlayer < 240) {
            enemy.state = 'chase';
          }
        } else if (enemy.state === 'chase') {
          enemy.facing = player.x > enemy.x ? 1 : -1;
          const chaseSpeed = enemy.type === 'sentinel' ? 100 : 130;
          enemy.vx = enemy.facing * chaseSpeed;

          // Attack range
          if (distToPlayer < (enemy.type === 'sentinel' ? 55 : 35)) {
            enemy.state = 'attack';
            enemy.attackTimer = 0.5;
          }
          if (distToPlayer > 380) {
            enemy.state = 'patrol';
          }
        } else if (enemy.state === 'attack') {
          enemy.vx = 0;
          enemy.attackTimer -= dt;
          if (enemy.attackTimer <= 0) {
            // Check if player took damage (and not in i-frame dash)
            if (distToPlayer < 60 && !player.isDashing) {
              const enemyDmg = enemy.type === 'sentinel' ? 24 : 14;
              player.health = Math.max(0, player.health - enemyDmg);
              player.vx = enemy.facing * 220;
              player.isHurt = true;
              soundEngine.playHit();
              engine.screenShake = 6;
              setTimeout(() => { player.isHurt = false; }, 220);

              engine.damageNumbers.push({
                x: player.x + player.width / 2,
                y: player.y - 10,
                vy: -50,
                text: `-${enemyDmg}`,
                color: '#e11d48',
                life: 0.6,
              });
            }
            enemy.state = 'chase';
          }
        }

        enemy.x += enemy.vx * dt;
      });

      // -------------------------------------------------------------
      // 4. INTERACTION SYSTEM (UInteractionComponent & Checkpoints)
      // -------------------------------------------------------------
      let nearestInteractable: typeof engine.nearInteractable = null;

      // Check Checkpoints (ABloodCheckpoint)
      (room.checkpoints || []).forEach((cp) => {
        const dist = Math.hypot(player.x - cp.x, player.y - cp.y);
        if (dist < 75) {
          nearestInteractable = { type: 'checkpoint', id: cp.id, name: cp.name };
          if (keys.interact && !engine.activeCheckpoints.has(cp.id)) {
            engine.activeCheckpoints.add(cp.id);
            engine.lastCheckpointData = { roomId: currentRoomIndex, x: cp.x, y: cp.y };
            player.health = player.maxHealth;
            player.stamina = player.maxStamina;
            player.abyssEssence = player.maxAbyssEssence;
            soundEngine.playCheckpoint();
            setCheckpointNotif(`Santuário Vinculado: ${cp.name}`);
            setTimeout(() => setCheckpointNotif(null), 3000);

            setTelemetry((prev) => ({
              ...prev,
              lastCheckpointId: cp.id,
              activeDelegates: [`FOnCheckpointReached: ${cp.name}`, ...prev.activeDelegates.slice(0, 3)]
            }));
          }
        }
      });

      // Check Echoes & Testimonies (Ecos e Testemunhos)
      (room.echoes || []).forEach((echo) => {
        const dist = Math.hypot(player.x - echo.x, player.y - echo.y);
        if (dist < 60) {
          nearestInteractable = { type: 'echo', id: echo.id, title: echo.title, text: echo.text };
          if (keys.interact) {
            engine.readEchoes.add(echo.id);
            setActiveEcho({ title: echo.title, text: echo.text });
            soundEngine.playEcho();

            setTelemetry((prev) => ({
              ...prev,
              collectedEchoes: Array.from(new Set([...prev.collectedEchoes, echo.title])),
              activeDelegates: [`FOnEchoInteracted: ${echo.title}`, ...prev.activeDelegates.slice(0, 3)]
            }));
          }
        }
      });

      // Check Room Exit / Portal (Transição entre salas)
      const distToExit = Math.hypot(player.x - room.exitX, player.y - room.exitY);
      if (distToExit < 70) {
        const nextRoomName = GAME_ROOMS[(currentRoomIndex + 1) % GAME_ROOMS.length].title;
        nearestInteractable = {
          type: 'portal',
          id: 'room-portal',
          name: `Avançar para: ${nextRoomName}`
        };
        if (keys.interact) {
          keys.interact = false;
          setCurrentRoomIndex((prev) => (prev + 1) % GAME_ROOMS.length);
        }
      }

      engine.nearInteractable = nearestInteractable;

      // -------------------------------------------------------------
      // 5. CAMERA FOLLOWING (2.5D Camera with Deadzone & Smooth Damping)
      // -------------------------------------------------------------
      camera.targetX = player.x - canvas.width * 0.4;
      camera.targetY = player.y - canvas.height * 0.6;
      camera.x += (camera.targetX - camera.x) * 5 * dt;
      camera.y += (camera.targetY - camera.y) * 4 * dt;

      // Clamp camera within room boundaries
      camera.x = Math.max(0, Math.min(room.width - canvas.width, camera.x));
      camera.y = Math.max(-50, Math.min(room.height - canvas.height + 60, camera.y));

      // Screen shake decay
      if (engine.screenShake > 0) {
        camera.x += (Math.random() - 0.5) * engine.screenShake;
        camera.y += (Math.random() - 0.5) * engine.screenShake;
        engine.screenShake *= 0.88;
        if (engine.screenShake < 0.5) engine.screenShake = 0;
      }

      // -------------------------------------------------------------
      // 6. RENDER 2.5D COSMIC HORROR WORLD
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. Deep Background (Parallax layer 1: Abyssal cosmic sky & nebula)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#040407');
      bgGrad.addColorStop(0.6, '#0b0b14');
      bgGrad.addColorStop(1, '#1a050f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant stars & cosmic dust
      ctx.save();
      for (let i = 0; i < 40; i++) {
        const starX = ((i * 137.5) - camera.x * 0.1) % canvas.width;
        const starY = (i * 47) % (canvas.height * 0.8);
        const pulse = Math.sin(now * 0.002 + i) * 0.3 + 0.7;
        ctx.fillStyle = i % 3 === 0 ? `rgba(244, 63, 94, ${0.4 * pulse})` : `rgba(180, 180, 210, ${0.3 * pulse})`;
        ctx.beginPath();
        ctx.arc((starX + canvas.width) % canvas.width, starY, (i % 2) + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // B. Midground (Parallax layer 2: Gothic arches & crumbling ruins)
      ctx.save();
      ctx.translate(-camera.x * 0.3, -camera.y * 0.15);
      ctx.fillStyle = '#0f0f18';
      for (let rx = 0; rx < room.width; rx += 280) {
        // Distant ruined pillar
        ctx.fillRect(rx, 220, 48, 380);
        // Arch
        ctx.beginPath();
        ctx.arc(rx + 140, 280, 92, Math.PI, 0);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#0e0e16';
        ctx.stroke();
      }
      ctx.restore();

      // C. World Space (Camera transform)
      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      // Atmospheric fog in room
      const fogGrad = ctx.createRadialGradient(
        player.x, player.y, 40,
        player.x, player.y, 420
      );
      fogGrad.addColorStop(0, 'rgba(159, 18, 57, 0.08)');
      fogGrad.addColorStop(0.7, 'rgba(10, 10, 20, 0.45)');
      fogGrad.addColorStop(1, 'rgba(4, 4, 7, 0.85)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);

      // Render Platforms & Architecture
      room.platforms.forEach((plat) => {
        // Platform body
        ctx.fillStyle = '#14141c';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        // Gothic top edge highlight
        ctx.fillStyle = '#272738';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);

        // Crimson runic etchings on altars
        if (plat.type === 'altar') {
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let rx = plat.x + 20; rx < plat.x + plat.w - 20; rx += 30) {
            ctx.moveTo(rx, plat.y + 10);
            ctx.lineTo(rx + 15, plat.y + 18);
            ctx.lineTo(rx + 30, plat.y + 10);
          }
          ctx.stroke();
        }
      });

      // Render Checkpoints (ABloodCheckpoint)
      (room.checkpoints || []).forEach((cp) => {
        const isActivated = engine.activeCheckpoints.has(cp.id);
        // Base altar pillar
        ctx.fillStyle = '#181824';
        ctx.fillRect(cp.x - 12, cp.y - 48, 24, 48);

        // Torch bowl
        ctx.fillStyle = '#2c2c3d';
        ctx.beginPath();
        ctx.arc(cp.x, cp.y - 48, 16, Math.PI, 0);
        ctx.fill();

        // Crimson Flame
        const flameHeight = isActivated ? 32 + Math.sin(now * 0.01) * 6 : 14;
        const flameColor = isActivated ? '#f43f5e' : '#71717a';
        ctx.fillStyle = flameColor;
        ctx.beginPath();
        ctx.ellipse(cp.x, cp.y - 54 - flameHeight / 2, 9, flameHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flame glow
        if (isActivated) {
          const glow = ctx.createRadialGradient(cp.x, cp.y - 65, 5, cp.x, cp.y - 65, 80);
          glow.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
          glow.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y - 65, 80, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Echoes (Ecos e Testemunhos)
      (room.echoes || []).forEach((echo) => {
        const isRead = engine.readEchoes.has(echo.id);
        const floatY = Math.sin(now * 0.003 + echo.x) * 6;

        // Floating monolith / ancient seal
        ctx.save();
        ctx.translate(echo.x, echo.y - 50 + floatY);
        ctx.rotate(0.04 * Math.sin(now * 0.002));

        // Monolith shape
        ctx.fillStyle = isRead ? '#3f3f46' : '#27273a';
        ctx.strokeStyle = isRead ? '#71717a' : '#e11d48';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(16, 0);
        ctx.lineTo(12, 28);
        ctx.lineTo(-12, 28);
        ctx.lineTo(-16, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cosmic Eye / Glyphs
        ctx.fillStyle = isRead ? '#a1a1aa' : '#fb7185';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Render Room Exit Portal
      const exitPulse = Math.sin(now * 0.004) * 0.2 + 0.8;
      const portalGrad = ctx.createRadialGradient(
        room.exitX, room.exitY - 40, 10,
        room.exitX, room.exitY - 40, 65
      );
      portalGrad.addColorStop(0, `rgba(225, 29, 72, ${0.7 * exitPulse})`);
      portalGrad.addColorStop(0.6, `rgba(76, 5, 25, ${0.4 * exitPulse})`);
      portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = portalGrad;
      ctx.beginPath();
      ctx.arc(room.exitX, room.exitY - 40, 65, 0, Math.PI * 2);
      ctx.fill();

      // Portal arch frame
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(room.exitX, room.exitY - 30, 40, Math.PI, 0);
      ctx.stroke();

      // Render Enemies
      engine.enemies.forEach((enemy) => {
        if (enemy.state === 'dead') {
          // Dissolve into abyssal smoke
          return;
        }

        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        if (enemy.facing === -1) ctx.scale(-1, 1);

        // Flash red when hurt
        const isHurtFlash = enemy.hurtTimer > 0;

        if (enemy.type === 'creeper') {
          // Sombra Rastejante
          ctx.fillStyle = isHurtFlash ? '#f43f5e' : '#171724';
          ctx.beginPath();
          ctx.ellipse(0, 4, 15, 18, 0, 0, Math.PI * 2);
          ctx.fill();

          // Glowing abyssal eyes
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Spikes/tendrils
          ctx.strokeStyle = '#4c0519';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-6, -10);
          ctx.lineTo(-12, -20);
          ctx.moveTo(2, -12);
          ctx.lineTo(4, -22);
          ctx.stroke();
        } else {
          // Sentinela do Vazio
          ctx.fillStyle = isHurtFlash ? '#f43f5e' : '#1f1f2e';
          // Heavy armored frame
          ctx.fillRect(-16, -28, 32, 56);
          // Crimson crest
          ctx.fillStyle = '#9f1239';
          ctx.fillRect(-12, -38, 24, 10);
          // Glaive weapon
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(10, 20);
          ctx.lineTo(24, -35);
          ctx.lineTo(36, -28);
          ctx.stroke();
        }

        // Enemy Health Bar
        ctx.restore();
        const hpBarW = 34;
        const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
        ctx.fillStyle = '#262626';
        ctx.fillRect(enemy.x + (enemy.width - hpBarW) / 2, enemy.y - 12, hpBarW, 4);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(enemy.x + (enemy.width - hpBarW) / 2, enemy.y - 12, hpBarW * hpPct, 4);
      });

      // Render Ghost Trails (Dash afterimages)
      engine.ghostTrails.forEach((gt, idx) => {
        ctx.save();
        ctx.translate(gt.x + player.width / 2, gt.y + player.height / 2);
        if (gt.facing === -1) ctx.scale(-1, 1);
        ctx.fillStyle = `rgba(225, 29, 72, ${gt.alpha * 0.45})`;
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();
        gt.alpha -= dt * 2.5;
        if (gt.alpha <= 0) engine.ghostTrails.splice(idx, 1);
      });

      // Render Protagonist (ABloodCharacter)
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      if (player.facing === -1) ctx.scale(-1, 1);

      // Character body: Gothic coat, silhouette, sword
      const hurtFlash = player.isHurt ? 'rgba(244, 63, 94, 0.8)' : '#181822';
      ctx.fillStyle = hurtFlash;

      // Cloak / Torso
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(10, -22);
      ctx.lineTo(13, 22);
      ctx.lineTo(-13, 22);
      ctx.closePath();
      ctx.fill();

      // Head / Hood
      ctx.fillStyle = '#0f0f16';
      ctx.beginPath();
      ctx.arc(0, -26, 9, 0, Math.PI * 2);
      ctx.fill();

      // Crimson Scarf / Eyes of the Truth
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(2, -27, 4, 2);

      // Blood Blade (Crimson glowing edge)
      ctx.strokeStyle = player.isHeavyAttacking ? '#fda4af' : '#e11d48';
      ctx.lineWidth = player.isHeavyAttacking ? 4 : 2.5;
      ctx.beginPath();
      if (player.isAttacking) {
        // Slashing forward
        ctx.moveTo(8, 0);
        ctx.lineTo(34, 12);
      } else {
        // Held at side
        ctx.moveTo(6, 6);
        ctx.lineTo(24, 24);
      }
      ctx.stroke();

      ctx.restore();

      // Render Slash Arcs (Combat FX)
      engine.slashArcs.forEach((slash, idx) => {
        ctx.save();
        ctx.strokeStyle = slash.isHeavy ? '#fda4af' : '#f43f5e';
        ctx.lineWidth = slash.isHeavy ? 6 : 3;
        ctx.beginPath();
        const startAngle = slash.facing === 1 ? -0.8 : Math.PI - 0.8;
        const endAngle = slash.facing === 1 ? 0.8 : Math.PI + 0.8;
        ctx.arc(slash.x, slash.y, slash.radius, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();

        slash.life -= dt;
        if (slash.life <= 0) engine.slashArcs.splice(idx, 1);
      });

      // Render Floating Damage Numbers
      engine.damageNumbers.forEach((num, idx) => {
        ctx.save();
        ctx.fillStyle = num.color;
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(num.text, num.x, num.y);
        ctx.restore();

        num.y += num.vy * dt;
        num.life -= dt;
        if (num.life <= 0) engine.damageNumbers.splice(idx, 1);
      });

      // Render Particles (Embers, Sparks, Dust)
      engine.particles.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) engine.particles.splice(idx, 1);
      });

      // Context interaction prompt in-world
      if (engine.nearInteractable) {
        const promptY = player.y - 25;
        const promptX = player.x + player.width / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(7, 7, 12, 0.85)';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(promptX - 55, promptY - 18, 110, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pressione [E] Interagir', promptX, promptY - 2);
        ctx.restore();
      }

      ctx.restore(); // Exit camera space

      // -------------------------------------------------------------
      // 7. TELEMETRY THROTTLED SYNC (Updates React state at 15fps)
      // -------------------------------------------------------------
      telemetryThrottle += dt;
      if (telemetryThrottle > 0.06) {
        telemetryThrottle = 0;
        setTelemetry((prev) => ({
          ...prev,
          characterState: player.state,
          health: Math.round(player.health),
          maxHealth: player.maxHealth,
          stamina: Math.round(player.stamina),
          maxStamina: player.maxStamina,
          abyssEssence: Math.round(player.abyssEssence),
          maxAbyssEssence: player.maxAbyssEssence,
          comboIndex: player.comboStep,
        }));
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [currentRoomIndex]);

  // Touch & Action Controls
  const handleTouchAction = (action: keyof typeof engineRef.current.keys, isDown: boolean) => {
    engineRef.current.keys[action] = isDown;
  };

  const handleAudioToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleAmbientToggle = () => {
    const playing = soundEngine.toggleAmbientDrone();
    setIsAmbientPlaying(playing);
  };

  const handleRespawn = useCallback(() => {
    const engine = engineRef.current;
    const player = engine.player;
    player.health = player.maxHealth;
    player.stamina = player.maxStamina;
    player.abyssEssence = player.maxAbyssEssence;
    player.x = engine.lastCheckpointData.x;
    player.y = engine.lastCheckpointData.y - 40;
    player.vx = 0;
    player.vy = 0;
    player.state = 'Idle';
  }, []);

  return (
    <div id="game-prototype-container" className="relative w-full rounded-2xl bg-neutral-950 border border-neutral-800/80 overflow-hidden shadow-2xl">
      {/* Top Banner / HUD Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-b from-neutral-950/95 via-neutral-950/80 to-transparent pointer-events-auto">
        {/* Left: Player Stat Bars (UHealthComponent + UCombatComponent HUD) */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 min-w-[170px] sm:min-w-[210px]">
            {/* Health Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono font-medium text-rose-300">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                VIDA
              </span>
              <span>{telemetry.health} / {telemetry.maxHealth}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-900 border border-rose-950/80 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 transition-all duration-150"
                style={{ width: `${(telemetry.health / telemetry.maxHealth) * 100}%` }}
              />
            </div>

            {/* Stamina & Abyss Essence dual bars */}
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              {/* Stamina */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[9px] font-mono text-amber-300/90">
                  <span>ESTAMINA</span>
                  <span>{telemetry.stamina}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-75"
                    style={{ width: `${(telemetry.stamina / telemetry.maxStamina) * 100}%` }}
                  />
                </div>
              </div>

              {/* Abyss Essence */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[9px] font-mono text-cyan-300/90">
                  <span>ESSÊNCIA</span>
                  <span>{telemetry.abyssEssence}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-rose-500 transition-all duration-150"
                    style={{ width: `${(telemetry.abyssEssence / telemetry.maxAbyssEssence) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Room Badge */}
          <div className="hidden md:flex flex-col border-l border-neutral-800 pl-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Sala Atual</span>
            <span className="text-xs font-semibold text-rose-200">{currentRoom.title}</span>
            <span className="text-[10px] text-neutral-500 truncate max-w-[160px]">{currentRoom.subtitle}</span>
          </div>
        </div>

        {/* Right: Quick Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Sound & Music Toggles */}
          <button
            id="ambient-sound-toggle"
            onClick={handleAmbientToggle}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
              isAmbientPlaying 
                ? 'bg-rose-950/60 border-rose-800 text-rose-200' 
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Trilha atmosférica procedural (Web Audio)"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Trilha Cósmica</span>
            <span>{isAmbientPlaying ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="audio-mute-toggle"
            onClick={handleAudioToggle}
            className="p-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
            title={isAudioMuted ? 'Desmutar Áudio' : 'Mutar Áudio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Telemetry Panel Toggle */}
          <button
            id="toggle-telemetry-panel"
            onClick={() => setShowTelemetry((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
              showTelemetry 
                ? 'bg-neutral-800/90 border-neutral-700 text-neutral-200' 
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Telemetria C++</span>
          </button>

          {/* Quick Room Selector */}
          <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-lg p-0.5">
            {GAME_ROOMS.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => setCurrentRoomIndex(idx)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                  currentRoomIndex === idx 
                    ? 'bg-rose-900/70 text-rose-200 font-semibold' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={r.title}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] bg-neutral-950">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

        {/* Checkpoint Notification Toast */}
        {checkpointNotif && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950/90 border border-rose-600/80 shadow-2xl backdrop-blur text-rose-200 text-xs font-mono animate-bounce">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>{checkpointNotif}</span>
          </div>
        )}

        {/* Death Screen Overlay */}
        {telemetry.health <= 0 && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-neutral-950/85 backdrop-blur-sm p-6 text-center">
            <h3 className="text-2xl sm:text-3xl font-serif-gothic font-bold text-rose-500 mb-2">
              A Mente Sucumbiu ao Abismo
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mb-5">
              “Toda memória possui um preço. O conhecimento foi disperso pelo Jardim do Esquecimento.”
            </p>
            <button
              onClick={handleRespawn}
              className="px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-rose-100 font-semibold text-xs uppercase tracking-wider font-mono transition flex items-center gap-2 border border-rose-700 shadow-lg shadow-rose-950"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar no Santuário
            </button>
          </div>
        )}

        {/* Echo / Lore Reading Modal */}
        {activeEcho && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-rose-800/80 p-6 shadow-2xl relative">
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs uppercase font-mono tracking-widest">Eco de Memória</span>
              </div>
              <h4 className="text-lg sm:text-xl font-serif-gothic font-bold text-neutral-100 mb-3">
                {activeEcho.title}
              </h4>
              <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed italic mb-6 border-l-2 border-rose-700 pl-4">
                {activeEcho.text}
              </p>
              <button
                onClick={() => setActiveEcho(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-medium transition border border-neutral-700"
              >
                Prosseguir na Jornada [Esc / Fechar]
              </button>
            </div>
          </div>
        )}

        {/* Live C++ Architecture Telemetry Panel (Collapsible) */}
        {showTelemetry && (
          <div className="absolute bottom-3 left-3 z-20 w-[260px] sm:w-[310px] rounded-xl bg-neutral-950/90 border border-neutral-800 backdrop-blur-md p-3 text-[11px] font-mono shadow-xl hidden sm:block">
            <div className="flex items-center justify-between text-neutral-400 pb-1.5 mb-1.5 border-b border-neutral-800">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                C++ TELEMETRIA UE5
              </span>
              <span className="text-[10px] text-neutral-500">ABloodCharacter</span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-neutral-300">
              <div>
                <span className="text-neutral-500">Estado: </span>
                <span className="text-rose-300 font-medium">{telemetry.characterState}</span>
              </div>
              <div>
                <span className="text-neutral-500">Combo: </span>
                <span className="text-amber-300 font-medium">{telemetry.comboIndex}/3</span>
              </div>
              <div>
                <span className="text-neutral-500">Sala: </span>
                <span className="text-neutral-200">{telemetry.currentRoomId}</span>
              </div>
              <div>
                <span className="text-neutral-500">Ecos Lidos: </span>
                <span className="text-cyan-300 font-medium">{telemetry.collectedEchoes.length}</span>
              </div>
            </div>

            {/* Active Delegates Queue */}
            <div className="mt-2 pt-1.5 border-t border-neutral-800/80">
              <div className="text-[10px] text-neutral-500 uppercase mb-1">Últimos Eventos Disparados:</div>
              <div className="space-y-0.5 text-[10px] text-neutral-400">
                {telemetry.activeDelegates.slice(0, 2).map((del, i) => (
                  <div key={i} className="truncate text-rose-300/80 font-mono">
                    ▸ {del}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar & Touch Controls (Mobile Friendly) */}
      <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Keyboard instructions */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[11px] font-mono text-neutral-400">
          <span className="text-rose-400 font-semibold mr-1">Comandos:</span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">A / D / Setas</span> Mover
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Espaço / W</span> Pulo
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Shift / K</span> Esquiva
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">J / X</span> Ataque
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">U / C</span> Clivagem
          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">E</span> Interagir
        </div>

        {/* Touch Buttons for Mobile/Tablet Screens */}
        <div className="flex md:hidden items-center justify-center gap-2 w-full pt-1">
          <button
            onTouchStart={() => handleTouchAction('left', true)}
            onTouchEnd={() => handleTouchAction('left', false)}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs text-center active:bg-rose-900"
          >
            ◄ Esquerda
          </button>
          <button
            onTouchStart={() => handleTouchAction('right', true)}
            onTouchEnd={() => handleTouchAction('right', false)}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs text-center active:bg-rose-900"
          >
            Direita ►
          </button>
          <button
            onTouchStart={() => handleTouchAction('jump', true)}
            onTouchEnd={() => handleTouchAction('jump', false)}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs text-center active:bg-rose-900"
          >
            Pulo
          </button>
          <button
            onTouchStart={() => handleTouchAction('attack', true)}
            onTouchEnd={() => handleTouchAction('attack', false)}
            className="flex-1 py-2.5 rounded-xl bg-rose-900/80 border border-rose-700 text-rose-100 font-mono text-xs text-center active:bg-rose-700"
          >
            Atacar
          </button>
          <button
            onTouchStart={() => handleTouchAction('dash', true)}
            onTouchEnd={() => handleTouchAction('dash', false)}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs text-center active:bg-rose-900"
          >
            Esquiva
          </button>
        </div>
      </div>
    </div>
  );
};
