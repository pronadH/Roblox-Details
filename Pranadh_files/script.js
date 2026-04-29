/* ============================================
   ROBLOX CYBER NEXUS — script.js
   All interactivity & animations
   ============================================ */

// ---- ROBLOX CHARACTER CURSOR ----
const rbxCursor = document.getElementById('rbxCursor');
const rbxDot    = document.getElementById('rbxDot');
const trailWrap = document.getElementById('rbxTrail');

let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;

const TRAIL_COLORS = ['#00f5ff', '#ff00c8', '#00ff88', '#ffe600', '#00f5ff'];
let trailIndex = 0;
let lastTrailX = 0, lastTrailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Exact dot
  rbxDot.style.left = mouseX + 'px';
  rbxDot.style.top  = mouseY + 'px';

  // Trail particles — only spawn if moved enough
  const dx = mouseX - lastTrailX;
  const dy = mouseY - lastTrailY;
  if (Math.sqrt(dx*dx + dy*dy) > 10) {
    spawnTrail(mouseX, mouseY);
    lastTrailX = mouseX;
    lastTrailY = mouseY;
  }
});

// Smooth lag follow for the big cursor head
function animateRbxCursor() {
  curX += (mouseX - curX) * 0.14;
  curY += (mouseY - curY) * 0.14;
  rbxCursor.style.left = curX + 'px';
  rbxCursor.style.top  = curY + 'px';
  requestAnimationFrame(animateRbxCursor);
}
animateRbxCursor();

// Spawn a neon square trail particle
function spawnTrail(x, y) {
  const p = document.createElement('div');
  p.className = 'trail-particle';
  const color = TRAIL_COLORS[trailIndex % TRAIL_COLORS.length];
  trailIndex++;
  const size = Math.random() * 5 + 4;
  p.style.cssText = `
    left:${x}px; top:${y}px;
    width:${size}px; height:${size}px;
    background:${color};
    box-shadow: 0 0 8px ${color}, 0 0 16px ${color};
    border-radius: ${Math.random() > 0.5 ? '2px' : '50%'};
  `;
  trailWrap.appendChild(p);
  setTimeout(() => p.remove(), 560);
}

// Hover state — turn cursor pink on interactive elements
document.querySelectorAll('a, button, .card-btn, .nav-link, .info-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    rbxCursor.classList.add('hover');
    // Swap eye colors in SVG to pink
    rbxDot.style.boxShadow = '0 0 6px #ff00c8, 0 0 12px #ff00c8';
  });
  el.addEventListener('mouseleave', () => {
    rbxCursor.classList.remove('hover');
    rbxDot.style.boxShadow = '0 0 6px #00f5ff, 0 0 12px #00f5ff';
  });
});

// Click burst
document.addEventListener('mousedown', () => {
  rbxCursor.classList.add('click');
  // Burst multiple particles
  for (let i = 0; i < 7; i++) {
    setTimeout(() => spawnTrail(
      mouseX + (Math.random()-0.5)*20,
      mouseY + (Math.random()-0.5)*20
    ), i * 30);
  }
});
document.addEventListener('mouseup', () => {
  rbxCursor.classList.remove('click');
});

// ---- FLOATING ROBLOX ITEMS ----
const ROBLOX_ITEMS = [
  { emoji: '🔫', label: 'gun' },
  { emoji: '⚔️', label: 'sword' },
  { emoji: '🗡️', label: 'dagger' },
  { emoji: '🏹', label: 'bow' },
  { emoji: '💣', label: 'bomb' },
  { emoji: '🎯', label: 'target' },
  { emoji: '🛡️', label: 'shield' },
  { emoji: '⚡', label: 'lightning' },
  { emoji: '💎', label: 'gem' },
  { emoji: '👾', label: 'avatar' },
  { emoji: '🚀', label: 'rocket' },
  { emoji: '🎮', label: 'controller' },
  { emoji: '🏆', label: 'trophy' },
  { emoji: '🔮', label: 'orb' },
  { emoji: '🌟', label: 'star' },
  { emoji: '💰', label: 'robux' },
  { emoji: '🪓', label: 'axe' },
  { emoji: '🔪', label: 'knife' },
];

