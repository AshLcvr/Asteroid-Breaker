import {paddleWidth,ballArray,lifeUp,modifyPaddleWidth,fireLauncher,bigBall} from './game.js';

export const bonusObject = {
    'life' : {
        name      : 'life',
        text      : "+1 LIFE",
        time      : 80,
        img       : "assets/img/item/gold_heart.png",
        action    : () => {lifeUp()},
        position  : {bx : 0,by : 0},
        actionDone: false,
        isFalling : false
    },
     'bigPaddle' : {
         name   : 'bigPaddle',
         text   : "BIG PADDLE",
        time   : 1000,
        img    : "assets/img/brick.jpg",
        action : () => {
            if (paddleWidth !== 150 ){
                modifyPaddleWidth(150)
            }
        },
        reverseAction : () => {
            modifyPaddleWidth(100)
        },
         position : {bx : 0,by : 0},
         isFalling : false
     },
     'multiplyScore' :{
         name   : 'multiplyScore',
         text   : "Score X2",
         time   : 200,
         img    : "assets/img/brick.jpg",
         position : {bx : 0,by : 0},
         isFalling : false,
     },
    'fireLauncher'  : {
        name : 'fireLauncher',
        text : "Fire Launcher !",
        time : 500,
        img : "assets/img/brick.jpg",
        action : () => {
            fireLauncher(true)
        },
        reverseAction : () => {
            fireLauncher(false)
        },
        position : {bx : 0,by : 0},
        isFalling : false,
    },
    'magnetBall'  : {
        name : 'magnetBall',
        text : "Magnetic Ball",
        time : 1000,
        img : "assets/img/brick.jpg",
        position : {bx : 0,by : 0},
        isFalling : false,
    },
    'bigBall' : {
        name : 'bigBall',
        text : 'BIG BALL',
        time : 1000,
        img : 'assets/img/brick.jpg',
        action : () => {
            bigBall(20)
        },
        reverseAction : () => {
            bigBall(10)
        },
        position : {bx : 0,by : 0},
        isFalling : false
    },
    'multiBall' : {
        name : 'multiBall',
        text : 'MultiBall !!!',
        time : 80,
        img : 'assets/img/brick.jpg',
        action : () => {
            createMultiBalls(5)
        },
        position : {bx : 0,by : 0},
        isFalling : false
    },
};

createImageObject();

export function createImageObject() {
    for (let item in bonusObject){
        let img = new Image();
        img.src = bonusObject[item].img;
        img.onload = () => {bonusObject[item].img = img;}
    }
}

createRocketImage();
createBallImage();
createPaddleImages();

export function createRocketImage(){
    let img = new Image();
    img.src = './assets/img/item/rocket.png';
    return img
}

export function createBallImage(){
    let img = new Image();
    img.src = './assets/elements/ball.png';
    return img;
}

export function createPaddleImages(){
    let paddleImagesArray = [];
    for (let i = 1; i < 4 ; i++){
        let img = new Image();
        img.src = './assets/elements/paddle/paddle_f'+i+'.png';
        paddleImagesArray.push(img)
    }
    return paddleImagesArray;
}

// export function createArmedPaddleImages(){
//     let armedPaddleImagesArray = [];
//     for (let i = 1; i < 4 ; i++){
//         let img = new Image();
//         img.src = './assets/elements/paddle/armedPaddle_f'+i+'.png';
//         armedPaddleImagesArray.push(img)
//     }
//     return armedPaddleImagesArray;
// }

export function createMultiBalls(max) {
    for (let i = 0; i < max ; i++) {
        ballArray.push({
            ballRadius    : 10,
            x             : ballArray[0].x+i,
            y             : ballArray[0].y-i*2,
            directions    : {dx : 5, dy : -5},
            oldDirections : {oldDx  : 0, oldDy : 0},
            copyDirections: function() {return JSON.parse(JSON.stringify(this.directions))},
        })
    }
}