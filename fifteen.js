/* canvas vars */
var canvas = document.getElementById("myCanvas"),
    ctx = canvas.getContext("2d");
/* button vars */
const BUTTON_ROW_COUNT = 2;
const BUTTON_COL_COUNT = 4;
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 50;
var buttonPadding,
    buttonOffsetLeft,
    buttonOffsetTop,
    buttons = [],
    buttonStyle = new style("#fff", "28px Arial", "#000"),
    buttonHoverStyle = new style("#ff0", "bold italic 24px Arial", "#000");
/* tile vars */
const TILE_WIDTH = 50;
const TILE_HEIGHT = 50;
var tilePadding,
    tileOffSetLeft,
    tileOffsetTop,
    tiles = [],
    tileStyle = new style("#fff", "24px Arial", "#000"),
    tileHoverStyle = new style("#ff0", "bold italic 24px Arial", "#000"),
    emptyStyle = new style("", "", "");
/* board vars */
var d, // dimension of the board 
    emp, // the empty space tile
    moveables; // an array of the moveable tiles
/* game vars */
var started = false,
    paused = false,
    finished = false,
    clockID, // an interval id for clock
    clockStyle = new style("#000", "Bold 24px Arial", '#fff'),
    clock = new interect(
        canvas.width - (BUTTON_WIDTH * 2),
        0,
        BUTTON_WIDTH * 2,
        BUTTON_HEIGHT * 2,
        "Time: 00:00:00",
        clockStyle);
/* UI vars */
var welcomeID, // an interval id for the rainbow title
    moving = false,
    showingHelp = false,
    helpStyle = new style("#000", "18px Arial", "#fff"),
    helpHoverStyle = new style("#000", "italic 18px Arial", "#ff0"),
    help = new interect(
        0,
        canvas.height - BUTTON_HEIGHT,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        "Help (H)",
        helpStyle),
    showingHelp = false,
    back = new interect(
        0,
        0,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        "< Back (B)",
        helpStyle),
    playAgainStyle = new style("#000", "bold 28px Arial", "#fff"),
    playAgain = new interect(
        canvas.width - (buttonPadding + BUTTON_WIDTH + 75),
        canvas.height - (buttonPadding + BUTTON_HEIGHT),
        BUTTON_WIDTH + 75, // make wider to fit text
        BUTTON_HEIGHT,
        "Play Again?",
        playAgainStyle);
/* rainbow vars */
const COLORS = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
const TEXT_ALIGN = "center";
var startColor = 0,
    curColor = 0,
    chars,
    charD, // estimated width/height of a char in rainbow 
    txtWd, // width of the rainbow
    startX, // x position of the first char of the rainbow
    yPos,
    font;

/* constructors */
function style(f, ts, tc) {
    this.fill = f;
    this.textStyle = ts;
    this.textColor = tc;
}
// a rectangle with which users may interact.
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

// bind events to the canvas
canvas.addEventListener('click', clickHandler, false);
canvas.addEventListener('mousemove', mousemoveHandler, false);
document.addEventListener('keydown', keydownHandler, false);
document.addEventListener('keyup', keyupHandler, false)

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
    welcomeID = rainbow("WELCOME TO GAME OF FIFTEEN", canvas.width / 2, 200, "bold 32px Arial", 100);
    ctx.font = "24px Arial";
    ctx.fillText("Please choose a board size", canvas.width / 2, 275);
    drawUI();
}

function clickHandler(e) {
    var mousePos = getMousePos(canvas, e);
    if (!started) {
        for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
            for (let c = 0; c < BUTTON_COL_COUNT; c++) {
                if (isInside(mousePos, buttons[r][c])) {
                    // update board dimension variable based on user input
                    d = buttons[r][c].value;
                    initializeTiles();
                    stopRainbow(welcomeID);
                    clear();
                    started = true;
                    startClock();
                    draw();
                }
            }
        }
    } else if (!finished) {
        if (isInside(mousePos, back)) location.reload();
        moveables.forEach(function(tile) {
            if (tile != undefined) {
                if (isInside(mousePos, tile)) move(tile);
            }
        });
    } else {
        if (isInside(mousePos, playAgain)) location.reload();
    }
}

function mousemoveHandler(e) {
    var mousePos = getMousePos(canvas, e);
    if (!started) {
        for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
            for (let c = 0; c < BUTTON_COL_COUNT; c++) {
                var cur = buttons[r][c];
                isInside(mousePos, cur) ? (cur.text = Math.pow(cur.value, 2) - 1 + " tiles", cur.style = buttonHoverStyle) :
                    (cur.text = cur.value + " x " + cur.value, cur.style = buttonStyle);
                // no animation here, so redraw interect
                drawInterect(cur);
            }
        }
    } else if (!finished) {
        moveables.forEach(function(tile) {
            if (tile != undefined) {
                tile.style = isInside(mousePos, tile) ? tileHoverStyle : tileStyle;
            }
        });
        isInside(mousePos, help) ? (help.style = helpHoverStyle, showingHelp = true) :
            (help.style = helpStyle, showingHelp = false);
        back.style = isInside(mousePos, back) ? helpHoverStyle : helpStyle;
    } else {
        playAgain.style.textStyle = isInside(mousePos, playAgain) ? "italic 28px Arial" : "28px Arial";
        // no animation here, so redraw interect
        drawInterect(playAgain);
    }
}

