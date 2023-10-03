//// Imports
import {levelConstructorArray} from "./levelConstruct.js";
import {bonusObject,createRocketImage,createBallImage,createPaddleImages} from "./objects.js";
import * as Inputs from './inputs.js'
import * as Modals from './modals.js';

//// Declarations
// Canvas & Context
export let canvas   = document.getElementById("myCanvas"),
    ctx             = canvas.getContext("2d"),
    playerNameInput = document.getElementsByClassName('player_name');

// Level Constructor
export let canvasClass = canvas.classList[0],
    levelIndex         = parseInt(canvasClass[5]),
    actualLevel        = levelConstructorArray[levelIndex];

// Bricks
let brickRowCount,brickColumnCount,brickWidth,brickHeight,brickPadding,brickOffsetTop,brickOffsetLeft,
    bricks            = [],
    brokenBricks      = 0;

// Ball
export let ballArray = [],
    oldDir           = {},
    ballImage        = createBallImage(),
    ball             = {
        ballRadius    : 50,
        x             : canvas.width/2,
        y             : canvas.height-30,
        directions    : {dx : 5, dy : -5},
        oldDirections : {oldDx  : 0, oldDy : 0},
        copyDirections: function() {return JSON.parse(JSON.stringify(this.directions))},
    };
ballArray.push(ball);

// Paddle
export let paddleWidth     = 100,
    paddleHeight           = 20,
    paddleX                = (canvas.width-paddleWidth)/2,
    paddleColor            = "#fff3fc",
    paddleImagesArray      = createPaddleImages(),
    // armedPaddleImagesArray = createArmedPaddleImages(),
    paddleImage,
    countTime  = 0,
    frame      = 1;
    


// Score
export let score  = 0,
    lives         = 3,
    isGamePaused  = true,
    isEndGame     = false,
    highScores    = [],
    playerName;

// Bonus
export let lifeUp     =    ()   =>{ lives++ },
    modifyPaddleWidth = pWidth  => { paddleWidth = pWidth },
    fireLauncher      = boolean => { (()=>{isArmed = boolean})()},
    bigBall           = bRadius => { for (let i = 0; i < ballArray.length; i++){ballArray[i].ballRadius = bRadius}},
    droppedItems      = [],
    activeItems       = {},
    isMagnetBall      = true,
    isArmed           = false,
    launchedAmmo      = [],
    rocketImg         = createRocketImage();

// Modals
export let isModalDisplayed = true;

// Init functions for Input Detection
export let modifyPaddleX = relativeX => {paddleX = relativeX - paddleWidth / 2},
    pause  = () => {
        if (isGamePaused){
            for (let i = 0; i < ballArray.length; i++) {
                let ball = ballArray[i];
                ball.directions.dx = ball.oldDirections.oldDx;
                ball.directions.dy = ball.oldDirections.oldDy;
            }
            isGamePaused = false;
        }else{
            for (let i = 0; i < ballArray.length; i++) {
                let ball = ballArray[i];
                oldDir = ball.copyDirections();
                ball.oldDirections.oldDx = oldDir.dx;
                ball.oldDirections.oldDy = oldDir.dy;
                ball.directions.dx = 0;
                ball.directions.dy = 0;
            }
            isGamePaused    = true;
        }
    },
    launch = () => {
        isMagnetBall  = false;
        for (let i = 0 ; i < ballArray.length; i++){
            let ball = ballArray[i],ballDir = ball.directions;
            if (ballDir.dy === 5){
                ballDir.dy = ball.oldDirections.oldDy;
                ballDir.dx = ball.oldDirections.oldDx;
            }else{
                ballDir.dy = -5 - i;
                ballDir.dx = 5 + i;
            }
        }
    };

// Let's go !
if (actualLevel.imgParts.length !== 0){
    document.addEventListener('DOMContentLoaded', () => {Inputs.addInputsListener(); game();}, false);
    document.addEventListener("click", () => {isModalDisplayed = false;isGamePaused = false;}, false);
    document.addEventListener('input', function (e) {playerName = e.target.value;}, false);
}else{
    window.location.reload()
}

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
    brickRowCount     = actualLevel.brickRowCount;
    brickColumnCount  = actualLevel.brickColumnCount;
    brickWidth        = actualLevel.brickWidth;
    brickHeight       = actualLevel.brickHeight;
    brickPadding      = actualLevel.brickPadding;
    brickOffsetTop    = actualLevel.brickOffsetTop;
    brickOffsetLeft   = actualLevel.brickOffsetLeft;
}

function randomBrick(row,column){
    let randomIntBonusBricks = [];
    for (let i = 0; i <= actualLevel.nbBonusBrick; i++){
        randomIntBonusBricks[i] = (Math.floor(Math.random() * (row*column)))
    }
    return randomIntBonusBricks ;
}

function randomObject(bonusObject){
    let bonusArray = Object.keys(bonusObject);
    let randIndex  = Math.floor(Math.random() * (Object.keys(bonusArray).length));
    return bonusObject[bonusArray[randIndex]];
}

