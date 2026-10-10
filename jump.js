let board;
let boardWidth=360;
let boardHeight=576;
let context;

let doodlerWidth=46;
let doodlerHeight=46;
let doodlerX=boardWidth/2-doodlerWidth/2;
let doodlerY=boardHeight*7/8-doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let skeletonSheet;
let platformImg;
let SPRITE_SIZE=32;

let moonBg;

let doodler={
    facingRight:true,
    x:doodlerX,
    y:doodlerY,
    width:doodlerWidth,
    height:doodlerHeight
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

    platformImg=new Image();
    platformImg.src="./shrineorgrave.png";

    requestAnimationFrame(update);
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

function update(){
    requestAnimationFrame(update);
    context.clearRect(0,0,board.width,board.height);
    context.fillStyle="black";
    context.fillRect(0,0,boardWidth,boardHeight);
    context.drawImage(moonBg,0,0);

    drawSkeleton();
}

function drawSkeleton(){
    let col=0;
    let row=0;

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