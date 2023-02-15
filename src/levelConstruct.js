export const levelConstructorArray =
[
    {
        canvasBackground : "assets/img/background_level1.jpg",
        brickBackground  : "assets/img/brick2.jpg",
        brickRowCount    : 7,
        brickColumnCount : 8,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 10,
        brickOffsetTop   : 100,
        brickOffsetLeft  : 140,
        nbBonusBrick     : 2
    },
    {
        canvasBackground : "assets/img/background_level1.jpg",
        brickBackground  : "assets/img/test.png",
        brickRowCount    : 6,
        brickColumnCount : 5,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 10,
        brickOffsetTop   : 100,
        brickOffsetLeft  : 140,
        nbBonusBrick     : 5
    },
    {
        canvasBackground : "assets/img/background_level1.jpg",
        brickBackground  : "assets/img/brick2.jpg",
        brickRowCount    : 5,
        brickColumnCount : 6,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 10,
        brickOffsetTop   : 100,
        brickOffsetLeft  : 140,
        nbBonusBrick     : 6
    },
];

function createBrickImage() {
    for (let i = 0; i < levelConstructorArray.length; i++){
        let img = new Image();
        img.src = levelConstructorArray[i].brickBackground;
        levelConstructorArray[i].brickBackground = img;
    }
}
createBrickImage();