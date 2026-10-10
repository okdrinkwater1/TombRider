let board;
let boardWidth=360;
let boardHeight=576;
let context;

let doodlerWidth=46;
let doodlerHeight=46;
let doodlerX=boardWidth/2-doodlerWidth/2;
let doodlerY=boardHeight*7/8-doodlerHeight;

let velocityX=0;
let velocityY=0;
let initialVelocityY=-8;
let gravity=0.4;

let graveArray=[];
let graveWidth=40;
let graveHeight=18;
let graveDrawHeight=60;
let graveTopOffset=6;
let graveImg;

let bestScore=0;
let score=0;
let maxScore=0;

let skeletonSheet;
let SPRITE_SIZE=32;

let moonBg;

let start=false;

let gameOver=false;

let doodler={
    facingRight:true,
    x:doodlerX,
    y:doodlerY,
    width:doodlerWidth,
    height:doodlerHeight
}

let audio_ctx=null;
document.addEventListener("keydown",()=>{
    if(!audio_ctx){
        audio_ctx=new AudioContext();
    }
    audio_ctx.resume();
})

const hz=(n)=>440*Math.pow(2,(n-69)/12);
const A3=57,A4=69,C5=72,E5=76;
const music=(midi,delay,duration,type,volume,cutoff)=>{
    if(!audio_ctx){
        return;
    }
    const time=audio_ctx.currentTime+delay;
    const oscillator=audio_ctx.createOscillator();
    const gain=audio_ctx.createGain();
    const frequency=audio_ctx.createBiquadFilter();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(hz(midi),time);
    frequency.type="lowpass";
    frequency.frequency.value=cutoff;
    gain.gain.setValueAtTime(volume,time);
    gain.gain.exponentialRampToValueAtTime(0.001,time+duration);
    oscillator.connect(frequency);
    frequency.connect(gain);
    gain.connect(audio_ctx.destination);
    oscillator.start(time);
    oscillator.stop(time+duration);
}

const start_sound=()=>{
    music(A4,0,0.1,"triangle",0.2,6000);
    music(C5,0.1,0.1,"triangle",0.2,6000);
    music(E5,0.2,0.25,"triangle",0.2,6000);
}

const jump_sound=()=>{
    music(A4,0,0.08,"triangle",0.12,6000);
}

const gameover_sound=()=>{
    music(E5,0,0.2,"square",0.15,800);
    music(C5,0.2,0.2,"square",0.15,800);
    music(A4,0.4,0.2,"square",0.15,800);
    music(A3,0.6,0.5,"square",0.15,400);
}

window.onload=function(){
    board=document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");
    context.imageSmoothingEnabled=false;

    moonBg=createMoon();

    skeletonSheet=new Image();
    skeletonSheet.src="./skeleton spritesheet calciumtrice.png";

    graveImg=new Image();
    graveImg.src="./shrineorgrave.png";

    velocityY=initialVelocityY;
    document.addEventListener("keydown",moveDoodler);
    placeGrave();
    bestScore=(Number(localStorage.getItem("bestScore"))||0);
    requestAnimationFrame(update);
}

function update(){
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }
    context.clearRect(0,0,board.width,board.height);
    context.fillStyle="black";
    context.fillRect(0,0,boardWidth,boardHeight);
    context.drawImage(moonBg,0,0);
    if(!start){
        for(let i=0;i<graveArray.length;i++){
            drawGrave(graveArray[i]);
        }
        context.textAlign="center";
        context.fillStyle="white";
        context.font="bold 26px 'Courier New',monospace";
        context.fillText("TombRider",boardWidth/2,boardHeight/2-20);
        context.font="16px sans-serif";
        context.fillText("Press Space to Start",boardWidth/2,boardHeight/2);
        context.textAlign="left";
        return;
    }
     
    doodler.x+=velocityX;
    if(doodler.x<0){
        doodler.x=0;
    }
    else if(doodler.x+doodler.width>boardWidth){
        doodler.x=boardWidth-doodler.width;
    }
    velocityY+=gravity;
    doodler.y+=velocityY;
    if(doodler.y>board.height){
        gameOver=true;
        gameover_sound();
        if(score>bestScore){
            bestScore=score;
            localStorage.setItem("bestScore",bestScore);
        }
    }
    for(let i=0;i<graveArray.length;i++){
        let grave=graveArray[i];
        if(velocityY<0&&doodler.y<boardHeight*3/4){
            grave.y-=initialVelocityY;
        }
        if(detectCollision(doodler,grave)&&velocityY>=0){
            velocityY=initialVelocityY;
            jump_sound();
        }
        drawGrave(grave);
    }
    while(graveArray.length>0&&graveArray[0].y>=boardHeight){
        graveArray.shift();
        newGrave();
    }
    updateScore();
    context.font="16px sans-serif";
    context.fillStyle="green";
    context.fillText(score,5,20);
    context.fillText("Best:"+bestScore,280,20);
    if(gameOver){
        context.fillText("Game Over: Press 'Space' to Restart",boardWidth/7,boardHeight*7/8);
    }
    drawSkeleton();
}

