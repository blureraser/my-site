const dt = 1 / 60
const MAX_STEPS = 5;
const MAX_FRAME = MAX_STEPS * dt;

const g = 9.889
const mDen = 1;

const screenH = 600;
const screenW = 800;
const ground = 50;
const scale = 20;
const BACKGROUND = '#0b0e13';
const COLORS = ["#222222", "#ffffff", "#999999", "#cccccc"]

const canvas = document.getElementById('myCanvas');
canvas.width = screenW;
canvas.height  = screenH;
const ctx = canvas.getContext('2d');

//向量计算
const vAdd = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
const vDot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];
const vSub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[0]];
const vProduceN = (angle) => [Math.cos(angle), Math.sin(angle)];

//type: 0木板 1石块 2猪 3鸟
function createBody(o) {
  return {
    pos: [0, 0], angle: 0, v:[0, 0], omega: 0,
    invMass: 0, invI: 0, e: 0.5, u: 0.5,
    type: 1, w: 0, h: 0, r: 0,
    ...o,
  };
}

const bodies = [];
bodies.push(createBody({ type: 1, pos: [0, 0], w: 30 / scale, h: 5 / scale, omega: 1, v:[1, 1], invMass: 1, invI: 12 / ((30 / scale) ** 2 + (5 / scale) ** 2) }));

//--- 辅助函数 ---
function clear() {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, screenW, screenH);
}

function draw_body(b) {
  ctx.save();
  ctx.translate(b.pos[0] * scale, b.pos[1] * scale);
  ctx.rotate(b.angle);
  ctx.fillStyle = COLORS[b.type];
  ctx.fillRect(-b.w * scale / 2, -b.h * scale / 2, b.w * scale, b.h * scale);
  ctx.restore();
}

const calInvI = (invMass, w, h) => 12 / (w * w + h * h) * invMass

//sat碰撞
function is_collided(b1, b2) {
  if(b1.w - b2.w > 2 * Math.abs(b1.pos[0] - b2.pos[0]) || b1.h - b2.h > 2 * Math.abs(b1.pos[1] - b1.pos[1])) return false;

  const vN1w = vProduceN(b1.angle);
  const vN1h = vProduceN(b1.angle + Math.PI / 2);
  const vN2w = vProduceN(b2.angle);
  const vN2h = vProduceN(b2.angle + Math.PI / 2);
  const vNs = [vN1w, vN1h, vN2w, vN2h];

  for (const n of vNs) {
    const proDis = Math.abs(vDot(vSub(b1.pos - b2.pos), n));
    const proW = (Math.abs(vDot(vN1w, n) * w) + Math.abs(vDot(vN1h, n) * h) + Math.abs(vDot(vN2w, n) * w) + Math.abs(vDot(vN2h, n) * h)) / 2;
    if(proW < proDis) return false;
  }
  return true;
}

//处理碰撞
function collide() {

  //两物体间碰撞
  for(const b1 of bodies) {
    for(const b2 of bodies) {
      if(b1 === b2) continue;
      if(is_collided(b1, b2)) {
        //TODO : 处理两物体碰撞
        continue;
      }
    }
  }

  //物体和地面
  for(const b of bodies) {
    const pen = b.pos[1] + (Math.abs(Math.sin(b.angle) * b.w) + Math.abs(Math.cos(b.angle) * b.h)) / 2 - (screenH - ground) / scale;
    if(pen > 0) {
      b.pos[1] -= pen;
      const r = Math.sign(Math.sin(b.angle)) * b.w / 2 * Math.cos(b.angle) - Math.sign(Math.cos(b.angle)) * b.h / 2 * Math.sin(b.angle);
      const k = b.invMass + b.invI * r * r;
      const j = (b.v[1] + b.omega * r) / k * (1 + b.e);
      b.v[1] -= j * b.invMass;
      b.omega -= j * r * b.invI;
      const rf = -(Math.sign(Math.sin(b.angle)) * b.w / 2 * Math.sin(b.angle) + Math.sign(Math.cos(b.angle)) * b.h / 2 * Math.cos(b.angle));
      const kf = b.invMass + b.invI * rf * rf;
      const jf = Math.max(-b.u * j, Math.min(b.u * j, (b.v[0] + b.omega * rf) / kf));
      b.v[0] -= jf * b.invMass;
      b.omega -= jf * rf * b.invI;
    }
  }


}


//--- 物理过程 ---
function physics_process() {
  collide();
  for(const b of bodies) {


    b.v[1] += g * dt;

    b.pos[0] += b.v[0] * dt;
    b.pos[1] += b.v[1] * dt;
    b.angle += b.omega * dt;
  }
}

//--- 单帧 ---
let acc  = 0;
let last = performance.now() / 1000;

function frame(nowMs) {
  requestAnimationFrame(frame);

  const now = nowMs / 1000;
  let ft = now - last;
  last = now;
  if (ft > MAX_FRAME) ft = MAX_FRAME;

  acc += ft;

  let steps = 0;
  while (acc >= dt && steps < MAX_STEPS) {
    physics_process();
    acc -= dt;
    steps++;
  }
  if (steps === MAX_STEPS) acc = 0;

  clear();
  for (const b of bodies) {
    draw_body(b);
  }
}

requestAnimationFrame(frame);
