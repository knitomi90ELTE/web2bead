window.addEventListener('load', init, false);

var CONSTANTS = {
    DEFAULT_ROW_COUNT : 10,
    DEFAULT_COL_COUNT : 10,
    DEFAULT_OBS_COUNT : 2,
    BASE_INTERVAL : 400,
    OBSTACLE_IMAGE : '',
    SNAKE_START : {
        x :0,
        y: 0
    }
};

var game = {
    running : null,
    logging : false,
    round : 1,
    score : 1,
    runnningInterval : CONSTANTS.BASE_INTERVAL
};

var table = {
    tekercs : null,
    obstacles : []
};

var snake = {
    direction : 0,
    cells : []
};
/*
 0 -> jobbra
 1 -> fel
 2 -> balra
 3 -> le
 */

var colCount;
var rowCount;
var obsCount;

var tukrokTekercse = false;

document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            if(game.logging) console.log('left');
            snake.direction = tukrokTekercse ? 0 : 2;
            break;
        case 38:
            if(game.logging) console.log('up');
            snake.direction = tukrokTekercse ? 3 : 1;
            break;
        case 39:
            if(game.logging) console.log('right');
            snake.direction = tukrokTekercse ? 2 : 0;
            break;
        case 40:
            if(game.logging) console.log('down');
            snake.direction = tukrokTekercse ? 1 : 3;
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
        x : Math.floor(Math.random() * rowCount),
        y : Math.floor(Math.random() * colCount)
    };
    return (!isSnake(coord) || !isObstacle(coord)) ? coord : getRandomCell();
}

function getColumn(x, y) {
    if(game.logging) console.log('getColumn',x, y, game.round);
    return $('#gameTable').rows[x].cells[y];
}

function changeColumnColor(cell, color){
    try{
        getColumn(cell.x, cell.y).style.backgroundColor = color;
    }catch (e){
        if(game.logging) console.log('Nincs ilyen cella');
    }
}

function colorColumn(cell) {
    if(game.logging) console.log('colorColumn',cell.x, cell.y, game.round);
    changeColumnColor(cell, 'red');
}

function removeSnakeCell(cell) {
    if(game.logging) console.log('removeSnakeCell',cell.x, cell.y, game.round);
    changeColumnColor(cell, '');
}

function drawSnake() {
    if(game.logging) console.log('drawSnake',game.round);
    snake.cells.forEach(colorColumn);
}

function initSnake() {
    if(game.logging) console.log('initSnake',game.round);
    snake.cells = [CONSTANTS.SNAKE_START];
    snake.cells.forEach(colorColumn);
}

function initObstacles(){
    var k = $('#k').value;
    for(var i = 0; i < k; i++){
        var coord = getRandomCell();
        table.obstacles.push(coord);
        if(game.logging) console.log('Obstacle at ', coord.x, coord.y);
        getColumn(coord.x, coord.y).innerHTML = '<img src="images/obstacle.png" class="obstacle">';
    }
}

function clearTable() {
    $('#gameTable').innerHTML = '';
}

function resetData() {
    $('#n').value = CONSTANTS.DEFAULT_COL_COUNT;
    $('#m').value = CONSTANTS.DEFAULT_ROW_COUNT;
    $('#k').value = CONSTANTS.DEFAULT_OBS_COUNT;
    game.runnningInterval = CONSTANTS.BASE_INTERVAL;
    game.running = null;
    game.score = 1;
    snake.cells = [CONSTANTS.SNAKE_START];
    table.obstacles = [];
    tukrokTekercse = false;
    clearTable();
    hideMyModal();
}

function gameOver() {
    pauseGame();
    showMyModal("Sajnos akadálynak vagy falnak ütköztél");
}

function startGame() {
    game.running = setInterval(moveSnake, game.runnningInterval);
}

function pauseGame() {
    if (game.running) {
        clearInterval(game.running);
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

function getNewSnakePosition(){
    var lastIndex = snake.cells.length - 1;
    var tmp;
    switch (snake.direction) {
        case 0:
            tmp = {x: snake.cells[lastIndex].x, y: snake.cells[lastIndex].y + 1};
            break;
        case 1:
            tmp = {x: snake.cells[lastIndex].x - 1, y: snake.cells[lastIndex].y};
            break;
        case 2:
            tmp = {x: snake.cells[lastIndex].x, y: snake.cells[lastIndex].y - 1};
            break;
        case 3:
            tmp = {x: snake.cells[lastIndex].x + 1, y: snake.cells[lastIndex].y};
            break;
    }
    return tmp;
}

function moveSnake() {
    if(game.logging) console.log('moveSnake',game.round);
    var newPos = getNewSnakePosition();
    if (isPlaceNotOk(newPos)) {
        if(game.logging) console.log('outOfBounds',game.round);
        gameOver();
        return;
    }
    removeSnakeCell(snake.cells[0]);
    snake.cells.shift();
    snake.cells.push(newPos);
    drawSnake();
    game.round++;
}

function isPlaceNotOk(coord){
    return isObstacle(coord) || isOut(coord);
}

function isOut(coord){
    return coord.x < 0 || coord.x > colCount || coord.y < 0 || coord.y > rowCount;
}

function isObstacle(coord){
    /*var isObs = false;
    table.obstacles.map(function(o){
        console.log(o);
        if(coord.x === o.x && coord.y === o.y) {
            isObs = true;
            return;
        };
    });
    return isObs;*/
    return table.obstacles.indexOfObject(coord);
}

function isSnake(coord){
    /*var isSnk = false;
    snake.cells.map(function(o){
        console.log(o);
        if(coord.x === o.x && coord.y === o.y) {
            isSnk = true;
            return;
        };
    });
    return isSnk;*/
    return snake.cells.indexOfObject(coord);
}

Array.prototype.indexOfObject = function(obj){
    var index = -1;
    for(var i = 0; i < this.length; i++){
        var objKeys = Object.keys(obj);
        var itmKeys = Object.keys(this[i]);
        var match = true;
        for(var j = 0; j < itmKeys.length; j++){
            var objKey = objKeys[j];
            var itmKey = itmKeys[j];
            if(this[i][itmKey] !== obj[objKey]){
                match = false;
                break;
            }
        }
        if(match) index = i;
    }
    return index;
};