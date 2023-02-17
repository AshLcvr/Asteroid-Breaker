// Canvas & Context
const canvas = document.getElementById("myCanvas");
const ctx    = canvas.getContext("2d");

// Level Constructor
let canvasClass = canvas.classList[0];
let levelIndex  = canvasClass[5];
import { levelConstructorArray } from "./levelConstruct.js";
// Bricks
let brickRowCount;
let brickColumnCount;
let brickWidth;
let brickHeight;
let brickPadding;
let brickOffsetTop;
let brickOffsetLeft;
let bricks            = [];
let brokenBricks      = 0;

// Modals & background

console.log(levelConstructorArray[levelIndex].canvasBackground)
ctx.beginPath();
ctx.rect(20, -200, 15000, 10000);
ctx.fillStyle = ctx.createPattern(levelConstructorArray[levelIndex].canvasBackground,'no-repeat');
ctx.fill();
ctx.closePath();

let isModalDisplayed = true;

// Ball(s)
export let ballArray   = [];
let ball               = {
    ballRadius    : 10,
    x             : canvas.width/2,
    y             : canvas.height-30,
    directions    : {dx : 5, dy : -5},
    oldDirections : {oldDx  : 0, oldDy : 0},
    copyDirections: function() {return JSON.parse(JSON.stringify(this.directions))},
};
ballArray.push(ball);
let oldDir = {};

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

// Bonus
import {bonusObject} from "./objects.js";
export let lifeUp            = ()=>{ lives++ };
export let modifyPaddleWidth = pWidth => { paddleWidth = pWidth };
export let fireLauncher      = boolean => { isArmed = boolean};
export let bigBall           = bRadius => { for (let i = 0; i < ballArray.length; i++){ballArray[i].ballRadius = bRadius}};
let isMagnetBall = true;
let isArmed      = false;
let droppedItems = [];
let activeItems  = {};
let hasFired     = false;
let launchedAmmo = [];

// GAME !
game();

