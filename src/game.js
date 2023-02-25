// Canvas & Context
export const canvas = document.getElementById("myCanvas"),
    ctx             = canvas.getContext("2d"),
    playerNameInput = document.getElementsByClassName('player_name');

// Level Constructor
import { levelConstructorArray } from "./levelConstruct.js";
export let canvasClass = canvas.classList[0],
    levelIndex         = canvasClass[5];

// Bricks
let brickRowCount,brickColumnCount,brickWidth,brickHeight,brickPadding,brickOffsetTop,brickOffsetLeft,
    bricks            = [],
    brokenBricks      = 0;

// Ball(s)
export let ballArray = [],
    oldDir           = {},
    ball             = {
        ballRadius    : 10,
        x             : canvas.width/2,
        y             : canvas.height-30,
        directions    : {dx : 5, dy : -5},
        oldDirections : {oldDx  : 0, oldDy : 0},
        copyDirections: function() {return JSON.parse(JSON.stringify(this.directions))},
    };
ballArray.push(ball);

// Paddle
export let paddleWidth  = 85,
    paddleHeight        = 15,
    paddleX             = (canvas.width-paddleWidth)/2,
    paddleColor         = "#fff3fc",
    rightPressed        = false,
    leftPressed         = false;

// Score
export let score  = 0,
    lives         = 3,
    isGamePaused  = true,
    isEndGame     = false,
    highScores    = [],
    playerStats   = {},
    playerName;

// Bonus
import {bonusObject} from "./objects.js";
export let lifeUp     =    ()   =>{ lives++ },
    modifyPaddleWidth = pWidth  => { paddleWidth = pWidth },
    fireLauncher      = boolean => { isArmed = boolean},
    bigBall           = bRadius => { for (let i = 0; i < ballArray.length; i++){ballArray[i].ballRadius = bRadius}},
    modifyItemCaught  = boolean => { isItemCaught = boolean},
    isItemCaught      = false,
    isMagnetBall      = true,
    isArmed           = false,
    hasFired          = false,
    launchedAmmo      = [],
    droppedItems      = [],
    activeItems       = {};

// Modals
import {drawStartModal,drawLevelModal,drawItemModal,drawEndGameModal,drawPlayerName,drawHighScores} from './modals.js';
// import * as Modals from './modals.js';
export let isModalDisplayed = false,
    isInputVisible          = false,
    isHighScoreDisplayed    = false;

// Init keyboard and mouse inputs detection
const DirectionsInput = {
    'Up'        : {type : "keyup" , function : keyUpHandler},
    'Down'      : {type : "keydown" , function : keyDownHandler},
    'Mousemove' : {type : "mousemove" , function : mouseMoveHandler},
    'Space'     : {type : "keyup" , function : spaceBarHandler},
    'Launch'    : {type : ["keyup","click"] , function : launchHandler},
    'Fire'      : {type : ["keyup","click"] , function : fireHandler},
    'Submit'    : {type : "keyup", function : submitHandler},
    'Reload'    : {type: "keyup", function: reloadHandler}
};

document.addEventListener('DOMContentLoaded', () => {addInputsListener();game()}, false);
document.addEventListener("click",() => { isModalDisplayed = false; isGamePaused = false},false);
document.addEventListener('input',function (e) {playerName = e.target.value;},false);

// Functions
function game() {
    if (levelIndex !== levelConstructorArray.length ){
        levelConstructor();
        bricks = brickConstructor();
        draw();
    }else{
        endgame()
    }
}

function endgame() {
     debugger
}

function levelConstructor(){
    // Setting props from imported array
    brickRowCount     = levelConstructorArray[levelIndex].brickRowCount;
    brickColumnCount  = levelConstructorArray[levelIndex].brickColumnCount;
    brickWidth        = levelConstructorArray[levelIndex].brickWidth;
    brickHeight       = levelConstructorArray[levelIndex].brickHeight;
    brickPadding      = levelConstructorArray[levelIndex].brickPadding;
    brickOffsetTop    = levelConstructorArray[levelIndex].brickOffsetTop;
    brickOffsetLeft   = levelConstructorArray[levelIndex].brickOffsetLeft;
}

