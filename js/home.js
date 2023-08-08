/* terminal-btn onclick navigate to index.html */
var terminalBtn = document.getElementById('terminal-btn');
terminalBtn.onclick = function () {
    window.location.href = './index.html';
}
// stars.js

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2;
    this.opacity = Math.random();
    this.opacitySpeed = Math.random() * 0.05 - 0.025; // random speed between -0.025 and 0.025
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
  }

  twinkle() {
    if (this.opacity < 0.1 || this.opacity > 1) this.opacitySpeed = -this.opacitySpeed;
    this.opacity += this.opacitySpeed;
  }
}


function createStars() {
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    stars.push(new Star(x, y));
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    star.twinkle();
    star.draw();
  });
}

createStars();
animate();