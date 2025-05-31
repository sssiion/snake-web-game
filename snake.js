const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let gameOver = false;
let score = 0;
let snakeColor = '#0f0';

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
}
function rgbToHex([r,g,b]) {
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw snake with gradient
    const base = hexToRgb(snakeColor);
    const len = snake.length;
    snake.forEach((segment, idx) => {
        let factor = 1 - (idx/len)*0.9; // 머리: 1, 꼬리: 0.1
        let color = rgbToHex(base.map(c => Math.max(0, Math.min(255, Math.round(c * factor)))));
        ctx.fillStyle = color;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    // Draw food
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 390);
}

function update() {
    if (gameOver) return;
    // 방향키가 눌려있지 않으면 이동하지 않음
    if (!keyPressed || (direction.x === 0 && direction.y === 0)) return;
    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    // Check collision with wall
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        alert('Game Over! Your score: ' + score);
        document.location.reload();
        return;
    }
    // Check collision with self
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            alert('Game Over! Your score: ' + score);
            document.location.reload();
            return;
        }
    }
    snake.unshift(head);
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Prevent food from spawning on the snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            placeFood();
            return;
        }
    }
}

let keyPressed = false;
document.addEventListener('keydown', e => {
    keyPressed = true;
    switch (e.key) {
        case 'ArrowLeft':
            if (direction.x !== 1) direction = { x: -1, y: 0 };
            break;
        case 'ArrowUp':
            if (direction.y !== 1) direction = { x: 0, y: -1 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) direction = { x: 1, y: 0 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) direction = { x: 0, y: 1 };
            break;
    }
});
document.addEventListener('keyup', e => {
    if (["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"].includes(e.key)) {
        keyPressed = false;
        direction = { x: 0, y: 0 };
    }
});

// 팔레트 클릭 이벤트
window.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('palette');
    if (palette) {
        palette.addEventListener('click', function(e) {
            if (e.target.dataset.color) {
                snakeColor = e.target.dataset.color;
            }
        });
    }
    // 캔버스에 포커스 주기 (방향키 입력 시 스크롤 방지)
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
});
// 방향키 누를 때 스크롤 방지
window.addEventListener('keydown', function(e) {
    if (["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"].includes(e.key)) {
        e.preventDefault();
    }
}, { passive: false });

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        setTimeout(gameLoop, 100);
    }
}
gameLoop();