function randomIntBonusBricks(row,column){
    let randomIntBonusBricks = [];
    for (let i = 0; i <= levelConstructorArray[levelIndex].nbBonusBrick; i++){
        randomIntBonusBricks[i] = (Math.floor(Math.random() * (row*column)))
    }
    return randomIntBonusBricks ;
}

function randomObjectBonus(bonusObject){
    let bonusArray = Object.keys(bonusObject);
    let randIndex  = Math.floor(Math.random() * (Object.keys(bonusArray).length));
    return bonusObject[bonusArray[randIndex]];
}

function brickConstructor(){
    let brickNumber = 0,
        bonusBricks = randomIntBonusBricks(brickRowCount,brickColumnCount);

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

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (levelIndex === levelConstructorArray.length){
        isEndGame = true;
        drawEndGameModal();
        if (isInputVisible){drawPlayerName()}
        if (isHighScoreDisplayed){drawHighScores()}
    }else{
        drawBricks();
        drawBall();
        drawPaddle(paddleColor);
        drawScore();
        drawLives();
        collisionDetection();

        drawStartModal();
        drawLevelModal(levelIndex);

        isArmed = true;

        if (isGamePaused){
            drawPauseMenu();
        }
        else{
            if (droppedItems.length > 0 && !isGamePaused){
                for (let i = 0; i<droppedItems.length;i++){
                    let item = droppedItems[i];
                    drawItem(item);
                    item.position.by  += 2;
                }
            }
            if (Object.keys(activeItems).length !== 0){
                for (let itemIndex in activeItems){
                    let item   = activeItems[itemIndex];
                    drawItemModal(item);
                    // item.time ? actionTimedItem(item) : (()=>{item.action() ; delete activeItems[item.name]})() ;
                    if(item.time){
                        actionTimedItem(item)
                    }else{
                        item.action();
                        if (! isItemCaught){ delete activeItems[item.name];}
                    }
                }
            }
            if (activeItems['fireLauncher'] !== undefined || isArmed){
                if (hasFired){
                    // Les projectiles s'effacent quand isArmed retourne à false
                    for (let i = 0; i < launchedAmmo.length; i++){
                        drawFireAnimation(launchedAmmo[i])
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
                        oldDir = ball.copyDirections();
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
        }
    }
    requestAnimationFrame(draw);
}

function drawBricks(){
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let brick = bricks[c][r];
            if(bricks[c][r].status === 1) {
                // C'est ici que ça se passe pour les collisions
                const brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                const brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.drawImage(levelConstructorArray[levelIndex].imgParts[brick.number -1],brickX,brickY,brickWidth,brickHeight)
            }
        }
    }
}

function drawBall(){
    for (let i = 0; i < ballArray.length; i++){
        ctx.beginPath();
        ctx.arc(ballArray[i].x, ballArray[i].y, ballArray[i].ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#dd2e2f";
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddle(paddleColor){
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

function drawFallingItem(b){
    b.object.position.bx = (b.x + (brickWidth/2))-15;
    b.object.position.by = (b.y + (brickHeight/2))-15;
    droppedItems.push(b.object)
}

function drawItem(item){
    ctx.beginPath();
    ctx.rect(item.position.bx,item.position.by,20,20);
    ctx.fillStyle = ctx.createPattern(item.img,'repeat');
    ctx.fill();
    ctx.closePath();
    // Si le joueur attrape l'objet
    if(item.position.by === canvas.height - paddleHeight - 15 && item.position.bx  < paddleX + paddleWidth){
        activeItems[item.name] = item;
        paddleColor            = "red";
        isItemCaught           = true;
        droppedItems.splice(droppedItems.indexOf(item),1);
    }
    // Si l'objet n'est pas attrapé
    if(item.position.by === canvas.height ){
        droppedItems.splice(droppedItems.indexOf(item),1);
    }
}

function drawScore(){
    ctx.font = "32px space";
    ctx.fillStyle = "#f6fff4";
    ctx.fillText("Score: "+score, 20, 40);
}

function drawLives(){
    ctx.font = "32px space";
    ctx.fillStyle = "#f6fff4";
    ctx.fillText("Vies: "+lives, canvas.width-120, 40);
}

function drawPauseMenu(){
    if (! isModalDisplayed) {
        ctx.font = "132px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText("PAUSE", 300, 350);
    }
}

function collisionDetection(){
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if (launchedAmmo.length > 0){
                    for (let a = 0; a < launchedAmmo.length; a++){
                        if (launchedAmmo[a].rightAmmoX > b.x && launchedAmmo[a].rightAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                            delete launchedAmmo[a].rightAmmoX;
                            b.status = 0;
                            scoreUp();
                            b.bonus? drawFallingItem(b) : null;
                        } else if (launchedAmmo[a].leftAmmoX > b.x && launchedAmmo[a].leftAmmoX < b.x+brickWidth && launchedAmmo[a].ammoY > b.y &&  launchedAmmo[a].ammoY  < b.y+brickHeight){
                            delete launchedAmmo[a].leftAmmoX;
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

function gameReset(){
    // Reset Paddle & Ball
    lives < 3 || levelIndex > 2  ? lives++ : null;
    ballArray[0].y                = canvas.height-25;
    ballArray[0].directions.dx    = 0;
    ballArray[0].directions.dy    = 0;
    paddleX           = (canvas.width-paddleWidth)/2;
    isMagnetBall      = true;
    brokenBricks      = 0;
    bricks            = [];
    launchedAmmo      = [];
    isModalDisplayed  = true;
    isGamePaused      = true;
}

function scoreUp(){
    brokenBricks++;
    activeItems['multiplyScore'] !== undefined ? score += 2 : score++;
}

function actionTimedItem(item){
    if (item.time !== 1){
        if (!isGamePaused){
            item.action? item.action() : null;
            item.time -= 1;
        }
    }else{
        delete activeItems[item.name];
        paddleColor = 'white';
        item.reverseAction ? item.reverseAction() : null;
    }
}

export function pause(){
    if (isGamePaused){
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].directions.dx = ballArray[i].oldDirections.oldDx;
            ballArray[i].directions.dy = ballArray[i].oldDirections.oldDy;
        }
        isGamePaused = false;
    }else{
        for (let i = 0; i < ballArray.length; i++) {
            oldDir = ballArray[i].copyDirections();
            // Copy balls directions
            ballArray[i].oldDirections.oldDx = oldDir.dx;
            ballArray[i].oldDirections.oldDy = oldDir.dy;
            //Stop the balls
            ballArray[i].directions.dx = 0;
            ballArray[i].directions.dy = 0;
        }
        isGamePaused    = true;
    }
}

function spaceBarHandler(e){
    if (e.code === "Space") {
        pause()
    }
}

function keyDownHandler(e){
    if (!isGamePaused){
        if(e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = true;
        }
        else if(e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = true;
        }
    }
}

function keyUpHandler(e){
    if (!isGamePaused) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = false;
        }
    }
}

function mouseMoveHandler(e){
    if (!isGamePaused) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }
}

function launchHandler(e){
    if (e.code === "KeyE" && !isGamePaused) {
        if (isMagnetBall){
            isMagnetBall  = false;
            for (let i = 0 ; i < ballArray.length; i++){
                let ball = ballArray[i];
                if (ball.directions.dy === 5){
                    ball.directions.dy = ball.oldDirections.oldDy;
                    ball.directions.dx = ball.oldDirections.oldDx;
                }else{
                    ball.directions.dy = -5 - i;
                    ball.directions.dx = 5 + i;
                }
            }
        }
    } else if(e.code === "KeyE" && isEndGame){
        isInputVisible = true;
        playerNameInput[0].classList.remove('hidden');
    }
}

function fireHandler(e){
    if (e.code === "KeyW" && !isGamePaused) {
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

function submitHandler(e){
    if (e.code === "Enter" && isInputVisible){
        if (playerNameInput[0].value.length >= 3 && playerNameInput[0].value.length <= 7){
            playerNameInput[0].classList.toggle('hidden');
            isInputVisible = false;
            playerStats    = {name : playerName,score : score};
            highScores.push(playerStats);
            highScores.push({name : 'GOD',score:320});
            highScores.push({name : 'Milou',score:33});
            highScores.push({name : 'Tounio',score:300});
            highScores.sort((p1, p2) => (p1.score < p2.score) ? 1 : (p1.score > p2.score) ? -1 : 0);
            isHighScoreDisplayed = true;
        }else{
            window.alert('Your name can contain 3 to 7 characters only !')
        }
    }
}

function reloadHandler(e){
    if (e.code === "KeyR" && isEndGame && !isInputVisible){
        document.location.reload();
    }
}

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