window.addEventListener('load', init, false);

var CONSTANTS = {
    DEFAULT_ROW_COUNT: 10,
    DEFAULT_COL_COUNT: 10,
    DEFAULT_OBS_COUNT: 2,
    BASE_INTERVAL: 400,
    SNAKE_START: {
        x: 0,
        y: 0
    }
};

var game = {
    running: null,
    logging: false,
    round: 1,
    score: 1,
    runnningInterval: CONSTANTS.BASE_INTERVAL
};

var table = {
    scrollOnTable: {
        type: null,
        position: null
    },
    obstacles: [],
    mirrorEffect: false
};

var snake = {
    direction: 0,
    cells: []
};
/*
 0 -> jobbra
 1 -> fel
 2 -> balra
 3 -> le
 */
/*
 Bölcsesség tekercse (80%): a sárkány 4 egységgel növekszik tőle.
 Tükrök tekercse (4%): az irányítás tükörképben történik irányonként (fel helyett le, bal helyett jobb).
 Fordítás tekercse (4%): a sárkány haladási iránya megfordul (feje és farka helyett cserél).
 Mohóság tekercse (4%): a sárkány haladási sebessége másfélszeresére nő 5 másodpercig.
 Lustaság tekercse (4%): a sárkány haladási sebessége másfélszeresére csökken 5 másodpercig.
 Falánkság tekercse (4%): a sárkány 10 egységgel növekszik tőle.
 */
var scrolls = {
    wisdom: {
        name: 'Bölcsesség tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            extendSnake(4);
        }
    },
    mirror: {
        name: 'Tükrök tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            table.mirrorEffect = true;
        }
    },
    reverse: {
        name: 'Fordítás tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            switch (snake.direction) {
                case 0:
                    snake.direction = 2;
                    break;
                case 1:
                    snake.direction = 3;
                    break;
                case 2:
                    snake.direction = 0;
                    break;
                case 3:
                    snake.direction = 1;
                    break;
            }
        }
    },
    greedy: {
        name: 'Mohóság tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            game.runnningInterval *= 1.5;
            pauseGame();
            startGame();
        }
    },
    lazy: {
        name: 'Lustaság tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            game.runnningInterval /= 1.5;
            pauseGame();
            startGame();
        }
    },
    voracious: {
        name: 'Falánkság tekercse',
        execute: function () {
            if(game.logging) console.log('Executing ' + this.name);
            extendSnake(10);
        }
    }
};
var colCount;
var rowCount;
var obsCount;

var tukrokTekercse = false;

document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            if (game.logging)
                console.log('left');
            snake.direction = tukrokTekercse ? 0 : 2;
            break;
        case 38:
            if (game.logging)
                console.log('up');
            snake.direction = tukrokTekercse ? 3 : 1;
            break;
        case 39:
            if (game.logging)
                console.log('right');
            snake.direction = tukrokTekercse ? 2 : 0;
            break;
        case 40:
            if (game.logging)
                console.log('down');
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

function getRandomCell() {
    var coord = {
        x: Math.floor(Math.random() * rowCount),
        y: Math.floor(Math.random() * colCount)
    };
    return (isSnake(coord) || !isObstacle(coord)) ? coord : getRandomCell();
}

function getColumn(x, y) {
    if (game.logging)
        console.log('getColumn', x, y, game.round);
    return $('#gameTable').rows[x].cells[y];
}

function changeColumnColor(cell, color) {
    try {
        getColumn(cell.x, cell.y).style.backgroundColor = color;
    } catch (e) {
        if (game.logging)
            console.log('Nincs ilyen cella');
    }
}

function colorColumn(cell) {
    if (game.logging)
        console.log('colorColumn', cell.x, cell.y, game.round);
    changeColumnColor(cell, 'red');
}

function removeSnakeCell(cell) {
    if (game.logging)
        console.log('removeSnakeCell', cell.x, cell.y, game.round);
    changeColumnColor(cell, '');
}

function extendSnake(value) {
    game.score += value;
    updateScoreLabel();
}

function drawSnake() {
    if (game.logging)
        console.log('drawSnake', game.round);
    snake.cells.forEach(colorColumn);
}

function initSnake() {
    if (game.logging)
        console.log('initSnake', game.round);
    snake.cells = [CONSTANTS.SNAKE_START];
    snake.cells.forEach(colorColumn);
}

function initObstacles() {
    var k = $('#k').value;
    for (var i = 0; i < k; i++) {
        var coord = getRandomCell();
        table.obstacles.push(coord);
        if (game.logging)
            console.log('Obstacle at ', coord.x, coord.y);
        getColumn(coord.x, coord.y).innerHTML = '<img src="images/obstacle.png" class="sm-img">';
    }
}

/*
0-79
80-83
84-87
88-91
92-95
96-99
 */
function getScroll() {
    var x = Math.floor(Math.random() * 100);
    if (x < 80) {
        return 'wisdom';
    } else if (x < 84) {
        return 'mirror';
    } else if (x < 88) {
        return 'reverse';
    } else if (x < 92) {
        return 'greedy';
    } else if (x < 96){
        return 'lazy';
    } else {
        return 'voracious';
    }
}


function placeScroll() {
    var coord = getRandomCell();
    var type = getScroll();
    table.scrollOnTable.position = coord;
    table.scrollOnTable.type = scrolls[type];
    getColumn(coord.x, coord.y).innerHTML = '<img src="images/' + type + '.png" class="sm-img">';
    $('#scroll').innerHTML = type;
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

function updateScoreLabel(){
    $('#score').innerHTML = 'Score: ' + game.score;
}

function disableButtons() {
    $('#startGame').classList.add("disabled");
    $('#pauseGame').classList.add("disabled");
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
    placeScroll();
    updateScoreLabel();
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

function getNewSnakePosition() {
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
    if (game.logging)
        console.log('moveSnake', game.round);
    var newPos = getNewSnakePosition();
    if (isPlaceNotOk(newPos)) {
        if (game.logging)
            console.log('outOfBounds', game.round);
        gameOver();
        return;
    }
    
    if (isTheSamePosition(newPos, table.scrollOnTable.position)){
        table.scrollOnTable.type.execute();
    }


    removeSnakeCell(snake.cells[0]);
    snake.cells.shift();
    snake.cells.push(newPos);
    drawSnake();
    game.round++;
}

function isPlaceNotOk(coord) {
    return isObstacle(coord) || isOut(coord);
}

function isOut(coord) {
    return coord.x < 0 || coord.x >= colCount || coord.y < 0 || coord.y >= rowCount;
}

function isObstacle(coord) {
    return table.obstacles.indexOfObject(coord) !== -1;
}

function isSnake(coord) {
    return snake.cells.indexOfObject(coord) !== -1;
}

function isTheSamePosition(p1, p2){
    return p1.x === p2.x && p1.y === p1.y;
}

Array.prototype.indexOfObject = function (obj) {
    var index = -1;
    for (var i = 0; i < this.length; i++) {
        var objKeys = Object.keys(obj);
        var itmKeys = Object.keys(this[i]);
        var match = true;
        for (var j = 0; j < itmKeys.length; j++) {
            var objKey = objKeys[j];
            var itmKey = itmKeys[j];
            if (this[i][itmKey] !== obj[objKey]) {
                match = false;
                break;
            }
        }
        if (match)
            index = i;
    }
    return index;
};