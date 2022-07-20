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
console.log('gCell:', gCell)


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

//functions///////////////////////////////////////////////////////////


function initGame(level = 0) {
    gGame.isOn = true
    gLevel = gLevels[level]
    buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    //model
    for (let i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([])
        for (let j = 0; j < gLevel.SIZE; j++) {
            gBoard[i].push({
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            })
            console.log('gBoard[' + i + '][' + j + ']:', gBoard[i][j])
        }
    }
    //// set const mines:
    // gBoard[1][1].isMine = true
    // gBoard[2][2].isMine = true
    // gBoard[3][3].isMine = true
    //// set random mines:
    for (let i = 0; i < gLevel.MINES; i++) {
        let rowIdx= getRandomInt(0,gLevel.MINES)
        let colIdx= getRandomInt(0,gLevel.MINES)   
        if(gBoard[rowIdx][colIdx].isMine !== true) gBoard[rowIdx][colIdx].isMine = true
        else  i--
    }

    // DOM:
    gBoard = setMinesNegsCount(gBoard)
}

function setMinesNegsCount(board) {

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
    console.log('board:', board)

    let strHTML = '<table oncontextmenu="return false"><tbody>'
    for (let i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < gLevel.SIZE; j++) {
            let cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" onclick="cellClicked(this, ${i}, ${j})" class="${className}">`
            if (cell.isShown) {
                if (cell.isMarked) strHTML += FLAG
                else if (!cell.isMine) strHTML += NUMS[gBoard[i][j].minesAroundCount]
                else if (cell.isMine) {
                    strHTML += MINE
                }
            }
            strHTML += '</td>'
        }
    }
    strHTML += '</tr>'

    strHTML += '</tbody></table>'
    gElGameBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    gLastBoard = makeCopyBoard(gBoard)
    gBoard[i][j].isShown = true
    elCell.style.backgroundColor = 'rgba(238, 233, 233, 0.521)'
    console.log('elCell:', elCell)
    renderBoard(gBoard)
    if (gBoard[i][j].isMine) {
        gameOver()
    }
    else {
        if (gBoard[i][j].minesAroundCount === 0) {
            expandShown(gBoard, elCell, i, j)
        }
        checkGameOver()
    }
}

function cellMarked(elCell, i, j) {
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    if(gBoard[i][j].isMarked) elCell.innerText = FLAG
    else elCell.innerText = ''
}

function checkGameOver() {
    console.log('CHECK GAME OVER');

}

function expandShown(board, elCell, rowIdx, colIdx) {
    // if (board[rowIdx][colIdx].minesAroundCount !== 0) return

    //run on his negs and check if threr are negs with 0 mines around
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].minesAroundCount === 0) {
                board[i][j].isShown === true
                elCell.style.backgroundColor = '#ababab'
                expandShown(board, elCell, i, j)
            }
            else return
        }
    }
}


function updateNegs(rowIdx, colIdx) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue

        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            // if (gBoard[i][j].isMine= true) continue 
            gBoard[i][j].minesAroundCount += 1
        }
    }
}

function gameOver() {
    console.log('GAME OVER');
    gGame.isOn = false
}

function makeCopyBoard(board) {
    let copyBoard = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        copyBoard[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            copyBoard[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    return copyBoard
}