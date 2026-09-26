//javascript真的诗人用的吗
const dt = 1 / 60;
const MAX_STEPS = 5;
const MAX_FRAME = MAX_STEPS * dt;

const g = 9.889;
const mDen = 1;

const screenH = 600;
const screenW = 800;
const ground = 50;
const scale = 20;
const BACKGROUND = '#ffffff';
const COLORS = ["#222222", "#555555", "#999999", "#cccccc"]
const width = 2.4;
const height = 0.4;
const sqaW = 0.8;
const structureP = [300 / scale, (screenH - ground) / scale];


const canvas = document.getElementById('myCanvas');
canvas.width = screenW
canvas.height  = screenH;
const ctx = canvas.getContext('2d');

//向量计算
const vAdd = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
const vDot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];
const vSub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]];
const vProduceN = (angle) => [Math.cos(angle), Math.sin(angle)];
const vDis = (v1, v2) => ((v1[0] - v2[0]) ** 2 + (v1[1] - v2[1]) ** 2) ** (1 / 2)
const vCrossXY = (v1, v2) => v1[0] * v2[1] - v1[1] * v2[0];
const vCrossWl = (w, r) => [-w * r[1], w * r[0]];
const vInv = (v) => [-v[0], -v[1]];

//type: 0木板 1石块 2
function createBody(o) {
  return {
    pos: [0, 0], angle: 0, v:[0, 0], omega: 0,
    invMass: 0, invI: 0, e: 0.5, u: 0.5,
    type: 1, w: 0, h: 0, r: 0, hp: 5,
    ...o,
  };
}

const bodies = [];

let score = 0;

//--------- 辅助函数 ----------
//----- 动画 -----
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

function draw_ground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, screenH - ground, screenW, ground);
}

function draw_score() {
  ctx.fillStyle = "#000000";
  ctx.font = 'bold 30px Arial';
  ctx.fillText(String(score), 0, 0);
}

const flip_coin = (p) => Math.random() > p;

function create_brick(typen, posi, anglep) {
  const invMass = 1 / (mDen * width * height);
  bodies.push(createBody({type: typen, pos: posi, w: width, h: height, angle: anglep,
                          invMass, invI: calInvI(invMass, width, height)}));
}

function create_entity(typen, posi) {
  const invMass = 1 / (mDen * sqaW * sqaW);
  bodies.push(createBody({type: typen, pos: posi, w: sqaW, h: sqaW,
                          invMass, invI: calInvI(invMass, sqaW, sqaW)}));
}

