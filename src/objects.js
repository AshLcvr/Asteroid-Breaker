import {lifeUp,paddleWidth,modifyPaddleWidth,isArmed,fireLauncher} from './game.js';

export function createImageObject() {
    let bonusImageArray = [];
    for (let item in bonusObject){
        let img = new Image();
        img.src = bonusObject[item].img;
        bonusImageArray[item] = img;
    }
    return bonusImageArray;
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
    'fireLauncher'  : {
        name : 'fireLauncher',
        text : "Fire Launcher ! Press Z",
        time : 500,
        img : "assets/img/test.png",
        action : () => {
            fireLauncher(true)
        },
        reverseAction : () => {
            fireLauncher(false)
        }
    }
};