function brickConstructor(){
    let brickNumber = 0,
        bonusBricks = randomBrick(brickRowCount,brickColumnCount);
    for(let c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(let r=0; r<brickRowCount; r++) {
            brickNumber++;
            if (!actualLevel.invisibleBricks.includes(brickNumber)) {
                if (bonusBricks.includes(brickNumber)) {
                    bricks[c][r] = {
                        x: 0,
                        y: 0,
                        status: 1,
                        number: brickNumber,
                        bonus: true,
                        object: randomObject(bonusObject)
                    }
                } else {
                    bricks[c][r] = {x: 0, y: 0, status: 1, number: brickNumber, bonus: false};
                }
            }else{
                bricks[c][r] = {x: 0, y: 0, status: 0, number: brickNumber, bonus: false};
            }
        }
    }
    return bricks
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (levelIndex === levelConstructorArray.length){
        isEndGame = true;
        Modals.drawEndGameModal();
        if (Inputs.isInputVisible){Modals.drawPlayerName()}
        if (Inputs.isHighScoreDisplayed){Modals.drawHighScores()}
    }else{
        drawBricks();
        drawBall();
        drawPaddle(paddleColor);
        drawScore();
        drawLives();
        collisionDetection();

        isArmed = true;

        if (isGamePaused){
            if (isModalDisplayed){
                levelIndex === 0 ?  Modals.drawStartModal() : Modals.drawLevelModal(levelIndex);
            }else{
                drawPauseMenu();
            }
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
                    let item = activeItems[itemIndex];
                    if (item.isFalling){
                        Modals.drawItemModal(item);
                    }
                        actionTimedItem(item)
                }
            }
            if (activeItems['fireLauncher'] !== undefined || isArmed){
                if (Inputs.hasFired){

                    for (let i = 0; i < launchedAmmo.length; i++){
                        drawFireAnimation(launchedAmmo[i])
                    }
                }
            }
            if (isMagnetBall){
                for (let i = 0; i < ballArray.length; i++)
                {
                    ballArray[i].x             = paddleX + paddleWidth/2;
                    ballArray[i].y             = canvas.height-30 - i * 2;
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
                            ball.y = canvas.height-30 - i*2;
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
                        } else {
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
            if(Inputs.rightPressed && paddleX < canvas.width-paddleWidth) {
                paddleX += 7;
            } else if(Inputs.leftPressed && paddleX > 0) {
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
                ctx.drawImage(actualLevel.imgParts[brick.number -1],brickX,brickY,brickWidth,brickHeight)
            }
        }
    }
}

function drawBall(){
    for (let i = 0; i < ballArray.length; i++){
        ctx.drawImage(ballImage,ballArray[i].x, ballArray[i].y, ballArray[i].ballRadius, 50)
    }
}

// Fonctionne mais trop rapide pour etre percu.. Rajouter setTimeOut
function drawPaddle(){
    if (!isGamePaused){
        countTime++;
    }
    countTime <= 5 ? frame = 1 : countTime > 5 && countTime <= 10 ? frame = 2 : countTime > 10 && countTime < 15 ? frame  = 3 : countTime = 0;
    if (isArmed){
        switch (frame) {
            case 1 :
                paddleImage = paddleImagesArray[0];
                break;
            case 2 :
                paddleImage = paddleImagesArray[1];
                break;
            case 3 :
                paddleImage = paddleImagesArray[2];
                break;
        }
        ctx.drawImage(paddleImage,paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight)
    }else{
        switch (frame) {
            case 1 :
                paddleImage = paddleImagesArray[0];
                break;
            case 2 :
                paddleImage = paddleImagesArray[1];
                break;
            case 3 :
                paddleImage = paddleImagesArray[2];
                break;
        }
        ctx.drawImage(paddleImage,paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight)
    }
}

function drawFireAnimation(activeAmmo){
    activeAmmo.ammoY -= 12;
    ctx.drawImage(rocketImg, activeAmmo.leftAmmoX, activeAmmo.ammoY,20,40)
    ctx.drawImage(rocketImg, activeAmmo.rightAmmoX, activeAmmo.ammoY,20,40)
}

function drawFallingItem(b){
    b.object.position.bx = (b.x + (brickWidth/2))-15;
    b.object.position.by = (b.y + (brickHeight/2))-15;
    droppedItems.push(b.object)
}

function drawItem(item){
    ctx.drawImage(item.img,item.position.bx,item.position.by,20,20)
    // Si le joueur attrape l'objet
    // le x est a modifier car on attrape l'objet sans etre dessus
    if(item.position.by === canvas.height - paddleHeight - 15 && item.position.bx  < paddleX + paddleWidth){
        activeItems[item.name] = item;
        paddleColor            = "red";
        item.isFalling = true;
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
                if(brokenBricks === (brickRowCount*brickColumnCount) - actualLevel.invisibleBricks.length) {
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
    lives < 5 || levelIndex > 2  ? lives++ : null;
    ballArray.length > 1 ? ballArray.slice(1,ballArray.length -1) : null;
    ballArray[0].y                = canvas.height-25;
    ballArray[0].x                = canvas.width/2;
    ballArray[0].directions.dx    = 0;
    ballArray[0].directions.dy    = 0;
    paddleX           = (canvas.width-paddleWidth)/2;
    isMagnetBall      = true;
    droppedItems      = [];
    activeItems       = [];
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

function actionTimedItem(item) {
    if (item.time !== 1) {
        if (!isGamePaused) {
            if (item.name === 'life' || item.name === 'multiBall') {
                if (!item.actionDone) {
                    item.action();
                    item.actionDone = true;
                }
            } else {
                item.action ? item.action() : null
            }
            item.time -= 1;
        }
    } else {
        delete activeItems[item.name];
        paddleColor = 'white';
        item.reverseAction ? item.reverseAction() : null;
    }
}