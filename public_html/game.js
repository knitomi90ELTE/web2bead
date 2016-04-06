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
    mirrorEffect: false,
    reverseEffect: false
};

var formData = {
    colCount: null,
    rowCount: null,
    obsCount: null
};

var snake = {
    direction: 0,
    cells: [],
    extending: 0
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
    wisdom: {//kék
        name: 'Bölcsesség tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            extendSnake(4);
        },
        hasEffect: false
    },
    mirror: {//szürke
        name: 'Tükrök tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name;
            table.mirrorEffect = true;
        },
        hasEffect: true
    },
    reverse: {//zöld
        name: 'Fordítás tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            pauseGame();
            snake.cells.reverse();
            var tmp = snake.cells[snake.cells.length - 1];
            calculateDirection(tmp);
            startGame();
            /*
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
             }*/
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name;
        },
        hasEffect: false
    },
    greedy: {//lila
        name: 'Mohóság tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            game.runnningInterval /= 1.5;
            pauseGame();
            startGame();
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name;
            setTimeout(resetRunningInterval, 5000);
        },
        hasEffect: true
    },
    lazy: {//sárga
        name: 'Lustaság tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            game.runnningInterval *= 1.5;
            pauseGame();
            startGame();
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name;
            setTimeout(resetRunningInterval, 5000);
        },
        hasEffect: true
    },
    voracious: {//piros
        name: 'Falánkság tekercse',
        execute: function () {
            if (game.logging)
                console.log('Executing ' + this.name);
            extendSnake(10);
        },
        hasEffect: false
    }
};

document.onkeydown = function (e) {

    switch (e.keyCode) {
        case 37:
            e.preventDefault();
            if (game.logging)
                console.log('left');
            snake.direction = table.mirrorEffect ? 0 : 2;
            break;
        case 38:
            e.preventDefault();
            if (game.logging)
                console.log('up');
            snake.direction = table.mirrorEffect ? 3 : 1;
            break;
        case 39:
            e.preventDefault();
            if (game.logging)
                console.log('right');
            snake.direction = table.mirrorEffect ? 2 : 0;
            break;
        case 40:
            e.preventDefault();
            if (game.logging)
                console.log('down');
            snake.direction = table.mirrorEffect ? 1 : 3;
            break;
    }
};

function calculateDirection(cell) {
    console.log("calculateDirection");
    var neighbourCells = [
        {x: cell.x + 1, y: cell.y, dir: 2},
        {x: cell.x - 1, y: cell.y, dir: 0},
        {x: cell.x, y: cell.y + 1, dir: 1},
        {x: cell.x, y: cell.y - 1, dir: 3}
    ];

    for (cell in neighbourCells) {
        if (snake.cells.indexOfObject({x: cell.x, y: cell.y}) !== -1) {
            snake.direction = cell.dir;
            console.log("newdirfound");
            break;
        }
    }
}

function init() {
    $('#startGame').addEventListener('click', startGame, false);
    $('#pauseGame').addEventListener('click', pauseGame, false);
    $('#generateButton').addEventListener('click', generateTable, false);
    $('#newGame').addEventListener('click', resetData, false);
}

function getRandomCell() {
    var coord = {
        x: Math.floor(Math.random() * formData.rowCount),
        y: Math.floor(Math.random() * formData.colCount)
    };
    return (isSnake(coord) || isObstacle(coord)) ? getRandomCell() : coord;
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
    //changeColumnColor(cell, '#36381B');
    getColumn(cell.x, cell.y).innerHTML = '<img src="images/body.png" class="snake-body">';
}

function removeSnakeCell(cell) {
    if (game.logging)
        console.log('removeSnakeCell', cell.x, cell.y, game.round);
    //changeColumnColor(cell, '');
    getColumn(cell.x, cell.y).innerHTML = '';
}

function extendSnake(value) {
    game.score += value;
    updateScoreLabel();
    snake.extending = value;
}

function drawSnake() {
    if (game.logging)
        console.log('drawSnake', game.round);
    snake.cells.forEach(colorColumn);
    var head = snake.cells[snake.cells.length - 1];
    getColumn(head.x, head.y).innerHTML = '<img src="images/head_' + snake.direction + '.png" class="snake-body">';
}

