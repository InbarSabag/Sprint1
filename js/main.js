'use strict'
//consts/////////////////////////////////////////////////////////////

const MINE = '💣'
const FLAG = '🚩'
const NUMS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']

const gLevels = [
    { SIZE: 4, MINES: 2 },
    { SIZE: 8, MINES: 12 },
    { SIZE: 12, MINES: 30 }
]

//vars///////////////////////////////////////////////////////////////

let gBoard = []
let gLastBoard = []
let gCell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
}

let gLives
let gTimeStart
let gTimeIntervalId
let gGameScore
let gFirstClick = false

let gCurrLevel = 0
let gLevel = {
    SIZE: 4,
    MINES: 2
}

let gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

let gElGameBoard = document.querySelector('.gameBoard')
let gElStartBtn = document.querySelector('.startBtn')
let gElTimer = document.querySelector('.timer')
let gElScore = document.querySelector('.score')
let gElLives = document.querySelector('.lives')
let gElHints = document.querySelector('.hints')

//functions///////////////////////////////////////////////////////////


function initGame(level = 0) {
    console.log('initGame()')
    gCurrLevel = level
    gLevel = gLevels[level]
    buildBoard()
    renderBoard(gBoard)
    // FIXME: while(!gFirstClick)
    setMines()
    gFirstClick = false
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    if(gLevel)gLives = 3
    gTimeStart = Date.now()
    gTimeIntervalId = setInterval(() => {
        gGame.secsPassed  = (Date.now() - gTimeStart)/1000
        gElTimer.innerText = `⏰  ${(gGame.secsPassed).toFixed(1)} s`
    }, 100);
    gElScore.innerText = `🚩   0`
    gElStartBtn.innerHTML = '😀'
}

function restartGame(){
    console.log('restartGame()');
    initGame(gCurrLevel)
}

function buildBoard() {
    console.log('buildBoard()')
    //model
    for (let i = 0; i < gLevel.SIZE; i++) {
        gBoard[i]= []
        for (let j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j]={
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
}

function setMines(){
    // //// set const mines:
    // gBoard[1][1].isMine = true
    // gBoard[2][2].isMine = true
    // gBoard[3][3].isMine = true
    // set random mines:  
    for (let i = 0; i < gLevel.MINES; i++) {
            let rowIdx= getRandomInt(0,gLevel.SIZE)
        let colIdx= getRandomInt(0,gLevel.SIZE)   
        if(gBoard[rowIdx][colIdx].isMine !== true) gBoard[rowIdx][colIdx].isMine = true
        else  i--
    }
    gBoard = setMinesNegsCount(gBoard)
}


function setMinesNegsCount(board) {
    console.log('setMinesNegsCount(board)')
    // run of every cell at the board
    for (let rowIdx = 0; rowIdx < gLevel.SIZE; rowIdx++) {
        for (let colIdx = 0; colIdx < gLevel.SIZE; colIdx++) {
            //run on his negs and check if there mines and count them
            for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
                if (i < 0 || i > gLevel.SIZE - 1) continue
                for (let j = colIdx - 1; j <= colIdx + 1; j++) {
                    if (j < 0 || j > gLevel.SIZE - 1) continue
                    if (i === rowIdx && j === colIdx) continue
                    if (board[i][j].isMine === true) {
                        board[rowIdx][colIdx].minesAroundCount++
                    }
                }
            }
        }
    }
    return board
}

function renderBoard(board) {
    console.log('renderBoard(board)')
    let strHTML = '<table oncontextmenu="return false;"><tbody>'
    for (let i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < gLevel.SIZE; j++) {
            let cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" onclick="cellClicked(this, ${i}, ${j})" class="${className}">`
            if (cell.isMarked && !cell.isShown) strHTML += FLAG
            if (cell.isShown) {
                if (!cell.isMine) strHTML += NUMS[gBoard[i][j].minesAroundCount]
                else  strHTML += MINE
                
            }
            strHTML += '</td>'
        }
    }
    strHTML += '</tr>'

    strHTML += '</tbody></table>'
    gElGameBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    if(!gFirstClick) gFirstClick = true
    console.log('cellClicked(elCell, i, j)')
    if (gGame.isOn) {
        if(!gBoard[i][j].isShown){
            if(gBoard[i][j].isMarked){
                gBoard[i][j].isMarked = false
                gGame.markedCount--
                gElScore.innerText = `🚩   ${gGame.markedCount}`
            } 
            // gLastBoard = makeCopyBoard()
            gBoard[i][j].isShown = true
            //FIXME:
            // elCell.style.backgroundColor = 'rgba(238, 233, 233, 0.521)'
            // elCell.classList.add("shown")
            // console.log('elCell:', elCell)
            gGame.shownCount++
            checkGameOver()
            console.log('gGame:', gGame)
            // renderBoard(gBoard)
            if (gBoard[i][j].isMine) {
                gameOver()
            }
            else {
                if (gBoard[i][j].minesAroundCount === 0) {
                    expandShown(gBoard, elCell, i, j)
                    checkGameOver()
                    // gBoard = expandShown(gBoard, elCell, i, j)
                }
            }
            renderBoard(gBoard)
        }
    }
}

