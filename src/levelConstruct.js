export const levelConstructorArray =
[
    {
        brickRowCount    : 5,
        brickColumnCount : 5,
        brickWidth       : 100,
        brickHeight      : 50,
        brickPadding     : 2,
        brickOffsetTop   : 150,
        brickOffsetLeft  : 250,
        nbBonusBrick     : 1,
        brickBackground  : "assets/img/crystal-2898037_1280-removebg-preview.png",
        imgParts         : [],
    },
    {
        brickRowCount    : 5,
        brickColumnCount : 5,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 5,
        brickOffsetTop   : 180,
        brickOffsetLeft  : 300,
        nbBonusBrick     : 5,
        brickBackground  : "assets/img/test.png",
        imgParts         : [],
    },
    {
        brickRowCount    : 5,
        brickColumnCount : 5,
        brickWidth       : 75,
        brickHeight      : 30,
        brickPadding     : 5,
        brickOffsetTop   : 180,
        brickOffsetLeft  : 300,
        nbBonusBrick     : 6,
        brickBackground  : "assets/img/brick.jpg",
        imgParts         : [],
    },
];

for (let i = 0; i < levelConstructorArray.length; i++){
    let actualLevel = levelConstructorArray[i];
    let img = new Image();
    img.src = actualLevel.brickBackground;
    img.onload = () => {
        splitImage(i,img)
    }
}

function splitImage(i,img){
    const canvas = document.createElement('canvas'),
        ctx      = canvas.getContext('2d');
    let partsArray  = [],
        actualLevel = levelConstructorArray[i],
        row         = actualLevel.brickRowCount,
        column      = actualLevel.brickColumnCount,
        w           = img.width/row,
        h           = img.height/column;
    for(let c=0; c<column; c++) {
        partsArray[c] = [];
        for(let r=0; r<row; r++) {
            let x         = -(w * r),
                y         = -(h * c);
            canvas.width  = w;
            canvas.height = h;
            ctx.drawImage(img, x, y, w*row, h*column);
            let data = canvas.toDataURL();
            partsArray[c].push(data);
            let slicedImage = document.createElement('img');
            slicedImage.src = partsArray[c][r];
            actualLevel.imgParts.push(slicedImage)
        }
    }
}