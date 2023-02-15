import {paddleWidth,ballArray,lifeUp,modifyPaddleWidth,fireLauncher,bigBall} from './game.js';

export const bonusObject = {
        'life' : {
        name   : 'life',
        text   : "+1 LIFE",
        time   : null,
        img    : "assets/img/item/gold_heart.png",
        action : () => {
            lifeUp();
        },
        position : {bx : 0,by : 0}
    },
     'bigPaddle' : {
         name   : 'bigPaddle',
         text   : "BIG PADDLE",
        time   : 1000,
        img    : "assets/img/brick.jpg",
        action : () => {
            if (paddleWidth !== 85*2 ){
                modifyPaddleWidth(paddleWidth*2)
            }
        },
        reverseAction : () => {
            modifyPaddleWidth(85)
        },
         position : {bx : 0,by : 0}
     },
     'multiplyScore' :{
         name   : 'multiplyScore',
         text   : "Score X2",
         time   : 200,
         img    : "assets/img/brick.jpg",
         position : {bx : 0,by : 0}
     },
    'fireLauncher'  : {
        name : 'fireLauncher',
        text : "Fire Launcher ! Press Z to fire",
        time : 500,
        img : "assets/img/brick.jpg",
        action : () => {
            fireLauncher(true)
        },
        reverseAction : () => {
            fireLauncher(false)
        },
        position : {bx : 0,by : 0}

    },
    'magnetBall'  : {
        name : 'magnetBall',
        text : "Magnetic Ball",
        time : 1000,
        img : "assets/img/brick.jpg",
        position : {bx : 0,by : 0}

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
        position : {bx : 0,by : 0}

    },
    'multiBall' : {
        name : 'multiBall',
        text : 'MultiBall !!!',
        img : 'assets/img/brick.jpg',
        action : () => {
            createMultiBalls(5)
        },
        position : {bx : 0,by : 0}
    }
};

createImageObject();

export function createImageObject() {
    for (let item in bonusObject){
        let img = new Image();
        img.src = bonusObject[item].img;
        bonusObject[item].img = img;
    }
}

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