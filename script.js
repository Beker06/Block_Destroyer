const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const menu = document.querySelector(".menu");
const button = document.querySelector(".button");
const scoreSpan = document.querySelector(".score");
let animationId;
let score = 0;

const deathSound = new Audio("sounds/death.mp3");
const shotSound = new Audio("sounds/shot.mp3");
const play = (sound, volume = 1) => {
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play();
};
deathSound.preload = 'auto';
shotSound.preload = 'auto';

function adjustCanvasSize() {
    if (window.innerWidth < 460) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 900;
        canvas.height = 500; 
    }
}
class Particle{
    constructor(side,position,color,velocity){
        this.side = side;
        this.position = position;
        this.color = color;
        this.velocity = velocity;
    }
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.side -= 0.8;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x,this.position.y,this.side,this.side);
        ctx.closePath();
    }
}
class Enemy{
    constructor(position,size,color,velocity){
        this.position = position;
        this.size = size;
        this.color = color;
        this.velocity = velocity;
        this.frame = 0;
        this.maxFrame = Math.floor(Math.random()*41)+40;
    }
    shoot(projectiles){
        if(this.frame > this.maxFrame){
            let projectile = new Projectile(
                {
                    x:(this.position.x+this.size.width/2)-5,
                    y:this.position.y
                },
                {
                    width:10,
                    height:20
                },
                this.color,
                8
            );
            projectiles.push(projectile);
            this.frame = 0;
        }
    }
    update(){
        this.draw();
        this.position.x += this.velocity;
        if(this.position.x + this.size.width > canvas.width){
            this.position.x = canvas.width - this.size.width;
            this.velocity *= -1;
        }
        if(this.position.x == 0 ){
            this.velocity *= -1;
        }
        this.frame++;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x,this.position.y,
            this.size.width,this.size.height);
        ctx.closePath();
    }
}
class Projectile{
    constructor(position, size, color, velocity){
        this.position = position;
        this.size = size;
        this.color = color;
        this.velocity = velocity;
    }
    update(){
        this.draw();
        this.position.y += this.velocity;
    }
    collisions(object){
        if(this.position.y<=0 || this.position.y>=canvas.height){
            return 1;
        }
        if(this.position.x < object.position.x + object.size.width &&
            this.position.x + this.size.width > object.position.x &&
            this.position.y < object.position.y + object.size.height &&
            this.position.y + this.size.height > object.position.y
        ){
            return 2;
        }
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x,this.position.y,
            this.size.width,this.size.height);
        ctx.closePath();
    }
}
class Player{
    constructor(position, size, color, velocity){
        this.position = position;
        this.size = size;
        this.color = color;
        this.velocity = velocity;
        this.keys = {
            left:false,
            right:false,
            shoot:true
        }
        this.projectiles = [];
        this.keyboard();
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x,this.position.y,
            this.size.width,this.size.height);
        ctx.closePath()
    }
    update(){
        this.draw();
        if(this.keys.right){
            this.position.x += this.velocity;
            if(this.position.x + this.size.width > canvas.width){
                this.position.x = canvas.width - this.size.width;
            }
        }
        if(this.keys.left){
            this.position.x -= this.velocity;
            if(this.position.x < 0){
                this.position.x = 0;
            }
        }
    }
    keyboard(){
        document.addEventListener("keydown", (evt)=>{
            if(evt.key == "a" || evt.key == "A"){
                this.keys.left = true;
            }
            if(evt.key == "d" || evt.key == "D"){
                this.keys.right = true;
            }
            if (evt.key == "ArrowUp" && this.keys.shoot) {
                play(shotSound, 0.3);
                let projectile = new Projectile(
                    { x: (this.position.x + this.size.width / 2) - 5, y: this.position.y },
                    { width: 10, height: 20 },
                    this.color,
                    -8
                );
                this.projectiles.push(projectile);
                this.keys.shoot = false;
            }
        });
        document.addEventListener("keyup", (evt)=>{
            if(evt.key == "a" || evt.key == "A"){
                this.keys.left = false;
            }
            if(evt.key == "d" || evt.key == "D"){
                this.keys.right = false;
            }
            if(evt.key == "ArrowUp"){
                this.keys.shoot = true;
            }
        });
    }
}