function random_produce_structure() {
  const structure = [
    [1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]

  let hori = structureP[1];
  let p = 0.5;
  for(let y = 1; y < 5; y++) {
    let verti = structureP[0];
    for(let x = 1; x <= 5; x++) {
      if(structure[y - 1][x] && flip_coin(p)) {
        structure[y][x] = 1;
        p += 0.07;
        create_brick(flip_coin(0.5) ? 0 : 1, [verti + width / 2, hori - (width + height / 2)], 0);
        create_brick(flip_coin(0.5) ? 0 : 1, [verti + height / 2, hori - width / 2], Math.PI / 2);
        create_brick(flip_coin(0.5) ? 0 : 1, [verti + (width - height / 2), hori - width / 2], Math.PI / 2);
        create_entity(3, [verti + width / 2, hori - sqaW / 2]);
      }
      verti += width;
    }
    hori -= (width + height);
  }

}

//----- 物理 -----
const calInvI = (invMass, w, h) => 12 / (w * w + h * h) * invMass

function PutJonBody(b, j, r) {
  b.v[0] += j[0] * b.invMass;
  b.v[1] += j[1] * b.invMass;
  b.omega += vCrossXY(r, j) * b.invI;
}

//点是否在矩形内
function withinRect(pos, rPos, w, h, angle) {
  const rltv = vSub(pos, rPos);

  const rw = Math.abs(vDot(vProduceN(angle), rltv));
  const rh = Math.abs(vDot(vProduceN(angle + Math.PI / 2), rltv));

  return (rw < w / 2 + 1e-9) && (rh < h / 2 + 1e-9);
}

//按顺序返回矩形四个点
function calRectPoints(rPos, w, h, angle) {
  const u = [Math.cos(angle) * w / 2, Math.sin(angle) * w / 2];
  const v = [-Math.sin(angle) * h / 2, Math.cos(angle) * h / 2];

  return [
    [rPos[0] + u[0] + v[0], rPos[1] + u[1] + v[1]],
    [rPos[0] - u[0] + v[0], rPos[1] - u[1] + v[1]],
    [rPos[0] - u[0] - v[0], rPos[1] - u[1] - v[1]],
    [rPos[0] + u[0] - v[0], rPos[1] + u[1] - v[1]],
  ];
}

//找两矩形碰撞点坐标，多点时取平均
function findCollideP(r1Pos, r1w, r1h, r1angle, r2Pos, r2w, r2h, r2angle) {
  let sx = 0, sy = 0, cnt = 0;
  for(const p of calRectPoints(r1Pos, r1w, r1h, r1angle)) {
    if(withinRect(p, r2Pos, r2w, r2h, r2angle))  {
      sx += p[0]; sy += p[1]; cnt++;
    }
  }
  for(const p of calRectPoints(r2Pos, r2w, r2h, r2angle)) {
    if(withinRect(p, r1Pos, r1w, r1h, r1angle))  {
      sx += p[0]; sy += p[1]; cnt++;
    }
  }

  return cnt ? [sx / cnt, sy / cnt] : null;
}

//sat碰撞,碰撞则返回碰撞边法向量和法向穿透深度
function is_collided(b1, b2) {
  if(2 * vDis(b1.pos, b2.pos) > vDis([0, 0], [b1.w, b1.h]) + vDis([0, 0], [b2.w, b2.h])) return null;

  const vN1w = vProduceN(b1.angle);
  const vN1h = vProduceN(b1.angle + Math.PI / 2);
  const vN2w = vProduceN(b2.angle);
  const vN2h = vProduceN(b2.angle + Math.PI / 2);
  const vNs = [vN1w, vN1h, vN2w, vN2h];

  let minPen = Infinity;
  let nc = null;
  for (const n of vNs) {
    const proDis = Math.abs(vDot(vSub(b1.pos, b2.pos), n));
    const proW = (Math.abs(vDot(vN1w, n) * b1.w) + Math.abs(vDot(vN1h, n) * b1.h) + Math.abs(vDot(vN2w, n) * b2.w) + Math.abs(vDot(vN2h, n) * b2.h)) / 2;
    const pen = proW - proDis;
    if(pen < 0) return null;
    if(pen < minPen) { minPen = pen; nc = n; }
  }

  if(!nc) return null;
  if(vDot(vSub(b2.pos, b1.pos), nc) < 0) nc = vInv(nc);
  return [nc[0], nc[1], minPen];
}

//处理碰撞
function collide() {

  //两物体间碰撞
  for(let i = 0; i < bodies.length; i++) {
    for(let j = 0; j < bodies.length; j++) {
      if(i <= j) continue;
      const b1 = bodies[i];
      const b2 = bodies[j];
      const n = is_collided(b1, b2);
      if(n) {
        const P = findCollideP(b1.pos, b1.w, b1.h, b1.angle, b2.pos, b2.w, b2.h, b2.angle);

        if(P) {
          const r1 = vSub(P, b1.pos);
          const r2 = vSub(P, b2.pos);

          const vp1 = [b1.v[0] - b1.omega * r1[1], b1.v[1] + b1.omega * r1[0]];
          const vp2 = [b2.v[0] - b2.omega * r2[1], b2.v[1] + b2.omega * r2[0]];
          const v_n = vDot(vSub(vp2, vp1), n);

          if(v_n < 0) {
            const rxN1 = vCrossXY(r1, n);
            const rxN2 = vCrossXY(r2, n);
            const k = b1.invMass + b2.invMass + b1.invI * rxN1 * rxN1 + b2.invI * rxN2 * rxN2;

            if(k > 0) {
              const j = -(1 + Math.min(b1.e, b2.e)) * v_n / k;
              PutJonBody(b1, [-j * n[0], -j * n[1]], r1);
              PutJonBody(b2, [j * n[0], j * n[1]], r2);

              const t = [-n[1], n[0]];
              const rxT1 = vCrossXY(r1, t);
              const rxT2 = vCrossXY(r2, t);
              const kf = b1.invMass + b2.invMass + b1.invI * rxT1 * rxT1 + b2.invI * rxT2 * rxT2;

              if(kf > 0) {
                const vp1b = [b1.v[0] - b1.omega * r1[1], b1.v[1] + b1.omega * r1[0]];
                const vp2b = [b2.v[0] - b2.omega * r2[1], b2.v[1] + b2.omega * r2[0]];
                const v_t = vDot(vSub(vp2b, vp1b), t);
                const mu = (b1.u + b2.u) / 2;
                const jf = Math.max(-mu * j, Math.min(mu * j, -v_t / kf));
                PutJonBody(b1, [-jf * t[0], -jf * t[1]], r1);
                PutJonBody(b2, [jf * t[0], jf * t[1]], r2);
              }
            }
          }
        }
        
        const invSum = b1.invMass + b2.invMass;
        if(invSum > 0) {
          const corr = Math.max(n[2] - 0.0005, 0)/ invSum;
          b1.pos[0] -= n[0] * corr * b1.invMass;
          b1.pos[1] -= n[1] * corr * b1.invMass;
          b2.pos[0] += n[0] * corr * b2.invMass;
          b2.pos[1] += n[1] * corr * b2.invMass;
        }
      }
    }  
  }

  //物体和地面
  for(const b of bodies) {
    const pen = b.pos[1] + (Math.abs(Math.sin(b.angle) * b.w) + Math.abs(Math.cos(b.angle) * b.h)) / 2 - (screenH - ground) / scale;
    if(pen > 0) {
      b.pos[1] -= pen;
      const r  = Math.sign(Math.sin(b.angle)) * b.w / 2 * Math.cos(b.angle) - Math.sign(Math.cos(b.angle)) * b.h / 2 * Math.sin(b.angle);
      const rf = Math.sign(Math.sin(b.angle)) * b.w / 2 * Math.sin(b.angle) + Math.sign(Math.cos(b.angle)) * b.h / 2 * Math.cos(b.angle);
      const rv = [r, rf];

      const k = b.invMass + b.invI * r * r;

      if(k > 0) {
        const j = (b.v[1] + b.omega * r) / k * (1 + b.e);
        PutJonBody(b, [0, -j], rv);

        const kf = b.invMass + b.invI * rf * rf;

        if(kf > 0) {
          const jf = Math.max(-b.u * j, Math.min(b.u * j, (b.v[0] - b.omega * rf) / kf));
          PutJonBody(b, [-jf, 0], rv);
        }
      }
    }
  }
}


//------------- 主循环 ----------------
function physics_process() {
  collide();
  for(const b of bodies) {
    if(b.invMass === 0) continue;

    b.v[1] += g * dt;

    b.pos[0] += b.v[0] * dt;
    b.pos[1] += b.v[1] * dt;
    b.angle += b.omega * dt;
  }
}

let acc  = 0;
let last = performance.now() / 1000;

function get_input() {

}

random_produce_structure();

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
  draw_ground();
  draw_score();
  for (const b of bodies) {
    draw_body(b);
  }
}

requestAnimationFrame(frame);
