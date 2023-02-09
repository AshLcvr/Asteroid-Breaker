// Level Constructor
let levelIndex = 0;
if (levelIndex !== 0){
    levelIndex = localStorage.getItem('levelIndex')
}
console.log(localStorage)
import { levelConstructorArray } from "./levelConstruct.js";

// Canvas & Context
export const canvas    = document.getElementById("myCanvas");
const ctx              = canvas.getContext("2d");

// Ball(s)
export let ballArray   = [];
let ball = {
    ballRadius    : 10,
    x             : canvas.width/2,
    y             : canvas.height-30,
    directions    : {dx : 5, dy : -5},
    oldDirections : {oldDx  : 0, oldDy : 0},
    copyDirections: function() {return JSON.parse(JSON.stringify(this.directions))},
};
ballArray.push(ball);

// Paddle
let paddleHeight       = 15;
export let paddleWidth = 85;
let paddleX            = (canvas.width-paddleWidth)/2;
let paddleColor        = "#fff3fc";
let rightPressed       = false;
let leftPressed        = false;

// Score
let score              = 0;
let lives              = 3;
let gamePaused         = false;
let itemDropped        = false;

// Bonus
import {bonusObject,createImageObject,createMultiBalls} from "./objects.js";
export let lifeUp            = ()=>{ lives++ };
export let modifyPaddleWidth = pWidth => { paddleWidth = pWidth };
export let fireLauncher      = boolean => { isArmed = boolean};
export let multiBall         = max => { createMultiBalls(max); };
export let bigBall           = bRadius => { for (let i = 0; i < ballArray.length; i++){ballArray[i].ballRadius = bRadius}};
export let isArmed           = false;
let bx;
let by;
let item;
let activeItems  = {};
let imageArray   = createImageObject();
let isMagnetBall = false;
let hasFired     = false;
let launchedAmmo = [];

// Bricks
let brickRowCount;
let brickColumnCount;
let brickWidth;
let brickHeight;
let brickPadding;
let brickOffsetTop;
let brickOffsetLeft;
let brokenBricks      = 0;
const brickBackground = new Image();
brickBackground.src   = levelConstructorArray[levelIndex].brickBackground;

// GAME !
game();

