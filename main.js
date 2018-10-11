//Method initializing game board
let emptySlotNumber;
let emptySlotObject;
let gameBoard, movesCounter = 0;
let gameBoardSize = 16; //Change it later, so user will be able to change game board size   
let movesLimit = 10;

//Function called when page is fully loaded to initialize game board and start the game
const initializeGame = () => {
    
    emptySlotNumber = getRandomNumber(0, gameBoardSize); //Getting pseudo-random number for emptySlot
    gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";

    //Creating gameboard
    for (let i = 0; i < gameBoardSize; i++) {

        if ((i % 4) === 0) {
            gameBoard.appendChild(document.createElement("tr"));
        }

        gameBoard.children[parseInt(i / 4)].appendChild(document.createElement("td")); //Create and append a game slot to every row
        gameBoard.children[parseInt(i / 4)].children[i - (parseInt(i/4))*4].setAttribute('class', "notEmptySlot");

        if (i === emptySlotNumber) { //Add empty slot
            gameBoard.children[parseInt(i / 4)].children[i - (parseInt(i/4))*4].setAttribute('id', "emptySlot");
        }
    }    
        //Add event listeners to all slots        
        let notEmptySlots = document.querySelectorAll(".notEmptySlot");
        notEmptySlots.forEach(slot => {
            slot.addEventListener("click", slotClicked);
        });

        //Assign random numbers from 1 to (gameboardSize - 1) to emty slots
        shuffleSlots();
};


//Callback function called when any not-empty slot is clicked 
const slotClicked = (event) => {
    //Swapping clicked slot with the empty one
    emptySlotObject = document.getElementById("emptySlot");        
    emptySlotObject.setAttribute('id', "");

    emptySlotObject.innerHTML = event.currentTarget.innerHTML;
    event.currentTarget.innerHTML = "";                
    event.currentTarget.setAttribute("class", "");
    event.currentTarget.setAttribute("id", "emptySlot");                
    movesCounter++;
    console.log(movesCounter);

    //Check if user won or lost 
    checkGameStatus();
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
        }
    }
};


//Function used to check if user won the game
let checkGameStatus = () => {

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
    let notEmptySlots = document.querySelectorAll("td");
    notEmptySlots.forEach(slot => {
        slot.removeEventListener("click", slotClicked);
    });
};

//Function to start a new game
let restartGame = () => {
    movesCounter = 0;
    initializeGame();
}

window.addEventListener("load", initializeGame, false);