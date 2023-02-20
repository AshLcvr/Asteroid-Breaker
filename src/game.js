// Canvas & Context
const canvas          = document.getElementById("myCanvas");
const ctx             = canvas.getContext("2d");
const playerNameInput = document.getElementsByClassName('player_name');

// Modals
let isModalDisplayed = true;

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
export let paddleWidth = 85;
let paddleHeight       = 15;
let paddleX            = (canvas.width-paddleWidth)/2;
let paddleColor        = "#fff3fc";
let rightPressed       = false;
let leftPressed        = false;

// Score
let score                = 0;
let lives                = 3;
let isGamePaused         = true;
let isEndGame            = false;
let isInputVisible       = false;
let isHighScoreDisplayed = false;
let highScores           = [];
let playerStats          = {};
let playerName;

// Bonus
import {bonusObject} from "./objects.js";
export let lifeUp            = ()=>{ lives++ };
export let modifyPaddleWidth = pWidth => { paddleWidth = pWidth };
export let fireLauncher      = boolean => { isArmed = boolean};
export let bigBall           = bRadius => { for (let i = 0; i < ballArray.length; i++){ballArray[i].ballRadius = bRadius}};
let droppedItems = [];
let isItemCaught = false;
let activeItems  = {};
let isMagnetBall = true;
let isArmed      = false;
let hasFired     = false;
let launchedAmmo = [];

// GAME !
game();

function game() {
    let actualLevel = levelConstructorArray[levelIndex];
    if (levelIndex !== levelConstructorArray.length){levelConstructor();}
    bricks = brickConstructor();
    draw();

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

    document.addEventListener('DOMContentLoaded', addInputsListener, false)
    document.addEventListener('input',function (e) {playerName = e.target.value;},false)

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
        if (levelIndex === levelConstructorArray.length ){
            isEndGame = true;
            endGame();
            if (isInputVisible){
                drawPlayerName()
            }
            if (isHighScoreDisplayed){
                drawHighScores()
            }
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
            }
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

    function drawCanvasBox(){
        ctx.beginPath();
        ctx.rect(220, 160, 520, 320);
        ctx.fillStyle = "grey";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(230, 170, 500, 300);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }

    function drawStartModal() {
        if (isModalDisplayed && levelIndex < 1){
            drawCanvasBox();
            ctx.font = "30px space";
            ctx.fillStyle = "black";
            ctx.fillText("Welcome to Asteroid Breaker", 265 , 200);
            ctx.font = "14px neuro";
            ctx.fillText("On the way to Tallon 4,", 255, 240);
            ctx.fillText("Our spaceship was trapped in an asteroid belt", 255, 264);
            ctx.fillText("We need you to destroy them !", 255, 288);
            ctx.fillText("Here are your instructions :", 255, 312);
            ctx.fillText("- Press E to launch the ball", 255, 336);
            ctx.fillText("- If armed, press Z to fire", 255, 360);
            ctx.fillText("- Press Spacebar to pause", 255, 384);
            ctx.fillText("Click anywhere to start", 380, 432);
        }
    }
    document.body.onclick = () => { isModalDisplayed = false; isGamePaused = false};

    function drawItemModal(item){
        if (item.position.by > canvas.height/2 && isItemCaught) {
            item.position.by -= 3;
            ctx.font = "32px space";
            ctx.fillStyle = "#f6fff4";
            ctx.fillText(item.text, item.position.bx, item.position.by);
        }else if(item.position.by <= canvas.height/2){
            isItemCaught = false;
        }
    }

    function drawLevelModal(levelIndex){
        if (isModalDisplayed && levelIndex >= 1) {
            let playerLevel = levelIndex+1;
            ctx.font = "132px space";
            ctx.fillStyle = "#f6fff4";
            ctx.fillText("LEVEL "+ playerLevel, 270, 350);
        }
    }

    function endGame(){
        drawEndGameModal();
    }

    function drawEndGameModal(){
        drawCanvasBox();
        ctx.font = "30px space";
        ctx.fillStyle = "black";
        ctx.fillText("Congratulations !!", 360 , 200);
        ctx.fillText("Your score : " + score, 370, 370);
        ctx.font = "14px neuro";
        ctx.fillText("You did it! ", 265, 240);
        ctx.fillText("Thanks to you we will be able to land on Tallon 4 ", 265, 264);
        ctx.fillText("and rescue the Galactic Federation troops!", 265, 290);
        ctx.fillText("Congratulations soldier !", 265, 314);
        ctx.fillText("Press E to access Highscores,", 340, 420);
        ctx.fillText("Thanks you for playing ;)", 370, 450);
    }

    function drawPlayerName(){
        drawCanvasBox();
        ctx.font = "30px space";
        ctx.fillStyle = "black";
        ctx.fillText("Register you :", 385 , 230);
        ctx.font = "14px neuro";
        ctx.fillText("Press Enter to submit", 380, 432);
        ctx.font = "13px neuro";
        ctx.fillStyle = "red";
        ctx.fillText("<3 to 7 characters>", 275, 270);
    }

    function drawHighScores(){
        drawCanvasBox();
        ctx.font = "30px space";
        ctx.fillStyle = "black";
        ctx.fillText("HIGHSCORES :", 390 , 200);
        ctx.font = "24px space";
        ctx.fillText(highScores[0].name+" : "+highScores[0].score+ " pts", 410 , 270);
        ctx.fillText(highScores[1].name+" : "+highScores[1].score+ " pts", 400 , 320);
        ctx.fillText(highScores[2].name+" : "+highScores[2].score+ " pts", 400 , 370);
        ctx.fillText(highScores.indexOf(playerStats)+1 + ". "+playerStats.name+" : "+playerStats.score+ " pts", 380 , 420);
        ctx.font = "16px space";
        ctx.fillText("Press R to restart", 400 , 455);
        ctx.font = "50px space";
        ctx.fillStyle = "#FFD700";
        ctx.fillText("I.",330 , 270);
        ctx.font = "48px space";
        ctx.fillStyle = "#C0C0C0";
        ctx.fillText("II.",320 , 320);
        ctx.font = "46px space";
        ctx.fillStyle = "#B87333";
        ctx.fillText("III.",310 , 370);
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
            paddleColor            = "red";
            isItemCaught           = true;
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
        if (! isModalDisplayed) {
            ctx.font = "132px space";
            ctx.fillStyle = "#f6fff4";
            ctx.fillText("PAUSE", 300, 350);
        }
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

    function gameReset() {
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

    function pause(){
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

    function scoreUp() {
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

    function spaceBarHandler(e) {
        if (e.code === "Space") {
            pause()
        }
    }

    function keyDownHandler(e) {
        if (!isGamePaused){
            if(e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            }
            else if(e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            }
        }
    }

    function keyUpHandler(e) {
        if (!isGamePaused) {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }
        }
    }

    function mouseMoveHandler(e) {
        if (!isGamePaused) {
            const relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }
    }

    function launchHandler(e) {
        if (e.code === "KeyE" && !isGamePaused) {
            if (isMagnetBall){
                isMagnetBall  = false;
                for (let i = 0 ; i < ballArray.length; i++){
                    let ball = ballArray[i]
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

    function fireHandler(e) {
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
}