function moveDoodler(e){
    if(!start){
        if(e.code=="Space"){
            start=true;
            start_sound();
        }
        return;
    }
    if(e.code=="ArrowRight"||e.code=="KeyD"){
        velocityX=4;
        doodler.facingRight=true;
    }
    else if(e.code=="ArrowLeft"||e.code=="KeyA"){
        velocityX=-4;
        doodler.facingRight=false;
    }
    else if(e.code=="Space"&&gameOver){
        doodler={
            facingRight:true,
            x:doodlerX,
            y:doodlerY,
            width:doodlerWidth,
            height:doodlerHeight
        }
        velocityX=0;
        velocityY=initialVelocityY;
        score=0;
        maxScore=0;
        gameOver=false;
        placeGrave();
        start_sound();
    }
}

function createMoon(){
    let c=document.createElement("canvas");
    c.width=boardWidth;
    c.height=boardHeight;
    let g=c.getContext("2d");

    let moonX=180,moonY=95,radius=60;

    g.fillStyle="#ecebd3";
    g.beginPath();
    g.arc(moonX,moonY,radius,0,Math.PI*2);
    g.fill();

    return c;
}

function drawSkeleton(){
    let col=0;
    let row=1;
    let maxCol=5;
    if(velocityY<0){
        let t=(velocityY-initialVelocityY)/(-initialVelocityY);
        col=Math.min(maxCol,Math.floor(t*(maxCol+1)));
    }
    else{
        let t=Math.min(velocityY/(-initialVelocityY),1);
        col=maxCol-Math.min(maxCol,Math.floor(t*(maxCol+1)));
    }
    context.save();
    if(!doodler.facingRight){
        context.translate(doodler.x+doodler.width,doodler.y);
        context.scale(-1,1);
        context.drawImage(skeletonSheet,col*SPRITE_SIZE,row*SPRITE_SIZE,SPRITE_SIZE,SPRITE_SIZE,0,0,doodler.width,doodler.height);
    }
    else{
        context.drawImage(skeletonSheet,col*SPRITE_SIZE,row*SPRITE_SIZE,SPRITE_SIZE,SPRITE_SIZE,doodler.x,doodler.y,doodler.width,doodler.height);
    }
    context.restore();   
}

function placeGrave(){
    graveArray=[];
    graveArray.push({
        img:graveImg,
        x:boardWidth/2,
        y:boardHeight-50,
        width:graveWidth,
        height:graveHeight
    });
    for(let i=0;i<5;i++){
        let randomX=Math.floor(Math.random()*boardWidth*3/4);
        graveArray.push({
            img:graveImg,
            x:randomX,
            y:boardHeight-75*i-150,
            width:graveWidth,
            height:graveHeight
        });
    }
}

function drawGrave(grave){
    context.drawImage(grave.img,grave.x,grave.y-graveTopOffset,grave.width,graveDrawHeight);
}

function newGrave(){
    let randomX=Math.floor(Math.random()*boardWidth*3/4);
    let grave={
        img:graveImg,
        x:randomX,
        y:-graveHeight,
        width:graveWidth,
        height:graveHeight
    }
    graveArray.push(grave);
}

function detectCollision(a,b){
    return a.x<b.x+b.width &&
       a.x+a.width>b.x &&
       a.y<b.y+b.height &&
       a.y+a.height>b.y;
}

function updateScore(){
    let points=Math.floor(50*Math.random());
    if(velocityY<0){
        maxScore+=points;
        if(score<maxScore){
            score=maxScore;
        }
    }
    else if(velocityY>=0){
        maxScore-=points;
    }
}