function game() {
    let actualLevel = levelConstructorArray[levelIndex];
    levelIndex > 0 ? pause() : drawStartModal();
    levelConstructor();
    bricks = brickConstructor();

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
        // Setting props from imported array
        brickRowCount     = actualLevel.brickRowCount;
        brickColumnCount  = actualLevel.brickColumnCount;
        brickWidth        = actualLevel.brickWidth;
        brickHeight       = actualLevel.brickHeight;
        brickPadding      = actualLevel.brickPadding;
        brickOffsetTop    = actualLevel.brickOffsetTop;
        brickOffsetLeft   = actualLevel.brickOffsetLeft;
    }

    function randomIntBonusBricks(row,column){
        let randomIntBonusBricks = [];
        for (let i = 0; i <= actualLevel.nbBonusBrick; i++){
           randomIntBonusBricks[i] = (Math.floor(Math.random() * (row*column)))
        }
        return randomIntBonusBricks ;
    }

    function randomObjectBonus(bonusObject) {
        let bonusArray = Object.keys(bonusObject);
        let randIndex  = Math.floor(Math.random() * (Object.keys(bonusArray).length));
        return bonusObject[bonusArray[randIndex]];
    }

    function brickConstructor() {
        let brickNumber = 0;
        let bonusBricks = randomIntBonusBricks(brickRowCount,brickColumnCount);

        for(let c=0; c<brickColumnCount; c++) {
            bricks[c] = [];
            for(let r=0; r<brickRowCount; r++) {
                brickNumber++;
                if (bonusBricks.includes(brickNumber)) {
                    bricks[c][r] = {
                        x: 0,
                        y: 0,
                        status: 1,
                        number: brickNumber,
                        bonus : true,
                        object: randomObjectBonus(bonusObject)
                    }
                } else {
                    bricks[c][r] = {x: 0, y: 0, status: 1, number: brickNumber, bonus: false};
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
        drawStartModal();

        isArmed = true;

        if (droppedItems.length > 0 && !gamePaused){
            for (let i = 0; i<droppedItems.length;i++){
                let item = droppedItems[i];
                drawItem(item);
                item.position.by  += 2;
            }
        }
        if (Object.keys(activeItems).length !== 0){
            for (let itemIndex in activeItems){
                let item   = activeItems[itemIndex];
                item.time ? actionTimedItem(item) : (()=>{item.action() ; delete activeItems[item.name]})() ;
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
            let ball = ballArray[i];
            // Ball movement
            ball.x += ball.directions.dx;
            ball.y += ball.directions.dy;
            // Edge collision detection
            if(ball.x + ball.directions.dx > canvas.width-ball.ballRadius || ball.x + ball.directions.dx < ball.ballRadius) {
                ball.directions.dx = -ball.directions.dx;
            }
            if(ball.y + ball.directions.dy < ball.ballRadius) {
                ball.directions.dy = -ball.directions.dy;
            } else if(ball.y + ball.directions.dy > canvas.height-ball.ballRadius) {
                // Low Edge Detection
                // If ball touch paddle
                if(ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                    oldDir = ball.copyDirections()
                    if (activeItems['magnetBall'] !== undefined ) {
                        ball.y -= 10;
                        ball.oldDirections.oldDx = oldDir.dx;
                        ball.oldDirections.oldDy = oldDir.dy;
                        isMagnetBall = true;
                        if (ball.oldDirections.oldDx === 5) {
                            ball.directions.dx = 0;
                            ball.directions.dy = 0;
                        }
                    }else {
                        ball.directions.dy = -ball.directions.dy;
                    }
                } else {
                    // If ball falls
                    if (ballArray.length > 1){
                        ballArray.splice(i,1)
                    }
                    else {
                        lives--;
                        ball.x             = canvas.width/2;
                        ball.y             = canvas.height-30;
                        ball.directions.dx = 5;
                        ball.directions.dy = -5;
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
        } else if(leftPressed && paddleX > 0) {
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
                        ctx.fillStyle =  ctx.createPattern(actualLevel.brickBackground,'repeat');
                    }
                    ctx.fill();
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                    ctx.closePath()
                }
            }
        }
    }

    function drawStartModal() {
        if (isModalDisplayed){
            ctx.beginPath();
            ctx.rect(canvas.width/5, canvas.height/5, 600, 300);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.closePath()
            ctx.font = "30px space";
            ctx.fillStyle = "black";
            ctx.fillText("Welcome to Asteroid Breaker", canvas.width/4, canvas.height/4);
            ctx.font = "16px arial";
            ctx.fillStyle = "black";
            ctx.fillText("Our spaceship is trap in an asteroid belt!", canvas.width/4, (canvas.height/4)+32);
            ctx.fillText("We need you to destroy them !", canvas.width/4, (canvas.height/4)+64);
            ctx.fillText("Our spaceship is trap in an asteroid belt!", canvas.width/4, (canvas.height/3)+ 32);
        }
    }
    document.body.onclick = () => { return isModalDisplayed = false;}

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
            ctx.fillStyle = paddleColor;
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

    function drawFallingItem(b) {
        b.object.position.bx = (b.x + (brickWidth/2))-15;
        b.object.position.by = (b.y + (brickHeight/2))-15;
        droppedItems.push(b.object)
    }

    function drawItem(item) {
        ctx.beginPath();
        ctx.rect(item.position.bx,item.position.by,20,20);
        ctx.fillStyle = ctx.createPattern(item.img,'repeat');
        ctx.fill();
        ctx.closePath();
        // Si le joueur attrape l'objet
        if(item.position.by === canvas.height - paddleHeight - 15 && item.position.bx  < paddleX + paddleWidth){
            activeItems[item.name] = item;
            paddleColor = "red";
            droppedItems.splice(droppedItems.indexOf(item),1);
        }
        // Si l'objet n'est pas attrapé
        if(item.position.by === canvas.height ){
            droppedItems.splice(droppedItems.indexOf(item),1);
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
                levelIndex === 1 ? (() => {bricks < 30 ? console.log(b) : null })() : null;
                let b = bricks[c][r];
                if(b.status === 1) {
                     if (launchedAmmo.length > 0){
                        for (let a = 0; a < launchedAmmo.length; a++){
                            if (launchedAmmo[a].rightAmmoX > b.x && launchedAmmo[a].rightAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                                delete launchedAmmo[a].rightAmmoX
                                b.status = 0;
                                scoreUp();
                                b.bonus? drawFallingItem(b) : null;
                            } else if (launchedAmmo[a].leftAmmoX > b.x && launchedAmmo[a].leftAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                                delete launchedAmmo[a].leftAmmoX
                                b.status = 0;
                                scoreUp();
                                b.bonus? drawFallingItem(b) : null;
                            } else if (launchedAmmo[a].ammoY < 0){
                                launchedAmmo.splice(a,1)
                            }
                        }
                    }
                     for (let i = 0; i < ballArray.length; i++){
                         if(ballArray[i].x > b.x && ballArray[i].x < b.x+brickWidth && ballArray[i].y > b.y && ballArray[i].y < b.y+brickHeight) {
                             b.status = 0;
                             ballArray[i].directions.dy = -ballArray[i].directions.dy;
                             scoreUp();
                             b.bonus? drawFallingItem(b) : null;
                         }
                     }
                    // Level Completed
                    if(brokenBricks === brickRowCount*brickColumnCount) {
                        canvas.classList.remove("level"+levelIndex);
                        levelIndex++;
                        canvas.classList.toggle("level"+levelIndex);
                        gameReset();
                        game();
                    }
                }
            }
        }
    }

    function gameReset() {
        // Reset Paddle & Ball
        lives < 3 || levelIndex === 2  ? lives++ : null;
        ballArray[0].y    = canvas.height-25;
        ballArray[0].directions.dx    = 0;
        ballArray[0].directions.dy    = 0;
        paddleX           = (canvas.width-paddleWidth)/2;
        isMagnetBall      = true;
        brokenBricks      = 0;
        bricks            = [];
        launchedAmmo      = [];
    }

    function pause(){
        ballArray[0].directions.dy =   - ballArray[0].directions.dy
        // if (gamePaused){
        //     for (let i = 0; i < ballArray.length; i++) {
        //         ballArray[i].directions.dx = ballArray[i].oldDirections.oldDx;
        //         ballArray[i].directions.dy = ballArray[i].oldDirections.oldDy;
        //     }
        //     gamePaused = false;
        // }else{
        //     for (let i = 0; i < ballArray.length; i++) {
        //         oldDir = ballArray[i].copyDirections();
        //         // Copy balls directions
        //         ballArray[i].oldDirections.oldDx = oldDir.dx;
        //         ballArray[i].oldDirections.oldDy = oldDir.dy;
        //         //Stop the balls
        //         ballArray[i].directions.dx = 0;
        //         ballArray[i].directions.dy = 0;
        //     }
        //     gamePaused    = true;
        // }
    }

    function scoreUp() {
        brokenBricks++;
        activeItems['multiplyScore'] !== undefined ? score += 2 : score++;
    }

    function actionTimedItem(item){
        if (item.time !== 1){
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
                isMagnetBall  = false;
                for (let i = 0 ; i < ballArray.length; i++){
                    let ball = ballArray[i]
                    // console.log(ball)
                    console.log(ball.oldDirections)

                    if (ball.directions.dy === 5){
                        // console.log(ball)

                        ball.directions.dy = ball.oldDirections.oldDy;
                        ball.directions.dx = ball.oldDirections.oldDx;
                        // ball.directions = ball.oldDirections;

                    }else{
                        ball.directions.dy = -5 - i;
                        ball.directions.dx = 5 + i;
                    }
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