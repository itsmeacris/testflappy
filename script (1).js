const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
        ctx.fillRect(pipe.x, 0, 60, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + pipeGap, 60, canvas.height);
    });
}

function updatePipes() {
    pipes.forEach((pipe, i) => {
        pipe.x += pipeSpeed;

        // Collision
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + 60 &&
            (bird.y - bird.radius < pipe.y || bird.y + bird.radius > pipe.y + pipeGap)
        ) {
            gameOver();
        }

        if (pipe.x + 60 < 0) {
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
}

// Restart game
function restartGame() {
    gameState = 0;
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
}

// Controls
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (gameState === 0) {
            gameState = 1;
            swooshSound.play();
        } else if (gameState === 1) {
            bird.flap();
        } else if (gameState === 2) {
            restartGame();
        }
    }
});

canvas.addEventListener("click", () => {
    if (gameState === 0) {
        gameState = 1;
        swooshSound.play();
    } else if (gameState === 1) {
        bird.flap();
    } else if (gameState === 2) {
        restartGame();
    }
});

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

    // UI
    ctx.fillStyle = "#333";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";

    if (gameState === 0) {
        ctx.fillText("Tap or Press SPACE to Start", canvas.width / 2, canvas.height / 2);
    }

    if (gameState === 1) {
        ctx.fillText(score, canvas.width / 2, 50);
        ctx.font = "16px Arial";
        ctx.fillText("Best: " + bestScore, canvas.width / 2, 70);
    }

    if (gameState === 2) {
        ctx.font = "32px Arial Black";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
        ctx.fillText("Best: " + bestScore, canvas.width / 2, canvas.height / 2 + 30);

        ctx.font = "18px Arial";
        ctx.fillText("Tap or Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 70);
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