function keydownHandler(e) {
    if (started && !finished) {
        // address issue of player using key to move tile while hovering with mouse  
        moveables.forEach(function(tile) {
            if (tile != undefined) {
                tile.style = tileStyle;
            }
        });
        switch (e.keyCode) {
            case 37: // left arrow
                move(moveables[2]);
                break;
            case 38: // up arrow
                move(moveables[3]);
                break;
            case 39: // right arrow
                move(moveables[0]);
                break;
            case 40: // down arrow
                move(moveables[1]);
                break;
            case 66: // b for back
                location.reload();
                break;
            case 72: // h for help
                showHelp();
        }
    }
}

function keyupHandler(e) {
    switch (e.keyCode) {
        case 72: // h for help
            hideHelp();
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
            buttonPadding = BUTTON_WIDTH / 2;
            buttonOffsetLeft = (canvas.width - ((BUTTON_COL_COUNT * BUTTON_WIDTH) + ((BUTTON_COL_COUNT - 1) * buttonPadding))) / 2;
            buttonOffsetTop = (canvas.height - ((BUTTON_ROW_COUNT * BUTTON_HEIGHT) + ((BUTTON_ROW_COUNT - 1) * buttonPadding))) / 2;
            var buttonX = c * (BUTTON_WIDTH + buttonPadding) + buttonOffsetLeft;
            var buttonY = r * (BUTTON_HEIGHT + buttonPadding) + buttonOffsetTop;
            var buttonText = curDim + " x " + curDim;
            buttons[r][c] = new interect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT, buttonText, buttonStyle, curDim++);
        }
    }
}

/**
 * Draws board size selector buttons.
 */
function drawButtons() {
    for (let r = 0; r < BUTTON_ROW_COUNT; r++) {
        for (let c = 0; c < BUTTON_COL_COUNT; c++) {
            drawInterect(buttons[r][c]);
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
            tilePadding = d > 7 ? TILE_WIDTH / 2 : TILE_WIDTH;
            tileOffsetLeft = (canvas.width - ((d * TILE_WIDTH) + ((d - 1) * tilePadding))) / 2;
            tileOffsetTop = (canvas.height - ((d * TILE_HEIGHT) + ((d - 1) * tilePadding))) / 2;
            var tileX = c * (TILE_WIDTH + tilePadding) + tileOffsetLeft;
            var tileY = r * (TILE_HEIGHT + tilePadding) + tileOffsetTop;
            var ord = d * d - val;
            tiles[r][c] = new interect(tileX, tileY, TILE_WIDTH, TILE_HEIGHT, val, tileStyle, val--, ord);
        }
    }
    // for boards with odd number of tiles, swap 3rd-to-last and 2nd-to-last tiles
    if (d % 2 == 0) swapTiles(tiles[d - 1][d - 2], tiles[d - 1][d - 3]);
    // initialize the empty space
    emp = tiles[d - 1][d - 1];
    emp.text = " ";
    emp.style = emptyStyle;
    // record the tiles adjacent to the empty space
    updateMoveables();
}

/**
 * Prints the board in its current state.
 */
function drawTiles() {
    for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
            drawInterect(tiles[r][c]);
        }
    }
}

/**
 * Draws a single interect.
 */
function drawInterect(interect) {
    ctx.beginPath();
    ctx.rect(interect.x, interect.y, interect.width, interect.height);
    ctx.fillStyle = interect.style.fill;
    ctx.fill();
    ctx.closePath();
    ctx.font = interect.style.textStyle;
    ctx.fillStyle = interect.style.textColor;
    ctx.fillText(interect.text, interect.x + (interect.width / 2), interect.y + 35);
}

/**
 * If tile borders empty space, moves tile and returns true, else
 * returns false.
 */
function move(tile) {
    /** enable movement using mouse **/
    if (!moving && tile != undefined) {
        moving = true;
        // move the tile
        swapTiles(tile, emp);
        // update moveables array
        updateMoveables();
    }
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
    if (moveables.includes(tile)) return true;
    return false;
}

/**
 * Keeps track of moveable tiles.
 */
