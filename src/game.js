// Level Constructor
let levelIndex = 0;
import { levelConstructorArray } from "./levelConstruct.js";

// Canvas & Context
const canvas           = document.getElementById("myCanvas");
const ctx              = canvas.getContext("2d");

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
import {bonusObject,createImageObject} from "./objects.js";
export let lifeUp            = ()=>{ lives++ };
export let modifyPaddleWidth = width => { paddleWidth = width };
export let fireLauncher      = (boolean) => {  isArmed = boolean};
export let isArmed       = false;
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
game(levelIndex);

function game(levelIndex) {

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
        'Launch'    : {type : "keyup" , function : launchHandler},
        'Fire'      : {type : "keyup" , function : fireHandler}
    };

    for (let directionName in DirectionsInput){
        let direction = DirectionsInput[directionName];
        document.addEventListener(direction.type, direction.function, false);
    }

    // Functions
    function levelConstructor(){
        // Reset Paddle & Ball
        lives < 3 ? lives++ : null;
        y                 = canvas.height-25;
        paddleX           = (canvas.width-paddleWidth)/2;
        isMagnetBall      = true;

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

        if (itemDropped) {
            drawItem(bx,by);
            if (!gamePaused){
                by  += 2;
            }
        }
        if (Object.keys(activeItems).length !== 0){
            for (let oneItem in activeItems){
                let item   = activeItems[oneItem];
                item.time !== null? actionTimedItem(item) : (()=>{item.action() ; delete activeItems[item.name]})();
            }
        }
        if (activeItems['fireLauncher'] !== undefined){
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
            x             = paddleX + paddleWidth/2;
            directions.dx = 0;
            directions.dy = 0;
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
                if (activeItems['magnetBall'] !== undefined){
                    y -= 10;
                    directions.dx = 0;
                    directions.dy = 0;
                    isMagnetBall = true
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
        activeAmmo.ammoY -= 2;
        ctx.beginPath();
        ctx.arc(activeAmmo.leftAmmoX, activeAmmo.ammoY, ballRadius, 0, Math.PI*2);
        ctx.arc(activeAmmo.rightAmmoX, activeAmmo.ammoY, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = 'blue';
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
                    if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight ) {
                        b.status = 0;
                        directions.dy = -directions.dy;
                        scoreUp();
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
                        levelIndex++;
                        game(levelIndex);
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
            oldDir        = JSON.parse(JSON.stringify(directions));
            directions.dx = 0;
            directions.dy = 0;
            gamePaused    = true;
        }
    }

    function scoreUp() { brokenBricks++; activeItems['multiplyScore'] !== undefined ? score += 2 : score++;}

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
        if (!gamePaused) {
            const relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }
    }

    function launchHandler(e) {
        if (e.code === "KeyE") {
            if (isMagnetBall){
                directions.dy = oldDir.dy;
                directions.dx = oldDir.dx;
                isMagnetBall  = false;
            }
        }
    }

    function fireHandler(e) {
        if (e.code === "KeyW") {
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