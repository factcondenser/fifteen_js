// canvas vars
var canvas = document.getElementById("myCanvas"),
    ctx = canvas.getContext("2d");
// button vars
const BUTTON_ROW_COUNT = 2;
const BUTTON_COL_COUNT = 4;
var buttonWidth = 100,
    buttonHeight = 50,
    buttonPadding = 50,
    buttonOffsetLeft = 125,
    buttonOffsetTop = 325,
    buttons = [];
const buttonStyle = new style("#fff", "28px Arial", "#000");
const buttonHoverStyle = new style("#ddd", "bold italic 24px Arial", "#000");
// tile vars
var tileWidth = 50,
    tileHeight = 50,
    tilePadding = 50,
    tileOffSetLeft,
    tileOffsetTop,
    tiles = [],
    dx = 3,
    dy = 3;
const tileStyle = new style("#fff", "24px Arial", "#000");
const tileHoverStyle = new style("#ff0", "bold italic 24px Arial", "#000");
const emptyStyle = new style("", "", "");
// board vars
var d,
    empX,
    empY;
// game vars
var playing = false;
// rainbow vars
const COLORS = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
const TEXT_ALIGN = "center";
const FONT = "bold 32px Arial";
const CHAR_D = 24;
var colorNum = 0,
    curRainbow,
    chars,
    txtWd,
    startX,
    yPos;

// constructors
function style(f, ts, tc) {
    this.fill = f;
    this.textStyle = ts;
    this.textColor = tc;
}
// An interect is a rectangle with which users may interact.
function interect(xpos, ypos, wd, ht, txt, sty, val, ord) {
    this.x = xpos;
    this.y = ypos;
    this.width = wd;
    this.height = ht;
    this.text = txt;
    this.style = sty;
    this.value = val;
    this.ordinal = ord;
}

/**
 * Clears canvas.
 */
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Greets player.
 */
function greet() {
    clear();
    ctx.textAlign = "center";
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#fff";
    rainbow("WELCOME TO GAME OF FIFTEEN", canvas.width / 2, 200);
    ctx.font = "24px Arial";
    ctx.fillText("Please choose a board size", canvas.width / 2, 275);
    initializeButtons();
    drawButtons();
    // bind the click and mousemove events to the canvas
    canvas.addEventListener('click', clickHandler, false);
    canvas.addEventListener('mousemove', mousemoveHandler, false);
}

function clickHandler(e) {
    var mousePos = getMousePos(canvas, e);
    if (playing) {
        for (let r = 0; r < d; r++) {
            for (let c = 0; c < d; c++) {
                if (isInside(mousePos, tiles[r][c])) {
                    move(tiles[r][c]);
                }
            }
        }
    } else {
        for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
            for (let c = 0; c < BUTTON_COL_COUNT; c++) {
                if (isInside(mousePos, buttons[r][c])) {
                    // update board dimension variable based on user input
                    d = buttons[r][c].value;
                    initializeTiles();
                    stopRainbow();
                    clear();
                    playing = true;
                    draw();
                }
            }
        }
    }
}

function mousemoveHandler(e) {
    var mousePos = getMousePos(canvas, e);
    if (playing) {
        for (let r = 0; r < d; r++) {
            for (let c = 0; c < d; c++) {
                if (moveable(tiles[r][c])) {
                    tiles[r][c].style = isInside(mousePos, tiles[r][c]) ? tileHoverStyle : tileStyle,
                        drawShape(tiles[r][c]);
                }
            }
        }
    } else {
        for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
            for (let c = 0; c < BUTTON_COL_COUNT; c++) {
                var cur = buttons[r][c];
                isInside(mousePos, cur) ? (cur.text = Math.pow(cur.value, 2) - 1 + " tiles", cur.style = buttonHoverStyle) : (cur.text = cur.value + " x " + cur.value, cur.style = buttonStyle);
                drawShape(cur);
            }
        }
    }

}

/**
 * Gets the mouse position.
 */
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

/**
 * Checks whether a point is inside a rectangle.
 */
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y;
}

/**
 * Creates and initializes a two-dimensional array of board size selector buttons.
 */
function initializeButtons() {
    var curDim = 3;
    for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
        buttons[r] = [];
        for (let c = 0; c < BUTTON_COL_COUNT; c++) {
            var buttonX = c * (buttonWidth + buttonPadding) + buttonOffsetLeft;
            var buttonY = r * (buttonHeight + buttonPadding) + buttonOffsetTop;
            var buttonText = curDim + " x " + curDim;
            buttons[r][c] = new interect(buttonX, buttonY, buttonWidth, buttonHeight, buttonText, buttonStyle, curDim++);
        }
    }
}

/**
 * Draws board size selector buttons.
 */
function drawButtons() {
    for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
        for (let c = 0; c < BUTTON_COL_COUNT; c++) {
            drawShape(buttons[r][c]);
        }
    }
}

/**
 * Creates and intializes the game's board with tiles numbered (d*d-1) through 1.
 */