function cellMarked(elCell, i, j) {
        console.log('cellMarked(elCell, i, j), elCell:',elCell)
    if (gGame.isOn) {
        if(gBoard[i][j].isShown) return
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked
        if (gBoard[i][j].isMarked) {
            elCell.innerText = FLAG
            gGame.markedCount++
        }
        else {
            elCell.innerText = ''
            gGame.markedCount--
        }
    }
    gElScore.innerText = `🚩   ${gGame.markedCount}`
    checkGameOver()
}

function checkGameOver() {        
    console.log('checkGameOver()')
    if(gGame.markedCount > gLevel.MINES) return
    let boardSize = gLevel.SIZE ** 2
    if ((gGame.markedCount + gGame.shownCount) === boardSize) {
        victory()
    }

}

function gameOver() {
    console.log('gameOver()')
    gLives--
    if(gLives>0){
        let livesStr =''
        for(var i = 0 ; i < gLives ; i++){
            livesStr += '💙'
        }
        gElLives.innerHTML = livesStr
    }
    else{
        gGame.isOn = false
        clearInterval(gTimeIntervalId)
        gElStartBtn.innerText = "🤯"
        revileAll()
    }

}

function victory() {
    console.log('victory()');
    clearInterval(gTimeIntervalId)
    gGameScore == gGame.secsPassed
    gGame.isOn = false
    gElStartBtn.innerText = "😎"
}

function makeCopyBoard() {
    console.log('makeCopyBoard(board)');
    let copyBoard = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        copyBoard[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            copyBoard[i][j].minesAroundCount= gBoard[i][j].minesAroundCount
            copyBoard[i][j].isShown= gBoard[i][j].isShown
            copyBoard[i][j].isMine= gBoard[i][j].isMine
            copyBoard[i][j].isMarked= gBoard[i][j].isMarked
        }
    }
    return copyBoardk
    k
}

function expandShown(board, elCell, rowIdx, colIdx) {
    console.log('expandShown(board, elCell, rowIdx, colIdx)')
    if (board[rowIdx][colIdx].minesAroundCount !== 0) return

    //run on his negs and check if there are negs with 0 mines around
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].minesAroundCount === 0) {
                if(board[i][j].isMarked) continue
                if(!board[i][j].isShown){
                    board[i][j].isShown = true
                    gGame.shownCount++
                    console.log('gGame:', gGame)
                    
                    expandShown(board, elCell, i, j)
                }
            }
        }
    }
}

function revileAll(){
    for(var i = 0 ; i < gLevel.SIZE ; i++){
        for(var j = 0 ; j < gLevel.SIZE ; j++){
               gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)
}

// function makeCopyBoard() {
//     console.log('makeCopyBoard(board)');
//     let copyBoard = []
//     let cell = {
//         minesAroundCount: 0,
//         isShown: false,
//         isMine: false,
//         isMarked: false
//     }
//     for (var i = 0; i < gLevel.SIZE; i++) {
//         // copyBoard[i].push([])
//         for (var j = 0; j < gLevel.SIZE; j++) {
//             cell.minesAroundCount= gBoard[i][j].minesAroundCount
//             cell.isShown= gBoard[i][j].isShown
//             cell.isMine= gBoard[i][j].isMine
//             cell.isMarked= gBoard[i][j].isMarked
//             copyBoard[i][j] = cell
//         }
//     }
//     return copyBoard
// }


    
    // function updateNegs(rowIdx, colIdx) {
    //     for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    //         if (i < 0 || i > gBoard.length - 1) continue
    
    //         for (let j = colIdx - 1; j <= colIdx + 1; j++) {
    //             if (j < 0 || j > gBoard[0].length - 1) continue
    //             if (i === rowIdx && j === colIdx) continue
    //             // if (gBoard[i][j].isMine= true) continue 
    //             gBoard[i][j].minesAroundCount += 1
    //         }
    //     }
    // }