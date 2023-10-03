import {highScores,playerName,isArmed,paddleHeight,pause,modifyPaddleX,launch,isEndGame,paddleX,isMagnetBall,isGamePaused,playerNameInput,launchedAmmo, canvas, paddleWidth, score} from "./game.js";

export let rightPressed  = false,
    leftPressed          = false,
    isInputVisible       = false,
    isHighScoreDisplayed = false,
    hasFired             = false,
    playerStats          = {},
    spaceBarHandler      = (e) => {
        if (e.code === "Space") {
            pause()
        }
    },
    keyDownHandler       = (e) => {
        if (!isGamePaused){
            if(e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            }
            else if(e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            }
        }
    },
    keyUpHandler         = (e) => {
        if (!isGamePaused) {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }
        }
    },
    mouseMoveHandler     = (e) => {
        if (!isGamePaused) {
            let relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                modifyPaddleX(relativeX)
            }
        }
    },
    launchHandler        = (e) => {
        if (e.code === "KeyE" && !isGamePaused && !isEndGame) {
            if (isMagnetBall){
                launch();
            }
        } else if(e.code === "KeyE" && isEndGame){
            isInputVisible = true;
            playerNameInput[0].classList.remove('hidden');
        }
    },
    fireHandler          = (e) => {
        if (e.code === "KeyW" && !isGamePaused) {
            if (isArmed){
                let ammo = {
                    'leftAmmoX'  : JSON.parse(JSON.stringify(paddleX-20)),
                    'rightAmmoX' : JSON.parse(JSON.stringify(paddleX+paddleWidth)),
                    'ammoY'      : JSON.parse(JSON.stringify(canvas.height-paddleHeight))
                };
                launchedAmmo.push(ammo);
                hasFired = true;
            }
        }
    },
    submitHandler        = (e) => {
        if (e.code === "Enter" && isInputVisible){
            if (playerNameInput[0].value.length >= 3 && playerNameInput[0].value.length <= 7){
                playerNameInput[0].classList.toggle('hidden');
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
    },
    reloadHandler        = (e) => {
        if (e.code === "KeyR" && isEndGame && !isInputVisible){
            document.location.reload();
        }
    },
    addInputsListener    = ()  => {
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
    },
    DirectionsInput      = {
        'Up'        : {type : "keyup" , function : keyUpHandler},
        'Down'      : {type : "keydown" , function : keyDownHandler},
        'Mousemove' : {type : "mousemove" , function : mouseMoveHandler},
        'Space'     : {type : "keyup" , function : spaceBarHandler},
        'Launch'    : {type : ["keyup","click"] , function : launchHandler},
        'Fire'      : {type : ["keyup","click"] , function : fireHandler},
        'Submit'    : {type : "keyup", function : submitHandler},
        'Reload'    : {type: "keyup", function: reloadHandler}
    };