function initializeTiles() {
    var val = d * d - 1;
    for (let r = 0; r < d; r++) {
        tiles[r] = [];
        for (let c = 0; c < d; c++) {
            tileOffsetLeft = (canvas.width - ((d * tileWidth) + ((d - 1) * tilePadding))) / 2;
            tileOffsetTop = (canvas.height - ((d * tileHeight) + ((d - 1) * tilePadding))) / 2;
            var tileX = c * (tileWidth + tilePadding) + tileOffsetLeft;
            var tileY = r * (tileHeight + tilePadding) + tileOffsetTop;
            var ord = d * d - val;
            tiles[r][c] = new interect(tileX, tileY, tileWidth, tileHeight, val, tileStyle, val--, ord);
        }
    }
    // for boards with odd number of tiles, swap 3rd-to-last and 2nd-to-last tiles
    if (d % 2 == 0) swapTiles(tiles[d - 1][d - 2], tiles[d - 1][d - 3]);
    // initialize coordinates of empty space
    var emp = tiles[d - 1][d - 1];
    empX = emp.x;
    empY = emp.y;
    // initialize the empty space
    emp.text = " ";
    emp.style = emptyStyle;
}

/**
 * Prints the board in its current state.
 */
function drawTiles() {
    for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
            // // highlight moveable tiles by turning on color and bold font
            // if (moveable(i, j) && !won()) printf("\033[%i;%im",
            //     TILE_HILIGHT, TILE_BOLD);
            drawShape(tiles[r][c]);
        }
    }
}

/**
 * Draws a single shape.
 */
function drawShape(shape) {
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    ctx.fillStyle = shape.style.fill;
    ctx.fill();
    ctx.closePath();
    ctx.font = shape.style.textStyle;
    ctx.fillStyle = shape.style.textColor;
    ctx.fillText(shape.text, shape.x + (shape.width / 2), shape.y + 35);
}

/**
 * If tile borders empty space, moves tile and returns true, else
 * returns false.
 */
function move(tile) {
    // enable movement using keys assigned to UP, LEFT, DOWN, and RIGHT
    // if (tile == UP_INT && emprow < d - 1) {
    //     swaptiles(emprow + 1, empcol, emprow, empcol);
    //     emprow++;
    //     return true;
    // }
    // if (tile == LEFT_INT && empcol < d - 1) {
    //     swaptiles(emprow, empcol + 1, emprow, empcol);
    //     empcol++;
    //     return true;
    // }
    // if (tile == DOWN_INT && emprow > 0) {
    //     swaptiles(emprow - 1, empcol, emprow, empcol);
    //     emprow--;
    //     return true;
    // }
    // if (tile == RIGHT_INT && empcol > 0) {
    //     swaptiles(emprow, empcol - 1, emprow, empcol);
    //     empcol--;
    //     return true;
    // }

    // enable movement using mouse
    // find and record position of given tile
    if (moveable(tile)) {
        // move the tile
        swapTiles(tile, tiles[d - 1][d - 1]);
        // record new coordinates of empty space
        empX = tile.x;
        empY = tile.y;
        return true;
    }
    return false;
}

/**
 * Returns true if game is won (i.e., board is in winning configuration),
 * else false.
 */
function won() {
    for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
            // if any tile is out of place, return false
            if (c != d - 1 || r != d - 1) {
                // alert(tiles[r][c].ordinal + ", " + tiles[r][c].value);
                if (tiles[r][c].ordinal != tiles[r][c].value) return false;
            }
        }
    }
    return true;
}

/**
 * Swaps two tiles.
 */
function swapTiles(tile1, tile2) {
    var tmpX = tile1.x;
    var tmpY = tile1.y;
    var tmpOrd = tile1.ordinal;
    tile1.x = tile2.x;
    tile1.y = tile2.y;
    tile1.ordinal = tile2.ordinal;
    tile2.x = tmpX;
    tile2.y = tmpY;
    tile2.ordinal = tmpOrd;
}

/**
 * Returns true if tile borders empty space, else false.
 */
function moveable(tile) {
    if ((tile.x == empX && Math.abs(tile.y - empY) == tileHeight + tilePadding) ||
        (tile.y == empY && Math.abs(tile.x - empX) == tileHeight + tilePadding)) return true;
    return false;
}

/**
 * Returns a congratulatory message.
 */
function congrats() {
    if (d == 3) return "Not bad. Can you solve a more challenging one now?";
    if (d > 3 && d <= 6) return "Congratulations! You've been practicing.";
    if (d > 6 && d <= 9) return "Impressive! You're really good at this!";
    if (d > 9) return "All hail the Master of Fifteen! Maybe take a break now?";
}

/**
 * Prints a given string at the given location n times, char by char, using different colors.
 */
function rainbow(str, x, y) {
    chars = str.split("");
    txtWd = chars.length * CHAR_D;
    startX = x - (txtWd / 2) + (CHAR_D / 2);
    yPos = y;

    curRainbow = setInterval(function() {
        rainbowfy();
        nextColor();
    }, 100);
}

function rainbowfy() {
    chars.forEach(function(char, index) {
        nextColor();
        printChar(char, index);
    });
}

function nextColor() {
    if (colorNum >= COLORS.length) {
        colorNum = 0;
    }
    ctx.fillStyle = COLORS[colorNum++];
}

function printChar(c, i) {
    ctx.textAlign = TEXT_ALIGN;
    ctx.font = FONT;
    var xPos = startX + (CHAR_D * i);
    ctx.fillText(c, xPos, yPos);
}

function stopRainbow() {
    clearInterval(curRainbow);
}

function draw() {
    if (!won()) {
        drawTiles();
        requestAnimationFrame(draw);
    } else {
        drawTiles();
        rainbow(congrats(), canvas.width / 2, tileOffsetTop / 2, 500);

        clear();
    }
}

greet();