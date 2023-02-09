// Init keyboard and mouse inputs detection
// import {ballArray, canvas, isArmed, paddleWidth,isMultiBall,} from "./game";
// import {isMagnetBall,gamePaused,pause,paddleX,paddleHeight} from './game.js';
//
// let rightPressed       = false;
// let leftPressed        = false;
//
// const DirectionsInput = {
//     'Up'        : {type : "keyup" , function : keyUpHandler},
//     'Down'      : {type : "keydown" , function : keyDownHandler},
//     'Mousemove' : {type : "mousemove" , function : mouseMoveHandler},
//     'Space'     : {type : "keyup" , function : spaceBarHandler},
//     'Launch'    : {type : ["keyup","click"] , function : launchHandler},
//     'Fire'      : {type : ["keyup","click"] , function : fireHandler}
// };
//
//
// function addInputsListener(){
//     for (let directionName in DirectionsInput){
//         let direction = DirectionsInput[directionName];
//         if (Array.isArray(direction.type)){
//             for (let i = 0; i < direction.type.length ; i++){
//                 document.addEventListener(direction.type[i], direction.function, false);
//             }
//         }else{
//             document.addEventListener(direction.type, direction.function, false);
//         }
//     }
// }
//
// function spaceBarHandler(e) {
//     if (e.code === "Space") {
//         pause()
//     }
// }
//
// function keyDownHandler(e) {
//     if (!gamePaused){
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
//     if (!gamePaused) {
//         if (e.key === "Right" || e.key === "ArrowRight") {
//             rightPressed = false;
//         } else if (e.key === "Left" || e.key === "ArrowLeft") {
//             leftPressed = false;
//         }
//     }
// }
//
// function mouseMoveHandler(e) {
//     if (!gamePaused) {
//         let relativeX = e.clientX - canvas.offsetLeft;
//         if (relativeX > 0 && relativeX < canvas.width) {
//             paddleX = relativeX - paddleWidth / 2;
//         }
//     }
// }
//
// function launchHandler(e) {
//     if (e.code === "KeyE" ) {
//         if (isMagnetBall){
//             for (let i = 0 ; i < ballArray.length; i++){
//                 let old = ballArray[i].copyDirections();
//                 ballArray[i].oldDirections.oldDx = old.dx;
//                 ballArray[i].oldDirections.oldDy = old.dy;
//                 if (ballArray[i].oldDirections.oldDy !== 0){
//                     ballArray[i].directions.dy = ballArray[i].oldDirections.oldDy = old.dy;
//                     ballArray[i].directions.dx = ballArray[i].oldDirections.oldDx;
//                 }else{
//                     ballArray[i].directions.dy = -5 - i;
//                     ballArray[i].directions.dx = 5 + i;
//                 }
//                 isMagnetBall  = false;
//             }
//         }
//     }
// }
//
// function fireHandler(e) {
//     if (e.code === "KeyW") {
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
// export let inputDetection = () => {document.addEventListener('DOMContentLoaded', addInputsListener, false)};
