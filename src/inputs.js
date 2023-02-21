// import {playerStats,isEndGame,isHighScoreDisplayed,rightPressed,leftPressed,pause,paddleX,isMagnetBall,isGamePaused,isInputVisible,playerNameInput,hasFired,launchedAmmo,isArmed, ballArray, canvas, paddleWidth, score} from "./game.js";
//
// export const DirectionsInput = {
//     'Up'        : {type : "keyup" , function : keyUpHandler},
//     'Down'      : {type : "keydown" , function : keyDownHandler},
//     'Mousemove' : {type : "mousemove" , function : mouseMoveHandler},
//     'Space'     : {type : "keyup" , function : spaceBarHandler},
//     'Launch'    : {type : ["keyup","click"] , function : launchHandler},
//     'Fire'      : {type : ["keyup","click"] , function : fireHandler},
//     'Submit'    : {type : "keyup", function : submitHandler},
//     'Reload'    : {type: "keyup", function: reloadHandler}
// };
//
//
// function spaceBarHandler(e) {
//     if (e.code === "Space") {
//         pause()
//     }
// }
//
// function keyDownHandler(e) {
//     if (!isGamePaused){
//         if(e.key === "Right" || e.key === "ArrowRight") {
//             rightPressed = true;
//         }
//         else if(e.key === "Left" || e.key === "ArrowLeft") {
//             leftPressed = true;
//         }
//     }
// }
//
// function keyUpHandler(e) {
//     if (!isGamePaused) {
//         if (e.key === "Right" || e.key === "ArrowRight") {
//             rightPressed = false;
//         } else if (e.key === "Left" || e.key === "ArrowLeft") {
//             leftPressed = false;
//         }
//     }
// }
//
// function mouseMoveHandler(e) {
//     if (!isGamePaused) {
//         const relativeX = e.clientX - canvas.offsetLeft;
//         if (relativeX > 0 && relativeX < canvas.width) {
//             paddleX = relativeX - paddleWidth / 2;
//         }
//     }
// }
//
// function launchHandler(e) {
//     if (e.code === "KeyE" && !isGamePaused) {
//         if (isMagnetBall){
//             isMagnetBall  = false;
//             for (let i = 0 ; i < ballArray.length; i++){
//                 let ball = ballArray[i];
//                 if (ball.directions.dy === 5){
//                     ball.directions.dy = ball.oldDirections.oldDy;
//                     ball.directions.dx = ball.oldDirections.oldDx;
//                 }else{
//                     ball.directions.dy = -5 - i;
//                     ball.directions.dx = 5 + i;
//                 }
//             }
//         }
//     } else if(e.code === "KeyE" && isEndGame){
//         isInputVisible = true;
//         playerNameInput[0].classList.remove('hidden');
//     }
// }
//
// function fireHandler(e) {
//     if (e.code === "KeyW" && !isGamePaused) {
//         if (isArmed){
//             let ammo = {
//                 'leftAmmoX'  : JSON.parse(JSON.stringify(paddleX-10)),
//                 'rightAmmoX' : JSON.parse(JSON.stringify(paddleX+paddleWidth+10)),
//                 'ammoY'      : JSON.parse(JSON.stringify(canvas.height-paddleHeight))
//             };
//             launchedAmmo.push(ammo);
//             hasFired = true;
//         }
//     }
// }
//
// function submitHandler(e){
//     if (e.code === "Enter" && isInputVisible){
//         if (playerNameInput[0].value.length >= 3 && playerNameInput[0].value.length <= 7){
//             playerNameInput[0].classList.toggle('hidden');
//             isInputVisible = false;
//             playerStats    = {name : playerName,score : score};
//             highScores.push(playerStats);
//             highScores.push({name : 'GOD',score:320});
//             highScores.push({name : 'Milou',score:33});
//             highScores.push({name : 'Tounio',score:300});
//             highScores.sort((p1, p2) => (p1.score < p2.score) ? 1 : (p1.score > p2.score) ? -1 : 0);
//             isHighScoreDisplayed = true;
//         }else{
//             window.alert('Your name can contain 3 to 7 characters only !')
//         }
//     }
// }
//
// function reloadHandler(e){
//     if (e.code === "KeyR" && isEndGame && !isInputVisible){
//         document.location.reload();
//     }
// }
