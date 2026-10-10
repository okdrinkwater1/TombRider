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

let velocityX=0;
let velocityY=0;
let initialVelocityY=-8;
let gravity=0.5;

let graveArray=[];
let graveWidth=40;
let graveHeight=18;
let graveDrawHeight=60;
let graveTopOffset=6;
let graveImg;

let skeletonSheet;
let SPRITE_SIZE=32;

let moonBg;

let gameOver=false;

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

    graveImg=new Image();
    graveImg.src="./shrineorgrave.png";

    velocityY=initialVelocityY;
    document.addEventListener("keydown",moveDoodler);
    placeGrave();
    requestAnimationFrame(update);
}

function update(){
    requestAnimationFrame(update);
    context.clearRect(0,0,board.width,board.height);
    context.fillStyle="black";
    context.fillRect(0,0,boardWidth,boardHeight);
    context.drawImage(moonBg,0,0);
     
    doodler.x+=velocityX;
    if(doodler.x>boardWidth){
        doodler.x=0;
    }
    else if(doodler.x+doodler.width<0){
        doodler.x=boardWidth;
    }
    velocityY+=gravity;
    doodler.y+=velocityY;
    if(doodler.y>board.height){
        gameOver=true;
    }
    for(let i=0;i<graveArray.length;i++){
        drawGrave(graveArray[i]);
    }
    drawSkeleton();
}

function moveDoodler(e){
    if(e.code=="ArrowRight"||e.code=="KeyD"){
        velocityX=4;
        doodler.facingRight=true;
    }
    else if(e.code=="ArrowLeft"||e.code=="KeyA"){
        velocityX=-4;
        doodler.facingRight=false;
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

function placeGrave(){
    graveArray.push({
        img:graveImg,
        x:boardWidth/2,
        y:boardHeight-50,
        width:graveWidth,
        height:graveHeight
    });
    for(let i=0;i<6;i++){
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