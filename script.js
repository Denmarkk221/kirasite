// Элементы DOM
const startSection = document.getElementById('start-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const healBtn = document.getElementById('heal-btn');
const retryBtn = document.getElementById('retry-btn');
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

// Настройка Web Audio API для автономных звуков
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if (type === 'click') {
        playTone(600, 'sine', 0.1);
    } else if (type === 'success') {
        // Веселый аккорд при успехе
        playTone(523.25, 'square', 0.1, 0);    // До
        playTone(659.25, 'square', 0.1, 0.1);  // Ми
        playTone(783.99, 'square', 0.2, 0.2);  // Соль
        playTone(1046.50, 'square', 0.4, 0.3); // До (октавой выше)
    }
}

function playTone(frequency, type, duration, delay = 0) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);
    
    oscillator.start(audioCtx.currentTime + delay);
    oscillator.stop(audioCtx.currentTime + delay + duration);
}

// Переключение секций
function switchSection(hideElem, showElem) {
    hideElem.classList.remove('active');
    setTimeout(() => {
        hideElem.style.display = 'none';
        showElem.style.display = 'block';
        setTimeout(() => {
            showElem.classList.add('active');
        }, 50);
    }, 400); // Ожидание окончания CSS анимации (opacity)
}

// Логика нажатия кнопки
healBtn.addEventListener('click', () => {
    playSound('click');
    switchSection(startSection, loadingSection);
    
    // Имитация "лечения" длиной ровно в 1 секунду
    setTimeout(() => {
        switchSection(loadingSection, resultSection);
        playSound('success');
        fireConfetti();
    }, 1000);
});

// Логика кнопки "Попробовать ещё раз"
retryBtn.addEventListener('click', () => {
    playSound('click');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка конфетти
    switchSection(resultSection, startSection);
});

// --- Система Конфетти ---
let particles = [];
const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7', '#43e97b', '#38f9d7', '#f6d365', '#fda085'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function fireConfetti() {
    particles = [];
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: Math.random() * 6 + 4,
            dx: Math.random() * 30 - 15,
            dy: Math.random() * -30 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
            tiltAngle: 0
        });
    }
    animateConfetti();
}

function animateConfetti() {
    requestAnimationFrame(animateConfetti);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let activeParticles = 0;

    particles.forEach(p => {
        if (p.y < canvas.height + 100) {
            activeParticles++;
            p.tiltAngle += p.tiltAngleIncrement;
            p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle) * 2;
            p.dy += 0.5; // гравитация
            p.y += p.dy;
            p.x += p.dx;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        }
    });
    
    if (activeParticles === 0) {
        particles = []; // Останавливаем отрисовку, когда все упали
    }
}