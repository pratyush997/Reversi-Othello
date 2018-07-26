$(document).ready(function () {
    initBoard();
});

///Static Consts

{
    player = 2;
    var tileColor = {
        "blank": 0,
        "white": 1,
        "black": 2
    }

    var Board = [];

    dirMatrix = [
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1]
    ];

    side = 8;

    res1 = [];
    res2 = [];
}


function initBoard() {
    makeBoard();
    drawBoard();
    paintBoard();
    suggestValidMoves();
    highlightMoves();
}

/// Initializes the map which stores the coordinates - color values

function makeBoard() {

    var coord = {
        x: 0,
        y: 0
    }

    for (var i = 0; i < side; i++) {
        for (var j = 0; j < side; j++) {

            var Tile = {
                coordinates: {},
                color: 0
            }

            Tile.coordinates.x = i;
            Tile.coordinates.y = j;

            // To mark the coordinates at center with corresponsing white and black tiles

            if (i == Math.floor(side / 2) - 1 && j == Math.floor(side / 2) - 1 || i == Math.floor(side / 2) && j == Math.floor(side / 2)) {
                Tile.color = tileColor.white;
                Board.push(Tile);
            }
            else

                if (i == Math.floor(side / 2) - 1 && j == Math.floor(side / 2) || i == Math.floor(side / 2) && j == Math.floor(side / 2) - 1) {
                    Tile.color = tileColor.black;
                    Board.push(Tile);
                }
                else {
                    Board.push(Tile);
                }
        }
    }
    sessionStorage.setItem('board', JSON.stringify(Board));
}

// Draws table rows and cells on the UI

function drawBoard() {
    for (var i = 0; i < side; i++) {
        var col = "";
        for (var j = 0; j < side; j++) {
            col += "<td onclick='selectCell(" + i + "," + j + ")' id='cell" + i + "" + j + "'><div class=\"disc\"></div></td>";
        }
        $("#board").append("<tr>" + col + "</tr>");
    }
}

// Retrieves the key-val pair and paints them Black or White depending upon the color value
// Counts the corresponding tiles and updates the score
// Contains end-game logic.

function paintBoard() {
    var count = [0, 0];
    var obj = JSON.parse(sessionStorage.board);

    for (var i = 0; i < obj.length; i++) {
        if (obj[i].color == 1) {
            var cood = "#cell" + obj[i].coordinates.x + "" + obj[i].coordinates.y + "> div.disc";
            $(cood).removeClass("black");
            $(cood).addClass("white");
            count[0]++;
        }
        else if (obj[i].color == 2) {
            var cood = "#cell" + obj[i].coordinates.x + "" + obj[i].coordinates.y + "> div.disc";
            $(cood).removeClass("white");
            $(cood).addClass("black");
            count[1]++;
        }
    }
    score[0] = count[0];
    score[1] = count[1];

    $("#score").html("White: " + score[0] + " - Black: " + score[1]);

    if (score[0] + score[1] == side * side || score[0] == 0 || score[1] == 0) {
        if (score[0] > score[1]) {
            $("#score").html("Score: " + score[0] + " - " + score[1]);
            $("#colorTurn").html("White Wins");
        }
        else if (score[0] < score[1]) {
            $("#score").html("Score: " + score[1] + " - " + score[0]);
            $("#colorTurn").html("Black Wins");
        }
        if (score[0] == score[1]) {
            $("#score").html("");

            $("#colorTurn").html("Game Draw");
        }
    }
    dropResMatrix();
}

//Resets the temp coordinate Matrices

function dropResMatrix() {
    res1 = [];
    res2 = [];
}

// Individually feeds the Ally coords to the CaclValidMoves function

function suggestValidMoves() {

    placedTile = [];
    var coord = {
        x: 0,
        y: 0
    }
    var obj = JSON.parse(sessionStorage.board);
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].color == player) {
            coord = obj[i].coordinates;
            placedTile.push(coord);
        }
    }
    for (var i = 0; i < placedTile.length; i++) {
        calcValidMoves(placedTile[i].x, placedTile[i].y);
    }
}

//Checks boundary and all the 8 directions for prospective paintable tiles.

