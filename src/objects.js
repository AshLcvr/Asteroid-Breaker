import {lifeUp,paddleWidth,modifyPaddleWidth} from './game.js';

function animate(canvas2,x2,y2,img,ctx2) {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);  // clear canvas
    ctx2.drawImage(img, x2, y2);                       // draw image at current position
    x2 -= 4;
    if (x2 > 250) requestAnimationFrame(animate)        // loop
}
//
export const createBonus = (img_url,bx,by) => {
        let canvas2 = document.getElementById('imageObject'),
        ctx2 = canvas2.getContext("2d");
        ctx2.rect(bx, by, 30,300);
        canvas2.style.backgroundImage = 'url('+img_url+')'
        canvas2.style.backgroundRepeat = 'no-repeat'
        canvas2.style.backgroundPosition = 'center'
        // img.onload = animate(canvas2,x2,y2,img,ctx2);
        // let img = new Image();
        //
        // img.src    = img_url;

        return canvas2;
};

export const bonusArray = [
    {
        name   : 'life',
        text   : "+1 VIE",
        time   : null,
        img    : "assets/img/item/gold_heart.png",
        action : () => {
            lifeUp();
        },
    },
    {
        name   : 'bigPaddle' ,
        text   : "BIG PADDLE",
        time   : 2000,
        img    : "assets/img/item/gold_heart.png",
        action : () => {
            if (paddleWidth !== 85*2 ){
                modifyPaddleWidth(paddleWidth*2)
            }
        },
        reverseAction : () => {
            modifyPaddleWidth(85)
        }
    }
];