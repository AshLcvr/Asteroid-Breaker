export const levelConstructorArray =
[
    {
        brickBackground  : "assets/img/brick.jpg",
        brickRowCount    : 1,
        brickColumnCount : 1,
        brickWidth       : 750,
        brickHeight      : 30,
        brickPadding     : 10,
        brickOffsetTop   : 100,
        brickOffsetLeft  : 140,
        nbBonusBrick     : 4
    },
    {
        brickBackground  : "assets/img/test.png",
        brickRowCount    : 1,
        brickColumnCount : 1,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 10,
        brickOffsetTop   : 100,
        brickOffsetLeft  : 140,
        nbBonusBrick     : 5
    },
    // {
    //     brickBackground  : "assets/img/brick.jpg",
    //     brickRowCount    : 5,
    //     brickColumnCount : 6,
    //     brickWidth       : 75,
    //     brickHeight      : 30,
    //     brickPadding     : 10,
    //     brickOffsetTop   : 100,
    //     brickOffsetLeft  : 140,
    //     nbBonusBrick     : 6
    // },
];

function createBrickImage() {
    for (let i = 0; i < levelConstructorArray.length; i++){
        let img = new Image();
        img.src = levelConstructorArray[i].brickBackground;
        levelConstructorArray[i].brickBackground = img;
    }
}
createBrickImage();