// The training scene: background, player, flying balls and effects.
import { W, H, HORIZON, WALL_X, background, drawDynamic } from './backgrounds.js';
import { drawPlayer, drawBall, drawBallShadow, drawMachine } from './sprites.js';

export const MAX_VISIBLE_BALLS = 12;
export const MAX_VISUAL_RATE = 2.2; // passes per second per drawn ball

const GY = 99;           // ground line under the player's feet
const PX = 58;           // player x (close to the wall)
const SX = PX + 10;      // where the ball leaves the foot
const WX = WALL_X - 4;   // where the ball hits the wall

// Lane offsets (pseudo depth) and arc heights so many balls stay readable.
const LANES = [
  { dz: 0, arc: 3 }, { dz: -3, arc: 14 }, { dz: 3, arc: 7 }, { dz: -2, arc: 22 },
  { dz: 4, arc: 2 }, { dz: -4, arc: 10 }, { dz: 2, arc: 18 }, { dz: -1, arc: 5 },
  { dz: 4, arc: 26 }, { dz: -3, arc: 1 }, { dz: 1, arc: 12 }, { dz: -2, arc: 30 },
];

export class Scene {
  constructor(canvas, overlay) {
    this.c = canvas.getContext('2d');
    this.overlay = overlay;
    this.balls = [];
    this.ground = 'g0';
    this.look = null;
    this.kick = -1;
    this.t = 0;
    this.particles = [];
    this.machines = 0;
    this.ballColors = ['#c9c2ad', '#7b7461'];
    this.reducedMotion = false;
    this.floats = 0;
  }

  setBallCount(n, initial = false) {
    const target = Math.min(n, MAX_VISIBLE_BALLS);
    while (this.balls.length < target) {
      const i = this.balls.length;
      this.balls.push(initial
        ? { phase: i / target, mode: 'normal', lane: LANES[i], spin: 0 }
        : { phase: 0, mode: 'retrieve', lane: LANES[i], spin: 0 });
    }
    this.balls.length = target;
    this.machines = Math.min(6, Math.ceil(Math.max(0, n - MAX_VISIBLE_BALLS) / 3));
  }

  // rate: visual passes/s per ball, p: success chance.
  // onPass(success, x, y) is called when a ball reaches the wall.
  update(dt, rate, p, onPass) {
    this.t += dt;
    if (this.kick >= 0) { this.kick += dt / 0.3; if (this.kick >= 1) this.kick = -1; }
    for (const b of this.balls) {
      const prev = b.phase;
      b.phase += rate * dt;
      b.spin += dt * 10 * rate;
      if (b.mode === 'normal' && prev < 0.5 && b.phase >= 0.5) {
        const ok = Math.random() < p;
        if (!ok) b.mode = 'fail';
        onPass(ok, WX, GY + b.lane.dz - 10);
      }
      if (b.phase >= 1) {
        b.phase -= 1;
        if (b.mode === 'fail') b.mode = 'retrieve';
        else { b.mode = 'normal'; this.kick = 0; }
      }
    }
    // Confetti
    for (const q of this.particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 60 * dt; q.life -= dt; }
    this.particles = this.particles.filter(q => q.life > 0 && q.y < H);
  }

  ballPos(b) {
    const { dz, arc } = b.lane;
    let x, h;
    if (b.mode === 'retrieve') {
      x = -10 + (SX + 10) * b.phase;
      h = Math.abs(Math.sin(b.phase * Math.PI * 3)) * 5 * (1 - b.phase);
    } else if (b.phase < 0.5) {
      const u = b.phase / 0.5;
      x = SX + (WX - SX) * u; h = arc * Math.sin(Math.PI * u);
    } else if (b.mode === 'fail') {
      const u = (b.phase - 0.5) / 0.5;
      x = WX - (WX + 20) * u; h = 60 * Math.sin(Math.PI * Math.min(u * 0.8, 1)) + u * 10;
    } else {
      const u = (b.phase - 0.5) / 0.5;
      x = WX - (WX - SX) * u; h = arc * 0.6 * Math.sin(Math.PI * u);
    }
    return { x, y: GY + dz - 3 - h, gy: GY + dz, h };
  }

  draw() {
    const c = this.c;
    c.drawImage(background(this.ground), 0, 0);
    if (!this.reducedMotion) drawDynamic(c, this.ground, this.t);
    for (let i = 0; i < this.machines; i++) drawMachine(c, 2 + i * 16, HORIZON + 14);

    const pos = this.balls.map(b => ({ b, ...this.ballPos(b) }));
    const back = pos.filter(p => p.b.lane.dz < 0), front = pos.filter(p => p.b.lane.dz >= 0);
    for (const p of pos) if (p.x > -5 && p.x < W) drawBallShadow(c, p.x, p.gy, p.h);
    for (const p of back) drawBall(c, p.x, p.y, this.ballColors, p.b.spin);
    if (this.look) drawPlayer(c, PX, GY, this.look, this.kick, this.t);
    for (const p of front) drawBall(c, p.x, p.y, this.ballColors, p.b.spin);

    for (const q of this.particles) { c.fillStyle = q.col; c.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); }
  }

  confetti(n = 120) {
    if (this.reducedMotion) return;
    const cols = ['#f4c430', '#ffffff', '#e94b3c', '#2a62c9', '#1d9a5b', '#ff3d8b'];
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: Math.random() * W, y: -10 - Math.random() * 30,
        vx: (Math.random() - 0.5) * 30, vy: 15 + Math.random() * 30,
        col: cols[i % cols.length], life: 3 + Math.random() * 2,
      });
    }
  }

  // Floating "+123" text as HTML over the canvas (crisp font).
  floatText(text, x, y, cls = '') {
    if (this.reducedMotion || this.floats > 14) return;
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.textContent = text;
    el.style.left = (x / W * 100) + '%';
    el.style.top = (y / H * 100) + '%';
    this.overlay.appendChild(el);
    this.floats++;
    setTimeout(() => { el.remove(); this.floats--; }, 1100);
  }
}
