var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.addVector = function (x, y) {
        this.x += x;
        this.y += y;
    };
    return Point;
})();
var Size = (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    return Size;
})();
var Rect = (function () {
    function Rect(x, y, width, height) {
        this.size = new Size(width, height);
        this.origin = new Point(x, y);
    }
    return Rect;
})();
/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
(function ($) { $.fn.hoverIntent = function (handlerIn, handlerOut, selector) { var cfg = { interval: 100, sensitivity: 6, timeout: 0 }; if (typeof handlerIn === "object") {
    cfg = $.extend(cfg, handlerIn);
}
else {
    if ($.isFunction(handlerOut)) {
        cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector });
    }
    else {
        cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut });
    }
} var cX, cY, pX, pY; var track = function (ev) { cX = ev.pageX; cY = ev.pageY; }; var compare = function (ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); if (Math.sqrt((pX - cX) * (pX - cX) + (pY - cY) * (pY - cY)) < cfg.sensitivity) {
    $(ob).off("mousemove.hoverIntent", track);
    ob.hoverIntent_s = true;
    return cfg.over.apply(ob, [ev]);
}
else {
    pX = cX;
    pY = cY;
    ob.hoverIntent_t = setTimeout(function () { compare(ev, ob); }, cfg.interval);
} }; var delay = function (ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); ob.hoverIntent_s = false; return cfg.out.apply(ob, [ev]); }; var handleHover = function (e) { var ev = $.extend({}, e); var ob = this; if (ob.hoverIntent_t) {
    ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
} if (e.type === "mouseenter") {
    pX = ev.pageX;
    pY = ev.pageY;
    $(ob).on("mousemove.hoverIntent", track);
    if (!ob.hoverIntent_s) {
        ob.hoverIntent_t = setTimeout(function () { compare(ev, ob); }, cfg.interval);
    }
}
else {
    $(ob).off("mousemove.hoverIntent", track);
    if (ob.hoverIntent_s) {
        ob.hoverIntent_t = setTimeout(function () { delay(ev, ob); }, cfg.timeout);
    }
} }; return this.on({ "mouseenter.hoverIntent": handleHover, "mouseleave.hoverIntent": handleHover }, cfg.selector); }; })(jQuery);
function Block(position, backgroundColor, borderColor) {
    var self = this;
    this.position = position;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
}
/*

TODO - moveTo animated
TODO - cursor hand when clicked and moving around
TODO - Border on scrolling aroung (i.e. cap movement (limit movement))
TODO - Improve performance for large boards
TODO - Fix hover color
TODO - Set default position to be in the middle
TODO - Add map to bottom left
TODO - Refactor DOM uasge with JQuery
BUG - Population doesnt update when erase and shuffle buttons pressed
*/
function Game(canvas, context) {
    var self = this;
    this.canvas = canvas;
    this.context = context;
    this.position = new Point(0.0, 0.0);
    this.size = new Size(140, 100);
    this.blockSize = new Size(15, 15);
    this.isMouseDown = false;
    this.isScrolling = false;
    this.didScrollSinceLastMouseClick = false;
    this.isPlaying = false;
    this._currentRefreshInterval = null;
    this._previousScrollEvent = null;
    this.hoverBlock = null;
    this.time = 0;
    self.population = 0;
    this.speed = 100;
    this.gridLineColor = "#f3f3f3";
    this.initialize = function () {
        self.canvas.onmousedown = self.handleMouseDown;
        self.canvas.onmouseup = self.handleMouseUp;
        self.canvas.onmousemove = self.handleMouseMove;
        self.canvas.onmousewheel = self.handleMouseWheel;
        self.canvas.onclick = self.handleMouseClick;
        self.randomize();
    };
    this.randomize = function () {
        self.data = [];
        for (var i = 0; i < self.size.width; i++) {
            self.data[i] = [];
            for (var j = 0; j < self.size.height; j++) {
                if (Math.floor((Math.random() * 10) + 1) < 4)
                    self.data[i][j] = 1;
                else
                    self.data[i][j] = 0;
            }
        }
    };
    this.play = function () {
        if (self.isPlaying) {
            window.clearInterval(self._currentRefreshInterval);
        }
        self.isPlaying = true;
        self._currentRefreshInterval = window.setInterval(self.stepForward, self.speed);
    };
    this.pause = function () {
        if (!self.isPlaying)
            return;
        self.isPlaying = false;
        window.clearInterval(self._currentRefreshInterval);
        self._currentRefreshInterval = null;
    };
    this.handleMouseDown = function (event) {
        self.isMouseDown = true;
    };
    this.handleMouseUp = function (event) {
        self.isMouseDown = false;
        self.isScrolling = false;
    };
    this.handleMouseMove = function (event) {
        // TODO - Remove hover block when scrolling
        if (self.isMouseDown && self._previousScrollEvent !== null) {
            self.isScrolling = true;
            self.didScrollSinceLastMouseClick = true;
            var xDiff = event.clientX - self._previousScrollEvent.clientX;
            var yDiff = event.clientY - self._previousScrollEvent.clientY;
            self.position.addVector(-xDiff, -yDiff);
            self.redraw();
        }
        else {
            function convertScreenPositionToBlockPoint(point) {
                return new Point(Math.floor((point.x + self.position.x) / self.blockSize.width), Math.floor((point.y + self.position.y) / self.blockSize.height));
            }
            var blockStart = convertScreenPositionToBlockPoint(new Point(event.clientX, event.clientY));
            if (blockStart.x >= 0 && blockStart.y >= 0 && blockStart.y < self.size.height && blockStart.x < self.size.width) {
                self.hoverBlock = new Block(blockStart, "#D5D5D5", "black");
            }
            else
                self.hoverBlock = null;
            self.redraw();
        }
        self._previousScrollEvent = event;
    };
    this.handleMouseWheel = function (event) {
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        // TODO - animated zoom
        delta *= 3;
        var mouseX = event.clientX;
        var mouseY = event.clientY;
        self.zoom(delta, new Point(mouseX, mouseY));
    };
    this.zoom = function (delta, handle) {
        if (delta < 0) {
            while (self.blockSize.width + delta < 3 && self.blockSize.height + delta < 3 && delta < 0)
                delta++;
        }
        function convertScreenPositionToBlockPoint(point) {
            return new Point((point.x + self.position.x) / self.blockSize.width, (point.y + self.position.y) / self.blockSize.height);
        }
        var blocksToLeft = convertScreenPositionToBlockPoint(new Point(handle.x, handle.y)).x;
        var blocksToTop = convertScreenPositionToBlockPoint(new Point(handle.x, handle.y)).y;
        var differenceX = blocksToLeft * delta;
        var differenceY = blocksToTop * delta;
        self.position.addVector(differenceX, differenceY);
        self.blockSize.width += delta;
        self.blockSize.height += delta;
        self.redraw();
    };
    this.handleMouseClick = function (event) {
        console.log('asdf');
        if (self.hoverBlock !== null && self.didScrollSinceLastMouseClick === false) {
            var value = self.data[self.hoverBlock.position.x][self.hoverBlock.position.y];
            if (value === 1) {
                self.data[self.hoverBlock.position.x][self.hoverBlock.position.y] = 0;
            }
            else {
                self.data[self.hoverBlock.position.x][self.hoverBlock.position.y] = 1;
            }
            self.redraw();
        }
        self.didScrollSinceLastMouseClick = false;
    };
    this.numberOfAliveNeighbors = function (x, y, xMax, yMax) {
        function neighborValue(i, j) {
            if (self.data[i][j] === 1 || self.data[i][j] === "WillDie")
                return 1;
            return 0;
        }
        function mod(x, m) {
            m = Math.abs(m);
            return (x % m + m) % m;
        }
        var sum = 0;
        if (neighborValue(mod(x + 1, xMax), y))
            sum++;
        if (neighborValue(mod(x + 1, xMax), mod(y + 1, yMax)))
            sum++;
        if (neighborValue(x, mod(y + 1, yMax)))
            sum++;
        if (neighborValue(x, mod(y - 1, yMax)))
            sum++;
        if (neighborValue(mod(x + 1, xMax), mod(y - 1, yMax)))
            sum++;
        if (neighborValue(mod(x - 1, xMax), y))
            sum++;
        if (neighborValue(mod(x - 1, xMax), mod(y - 1, yMax)))
            sum++;
        if (neighborValue(mod(x - 1, xMax), mod(y + 1, yMax)))
            sum++;
        return sum;
    };
    this.stepForward = function () {
        self.population = 0;
        for (var i = 0; i < self.size.width; i++) {
            for (var j = 0; j < self.size.height; j++) {
                var neighborCount = self.numberOfAliveNeighbors(i, j, self.size.width, self.size.height);
                var currentValue = self.data[i][j];
                if ((neighborCount < 2 || neighborCount > 3) && currentValue === 1) {
                    self.data[i][j] = "WillDie";
                }
                else if (neighborCount === 3 && currentValue === 0) {
                    self.data[i][j] = "WillBirth";
                }
            }
        }
        for (var i = 0; i < self.size.width; i++) {
            for (var j = 0; j < self.size.height; j++) {
                var currentValue = self.data[i][j];
                if (currentValue === "WillDie")
                    self.data[i][j] = 0;
                else if (currentValue === "WillBirth")
                    self.data[i][j] = 1;
                if (self.data[i][j] === 1)
                    self.population++;
            }
        }
        self.time += 1;
        self.redraw();
    };
    this.draw = function () {
        self.context.fillStyle = "black";
        self.context.strokeStyle = self.gridLineColor;
        function convertPointToScreenPosition(point) {
            return new Point(point.x - self.position.x, point.y - self.position.y);
        }
        function convertScreenPositionToBlockPoint(point) {
            return new Point(Math.floor((point.x + self.position.x) / self.blockSize.width), Math.floor((point.y + self.position.y) / self.blockSize.height));
        }
        var pixelGameRect = new Rect(convertPointToScreenPosition(new Point(0, 0)).x, convertPointToScreenPosition(new Point(0, 0)).y, convertPointToScreenPosition(new Point(self.blockSize.width * self.size.width, self.blockSize.height * self.size.height)).x, convertPointToScreenPosition(new Point(self.blockSize.width * self.size.width, self.blockSize.height * self.size.height)).y);
        self.context.beginPath();
        // Draws vertical gridlines
        var xDiff = self.position.x % self.blockSize.width;
        var xposition = self.position.x - xDiff;
        for (var i = -xDiff; i <= self.canvas.width; i += self.blockSize.width, xposition += self.blockSize.width) {
            if (xposition < 0 || xposition > self.blockSize.width * self.size.width)
                continue;
            self.context.moveTo(i, pixelGameRect.origin.y);
            self.context.lineTo(i, pixelGameRect.size.height);
        }
        // Draws horizontal gridlines
        var yDiff = self.position.y % self.blockSize.height;
        var yposition = self.position.y - yDiff;
        for (var i = -yDiff; i <= self.canvas.height; i += self.blockSize.height, yposition += self.blockSize.height) {
            if (yposition < 0 || yposition > self.blockSize.height * self.size.height)
                continue;
            self.context.moveTo(pixelGameRect.origin.x, i);
            self.context.lineTo(pixelGameRect.size.width, i);
        }
        self.context.stroke();
        // Draw hover block
        // TODO - move drawing of hover block to after the cells have been drawn
        if (self.hoverBlock) {
            self.context.beginPath();
            self.context.strokeStyle = self.hoverBlock.borderColor;
            self.context.fillStyle = self.hoverBlock.backgroundColor;
            var xPoint = self.hoverBlock.position.x * self.blockSize.width;
            var yPoint = self.hoverBlock.position.y * self.blockSize.height;
            var hoverBlockStartPoint = convertPointToScreenPosition(new Point(xPoint, yPoint));
            self.context.rect(hoverBlockStartPoint.x, hoverBlockStartPoint.y, self.blockSize.width, self.blockSize.height);
            if (self.hoverBlock.backgroundColor !== "clear")
                self.context.fill();
            if (self.hoverBlock.borderColor !== "clear")
                self.context.stroke();
        }
        // Draw cells
        // TODO - Only render blocks that are on screen
        var maxBlockToRender = convertScreenPositionToBlockPoint(new Point(window.innerWidth, window.innerHeight));
        var minBlockToRender = convertScreenPositionToBlockPoint(new Point(0, 0));
        if (minBlockToRender.x < 0)
            minBlockToRender.x = 0;
        if (minBlockToRender.y < 0)
            minBlockToRender.y = 0;
        if (maxBlockToRender.x > self.size.width)
            maxBlockToRender.x = self.size.width;
        if (maxBlockToRender.y > self.size.height)
            maxBlockToRender.y = self.size.height;
        for (var i = minBlockToRender.x; i < maxBlockToRender.x; i++) {
            for (var j = minBlockToRender.y; j < maxBlockToRender.y; j++) {
                if (self.data[i][j] === 1) {
                    var neighborCount = self.numberOfAliveNeighbors(i, j, self.size.width, self.size.height);
                    var backgroundColor = "#EFF5F9";
                    switch (neighborCount) {
                        case 1:
                            backgroundColor = "#EFF5F9";
                            break;
                        case 2:
                            backgroundColor = "#ecf2f6";
                            break;
                        case 3:
                            backgroundColor = "#e9eff3";
                            break;
                        case 4:
                            backgroundColor = "#e6ecf0";
                            break;
                        case 5:
                            backgroundColor = "#e3e9ed";
                            break;
                        case 6:
                            backgroundColor = "#e0e6ea";
                            break;
                        case 7:
                            backgroundColor = "#dde3e7";
                            break;
                        case 8:
                            backgroundColor = "#dae0e4";
                            break;
                        default:
                            backgroundColor = "#EFF5F9";
                    }
                    var block = new Block(new Point(i, j), backgroundColor, "#DEECF7");
                    self.context.beginPath();
                    self.context.strokeStyle = block.borderColor;
                    self.context.fillStyle = backgroundColor;
                    var xPoint = block.position.x * self.blockSize.width;
                    var yPoint = block.position.y * self.blockSize.height;
                    var blockStartPoint = convertPointToScreenPosition(new Point(xPoint, yPoint));
                    self.context.rect(blockStartPoint.x, blockStartPoint.y, self.blockSize.width, self.blockSize.height);
                    self.context.fill();
                    self.context.stroke();
                    block = null;
                }
            }
        }
        self.updateDOMElements();
    };
    this.redraw = function () {
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
        self.draw();
    };
    this.restart = function () {
        self.time = 0;
        for (var i = 0; i < self.size.width; i++) {
            for (var j = 0; j < self.size.height; j++) {
                self.data[i][j] = 0;
            }
        }
        self.redraw();
    };
    this.updateDOMElements = function () {
        document.getElementById("timeDiv").innerHTML = "Time: " + self.time;
        document.getElementById("populationDiv").innerHTML = "Population: " + self.population;
    };
}
var canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
// finally query the various pixel ratios
var vardevicePixelRatio = window.devicePixelRatio || 1;
var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
var ratio = devicePixelRatio / backingStoreRatio;
// upscale the canvas if the two ratios don't match
if (devicePixelRatio !== backingStoreRatio) {
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    // now scale the context to counter
    // the fact that we've manually scaled
    // our canvas element
    context.scale(ratio, ratio);
}
var game = new Game(canvas, context);
game.initialize();
buttonPlayPress();
// Button interactions
function buttonPlayPress() {
    var playButton = document.getElementById('button_play').children[0];
    var fastForwardButton = document.getElementById('button_fast');
    var stepButton = document.getElementById('button_step');
    if (game.isPlaying) {
        buttonStopPress();
    }
    else {
        playButton.className = "fa fa-pause";
        fastForwardButton.className = fastForwardButton.className.replace(/(?:^|\s)disabled(?!\S)/g, '');
        stepButton.className += " disabled";
        game.play();
    }
}
function buttonStopPress() {
    var playButton = document.getElementById('button_play').children[0];
    var fastForwardButton = document.getElementById('button_fast');
    var stepButton = document.getElementById('button_step');
    game.pause();
    playButton.className = "fa fa-play";
    fastForwardButton.className += " disabled";
    stepButton.className = stepButton.className.replace(/(?:^|\s)disabled(?!\S)/g, '');
}
function buttonStepPress() {
    game.stepForward();
}
function buttonClearPress() {
    buttonStopPress();
    game.restart();
}
function buttonRandomPress() {
    buttonClearPress();
    game.randomize();
    game.redraw();
}
function buttonForwardPress() {
    if (game.speed === 40) {
        game.speed = 100;
        game.play();
        var fastButton = document.getElementById('button_fast').children[0];
        fastButton.className = fastButton.className.replace(/(?:^|\s)fa-close(?!\S)/g, '');
        fastButton.className += " fa-forward";
    }
    else {
        var fastButton = document.getElementById('button_fast').children[0];
        fastButton.className = fastButton.className.replace(/(?:^|\s)fa-forward(?!\S)/g, '');
        fastButton.className += " fa-close";
        game.speed = 40;
        game.play();
    }
}
function buttonZoomInPress() {
    game.zoom(5, new Point(window.innerWidth / 2, window.innerHeight / 2));
}
function buttonZoomOutPress() {
    game.zoom(-5, new Point(window.innerWidth / 2, window.innerHeight / 2));
}
$('#entirePanel').hoverIntent(function () {
    $("#additionalContentWrapper").show("fast");
}, function () {
    $("#additionalContentWrapper").hide("fast");
});
// Enables all tooltips in the document
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});