const player = new Player({x:200,y:680},{width:60,height:20}, "#3E7C17", 7);
const enemys = [];
const particles = [];
const projectilesEnemys = [];

window.addEventListener('resize', () => {
    adjustCanvasSize();

});
// document.addEventListener("touchstart", (evt) => {
//     const touchX = evt.touches[0].clientX;
//     const touchY = evt.touches[0].clientY;
    
//     player.position.x = touchX - player.size.width / 2;
//     player.position.y = touchY - player.size.height / 2;
// });

function createEnemys(color){
    let enemy = new Enemy(
        {
            x:Math.floor(Math.random() * (canvas.width-61)),
            y:Math.floor(Math.random() * (201))
        },
        {width:60, height:20},
        color,
        2
    );
    enemys.push(enemy);
}
function initEnemys(){
    let colors = ["#FF004D", "#F8E559", "#4942E4", "#FF9800", "#4CB9E7", "#E36414"];
    for(let i = 0; i<colors.length; i++){
        createEnemys(colors[i]);
    }
}
function createExplosion(object){
    for(let k = 0; k<8; k++){
        let particle = new Particle(
            Math.floor(Math.random()*16)+15,
            {
                x:object.position.x + object.size.width/2,
                y:object.position.y + object.size.height/2
            },
            object.color,
            {
                x: (Math.random()*1.6 - 0.8)*6,
                y: (Math.random()*1.6 - 0.8)*6
            }
        );
        particle.position.x -= particle.side/2;
        particle.position.y -= particle.side/2;
        particles.push(particle);
    }
}
function gameOver(){
    ctx.fillStyle = "#141414";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    enemys.length = 0;
    projectilesEnemys.length = 0;
    particles.length = 0;
    player.projectiles.length = 0;
    menu.style.display = "flex";
}
button.addEventListener("click", ()=>{
    score = 0;
    scoreSpan.innerHTML = score;

    menu.style.display = "none";
    
    if (window.innerWidth < 460){
        player.position = {x:200, y:window.innerHeight*0.6}
    }else{
        player.position = {x:200, y:400}; 
    }
    
    initEnemys();
    update();
});
function updateObjects(){
    for(let i=0; i<player.projectiles.length; i++){
        player.projectiles[i].update();
        for(let j=0; j<enemys.length; j++){
            if(player.projectiles[i].collisions(enemys[j])==1){
                player.projectiles.splice(i,1);
                break;
            }
            if(player.projectiles[i].collisions(enemys[j])==2){
                createExplosion(enemys[j]);

                let colorEnemy = enemys[j].color;
                setTimeout(() => {
                    createEnemys(colorEnemy);
                }, 1000)

                player.projectiles.splice(i,1);
                enemys.splice(j,1);
                score++;
                scoreSpan.innerHTML = score;
                break;
            }
        }
    }
    enemys.forEach((p) => {
        p.update();
        p.shoot(projectilesEnemys);
    });
    particles.forEach((p,i) => {
        p.update();
        if(p.side<=0){
            particles.splice(i,1);
        }
    });
    for(let i = 0; i<projectilesEnemys.length; i++){
        projectilesEnemys[i].update();
        if(projectilesEnemys[i].collisions(player) == 1){
            projectilesEnemys.splice(i,1);
        }
        else if(projectilesEnemys[i].collisions(player) == 2){
            projectilesEnemys.splice(i,1);
            play(deathSound);
            createExplosion(player);

            player.position.x = -50;
            player.position.y = -50;
            setTimeout(()=>{
                cancelAnimationFrame(animationId);
                gameOver();
            },2000);
        }
    }
}
function update(){
    animationId = requestAnimationFrame(update);
    ctx.fillStyle = "#2C2E43";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    player.update();
    updateObjects();
}
function restart(){
    player.position.x = -50;
    player.position.y = -50;

    ctx.fillStyle = "#141414";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    enemys.length = 0;
    projectilesEnemys.length = 0;
    particles.length = 0;
    player.projectiles.length = 0;
    menu.style.display = "flex";
}

adjustCanvasSize();
restart();