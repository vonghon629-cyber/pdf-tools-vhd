// ========================
// PARTICLE BACKGROUND
// ========================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5 ? '99, 102, 241' : '34, 211, 238';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= dx * force * 0.01;
                this.y -= dy * force * 0.01;
            }
        }
    }

    draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const opacity = (1 - dist / 120) * 0.12;
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
window.addEventListener('resize', initParticles);

// ========================
// NAVBAR SCROLL EFFECT
// ========================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================
// SCROLL REVEAL ANIMATION
// ========================
const revealElements = document.querySelectorAll('.feature-card, .req-card, .download-card, .section-header');

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ========================
// COUNTER ANIMATION
// ========================
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll('.stat-number');
            numbers.forEach(num => animateCounter(num));
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.hero-stats');
if (statsSection) statsObserver.observe(statsSection);

// ========================
// FIREBASE DOWNLOAD COUNTER
// ========================
const FIREBASE_DB_URL = 'https://pdf-tools-vhd-default-rtdb.asia-southeast1.firebasedatabase.app';
const downloadCountEl = document.getElementById('download-count');

// Fetch current download count on page load
async function fetchDownloadCount() {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/downloads.json`);
        const count = await res.json();
        const total = count || 0;
        downloadCountEl.textContent = total;
        downloadCountEl.setAttribute('data-target', total);
    } catch (e) {
        downloadCountEl.textContent = '0';
    }
}

// Increment download count
async function incrementDownload() {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/downloads.json`);
        const current = (await res.json()) || 0;
        const newCount = current + 1;
        await fetch(`${FIREBASE_DB_URL}/downloads.json`, {
            method: 'PUT',
            body: JSON.stringify(newCount),
            headers: { 'Content-Type': 'application/json' }
        });
        downloadCountEl.textContent = newCount;
    } catch (e) {
        console.error('Failed to update download count');
    }
}

fetchDownloadCount();

// Download button click handler
document.querySelectorAll('#download-btn, #download-btn-2').forEach(btn => {
    btn.addEventListener('click', function () {
        incrementDownload();
        const originalHTML = this.innerHTML;
        this.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Đang tải xuống...
        `;
        this.style.pointerEvents = 'none';
        setTimeout(() => {
            this.innerHTML = originalHTML;
            this.style.pointerEvents = 'auto';
        }, 3000);
    });
});

// ========================
// SMOOTH SCROLL FOR NAV LINKS
// ========================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Only intercept internal anchor links (starting with #)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});
