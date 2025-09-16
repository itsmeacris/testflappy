const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBox = document.getElementById("startBox");
const startBtn = document.getElementById("startBtn");
const gameOverBox = document.getElementById("gameOverBox");
const restartBtn = document.getElementById("restartBtn");
const scoreText = document.getElementById("scoreText");
const bestScoreText = document.getElementById("bestScoreText");

let frames = 0;
const DEGREE = Math.PI / 180;

// Load sprites
const coinImg = new Image();
coinImg.src = "xioncoin.png";

// Sounds
const flapSound = new Audio("flap.wav");
const scoreSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Game variables
let gameState = 0; // 0 = start, 1 = playing, 2 = game over
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// Detect if mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Difficulty settings
const pipeGap = isMobile ? 170 : 150;
const pipeSpeed = isMobile ? -2.5 : -3;
const gravity = isMobile ? 0.20 : 0.25;
const jump = isMobile ? 4.2 : 4.5;

// Pipe dimensions
const pipeWidth = 60;
const pipeHeadWidth = 80;
const pipeHeadHeight = 30;

// Bird
const bird = {
    x: 50,
    y: 150,
    radius: 15,
    velocity: 0,
    draw() {
        ctx.drawImage(coinImg, this.x - 20, this.y - 20, 40, 40);
    },
    update() {
        if (gameState === 1) {
            this.velocity += gravity;
            this.y += this.velocity;
            if (this.y + this.radius >= canvas.height - 40) {
                this.y = canvas.height - 40 - this.radius;
                gameOver();
            }
        }
    },
    flap() {
        this.velocity = -jump;
        flapSound.play();
    }
};

// Pipes
const pipes = [];
function spawnPipe() {
    let topHeight = Math.floor(Math.random() * (canvas.height / 2));
    if (topHeight < 50) topHeight = 50;
    if (topHeight > canvas.height - pipeGap - 50) topHeight = canvas.height - pipeGap - 50;

    pipes.push({
        x: canvas.width,
        y: topHeight
    });
}

function drawPipes() {
    ctx.fillStyle = "#228B22"; // Green pipe
    pipes.forEach(pipe => {
        // Top Pipe Body
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        // Top Pipe Head
        ctx.fillRect(pipe.x - ((pipeHeadWidth - pipeWidth) / 2), pipe.y, pipeHeadWidth, pipeHeadHeight);
        
        // Bottom Pipe Body
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height);
        // Bottom Pipe Head
        ctx.fillRect(pipe.x - ((pipeHeadWidth - pipeWidth) / 2), pipe.y + pipeGap, pipeHeadWidth, pipeHeadHeight);
    });
}

function updatePipes() {
    pipes.forEach((pipe, i) => {
        pipe.x += pipeSpeed;

        // Collision
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.y || bird.y + bird.radius > pipe.y + pipeGap)
        ) {
            gameOver();
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            score++;
            scoreSound.play();
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }
        }
    });

    if (frames % 100 === 0) {
        spawnPipe();
    }
}

// Game over
function gameOver() {
    hitSound.play();
    dieSound.play();
    gameState = 2;
    gameOverBox.style.display = "block";
    scoreText.textContent = "Score: " + score;
    bestScoreText.textContent = "Best: " + bestScore;
}

// Restart game
function restartGame() {
    gameState = 0;
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    gameOverBox.style.display = "none";
    startBox.style.display = "block";
}

// Controls
startBtn.addEventListener("click", () => {
    gameState = 1;
    startBox.style.display = "none";
    swooshSound.play();
});

restartBtn.addEventListener("click", () => {
    restartGame();
});

document.addEventListener("keydown", e => {
    if (e.code === "Space" && gameState === 1) {
        bird.flap();
    }
});

canvas.addEventListener("click", () => {
    if (gameState === 1) {
        bird.flap();
    }
});

// Initial state
startBox.style.display = "block";

// Draw everything
function draw() {
    // Background
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pipes
    drawPipes();

    // Ground
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // Bird
    bird.draw();

    // Score on canvas (while playing)
    if (gameState === 1) {
        ctx.fillStyle = "#333";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(score, canvas.width / 2, 50);
        ctx.font = "16px Arial";
        ctx.fillText("Best: " + bestScore, canvas.width / 2, 70);
    }
}

function loop() {
    frames++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.update();
    if (gameState === 1) updatePipes();

    draw();
    requestAnimationFrame(loop);
}
loop();
