window.addEventListener('load', init, false);


var CONSTANTS = {
    DEFAULT_ROW_COUNT : 10,
    DEFAULT_COL_COUNT : 10,
    DEFAULT_OBS_COUNT : 2,
    BASE_INTERVAL : 400,
    OBSTACLE_IMAGE : ''
};

var gameRunning = null;
var colCount;
var rowCount;
var obsCount;
var tukrokTekercse = false;
var runnningInterval = CONSTANTS.BASE_INTERVAL;
var score = 1;
var round = 1;
var snakeCells = [
    {
        x: 0,
        y: 0
    }
];

var obstacles = [];
var tekercsPosition;

var direction = 0;
/*
 0 -> jobbra
 1 -> fel
 2 -> balra
 3 -> le
 */

document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            console.log('left');
            direction = tukrokTekercse ? 0 : 2;
            break;
        case 38:
            console.log('up');
            direction = tukrokTekercse ? 3 : 1;
            break;
        case 39:
            console.log('right');
            direction = tukrokTekercse ? 2 : 0;
            break;
        case 40:
            console.log('down');
            direction = tukrokTekercse ? 1 : 3;
            break;
    }
};

function init() {
    $('#startGame').addEventListener('click', startGame, false);
    $('#pauseGame').addEventListener('click', pauseGame, false);
    $('#generateButton').addEventListener('click', generateTable, false);
    $('#newGame').addEventListener('click', resetData, false);
}

function getRandomCell(){
    var coord = {
        x : Math.floor(Math.random() * rowCount) + 1,
        y : Math.floor(Math.random() * colCount) + 1
    };
    return (snakeCells.indexOf(coord) !== -1 || obstacles.indexOf(coord) !== 1) ? coord : getRandomCell();
}

function getColumn(x, y) {
    console.log('getColumn',x, y, round);
    return $('#gameTable').rows[x].cells[y];
}

function colorColumn(cell) {
    console.log('colorColumn',cell.x, cell.y, round);
    getColumn(cell.x, cell.y).style.backgroundColor = 'red';
}

function removeSnakeCell(cell) {
    console.log('removeSnakeCell',cell.x, cell.y, round);
    getColumn(cell.x, cell.y).style.backgroundColor = '';
}

function drawSnake() {
    console.log('drawSnake',round);
    snakeCells.forEach(colorColumn);
}

function initSnake() {
    console.log('initSnake',round);
    snakeCells.forEach(colorColumn);
}

function initObstacles(){
    var k = $('#k').value;
    for(var i = 0; i < k; i++){
        var coord = getRandomCell();
        //getColumn(coord.x, coord.y).style.backgroundImage
    }
}

function clearTable() {
    $('#gameTable').innerHTML = '';
}

function resetData() {
    $('#n').value = CONSTANTS.DEFAULT_COL_COUNT;
    $('#m').value = CONSTANTS.DEFAULT_ROW_COUNT;
    $('#k').value = CONSTANTS.DEFAULT_OBS_COUNT;
    runnningInterval = CONSTANTS.BASE_INTERVAL;
    gameRunning = null;
    tukrokTekercse = false;
    score = 1;
    clearTable();
    hideMyModal();
}

function gameOver() {
    pauseGame();
    showMyModal("Sajnos akadálynak vagy falnak ütköztél");
}

function startGame() {
    gameRunning = setInterval(moveSnake, runnningInterval);
}

function pauseGame() {
    if (gameRunning) {
        clearInterval(gameRunning);
    }
}

function enableButtons() {
    $('#startGame').classList.remove("disabled");
    $('#pauseGame').classList.remove("disabled");
}

function generateTable() {
    colCount = $('#n').value;
    rowCount = $('#m').value;
    if (colCount < 3 || rowCount < 3) {
        return;
    }
    clearTable();
    $('#gameTable').innerHTML = generateHtml();
    initSnake();
    initObstacles();
    enableButtons();

}

function generateHtml() {
    var tableHtml = '';
    for (var i = 0; i < rowCount; i++) {
        tableHtml += '<tr>';
        for (var j = 0; j < colCount; j++) {
            tableHtml += '<td class="cell"></td>';
        }
        tableHtml += '</tr>';
    }
    return tableHtml;
}

function moveSnake() {
    console.log('moveSnake',round);
    var lastIndex = snakeCells.length - 1;
    var tmp;
    switch (direction) {
        case 0:
            tmp = {x: snakeCells[lastIndex].x, y: snakeCells[lastIndex].y + 1};
            break;
        case 1:
            tmp = {x: snakeCells[lastIndex].x - 1, y: snakeCells[lastIndex].y};
            break;
        case 2:
            tmp = {x: snakeCells[lastIndex].x, y: snakeCells[lastIndex].y - 1};
            break;
        case 3:
            tmp = {x: snakeCells[lastIndex].x + 1, y: snakeCells[lastIndex].y};
            break;
    }

    if (tmp.x < 0 || tmp.x > colCount || tmp.y < 0 || tmp.y > rowCount) {
        console.log('outOfBounds',round);
        gameOver();
        return;
    }
    removeSnakeCell(snakeCells[0]);
    snakeCells.shift();
    snakeCells.push(tmp);
    drawSnake();
    round++;
}


