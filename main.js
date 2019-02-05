//Method initializing game board
let emptySlotNumber;
let emptySlotObject, resetButton, inputFile, inputImage, canvas, context, clickCounterObject;
let gameBoard, movesCounter = 0;
let gameBoardSize = 16; //Change it later, so user will be able to change game board size   
let movesLimit = 15;
//For canvas
let imgW, //px
imgH, //px
tileDim = 83, //tile dimensions px
tileCountX, //how many tiles we can fit
tileCountY;
let w = innerWidth,
h = innerHeight, tiles, images = [];

//Function called when page is fully loaded to initialize game board and start the game
const initializeGame = () => {
    inputFile = document.getElementById("inputFile");
    emptySlotNumber = getRandomNumber(0, gameBoardSize); //Getting pseudo-random number for emptySlot
    gameBoard = document.getElementById("gameBoard");
    resetButton = document.getElementById("resetButton");
    clickCounterObject = document.getElementById("clickCounter");
    canvas = document.getElementById("canvas");
    canvas.width = w;
    canvas.height = h;
    context = canvas.getContext("2d");
    inputImage = new Image();

    gameBoard.innerHTML = ""; //Clear canvas

    resetButton.addEventListener("click", restartGame, false);
    inputFile.addEventListener("change", readFile); //Add listener to form to load file

    //Creating gameboard
    for (let i = 0; i < gameBoardSize; i++) {

        if ((i % 4) === 0) {
            gameBoard.appendChild(document.createElement("tr"));
        }

        gameBoard.children[parseInt(i / 4)].appendChild(document.createElement("td")); //Create and append a game slot to every row
        

        if (i === emptySlotNumber) { //Add empty slot
            console.log(`Random number is ${emptySlotNumber}, slot ${i} is empty`);
            gameBoard.children[parseInt(i / 4)].children[i - (parseInt(i/4))*4].setAttribute('id', "emptySlot");
            continue;
        }

        gameBoard.children[parseInt(i / 4)].children[i - (parseInt(i/4))*4].setAttribute('class', "notEmptySlot");
    }    

    //Add event listeners to all slots        
    let notEmptySlots = document.querySelectorAll(".notEmptySlot");
    notEmptySlots.forEach(slot => {
        slot.addEventListener("click", slotClicked);
    }); 
    

};

//Callback function called when new image file is loaded
const readFile = () => {
    let reader = new FileReader();
    reader.readAsDataURL(inputFile.files[0]);
    reader.onload = () => {
        inputImage.src = reader.result;        
        
        inputImage.onload = () => {
            
            inputImage.naturalWidth = 350;
            inputImage.naturalHeight = 350;

            initializeCanvas();
            tiles = getTiles();
            drawTiles(tiles);   
            
            gameBoard.style.visibility = "visible";
            resetButton.style.visibility = "visible";  
        
            restartGame();
        }
    }
};

//Function called to initialize canvas
const initializeCanvas = () => {

    imgW = inputImage.width;
	imgH = inputImage.height;
	//check how many full tiles we can fit
	//right and bottom sides of the image will get cropped
	tileCountX = ~~(imgW / tileDim);
	tileCountY = ~~(imgH / tileDim);

	context.drawImage(inputImage, 0, 0);
	inputImage = context.getImageData(0, 0, imgW, imgH).data;
    context.clearRect(0, 0, w, h);
    
    //Render number of attempts left 
    updateStatistics();
};

const indexX = (x) => {
	var i = x * 4;
	if (i > inputImage.length) console.warn("X out of bounds");
	return i;
}

const indexY = (y) => {
	var i = imgW * 4 * y;
	if (i > inputImage.length) console.warn("Y out of bounds");
	return i;
}

const getIndex = (x, y) => {
	var i = indexX(x) + indexY(y);
	if (i > inputImage.length) console.warn("XY out of bounds");
	return i;
}

//get a tile of size tileDim*tileDim from position xy
const getTile = (x, y) => {
	var tile = [];
	//loop over rows
	for (var i = 0; i < tileDim; i++) {
		//slice original image from x to x + tileDim, concat
		tile.push(...inputImage.slice(getIndex(x, y + i), getIndex(x + tileDim, y + i)));
	}
	//convert back to typed array and to imgdata object
	tile = new ImageData(new Uint8ClampedArray(tile), tileDim, tileDim);
	//save original position
	tile.x = x;
	tile.y = y;
	return tile;
}

//generate all tiles
const getTiles = () => {
	var tiles = [];
	for (var yi = 0; yi < tileCountY; yi++) {
		for (var xi = 0; xi < tileCountX; xi++) {
			tiles.push(getTile(xi * tileDim, yi * tileDim));
		}
	}
	return tiles;
}