const floatingContainer = document.getElementById('floatingItems');
const ITEM_COUNT = 22;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createFloatingItem() {
  const item = ROBLOX_ITEMS[Math.floor(Math.random() * ROBLOX_ITEMS.length)];
  const el = document.createElement('div');
  el.className = 'float-item';
  el.textContent = item.emoji;
  el.setAttribute('aria-hidden', 'true');

  // Random position
  const startX = rand(2, 95);
  const startY = rand(10, 90);

  // Random movement offsets
  const x1 = rand(-80, 80);
  const y1 = rand(-120, -30);
  const x2 = rand(-60, 60);
  const y2 = rand(-180, -60);
  const x3 = rand(-100, 100);
  const y3 = rand(-60, -20);

  const dur = rand(9, 18);
  const delay = rand(0, -dur); // negative delay = starts mid-animation
  const size = rand(1.4, 3.0);
  const rotStart = rand(-30, 30);
  const rotMid = rand(-45, 45);
  const rotEnd = rand(-20, 20);

  el.style.cssText = `
    left: ${startX}%;
    top: ${startY}%;
    font-size: ${size}rem;
    --dur: ${dur}s;
    --delay: ${delay}s;
    --x1: ${x1}px;
    --y1: ${y1}px;
    --x2: ${x2}px;
    --y2: ${y2}px;
    --x3: ${x3}px;
    --y3: ${y3}px;
    --rot-start: ${rotStart}deg;
    --rot-mid: ${rotMid}deg;
    --rot-end: ${rotEnd}deg;
  `;

  // Make items draggable
  makeItemDraggable(el);

  floatingContainer.appendChild(el);
}

for (let i = 0; i < ITEM_COUNT; i++) {
  createFloatingItem();
}

// ---- DRAGGABLE FLOATING ITEMS ----
function makeItemDraggable(el) {
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let paused = false;

  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    paused = true;
    el.style.animationPlayState = 'paused';
    el.style.cursor = 'grabbing';
    el.style.zIndex = '999';
    el.style.opacity = '0.9';
    el.style.filter = 'drop-shadow(0 0 20px #00f5ff) drop-shadow(0 0 40px #00f5ff) brightness(1.3)';
    el.style.transform = 'scale(1.3)';
    el.style.transition = 'transform 0.1s, filter 0.1s';

    const rect = el.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
    el.style.position = 'fixed';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.cursor = 'none';
    el.style.opacity = '';
    el.style.filter = '';
    el.style.transform = '';
    el.style.zIndex = '';
    el.style.transition = 'transform 0.4s, filter 0.4s';

    // Resume floating after delay
    setTimeout(() => {
      el.style.position = 'absolute';
      el.style.animationPlayState = 'running';
    }, 1500);
  });
}

// ---- NAVBAR SCROLL EFFECT ----
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(2,5,16,0.97)';
    navbar.style.borderBottomColor = 'rgba(0,245,255,0.25)';
    navbar.style.boxShadow = '0 0 40px rgba(0,245,255,0.08)';
  } else {
    navbar.style.background = 'rgba(2,5,16,0.85)';
    navbar.style.borderBottomColor = 'rgba(0,245,255,0.15)';
    navbar.style.boxShadow = '0 0 30px rgba(0,245,255,0.05)';
  }
});

// ---- SCROLL REVEAL ----
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-up to elements
const animTargets = [
  ...document.querySelectorAll('.game-card'),
  ...document.querySelectorAll('.feature-card'),
  ...document.querySelectorAll('.stat-box'),
  ...document.querySelectorAll('.hero-content > *'),
  document.querySelector('.join-content'),
];

animTargets.forEach((el, i) => {
  if (!el) return;
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  observer.observe(el);
});

// ---- STATS COUNTER ----
const statNums = document.querySelectorAll('.stat-num');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      animateCounter(el, 0, target, 2000);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

function animateCounter(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = Math.floor(eased * (end - start) + start);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = end;
  }
  requestAnimationFrame(update);
}

// ---- GLITCH EFFECT ON NAV LOGO ----
const logoText = document.querySelector('.logo-text');
let glitchInterval;

function startGlitch() {
  const chars = 'RBX!@#$%&';
  let count = 0;
  glitchInterval = setInterval(() => {
    logoText.textContent = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
    count++;
    if (count > 5) {
      clearInterval(glitchInterval);
      logoText.textContent = 'RBX';
    }
  }, 60);
}

setInterval(startGlitch, 4000);

// ---- NAV ACTIVE LINK ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'transparent';
    }
  });
});

// ---- CARD HOVER PARTICLE EFFECT ----
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -6;
    const rotateY = (x - centerX) / centerX * 6;
    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s, border-color 0.3s';
  });
});