function calcValidMoves(x, y) {

    var obj = JSON.parse(sessionStorage.board);

    var series = 0;
    for (var i = 0; i < dirMatrix.length ; i++) {
        var series = 0;

        var cordTemp = {
            x: 0,
            y: 0
        };

        cordTemp.x = x + dirMatrix[i][0];
        cordTemp.y = y + dirMatrix[i][1];
        while (isEnemyTile(cordTemp.x, cordTemp.y) && checkBoundary(cordTemp.x, cordTemp.y)) {
            series++;       //calc max line
            cordTemp.x += dirMatrix[i][0];
            cordTemp.y += dirMatrix[i][1];
            if (series != 1) {
                res1.pop(); //doesn't pop?
            }
            if ((cordTemp.x > -1) && checkBoundary(cordTemp.x, cordTemp.y)) {
                res1.push(cordTemp);
            }
        }
    }
}

//Boundary Check

function checkBoundary(x, y) {
    if (((x > -1) && (x < side)) && (y > -1 && y < side)) {
        return true;
    }
    else return false;
}

// Marks the suggested tile.

function highlightMoves() {
    var obj = JSON.parse(sessionStorage.board);

    for (var i = 0; i < obj.length; i++) {
        for (var j = 0; j < res1.length; j++) {
            if ((obj[i].coordinates.x == res1[j].x) && (obj[i].coordinates.y == res1[j].y)) {
                if (obj[i].color == 0) {
                    x = res1[j].x;
                    y = res1[j].y;
                    col = "#cell" + x + "" + y;
                    $(col).addClass("suggestTiles");
                }
            }
        }
    }
}

//

function selectCell(x, y) {

    var obj = JSON.parse(sessionStorage.board);
    var changedTile = 0;
    for (var i = 0; i < res1.length; i++) {
        if (res1[i].x == x && res1[i].y == y) {
            for (var i = 0; i < obj.length; i++) {
                if ((obj[i].coordinates.x == x) && (obj[i].coordinates.y == y) && (obj[i].color == 0)) {
                    obj[i].color = player;
                    changedTile = 1;
                }
            }
        }
    }

    if (changedTile) {
        sessionStorage.setItem('board', JSON.stringify(obj));
        flipTiles(x, y);
        removeSuggestions();
        changeTurn();
        paintBoard();
        suggestValidMoves();
        highlightMoves();
    }
}

function flipTiles(x, y) {
    calcBackValidMoves(x, y);
    flipLogic();
}

function calcBackValidMoves(x, y) {
    //to find the tiles to be painted

    for (var i = 0; i < dirMatrix.length ; i++) {
        var cordTempA = {
            x: 0,
            y: 0
        }
        res3 = [];
        cordTempA.x = x + dirMatrix[i][0];
        cordTempA.y = y + dirMatrix[i][1];
        while (isEnemyTile(cordTempA.x, cordTempA.y) && checkBoundary(cordTempA.x, cordTempA.y)) {
            res3.push({ x: cordTempA.x, y: cordTempA.y });
            cordTempA.x += dirMatrix[i][0];
            cordTempA.y += dirMatrix[i][1];
            if (isAllyTile(cordTempA.x, cordTempA.y) && checkBoundary(cordTempA.x, cordTempA.y)) {
                res2 = res2.concat(res3);
            }
        }
    }
}

function flipLogic() {
    // To mark the selected tile in the map
    var obj = JSON.parse(sessionStorage.board);
    for (var i = 0; i < obj.length; i++) {
        for (var j = 0; j < res2.length; j++) {
            if ((res2[j].x == obj[i].coordinates.x) && (res2[j].y == obj[i].coordinates.y)) {
                obj[i].color = player;
            }
        }
    }
    sessionStorage.setItem('board', JSON.stringify(obj));
}

function changeTurn() {
    var obj = JSON.parse(sessionStorage.board);

    if ((player == 2)) {
        player = 1;
        $("#colorTurn").html("Turn: White");

    } else if ((player == 1)) {
        player = 2;
        $("#colorTurn").html("Turn: Black");
    }
}

function passTurn() {
    removeSuggestions();
    changeTurn();
    paintBoard();
    suggestValidMoves();
    highlightMoves();
}

function removeSuggestions() {
    for (var i = 0; i < res1.length; i++) {
        x = res1[i].x;
        y = res1[i].y;

        col = "#cell" + x + "" + y;
        $(col).removeClass("suggestTiles");
    }
}

function isEnemyTile(x, y) {
    var obj = JSON.parse(sessionStorage.board);
    for (var i = 0; i < obj.length; i++) {
        if ((obj[i].coordinates.x == x) && (obj[i].coordinates.y == y)) {
            if ((obj[i].color != player) && ((obj[i].color != 0))) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}

function isAllyTile(x, y) {
    var obj = JSON.parse(sessionStorage.board);
    for (var i = 0; i < obj.length; i++) {
        if ((obj[i].coordinates.x == x) && (obj[i].coordinates.y == y)) {
            if (obj[i].color == player) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