function game() {

    levelIndex > 0 ? pause() : null;

    levelConstructor();

    let bricks = brickConstructor();

    draw();

    // Init keyboard and mouse inputs detection
    const DirectionsInput = {
        'Up'        : {type : "keyup" , function : keyUpHandler},
        'Down'      : {type : "keydown" , function : keyDownHandler},
        'Mousemove' : {type : "mousemove" , function : mouseMoveHandler},
        'Space'     : {type : "keyup" , function : spaceBarHandler},
        'Launch'    : {type : ["keyup","click"] , function : launchHandler},
        'Fire'      : {type : ["keyup","click"] , function : fireHandler}
    };

    document.addEventListener('DOMContentLoaded', addInputsListener, false)

    function addInputsListener(){
        for (let directionName in DirectionsInput){
            let direction = DirectionsInput[directionName];
            if (Array.isArray(direction.type)){
                for (let i = 0; i < direction.type.length ; i++){
                    document.addEventListener(direction.type[i], direction.function, false);
                }
            }else{
                document.addEventListener(direction.type, direction.function, false);
            }
        }
    }

    // Functions
    function levelConstructor(){
        // Reset Paddle & Ball
        lives < 3 ? lives++ : null;
        ballArray[0].y    = canvas.height-25;
        paddleX           = (canvas.width-paddleWidth)/2;
        isMagnetBall      = true;
        brokenBricks      = 0;

        // Setting props from imported array
        brickRowCount     = levelConstructorArray[levelIndex].brickRowCount;
        brickColumnCount  = levelConstructorArray[levelIndex].brickColumnCount;
        brickWidth        = levelConstructorArray[levelIndex].brickWidth;
        brickHeight       = levelConstructorArray[levelIndex].brickHeight;
        brickPadding      = levelConstructorArray[levelIndex].brickPadding;
        brickOffsetTop    = levelConstructorArray[levelIndex].brickOffsetTop;
        brickOffsetLeft   = levelConstructorArray[levelIndex].brickOffsetLeft;
    }

    function randomIntBonusBrick(row,column){
        // return Math.floor(Math.random() * (row*column));
        return 40;
    }

    function randomObjectBonus(bonusObject) {
        let bonusArray = Object.keys(bonusObject);
        let randIndex  = Math.floor(Math.random() * (Object.keys(bonusArray).length));
        return bonusObject[bonusArray[randIndex]];
    }

    function brickConstructor() {
        let bricks      = [];
        let brickNumber = 0;
        let bonusBrick  = randomIntBonusBrick(brickRowCount,brickColumnCount);

        for(let c=0; c<brickColumnCount; c++) {
            bricks[c] = [];
            for(let r=0; r<brickRowCount; r++) {
                brickNumber++;
                if (brickNumber === bonusBrick)
                {
                    bricks[c][r] = {
                        x      : 0,
                        y      : 0,
                        status : 1,
                        number : brickNumber,
                        bonus  : true,
                        object : randomObjectBonus(bonusObject)}
                }else{
                    bricks[c][r] = {x: 0, y: 0, status: 1, number: brickNumber, bonus : false };
                }
            }
        }
        return bricks
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle(paddleColor);
        drawScore();
        drawLives();
        collisionDetection();

        isArmed = true;

        if (itemDropped) {
            if (!gamePaused){
                drawItem(bx,by);
                by  += 2;
            }
        }
        if (Object.keys(activeItems).length !== 0){
            for (let oneItem in activeItems){
                let item   = activeItems[oneItem];
                item.time ? actionTimedItem(item) : (()=>{item.action() ; delete activeItems[item.name]})();
            }
        }
        if (activeItems['fireLauncher'] !== undefined || isArmed){
            if (hasFired){
                if (!gamePaused){
                    // Les projectiles s'effacent quand isArmed retourne à false
                    for (let i = 0; i < launchedAmmo.length; i++){
                        drawFireAnimation(launchedAmmo[i])
                    }
                }
            }
        }
        if (isMagnetBall){
            for (let i = 0; i < ballArray.length; i++)
            {
                ballArray[i].x             = paddleX + paddleWidth/2;
                ballArray[i].directions.dx = 0;
                ballArray[i].directions.dy = 0;
            }
        }
        if (gamePaused){
            drawPauseMenu();
        }

        for (let i = 0; i < ballArray.length; i++){
            // Ball movement
            ballArray[i].x += ballArray[i].directions.dx;
            ballArray[i].y += ballArray[i].directions.dy;
            // Edge collision detection
            if(ballArray[i].x + ballArray[i].directions.dx > canvas.width-ballArray[i].ballRadius || ballArray[i].x + ballArray[i].directions.dx < ballArray[i].ballRadius) {
                ballArray[i].directions.dx = -ballArray[i].directions.dx;
            }
            if(ballArray[i].y + ballArray[i].directions.dy < ballArray[i].ballRadius) {
                ballArray[i].directions.dy = -ballArray[i].directions.dy;
            }
            else if(ballArray[i].y + ballArray[i].directions.dy > canvas.height-ballArray[i].ballRadius) {
                // Low Edge Detection
                // If ball touch paddle
                if(ballArray[i].x > paddleX && ballArray[i].x < paddleX + paddleWidth) {
                    if (activeItems['magnetBall'] !== undefined){
                        ballArray[i].y -= 10;
                        ballArray[i].directions.dx = 0;
                        ballArray[i].directions.dy = 0;
                        isMagnetBall               = true
                    } else {
                        ballArray[i].directions.dy = -ballArray[i].directions.dy;
                    }
                } else {
                    // If ball falls
                    if (ballArray.length > 1){
                        ballArray.splice(i,1)
                    }
                    else {
                        lives--;
                        ballArray[i].x             = canvas.width/2;
                        ballArray[i].y             = canvas.height-30;
                        ballArray[i].directions.dx = 5;
                        ballArray[i].directions.dy = -5;
                        paddleX                    = (canvas.width-paddleWidth)/2;
                        isMagnetBall               = true;
                    }
                    if(!lives) {
                        alert("GAME OVER");
                        document.location.reload();
                    }
                }
            }
        }
        // Keyboard arrow movement
        if(rightPressed && paddleX < canvas.width-paddleWidth) {
            paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        requestAnimationFrame(draw);
    }

    function drawBricks() {
        for(let c=0; c<brickColumnCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                if(bricks[c][r].status === 1) {
                    // C'est ici que ça se passe pour les collisions
                    const brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                    const brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    // si la brique contient un bonus
                    if (bricks[c][r].bonus){
                        ctx.fillStyle = "gold";
                    }else{
                        ctx.fillStyle =  ctx.createPattern(brickBackground,'repeat');
                    }
                    ctx.fill();
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                    ctx.closePath()
                }
            }
        }
    }

    function drawBall() {
        for (let i = 0; i < ballArray.length; i++){
            ctx.beginPath();
            ctx.arc(ballArray[i].x, ballArray[i].y, ballArray[i].ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#dd2e2f";
            ctx.fill();
            ctx.closePath();
        }
    }

    function drawPaddle(paddleColor) {
        if (isArmed){
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = 'pink';
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.rect(paddleX-20, canvas.height-paddleHeight, 20, paddleHeight);
            ctx.rect(paddleX+paddleWidth, canvas.height-paddleHeight, 20, paddleHeight);
            ctx.fillStyle = 'grey';
            ctx.fill();
        }else{
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = paddleColor;
            ctx.fill();
            ctx.closePath();
        }
    }

    function drawFireAnimation(activeAmmo){
        activeAmmo.ammoY -= 12;
        ctx.beginPath();
        ctx.arc(activeAmmo.leftAmmoX, activeAmmo.ammoY, 7, 0, Math.PI*2);
        ctx.arc(activeAmmo.rightAmmoX, activeAmmo.ammoY, 7, 0, Math.PI*2);
        ctx.fillStyle = 'cyan';
        ctx.fill();
        ctx.closePath();
    }

    function drawItem(bx,by) {
        ctx.beginPath();
        ctx.rect(bx,by,20,20);
        // ctx.fillStyle = ctx.createPattern(imageArray[item.name],'repeat');
        ctx.fillStyle = 'gold';
        ctx.fill();
        ctx.closePath();
        // Si le joueur attrape l'objet
        if(by === canvas.height - paddleHeight - 15 && bx < paddleX + paddleWidth){
            itemDropped = false;
            activeItems[item.name] = item;
            paddleColor = "red"
        }
        // Si l'objet n'est pas attrapé
        if(by === canvas.height ){
            itemDropped = false;
        }
    }

    function drawScore() {
        ctx.font = "32px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText("Score: "+score, 20, 40);
    }

    function drawLives() {
        ctx.font = "32px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText("Vies: "+lives, canvas.width-120, 40);
    }

    function drawPauseMenu() {
        ctx.font = "132px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText("PAUSE", 300, 350);
    }

    function collisionDetection() {
        for(let c=0; c<brickColumnCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                let b = bricks[c][r];
                if(b.status === 1) {
                     if (launchedAmmo.length > 0){
                        for (let a = 0; a < launchedAmmo.length; a++){
                            if (launchedAmmo[a].rightAmmoX > b.x && launchedAmmo[a].rightAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                                launchedAmmo[a].rightAmmoX = -100;
                                b.status = 0;
                                scoreUp();
                            } else if (launchedAmmo[a].leftAmmoX > b.x && launchedAmmo[a].leftAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                                launchedAmmo[a].leftAmmoX = -100;
                                b.status = 0;
                                scoreUp();
                            }
                        }
                    }
                     for (let i = 0; i < ballArray.length; i++){
                         if(ballArray[i].x > b.x && ballArray[i].x < b.x+brickWidth && ballArray[i].y > b.y && ballArray[i].y < b.y+brickHeight) {
                             b.status = 0;
                             ballArray[i].directions.dy = -ballArray[i].directions.dy;
                             scoreUp();
                         }
                     }
                    // Si la brique contient un bonus
                    if (b.bonus) {
                        itemDropped       = true;
                        bx                = (b.x + (brickWidth/2))-15;
                        by                = (b.y + (brickHeight/2))-15;
                        item              = b.object;
                    }
                    // Niveau terminé
                    if(brokenBricks === brickRowCount*brickColumnCount) {
                        levelIndex += 1;
                        console.log(levelIndex)
                        window.onload = function() {
                            localStorage.clear();
                            localStorage.removeItem("levelIndex")
                            localStorage.setItem("levelIndex","1");
                        }
                        console.log(localStorage)
                        debugger
                        window.location.reload()
                        // game();
                    }
                }
            }
        }
    }

    function pause(){
        if (gamePaused){
            for (let i = 0; i < ballArray.length; i++) {
                ballArray[i].directions.dx = ballArray[i].oldDirections.oldDx;
                ballArray[i].directions.dy = ballArray[i].oldDirections.oldDy;
            }
            gamePaused = false;
        }else{
            for (let i = 0; i < ballArray.length; i++) {
                let old = ballArray[i].copyDirections();
                // Copy balls directions
                ballArray[i].oldDirections.oldDx = old.dx;
                ballArray[i].oldDirections.oldDy = old.dy;
                //Stop the balls
                ballArray[i].directions.dx = 0;
                ballArray[i].directions.dy = 0;
            }
            gamePaused    = true;
        }
    }

    function scoreUp() { brokenBricks++; activeItems['multiplyScore'] !== undefined ? score += 2 : score++; }

    function actionTimedItem(item){
        if (item.time !== 0){
            if (!gamePaused){
                item.action? item.action() : null;
                item.time -= 1;
            }
        }else{
            delete activeItems[item.name];
            paddleColor = 'white';
            item.reverseAction ? item.reverseAction() : null;
        }
    }

    function spaceBarHandler(e) {
        if (e.code === "Space") {
            pause()
        }
    }

    function keyDownHandler(e) {
        if (!gamePaused){
            if(e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            }
            else if(e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            }
        }
    }

    function keyUpHandler(e) {
        if (!gamePaused) {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }
        }
    }

    function mouseMoveHandler(e) {
        console.log(e)
        if (!gamePaused) {
            const relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }
    }

    function launchHandler(e) {
        if (e.code === "KeyE" && !gamePaused) {
            if (isMagnetBall){
                for (let i = 0 ; i < ballArray.length; i++){
                    let old = ballArray[i].copyDirections();
                    ballArray[i].oldDirections.oldDx = old.dx;
                    ballArray[i].oldDirections.oldDy = old.dy;
                    if (ballArray[i].oldDirections.oldDy !== 0){
                        ballArray[i].directions.dy = ballArray[i].oldDirections.oldDy = old.dy;
                        ballArray[i].directions.dx = ballArray[i].oldDirections.oldDx;
                    }else{
                        ballArray[i].directions.dy = -5 - i;
                        ballArray[i].directions.dx = 5 + i;
                    }
                    isMagnetBall  = false;
                }
            }
        }
    }

    function fireHandler(e) {
        if (e.code === "KeyW" && !gamePaused) {
            if (isArmed){
                let ammo = {
                    'leftAmmoX'  : JSON.parse(JSON.stringify(paddleX-10)),
                    'rightAmmoX' : JSON.parse(JSON.stringify(paddleX+paddleWidth+10)),
                    'ammoY'      : JSON.parse(JSON.stringify(canvas.height-paddleHeight))
                };
                launchedAmmo.push(ammo);
                hasFired = true;
            }
        }
    }
}