//Callback function called when any not-empty slot is clicked 
const slotClicked = (event) => {
    //Swapping clicked slot with the empty one
    if (event.currentTarget.getAttribute("id") !== "emptySlot") {
        emptySlotObject = document.getElementById("emptySlot");        
        
        emptySlotNumber = parseInt(event.currentTarget.innerHTML);
    
        emptySlotObject.innerHTML = event.currentTarget.innerHTML;
        //Swap backgrounds as well
        emptySlotObject.style.backgroundImage = `url("${images[parseInt(event.currentTarget.innerHTML)].src}")`;
        emptySlotObject.addEventListener("click", slotClicked);
        event.currentTarget.style.backgroundImage = "url('')";    
    
        emptySlotObject.setAttribute('id', "");
        emptySlotObject.setAttribute("class", "notEmptySlot"); 
        event.currentTarget.innerHTML = "";                
        event.currentTarget.setAttribute("class", "");
        event.currentTarget.setAttribute("id", "emptySlot");   
        event.currentTarget.removeEventListener("click", slotClicked);             
        movesCounter++;

        //Check if user won or lost 
        checkGameStatus();

        //Update number of attempts left on HTML page
        updateStatistics();
    }
};

//Function returning random number based on minimum and maximum values passed to it
const getRandomNumber = (minValue, maxValue) => {
    return minValue + Math.floor(maxValue * Math.random());
} 

//Function shuffling slots 
const shuffleSlots = () => {
    let assignedNumbers = [];
    let rows = gameBoard.children;
    let slots, randomNumber;

    for (let rowNumber = 0; rowNumber < rows.length; rowNumber++) {
        slots = rows[rowNumber].children;

        for (let slotNumber = 0; slotNumber < slots.length; slotNumber++) {
            if ((slots[slotNumber].getAttribute("id")) === "emptySlot") {
                continue;
            }

            while(true) { //Looking for pseudo-random numbers that wasn't assigned yet
                randomNumber = getRandomNumber(1, rows.length * slots.length - 1);
                if (assignedNumbers.indexOf(randomNumber) === -1) {
                    assignedNumbers.push(randomNumber);
                    break;
                }
            } 
            slots[slotNumber].innerHTML = randomNumber;      
            
            if (images != undefined) {
                slots[slotNumber].style.backgroundImage = `url("${images[randomNumber].src}")`; 
            }            
        }
    }
};

const drawTiles = (tiles) => {
    tiles.forEach((tile,i) => { 
                                
        context.putImageData(tile, 0, 0);
        let tmpImage = new Image();
        /* tmpImage.src = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, ''); */
        tmpImage.src = canvas.toDataURL("image/png");
        images[i] = tmpImage;
        context.clearRect(0, 0, canvas.width, canvas.height);                                      
        });
}

//Function used to check if user won the game
const checkGameStatus = () => {

    //If user's done more than movesLimit moves the game is over
    if (movesCounter > movesLimit) { 
        printResult("lost");
        return;   
    }
    else { //if it's less than movesLimit then call function checking all slots 
        checkAllSlots();
    }
}

const checkAllSlots = () => {
    let rows = gameBoard.children; //Get all N rows 
    let slots;

    for (let rowNumber = 0; rowNumber < rows.length; rowNumber++) {
        slots = rows[rowNumber].children;

        for (let slotNumber = 0; slotNumber < slots.length; slotNumber++) {
            
            if (parseInt(slots[slotNumber].innerHTML) != (rowNumber*4 + slotNumber + 1)) {
                if((slots[slotNumber].innerHTML === "") && (rowNumber*4 + slotNumber + 1) === 16 ) {
                    continue;
                }
                return;
            }
        }
    }
    //If reached this point it means that all slots are in order and user won
    printResult("won");
};   

//Function called if user won or lost
const printResult = (result) => {
    let message; //Message that will be used in alert window        
    
    switch(result) {
        case "lost":
            message = `You made more than ${movesLimit} moves and you lost!\n Press ok to start a new game`;
            break;
        case "won":
            message = `Congrats, you won in ${movesCounter} moves! \n Press ok to start a new game`;
            break;
    }

    let userChoise = window.confirm(message);

    if (userChoise) {
        restartGame();
    }
    else { //If user doesn't want to continue game, remove all event listeners
        disableSlots();
    }
}

//Disable all slots 
const disableSlots = () => {
    let allSlots = document.querySelectorAll("td");

    allSlots.forEach(slot => {
        slot.removeEventListener("click", slotClicked);   
    });
};

//Function to start a new game
const restartGame = () => {

    tiles = [];
    movesCounter = 0;
    //Remove classses and id from all slots
    let allSlots = document.querySelectorAll("td");

    allSlots.forEach(slot => {
        slot.setAttribute("class", "");
        slot.setAttribute("id", "");  
        slot.removeEventListener("click", slotClicked);   
    });

    //Initialize a new gameboard
    initializeGame();
    shuffleSlots();
}

//Update number of left attempts on HTML page
const updateStatistics = () => {

    clickCounterObject.innerHTML = `You have ${movesLimit - movesCounter} attempt${(movesLimit - movesCounter) === 1 ? "s" : ""} left`;
};

window.addEventListener("load", initializeGame, false);