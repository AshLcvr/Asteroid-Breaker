import {lifeUp,paddleWidth,modifyPaddleWidth} from './game.js';

export function createImageObject() {
    let bonusImageArray = [];
    for (let i = 0 ; i < bonusArray.length ; i++){
        let item = bonusArray[i];
        let img = new Image();
        img.src = item.img;
        bonusImageArray[item.name] = img;
    }
    return bonusImageArray;
}

export const bonusArray = [
    // {
    //     name   : 'life',
    //     text   : "+1 VIE",
    //     time   : null,
    //     img    : "assets/img/item/gold_heart.png",
    //     action : () => {
    //         lifeUp();
    //     },
    // },
    // {
    //     name   : 'bigPaddle' ,
    //     text   : "BIG PADDLE",
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
    // {
    //     name   : 'multiplyScore' ,
    //     text   : "Score X2",
    //     time   : 1000,
    //     img    : "assets/img/test.png",
    // },
    {
        name   : 'magnetBall' ,
        text   : "Magnetic Ball",
        time   : 1000,
        img    : "assets/img/test.png",
    }
];