// ---- FEATURE CARD ICON PULSE ----
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const icon = card.querySelector('.feat-icon');
    icon.style.animation = 'iconFloat 0.6s ease-in-out infinite';
  });
  card.addEventListener('mouseleave', () => {
    const icon = card.querySelector('.feat-icon');
    icon.style.animation = '';
  });
});

// ---- CYBER INPUT EFFECT ----
const cyberInput = document.querySelector('.cyber-input');
if (cyberInput) {
  cyberInput.addEventListener('focus', () => {
    cyberInput.parentElement.style.setProperty('--glow', '0 0 20px rgba(0,245,255,0.5)');
  });
}

// ---- RANDOM NEON FLICKER ----
function randomFlicker() {
  const neonElements = document.querySelectorAll('.neon-text, .status-text');
  if (neonElements.length) {
    const el = neonElements[Math.floor(Math.random() * neonElements.length)];
    el.style.opacity = '0.3';
    setTimeout(() => { el.style.opacity = ''; }, 80);
    setTimeout(() => { el.style.opacity = '0.6'; }, 160);
    setTimeout(() => { el.style.opacity = ''; }, 240);
  }
  setTimeout(randomFlicker, rand(2000, 6000));
}
setTimeout(randomFlicker, 3000);

// ---- JOIN BUTTON RIPPLE ----
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 200px; height: 200px;
      background: rgba(0,245,255,0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      left: ${e.offsetX - 100}px;
      top: ${e.offsetY - 100}px;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(2); opacity: 0; }
  }
  @keyframes iconFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(5deg); }
  }
