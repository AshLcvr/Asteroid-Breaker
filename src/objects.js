import {canvas,paddleWidth,ballArray,lifeUp,modifyPaddleWidth,fireLauncher,bigBall} from './game.js';

export function createImageObject() {
    let bonusImageArray = [];
    for (let item in bonusObject){
        let img = new Image();
        img.src = bonusObject[item].img;
        bonusImageArray[item] = img;
    }
    return bonusImageArray;
}

export function createMultiBalls(max) {
    console.log(ballArray[0])
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

export const bonusObject = {
    //     'life' : {
    //     name   : 'life',
    //     text   : "+1 VIE",
    //     time   : null,
    //     img    : "assets/img/item/gold_heart.png",
    //     action : () => {
    //         lifeUp();
    //     },
    // },
    //  'bigPaddle' : {
    //      name   : 'bigPaddle',
    //      text   : "BIG PADDLE",
    //     time   : 1000,
    //     img    : "assets/img/test.png",
    //     action : () => {
    //         if (paddleWidth !== 85*2 ){
    //             modifyPaddleWidth(paddleWidth*2)
    //         }
    //     },
    //     reverseAction : () => {
    //         modifyPaddleWidth(85)
    //     }
    // },
    //  'multiplyScore' :{
    //      name   : 'multiplyScore',
    //      text   : "Score X2",
    //      time   : 200,
    //      img    : "assets/img/test.png",
    // },
    // 'magnetBall'  : {
    //     name : 'magnetBall',
    //     text : "Magnetic Ball",
    //     time : 1000,
    //     img : "assets/img/test.png",
    // },
    // 'fireLauncher'  : {
    //     name : 'fireLauncher',
    //     text : "Fire Launcher ! Press Z",
    //     time : 500,
    //     img : "assets/img/test.png",
    //     action : () => {
    //         fireLauncher(true)
    //     },
    //     reverseAction : () => {
    //         fireLauncher(false)
    //     }
    // },
    // 'slowBall' : {
    //     name : 'slowBall',
    //     text : 'Sloooow Ball',
    //     time : 500,
    //     img : 'assets/img/test.png',
    //     action : () => {
    //
    //     }
    // },
    // 'bigBall' : {
    //     name : 'bigBall',
    //     text : 'BIG BALL ! ',
    //     time : 1000,
    //     img : 'assets/img/test.png',
    //     action : () => {
    //         bigBall(20)
    //     },
    //     reverseAction : () => {
    //         bigBall(10)
    //     }
    // },
    'multiBall' : {
        name : 'multiBall',
        text : 'MultiBall !!! ',
        img : 'assets/img/test.png',
        action : () => {
            createMultiBalls(5)
        }
    },
};
