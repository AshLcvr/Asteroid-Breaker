import {canvas,ctx,score,levelIndex,isModalDisplayed,isItemCaught,modifyItemCaught,highScores,playerStats} from './game.js'

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

export function drawStartModal() {
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

export function drawLevelModal(levelIndex){
    if (isModalDisplayed && levelIndex >= 1) {
        let playerLevel = levelIndex+1;
        ctx.font = "132px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText("LEVEL "+ playerLevel, 270, 350);
    }
}

export function drawItemModal(item){
    if (item.position.by > canvas.height/2 && isItemCaught) {
        item.position.by -= 3;
        ctx.font = "32px space";
        ctx.fillStyle = "#f6fff4";
        ctx.fillText(item.text, item.position.bx, item.position.by);
    }else if(item.position.by <= canvas.height/2){
        modifyItemCaught(false);
    }
}

export function drawEndGameModal(){
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

export function drawPlayerName(){
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

export function drawHighScores(){
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