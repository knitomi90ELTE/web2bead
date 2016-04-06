window.addEventListener('load', init, false);

var CONSTANTS = {
    DEFAULT_ROW_COUNT: 10,
    DEFAULT_COL_COUNT: 10,
    DEFAULT_OBS_COUNT: 2,
    SNAKE_START: {
        x: 0,
        y: 0
    },
    DEFAULT_SNAKE: {
        direction: 0,
        cells: [],
        extending: 0
    },
    DEFAULT_GAME: {
        running: null,
        score: 1,
        runnningInterval: 400
    },
    DEFAULT_TABLE: {
        scrollOnTable: {
            type: null,
            position: null
        },
        obstacles: [],
        mirrorEffect: false,
        reverseEffect: false
    }
};

var game = CONSTANTS.DEFAULT_GAME;
var table = CONSTANTS.DEFAULT_TABLE;
var snake = CONSTANTS.DEFAULT_SNAKE;
var formData = {
    colCount: null,
    rowCount: null,
    obsCount: null
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
            extendSnake(4);
        },
        hasEffect: false
    },
    mirror: {//szürke
        name: 'Tükrök tekercse',
        execute: function () {
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name;
            table.mirrorEffect = true;
        },
        hasEffect: true
    },
    reverse: {//zöld
        name: 'Fordítás tekercse',
        execute: function () {
            pauseGame();
            snake.cells.reverse();
            calculateDirection(snake.cells[snake.cells.length - 1]);
            table.reverseEffect = true;
            startGame();
            $('#scroll').innerHTML = 'Aktív tekercs: ' + this.name + ' (nem működik)';
        },
        hasEffect: false
    },
    greedy: {//lila
        name: 'Mohóság tekercse',
        execute: function () {
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
            extendSnake(10);
        },
        hasEffect: false
    }
};

var directions = {
    keyCodes: [37, 38, 39, 40],
    39: {//jobbra
        true: 2,
        false: 0
    },
    38: {//fel
        true: 3,
        false: 1
    },
    37: {//bal
        true: 0,
        false: 2
    },
    40: {//le
        true: 1,
        false: 3
    }
};
document.onkeydown = function (e) {
    if (directions.keyCodes.indexOf(e.keyCode) !== -1) {
        e.preventDefault();
        snake.direction = directions[e.keyCode][table.mirrorEffect];
    }
};

function calculateDirection(cell) {
    var neighbourCells = [
        {x: cell.x + 1, y: cell.y, dir: 1},
        {x: cell.x - 1, y: cell.y, dir: 3},
        {x: cell.x, y: cell.y + 1, dir: 2},
        {x: cell.x, y: cell.y - 1, dir: 0}
    ];

    for (var i = 0; i < neighbourCells.length; i++) {
        if (snake.cells.indexOfObject({x: neighbourCells[i].x, y: neighbourCells[i].y}) !== -1) {
            snake.direction = neighbourCells[i].dir;
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
    return $('#gameTable').rows[x].cells[y];
}

function changeColumnColor(cell, color) {
    getColumn(cell.x, cell.y).style.backgroundColor = color;
}

function colorColumn(cell) {
    getColumn(cell.x, cell.y).innerHTML = '<img src="images/body.png" class="snake-body">';
}

function removeSnakeCell(cell) {
    getColumn(cell.x, cell.y).innerHTML = '';
}

function extendSnake(value) {
    game.score += value;
    updateScoreLabel();
    snake.extending = value;
}

function drawSnake() {
    snake.cells.forEach(colorColumn);
    if (table.reverseEffect) {
        table.reverseEffect = false;
        return;
    }
    var head = snake.cells[snake.cells.length - 1];
    getColumn(head.x, head.y).innerHTML = '<img src="images/head_' + snake.direction + '.png" class="snake-body">';
}

function initSnake() {
    snake.cells = [CONSTANTS.SNAKE_START];
    var head = snake.cells[snake.cells.length - 1];
    getColumn(head.x, head.y).innerHTML = '<img src="images/head_' + snake.direction + '.png" class="snake-body">';
}

function initObstacles() {
    for (var i = 0; i < formData.obsCount; i++) {
        var coord = getRandomCell();
        table.obstacles.push(coord);
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
    var x = Math.floor(Math.random() * 100);
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
    }/*
     if (first) {
     first = false;
     return 'wisdom';
     } else {
     return 'reverse';
     }*/
}

function removeScrollEffects() {
    table.mirrorEffect = false;
    if (game.runnningInterval !== CONSTANTS.DEFAULT_GAME.runnningInterval) {
        game.runnningInterval = CONSTANTS.DEFAULT_GAME.runnningInterval;
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
    game = CONSTANTS.DEFAULT_GAME;
    table = CONSTANTS.DEFAULT_TABLE;
    snake = CONSTANTS.DEFAULT_SNAKE;
    updateScoreLabel();
    clearTable();
    hideMyModal();
}

function gameOver() {
    pauseGame();
    showMyModal("Sajnos akadálynak vagy falnak ütköztél");
}

function startGame() {
    if (!game.running) {
        console.log("startGame");
        game.running = setInterval(moveSnake, game.runnningInterval);
    }
}

function pauseGame() {
    if (game.running) {
        console.log("pauseGame");
        clearInterval(game.running);
        game.running = null;
    }
}

function resetRunningInterval() {
    console.log("resetRunningInterval");
    game.runnningInterval = CONSTANTS.DEFAULT_GAME.runnningInterval;
    pauseGame();
    startGame();
}

function updateScoreLabel() {
    $('#score').innerHTML = 'Score: ' + game.score;
}
/*
 function disableButtons() {
 $('#startGame').classList.add("disabled");
 $('#pauseGame').classList.add("disabled");
 }
 
 function enableButtons() {
 $('#startGame').classList.remove("disabled");
 $('#pauseGame').classList.remove("disabled");
 }
 */
function generateTable() {

    if (!game.running) {
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
        //enableButtons();
    }
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
    var newPos = getNewSnakePosition();
    if (isPlaceNotOk(newPos)) {
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