window.addEventListener('load', init, false);

var gameRunning = null;
var colCount;
var rowCount;
var tukrokTekercse = false;
var basicInterval = 400;
var score = 1;
var snakeCells = [
    {
        x: 0,
        y: 0
    }
];

var direction = 0;
/*
 0 -> jobbra
 1 -> fel
 2 -> balra
 3 -> le
 */

document.onkeydown = function(e) {
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
    $('#stopGame').addEventListener('click', stopGame, false);
    $('#generateButton').addEventListener('click', generateTable, false);
}

function getColumn(x, y) {
    return $('#gameTable').rows[x].cells[y];
}

function colorColumn(cell) {
    getColumn(cell.x, cell.y).style.backgroundColor = 'red';
}

function removeSnakeCell(cell) {
    getColumn(cell.x, cell.y).style.backgroundColor = '';
}

function drawSnake() {
    snakeCells.forEach(colorColumn);
}

function initSnake() {
    console.log('initSnake');
    snakeCells.forEach(colorColumn);
}

function moveSnake() {

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
    
    if(tmp.x < 0 || tmp.x > colCount || tmp.y < 0 || tmp.y > rowCount){
        stopGame();
        showMyModal("Sajnos akadálynak vagy falnak ütköztél");
        return;
    }
    removeSnakeCell(snakeCells[0]);
    snakeCells.shift();
    snakeCells.push(tmp);

    drawSnake();

}

function startGame() {
    gameRunning = setInterval(moveSnake, basicInterval);
}

function stopGame(){
    if(gameRunning){
        clearInterval(gameRunning);
    }
}

function resetGame(){
    stopGame();
    
}

function enableButtons(){
    $('#startGame').classList.remove("disabled");
    $('#stopGame').classList.remove("disabled");
}

function generateTable(){
    colCount = $('#n').value;
    rowCount = $('#m').value;
    if(colCount < 3 || rowCount < 3) {
        return;
    }
    $('#gameTable').innerHTML = generateHtml();
    initSnake();
    enableButtons();
    
}

function generateHtml(){
    var tableHtml = '';
    for(var i = 0; i < rowCount; i++){
        tableHtml += '<tr>';
        for (var j = 0; j < colCount; j++){
            tableHtml += '<td class="cell"></td>';
        }
        tableHtml += '</tr>';
    }
    return tableHtml;
}