function updateMoveables() {
    var yDiff = TILE_HEIGHT + tilePadding,
        xDiff = TILE_WIDTH + tilePadding;
    // clear the moveables array
    moveables = [];
    for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
            var t = tiles[r][c];
            if (t.y == emp.y) {
                if (t.x - emp.x == xDiff) moveables[2] = t; // right of empty
                else if (t.x - emp.x == -xDiff) moveables[0] = t; // left of empty
            } else if (t.x == emp.x) {
                if (t.y - emp.y == yDiff) moveables[3] = t; // below empty
                else if (t.y - emp.y == -yDiff) moveables[1] = t; // above empoty
            }
        }
    }
    moving = false;
}

/**
 * Draws the user interface.
 */
function drawUI() {
    if (!started) {
        initializeButtons();
        drawButtons();
    } else if (!finished) {
        drawTiles();
        drawInterect(help);
        if (showingHelp) showHelp();
        drawInterect(back);
        drawInterect(clock);
        //drawInterect(moves);
    }
}

/**
 * Creates an interval that updates the clock interect every second. 
 */
function startClock() {
    var startTime = new Date();
    clockID = setInterval(function() {
        updateClock(startTime);
    }, 1000);
}

// startClock helper function - updates clock interect with new text
function updateClock(time) {
    var curTime = new Date(),
        diff = (curTime - time) / 1000, // in seconds
        hr = Math.floor(diff / 3600),
        min = Math.floor((diff % 3600) / 60),
        sec = Math.floor((diff % 3600) % 60),
        hZero = (hr < 10) ? "0" : "",
        mZero = (min < 10) ? "0" : "",
        sZero = (sec < 10) ? "0" : "";
    clock.text = (hr == 24) ? "Over a day..." : "Time: " + hZero + hr + ":" + mZero + min + ":" + sZero + sec;
}

/**
 * Stops the clock.
 */
function stopClock() {
    clearInterval(clockID);
}
/**
 * Shows instructions.
 */
function showHelp() {
    ctx.font = "18px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Click or use arrow keys to move tiles into the empty space.",
        canvas.width / 2, canvas.height - 75);
    ctx.fillText("To win, order the tiles from least to greatest, with the empty space in the lower right corner.",
        canvas.width / 2, canvas.height - 50);
}

/**
 * Congratulates player.
 */
function congratulate() {
    var message = (d == 3) ? ["Not bad.", "Can you solve a more challenging one now?"] :
        (d > 3 && d <= 6) ? ["Congratulations!", "You've been practicing."] :
        (d > 6 && d <= 9) ? ["Impressive!", "You're really good at this!"] : ["All hail the Master of Fifteen!", "Maybe take a break now?"];
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(message[0],
        canvas.width / 2,
        tileOffsetTop / 2);
    rainbow(message[1],
        canvas.width / 2,
        tileOffsetTop * 3 / 4,
        "italic 22px Arial",
        100);
}

/**
 * Changes text color of a given interect at a regular interval.
 */
function cycleColors(interect) {
    var cur = 0;
    setInterval(function() {
        interect.style.fill = COLORS[cur];
        // hacky fix to make text visible when fill is yellow or green
        interect.style.textColor = (cur == 2 || cur == 3) ? "#000" : "#fff";
        if (++cur >= COLORS.length) cur = 0;
        drawInterect(interect);
    }, 1000);
}

/**
 * Prints a given string at the given location n times, char by char, using different colors.
 */
function rainbow(str, x, y, f, interval) {
    var patt = /\d{1,3}(?=px)/g;
    var res = patt.exec(f);
    charD = 0.75 * res;
    chars = str.split("");
    txtWd = chars.length * charD;
    startX = x - (txtWd / 2) + (charD / 2);
    yPos = y;
    font = f;

    return setInterval(function() {
        rainbowfy();
        setStartColor();
    }, interval);
}

// rainbow() helper function - "rainbowfies" string by printing each char in a different color
function rainbowfy() {
    chars.forEach(function(char, index) {
        nextColor();
        printChar(char, index);
    });
}

// rainbowfy() helper function
function nextColor() {
    if (curColor >= COLORS.length) {
        curColor = 0;
    }
    ctx.fillStyle = COLORS[curColor++];
}

// rainbow() helper function
function setStartColor() {
    if (startColor < 0) {
        startColor = COLORS.length - 1;
    }
    curColor = startColor--;
}

// rainbowfy() helper function
function printChar(c, i) {
    ctx.textAlign = TEXT_ALIGN;
    ctx.font = font;
    var xPos = startX + (charD * i);
    ctx.fillText(c, xPos, yPos);
}

// rainbow() helper function
function stopRainbow(rainbow) {
    clearInterval(rainbow);
}

/**
 * Animates the game.
 */
function draw() {
    clear();
    drawUI();
    if (!won()) requestAnimationFrame(draw);
    else {
        stopClock();
        finished = true;
        clear();
        drawTiles();
        congratulate();
        cycleColors(playAgain);
    }
}

greet();


today = new Date();
var m = today.getMinutes();
var h = today.getHours();
var d = today.getDate()
var n = today.getMonth() + 1
var y = today.getYear()