`;
document.head.appendChild(style);

// ---- HERO ORB MOUSE PARALLAX ----
const heroOrb = document.querySelector('.hero-orb');
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    heroVisual.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    if (heroOrb) {
      heroOrb.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    }
  });
}

// ---- TYPING EFFECT FOR STATUS ----
const statusText = document.querySelector('.status-text');
if (statusText) {
  const messages = ['ONLINE: 4.2M', 'ONLINE: 4.1M', 'ONLINE: 4.3M', 'ONLINE: 4.2M'];
  let msgIndex = 0;
  setInterval(() => {
    msgIndex = (msgIndex + 1) % messages.length;
    statusText.textContent = messages[msgIndex];
  }, 3000);
}


// ---- AVATAR 2D SHOWCASE ----
(function () {
  const configs = [
    { canvasId: 'avCanvas1', imgSrc: 'AVT.jpg',  glowColor: '#00f5ff', rimColor: '#00ffaa' },
    { canvasId: 'avCanvas2', imgSrc: 'avt2.jpg', glowColor: '#ff00c8', rimColor: '#ff6600' },
  ];

  configs.forEach(({ canvasId, imgSrc, glowColor, rimColor }) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = 320, H = 400;
    canvas.width  = W;
    canvas.height = H;

    // State
    let floatY   = 0;        // floating bob
    let scanY    = 0;        // scan line position
    let glowPulse = 0;       // glow pulsing
    let hovered  = false;
    let scaleNow = 1;
    let targetScale = 1;

    // Particles
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        drift: (Math.random() - 0.5) * 0.4,
      });
    }

    // Load image
    const img = new Image();
    img.src = imgSrc;

    // Buttons
    let flipX = false;
    document.querySelectorAll(`.av-ctrl-btn[data-canvas="${canvasId}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('av-reset-btn')) {
          flipX = false;
        } else if (btn.dataset.dir === 'left') {
          flipX = !flipX;
        } else if (btn.dataset.dir === 'right') {
          flipX = !flipX;
        }
      });
    });

    // Hover
    const wrap = canvas.parentElement;
    wrap.addEventListener('mouseenter', () => { hovered = true;  targetScale = 1.04; });
    wrap.addEventListener('mouseleave', () => { hovered = false; targetScale = 1.0;  });

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return `${r},${g},${b}`;
    }
    const glowRGB = hexToRgb(glowColor);
    const rimRGB  = hexToRgb(rimColor);

    // ---- BACKGROUND REMOVAL ----
    // Offscreen canvas that holds the bg-removed version of the avatar
    let processedCanvas = null;

    function removeBackground(srcImg) {
      const oc  = document.createElement('canvas');
      oc.width  = srcImg.naturalWidth;
      oc.height = srcImg.naturalHeight;
      const oc2 = oc.getContext('2d');
      oc2.drawImage(srcImg, 0, 0);

      const imageData = oc2.getImageData(0, 0, oc.width, oc.height);
      const data = imageData.data;

      // Sample corner pixels to determine the background colour
      // (top-left, top-right, bottom-left, bottom-right — average)
      function px(x, y) {
        const i = (y * oc.width + x) * 4;
        return [data[i], data[i+1], data[i+2]];
      }
      const corners = [
        px(0, 0), px(oc.width-1, 0),
        px(0, oc.height-1), px(oc.width-1, oc.height-1),
      ];
      const bgR = corners.reduce((s,c) => s+c[0], 0) / 4;
      const bgG = corners.reduce((s,c) => s+c[1], 0) / 4;
      const bgB = corners.reduce((s,c) => s+c[2], 0) / 4;

      // Flood-fill from all 4 corners to mark true background pixels
      const w = oc.width, h = oc.height;
      const visited = new Uint8Array(w * h);
      const queue   = [];
      const THRESH  = 38; // colour distance tolerance

      function colorDist(i) {
        const dr = data[i]   - bgR;
        const dg = data[i+1] - bgG;
        const db = data[i+2] - bgB;
        return Math.sqrt(dr*dr + dg*dg + db*db);
      }

      function enqueue(x, y) {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const idx = y * w + x;
        if (visited[idx]) return;
        visited[idx] = 1;
        if (colorDist(idx * 4) < THRESH) queue.push(idx);
      }

      // Seed from all 4 edges
      for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h-1); }
      for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w-1, y); }

      while (queue.length) {
        const idx = queue.pop();
        const x = idx % w, y = Math.floor(idx / w);
        // Make pixel transparent
        data[idx*4+3] = 0;
        enqueue(x+1, y); enqueue(x-1, y);
        enqueue(x, y+1); enqueue(x, y-1);
      }

      // Soften edges — semi-transparent pixels near border
      for (let i = 0; i < w * h; i++) {
        if (data[i*4+3] === 0) continue;
        const x = i % w, y = Math.floor(i / w);
        // Check if any neighbour is transparent
        let hasTransparentNeighbour = false;
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx<0||ny<0||nx>=w||ny>=h) continue;
          if (data[(ny*w+nx)*4+3] === 0) { hasTransparentNeighbour = true; break; }
        }
        if (hasTransparentNeighbour) data[i*4+3] = 180; // soften edge pixel
      }

      oc2.putImageData(imageData, 0, 0);
      return oc;
    }

    let t = 0;

    function draw() {
      requestAnimationFrame(draw);
      t += 0.025;

      // Lerp scale
      scaleNow += (targetScale - scaleNow) * 0.08;

      floatY   = Math.sin(t * 0.9) * 8;
      glowPulse = 0.7 + Math.sin(t * 1.4) * 0.3;
      scanY = ((t * 60) % (H + 40)) - 20;

      // Background
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#04080f';
      ctx.fillRect(0, 0, W, H);

      // Radial background glow
      const bgGrad = ctx.createRadialGradient(W/2, H*0.55, 0, W/2, H*0.55, W * 0.7);
      bgGrad.addColorStop(0,   `rgba(${glowRGB},${0.06 * glowPulse})`);
      bgGrad.addColorStop(0.5, `rgba(${glowRGB},0.02)`);
      bgGrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = `rgba(${glowRGB},0.07)`;
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Platform ellipse
      const pY = H - 55 + floatY * 0.3;
      const platGrad = ctx.createRadialGradient(W/2, pY, 0, W/2, pY, 90);
      platGrad.addColorStop(0,   `rgba(${glowRGB},${0.35 * glowPulse})`);
      platGrad.addColorStop(0.5, `rgba(${glowRGB},0.12)`);
      platGrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = platGrad;
      ctx.beginPath();
      ctx.ellipse(W/2, pY, 95, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Platform rings
      [80, 65, 50].forEach((rx, i) => {
        ctx.save();
        ctx.strokeStyle = `rgba(${glowRGB},${(0.5 - i*0.12) * glowPulse})`;
        ctx.lineWidth = i === 0 ? 1.5 : 1;
        ctx.beginPath();
        ctx.ellipse(W/2, pY, rx, rx * 0.19, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < 0 || p.x > W) p.drift *= -1;

        ctx.save();
        ctx.globalAlpha = p.opacity * glowPulse;
        ctx.fillStyle = glowColor;
        ctx.shadowBlur = 6;
        ctx.shadowColor = glowColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Avatar image (with background removed)
      if (processedCanvas && img.complete && img.naturalWidth > 0) {
        const iAspect = img.naturalWidth / img.naturalHeight;
        const iH = H * 0.78;
        const iW = iH * iAspect;
        const ix = (W - iW) / 2;
        const iy = H * 0.05 + floatY;

        ctx.save();
        ctx.translate(W/2, iy + iH/2);
        ctx.scale(flipX ? -scaleNow : scaleNow, scaleNow);
        ctx.translate(-W/2, -(iy + iH/2));

        // Neon glow aura behind avatar
        const auraGrad = ctx.createRadialGradient(W/2, iy + iH*0.5, 10, W/2, iy + iH*0.5, iW * 0.75);
        auraGrad.addColorStop(0,   `rgba(${glowRGB},${0.22 * glowPulse})`);
        auraGrad.addColorStop(0.5, `rgba(${rimRGB},${0.09 * glowPulse})`);
        auraGrad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.fillRect(ix - 30, iy - 20, iW + 60, iH + 40);

        // Shadow at feet
        const shadowGrad = ctx.createRadialGradient(W/2, iy + iH - 4, 0, W/2, iy + iH - 4, iW * 0.45);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(W/2, iy + iH - 4, iW * 0.4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw bg-removed avatar
        ctx.shadowBlur  = hovered ? 35 : 20;
        ctx.shadowColor = glowColor;
        ctx.drawImage(processedCanvas, ix, iy, iW, iH);

        // Glitch effect
        if (Math.random() > 0.97) {
          const glitchY = iy + Math.random() * iH;
          const glitchH = Math.random() * 5 + 1;
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.drawImage(processedCanvas,
            0, (glitchY - iy) / iH * processedCanvas.height,
            processedCanvas.width, glitchH / iH * processedCanvas.height,
            ix + (Math.random()-0.5)*8, glitchY, iW, glitchH);
          ctx.restore();
        }

        ctx.restore();
      }

      // Scan line
      if (scanY > 0 && scanY < H) {
        const scanGrad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
        scanGrad.addColorStop(0,    'rgba(0,0,0,0)');
        scanGrad.addColorStop(0.5,  `rgba(${glowRGB},0.55)`);
        scanGrad.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 12, W, 24);
      }

      // Neon border
      const borderGlow = hovered ? 0.9 : 0.5 * glowPulse;
      ctx.strokeStyle = `rgba(${glowRGB},${borderGlow})`;
      ctx.lineWidth   = hovered ? 1.5 : 1;
      ctx.shadowBlur  = hovered ? 14 : 8;
      ctx.shadowColor = glowColor;
      ctx.strokeRect(1, 1, W-2, H-2);

      // Corner brackets
      const bLen = 18, bW = 2;
      ctx.fillStyle = glowColor;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = glowColor;
      // TL
      ctx.fillRect(4, 4, bLen, bW);
      ctx.fillRect(4, 4, bW, bLen);
      // TR
      ctx.fillRect(W - 4 - bLen, 4, bLen, bW);
      ctx.fillRect(W - 4 - bW, 4, bW, bLen);
      // BL
      ctx.fillRect(4, H - 4 - bW, bLen, bW);
      ctx.fillRect(4, H - 4 - bLen, bW, bLen);
      // BR
      ctx.fillRect(W - 4 - bLen, H - 4 - bW, bLen, bW);
      ctx.fillRect(W - 4 - bW, H - 4 - bLen, bW, bLen);

      ctx.shadowBlur = 0;
    }

    img.onload  = () => { processedCanvas = removeBackground(img); draw(); };
    img.onerror = draw;
    if (img.complete) draw();
  });
})();



const iframe = document.querySelector('.preview-iframe');
const frameWrap = document.querySelector('.preview-frame-wrap');
if (iframe && frameWrap) {
  iframe.addEventListener('load', () => {
    // Try to detect blocked iframes (X-Frame-Options)
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || doc.body.innerHTML === '') {
        frameWrap.classList.add('blocked');
      }
    } catch (e) {
      // Cross-origin means it loaded (not blocked by us)
      // Leave as is — the iframe is showing
    }
  });
  iframe.addEventListener('error', () => {
    frameWrap.classList.add('blocked');
  });
  // Fallback: after 5 seconds check if iframe has any height content
  setTimeout(() => {
    try {
      if (iframe.contentWindow.location.href === 'about:blank') {
        frameWrap.classList.add('blocked');
      }
    } catch(e) {
      // Cross-origin access — iframe loaded fine
    }
  }, 5000);
}

console.log('%c🎮 ROBLOX CYBER NEXUS', 'font-size:24px; font-family:monospace; color:#00f5ff; text-shadow: 0 0 10px #00f5ff;');
console.log('%cBuilt with ⚡ by Claude', 'font-size:12px; color:#ff00c8;');