function initSnake() {
    if (game.logging)
        console.log('initSnake', game.round);
    snake.cells = [CONSTANTS.SNAKE_START];
    var head = snake.cells[snake.cells.length - 1];
    getColumn(head.x, head.y).innerHTML = '<img src="images/head_' + snake.direction + '.png" class="snake-body">';

}

function initObstacles() {
    //var k = $('#k').value;
    for (var i = 0; i < formData.obsCount; i++) {
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
var first = true;
function getScroll() {
    /*var x = Math.floor(Math.random() * 100);
     if (x < 80) {
     return 'wisdom';
     } else if (x < 84) {
     return 'mirror';
     } else if (x < 88) {
     return 'reverse';
     } else if (x < 92) {
     return 'greedy';
     } else if (x < 96) {
     return 'lazy';
     } else {
     return 'voracious';
     }*/
    if (first) {
        first = false;
        return 'wisdom';
    } else {
        return 'reverse';
    }
}

function removeScrollEffects() {
    table.mirrorEffect = false;
    if (game.runnningInterval !== CONSTANTS.BASE_INTERVAL) {
        game.runnningInterval = CONSTANTS.BASE_INTERVAL;
        pauseGame();
        startGame();
    }

}

function removeScroll() {
    getColumn(table.scrollOnTable.position.x, table.scrollOnTable.position.y).innerHTML = '';
    if (table.scrollOnTable.type.hasEffect) {
        removeScrollEffects();
    }
}

function placeScroll() {
    var coord = getRandomCell();
    var type = getScroll();
    table.scrollOnTable.position = coord;
    table.scrollOnTable.type = scrolls[type];
    getColumn(coord.x, coord.y).innerHTML = '<img src="images/' + type + '.png" class="sm-img">';

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
    snake.direction = 0;
    table.obstacles = [];
    table.mirrorEffect = false;
    updateScoreLabel();
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



function resetRunningInterval() {
    game.runnningInterval = CONSTANTS.BASE_INTERVAL;
    pauseGame();
    startGame();
}

function updateScoreLabel() {
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

    formData.colCount = $('#n').value;
    formData.rowCount = $('#m').value;
    formData.obsCount = $('#k').value;
    if (formData.colCount < 3 || formData.rowCount < 3) {
        return;
    }
    resetData();
    $('#gameTable').innerHTML = generateHtml();
    initSnake();
    initObstacles();
    placeScroll();
    updateScoreLabel();
    enableButtons();
}

function generateHtml() {
    var tableHtml = '';
    for (var i = 0; i < formData.rowCount; i++) {
        tableHtml += '<tr>';
        for (var j = 0; j < formData.colCount; j++) {
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
    if (isTheSamePosition(newPos, table.scrollOnTable.position)) {
        removeScroll();
        table.scrollOnTable.type.execute();
        placeScroll();
    }
    if (snake.extending <= 0) {
        removeSnakeCell(snake.cells[0]);
        snake.cells.shift();
    }
    snake.extending--;
    snake.cells.push(newPos);
    drawSnake();
    game.round++;
}

function isPlaceNotOk(coord) {
    return isObstacle(coord) || isOut(coord) || isSnake(coord);
}

function isOut(coord) {
    return coord.x < 0 || coord.x >= formData.colCount || coord.y < 0 || coord.y >= formData.rowCount;
}

function isObstacle(coord) {
    return table.obstacles.indexOfObject(coord) !== -1;
}

function isSnake(coord) {
    return snake.cells.indexOfObject(coord) !== -1;
}

function isTheSamePosition(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

Object.prototype.isTheSameObject = function (obj) {
    var objKeys = Object.keys(obj);
    var myKeys = Object.keys(this);
    var match = true;
    for (var i = 0; i < myKeys.length; i++) {
        var objKey = objKeys[i];
        var myKey = myKeys[i];
        if (this[myKey] !== obj[objKey]) {
            match = false;
            break;
        }
    }
    return match;
};

Array.prototype.indexOfObject = function (obj) {
    var index = -1;
    for (var i = 0; i < this.length; i++) {
        if (obj.isTheSameObject(this[i])) {
            index = i;
            break;
        }
    }
    return index;
};