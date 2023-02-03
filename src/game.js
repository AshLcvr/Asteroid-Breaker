// Level Constructor
let levelIndex = 0;
import { levelConstructorArray } from "./levelConstruct.js";

// Canvas & Context
const canvas            = document.getElementById("myCanvas");
const ctx               = canvas.getContext("2d");

// Ball
const ballRadius       = 10;
let x                  = canvas.width/2;
let y                  = canvas.height-30;
let directions         = {dx : 5, dy : -5};
let oldDir             = JSON.parse(JSON.stringify(directions));

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
import {bonusArray,createImageObject} from "./objects.js";
export let lifeUp            = ()=>{ lives++ };
export let modifyPaddleWidth = width => { paddleWidth = width };
let bx;
let by;
let item;
let activeItems  = [];
let imageArray   = createImageObject();

// Bricks
let brickRowCount;
let brickColumnCount;
let brickWidth;
let brickHeight;
let brickPadding;
let brickOffsetTop;
let brickOffsetLeft;
let brokenBricks = 0;
const brickBackground = new Image();
brickBackground.src   = levelConstructorArray[levelIndex].brickBackground;

// GAME !
game(levelIndex);

function game(levelIndex) {

    levelIndex > 0 ? pause() : null;

    levelConstructor();

    let bricks = brickConstructor();

    draw();

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("keyup", spaceBarHandler, false);

    // Essai enum
    const Direction = {
        'Up' : keyUpHandler,
        'Down' : keyDownHandler,
        'Mousemove' : mouseMoveHandler,
        'Space' : spaceBarHandler
    };

    // Functions
    function levelConstructor(){
        // Reset Paddle & Ball
        lives < 3 ? lives++ : null;
        x                 = canvas.width/2;
        y                 = canvas.height-30;
        paddleX           = (canvas.width-paddleWidth)/2;

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

    function randomObjectBonus(bonusArray) {
        let randIndex = Math.floor(Math.random() * (bonusArray.length));
        return bonusArray[randIndex];
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
                        object : randomObjectBonus(bonusArray)};
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

        if (itemDropped) {
            drawItem(bx,by);
            if (!gamePaused){
                by  += 2;
            }
        }
        if (activeItems.length !== 0){
            for (let i = 0 ; i < activeItems.length; i++){
                let item   = activeItems[i];
                item.time !== null? actionTimedItem(item) : (()=>{item.action();activeItems.pop()})();
            }
        }
        if (gamePaused){
            drawPauseMenu();
        }
        if(x + directions.dx > canvas.width-ballRadius || x + directions.dx < ballRadius) {
            directions.dx = -directions.dx;
        }
        if(y + directions.dy < ballRadius) {
            directions.dy = -directions.dy;
        }
        else if(y + directions.dy > canvas.height-ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                if (activeItems.length > 0){
                    for (let o = 0; o < activeItems.length; o++) {
                        if (activeItems[o].name === 'magnetBall') {
                            directions.dy = 0;
                            directions.dx = 0;
                            x = paddleX;
                        }
                    }
                } else {
                    directions.dy = -directions.dy;
                }
            } else {
                lives--;
                if(!lives) {
                    alert("GAME OVER");
                    document.location.reload();
                }
                else {
                    x             = canvas.width/2;
                    y             = canvas.height-30;
                    directions.dx = 5;
                    directions.dy = -5;
                    paddleX       = (canvas.width-paddleWidth)/2;
                }
            }
        }
        if(rightPressed && paddleX < canvas.width-paddleWidth) {
            paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        x += directions.dx;
        y += directions.dy;
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
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#dd2e2f";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle(paddleColor) {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = paddleColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawItem(bx,by) {
        ctx.beginPath();
        ctx.rect(bx,by,20,20);
        ctx.fillStyle = ctx.createPattern(imageArray[item.name],'repeat');
        ctx.fill();
        ctx.closePath();
        // Si le joueur attrape l'objet
        if(by === canvas.height - paddleHeight - 15 && x < paddleX + paddleWidth){
            itemDropped = false;
            activeItems.push(item);
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
                    if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                        directions.dy = -directions.dy;
                        b.status      = 0;
                        scoreUp();
                        // Si la brique contient un bonus
                        if (b.bonus) {
                            itemDropped = true;
                            // Definis le centre de la brique et récupère l'objet
                            bx                = (b.x + (brickWidth/2))-15;
                            by                = (b.y + (brickHeight/2))-15;
                            item              = b.object;
                        }
                        // Niveau terminé
                        if(brokenBricks === brickRowCount*brickColumnCount) {
                            levelIndex++;
                            game(levelIndex);
                        }
                    }
                }
            }
        }
    }

    function pause(){
        if (gamePaused){
            directions.dx = oldDir.dx;
            directions.dy = oldDir.dy;
            gamePaused    = false;
        }else{
            // Copy the ancient directions
            oldDir        = JSON.parse(JSON.stringify(directions));
            // Stop the ball
            directions.dx = 0;
            directions.dy = 0;
            gamePaused    = true;
        }
    }

    function scoreUp() {
        brokenBricks++;
        if (activeItems.length > 0){
            for (let o = 0; o < activeItems.length; o++) {
                if (activeItems[o].name === 'multiplyScore') {
                    return score += 2;
                }
            }
        } else {
            return score++;
        }
    }

    function actionTimedItem(item){
        if (item.time !== 0){
            item.action? item.action() : null;
            item.time -= 1;
        }else{
            activeItems.pop();
            paddleColor = 'white';
            item.reverseAction? item.reverseAction() : null;
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
}