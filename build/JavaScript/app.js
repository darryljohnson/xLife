/*!
 * Defines a set of classes to manage coordinate systems
 */
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.addVector = function (x, y) {
        this.x += x;
        this.y += y;
    };
    Point.prototype.isEqual = function (point) {
        return this.x === point.x && this.y === point.y;
    };
    return Point;
})();
var Size = (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    Size.prototype.isEqual = function (size) {
        return this.width === size.width && this.height === size.height;
    };
    return Size;
})();
var Rect = (function () {
    function Rect(x, y, width, height) {
        this.size = new Size(width, height);
        this.origin = new Point(x, y);
    }
    Rect.prototype.isEqual = function (rect) {
        return this.size.isEqual(rect.size) && this.origin.isEqual(rect.origin);
    };
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
/// <reference path="TypeDefinitions/jquery.d.ts" />
/// <reference path="Position.ts"/>
var Block = (function () {
    function Block(position, backgroundColor, borderColor) {
        this.position = position;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
    }
    return Block;
})();
/*

TODO - moveTo animated
TODO - cursor hand when clicked and moving around
TODO - Border on scrolling around (i.e. cap movement (limit movement))
TODO - Fix hover color
TODO - Refactor DOM uasge with JQuery
TODO - Remove hover block when scrolling
TODO - move drawing of hover block to after the cells have been drawn
TODO - Only render blocks that are on screen
*/
var Game = (function () {
    function Game(canvas, context) {
        var _this = this;
        this.hoverBlock = null;
        this.isMouseDown = false;
        this.isScrolling = false;
        this.didScrollSinceLastMouseClick = false;
        this.isPlaying = false;
        this._currentRefreshInterval = null;
        this._previousScrollEvent = null;
        this.time = 0;
        this.population = 0;
        this.speed = 100;
        this.gridLineColor = "#f3f3f3";
        this.randomize = function () {
            _this.data = [];
            for (var i = 0; i < _this.size.width; i++) {
                _this.data[i] = [];
                for (var j = 0; j < _this.size.height; j++) {
                    if (Math.floor((Math.random() * 10) + 1) < 4)
                        _this.data[i][j] = 1;
                    else
                        _this.data[i][j] = 0;
                }
            }
        };
        this.play = function () {
            if (_this.isPlaying) {
                window.clearInterval(_this._currentRefreshInterval);
            }
            _this.isPlaying = true;
            _this._currentRefreshInterval = window.setInterval(_this.stepForward, _this.speed);
        };
        this.pause = function () {
            if (!_this.isPlaying)
                return;
            _this.isPlaying = false;
            window.clearInterval(_this._currentRefreshInterval);
            _this._currentRefreshInterval = null;
        };
        this.handleMouseDown = function (event) {
            _this.isMouseDown = true;
        };
        this.handleMouseUp = function (event) {
            _this.isMouseDown = false;
            _this.isScrolling = false;
        };
        this.handleMouseMove = function (event) {
            if (_this.isMouseDown && _this._previousScrollEvent !== null) {
                _this.isScrolling = true;
                _this.didScrollSinceLastMouseClick = true;
                var xDiff = event.clientX - _this._previousScrollEvent.clientX;
                var yDiff = event.clientY - _this._previousScrollEvent.clientY;
                _this.position.addVector(-xDiff, -yDiff);
                _this.redraw();
            }
            else {
                var convertScreenPositionToBlockPoint = function (point) {
                    return new Point(Math.floor((point.x + this.position.x) / this.blockSize.width), Math.floor((point.y + this.position.y) / this.blockSize.height));
                }.bind(_this);
                var blockStart = convertScreenPositionToBlockPoint(new Point(event.clientX, event.clientY));
                if (blockStart.x >= 0 && blockStart.y >= 0 && blockStart.y < _this.size.height && blockStart.x < _this.size.width) {
                    _this.hoverBlock = new Block(blockStart, "#D5D5D5", "black");
                }
                else
                    _this.hoverBlock = null;
                _this.redraw();
            }
            _this._previousScrollEvent = event;
        };
        this.handleMouseClick = function (event) {
            if (_this.hoverBlock !== null && _this.didScrollSinceLastMouseClick === false) {
                var value = _this.data[_this.hoverBlock.position.x][_this.hoverBlock.position.y];
                if (value === 1) {
                    _this.data[_this.hoverBlock.position.x][_this.hoverBlock.position.y] = 0;
                }
                else {
                    _this.data[_this.hoverBlock.position.x][_this.hoverBlock.position.y] = 1;
                }
                _this.redraw();
            }
            _this.didScrollSinceLastMouseClick = false;
        };
        this.handleMouseWheel = function (event) {
            var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
            delta *= 3;
            var mouseX = event.clientX;
            var mouseY = event.clientY;
            _this.zoom(delta, new Point(mouseX, mouseY));
        };
        this.zoom = function (delta, handle) {
            if (delta < 0) {
                while (_this.blockSize.width + delta < 3 && _this.blockSize.height + delta < 3 && delta < 0)
                    delta++;
            }
            var convertScreenPositionToBlockPoint = function (point) {
                return new Point((point.x + this.position.x) / this.blockSize.width, (point.y + this.position.y) / this.blockSize.height);
            }.bind(_this);
            var blocksToLeft = convertScreenPositionToBlockPoint(new Point(handle.x, handle.y)).x;
            var blocksToTop = convertScreenPositionToBlockPoint(new Point(handle.x, handle.y)).y;
            var differenceX = blocksToLeft * delta;
            var differenceY = blocksToTop * delta;
            _this.position.addVector(differenceX, differenceY);
            _this.blockSize.width += delta;
            _this.blockSize.height += delta;
            _this.redraw();
        };
        this.numberOfAliveNeighbors = function (x, y, xMax, yMax) {
            var neighborValue = function (i, j) {
                if (this.data[i][j] === 1 || this.data[i][j] === "WillDie")
                    return 1;
                return 0;
            }.bind(_this);
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
            _this.population = 0;
            for (var i = 0; i < _this.size.width; i++) {
                for (var j = 0; j < _this.size.height; j++) {
                    var neighborCount = _this.numberOfAliveNeighbors(i, j, _this.size.width, _this.size.height);
                    var currentValue = _this.data[i][j];
                    if ((neighborCount < 2 || neighborCount > 3) && currentValue === 1) {
                        _this.data[i][j] = "WillDie";
                    }
                    else if (neighborCount === 3 && currentValue === 0) {
                        _this.data[i][j] = "WillBirth";
                    }
                }
            }
            for (var i = 0; i < _this.size.width; i++) {
                for (var j = 0; j < _this.size.height; j++) {
                    var currentValue = _this.data[i][j];
                    if (currentValue === "WillDie")
                        _this.data[i][j] = 0;
                    else if (currentValue === "WillBirth")
                        _this.data[i][j] = 1;
                    if (_this.data[i][j] === 1)
                        _this.population++;
                }
            }
            _this.time += 1;
            _this.redraw();
        };
        this.draw = function () {
            _this.context.fillStyle = "black";
            _this.context.strokeStyle = _this.gridLineColor;
            var convertPointToScreenPosition = function (point) {
                return new Point(point.x - this.position.x, point.y - this.position.y);
            }.bind(_this);
            var convertScreenPositionToBlockPoint = function (point) {
                return new Point(Math.floor((point.x + this.position.x) / this.blockSize.width), Math.floor((point.y + this.position.y) / this.blockSize.height));
            }.bind(_this);
            var pixelGameRect = new Rect(convertPointToScreenPosition(new Point(0, 0)).x, convertPointToScreenPosition(new Point(0, 0)).y, convertPointToScreenPosition(new Point(_this.blockSize.width * _this.size.width, _this.blockSize.height * _this.size.height)).x, convertPointToScreenPosition(new Point(_this.blockSize.width * _this.size.width, _this.blockSize.height * _this.size.height)).y);
            _this.context.beginPath();
            // Draws vertical gridlines
            var xDiff = _this.position.x % _this.blockSize.width;
            var xposition = _this.position.x - xDiff;
            for (var i = -xDiff; i <= _this.canvas.width; i += _this.blockSize.width, xposition += _this.blockSize.width) {
                if (xposition < 0 || xposition > _this.blockSize.width * _this.size.width)
                    continue;
                _this.context.moveTo(i, pixelGameRect.origin.y);
                _this.context.lineTo(i, pixelGameRect.size.height);
            }
            // Draws horizontal gridlines
            var yDiff = _this.position.y % _this.blockSize.height;
            var yposition = _this.position.y - yDiff;
            for (var i = -yDiff; i <= _this.canvas.height; i += _this.blockSize.height, yposition += _this.blockSize.height) {
                if (yposition < 0 || yposition > _this.blockSize.height * _this.size.height)
                    continue;
                _this.context.moveTo(pixelGameRect.origin.x, i);
                _this.context.lineTo(pixelGameRect.size.width, i);
            }
            _this.context.stroke();
            // Draw hover block
            if (_this.hoverBlock) {
                _this.context.beginPath();
                _this.context.strokeStyle = _this.hoverBlock.borderColor;
                _this.context.fillStyle = _this.hoverBlock.backgroundColor;
                var xPoint = _this.hoverBlock.position.x * _this.blockSize.width;
                var yPoint = _this.hoverBlock.position.y * _this.blockSize.height;
                var hoverBlockStartPoint = convertPointToScreenPosition(new Point(xPoint, yPoint));
                _this.context.rect(hoverBlockStartPoint.x, hoverBlockStartPoint.y, _this.blockSize.width, _this.blockSize.height);
                if (_this.hoverBlock.backgroundColor !== "clear")
                    _this.context.fill();
                if (_this.hoverBlock.borderColor !== "clear")
                    _this.context.stroke();
            }
            // Draw cells
            var maxBlockToRender = convertScreenPositionToBlockPoint(new Point(window.innerWidth, window.innerHeight));
            var minBlockToRender = convertScreenPositionToBlockPoint(new Point(0, 0));
            if (minBlockToRender.x < 0)
                minBlockToRender.x = 0;
            if (minBlockToRender.y < 0)
                minBlockToRender.y = 0;
            if (maxBlockToRender.x > _this.size.width)
                maxBlockToRender.x = _this.size.width;
            if (maxBlockToRender.y > _this.size.height)
                maxBlockToRender.y = _this.size.height;
            for (var i = minBlockToRender.x; i < maxBlockToRender.x; i++) {
                for (var j = minBlockToRender.y; j < maxBlockToRender.y; j++) {
                    if (_this.data[i][j] === 1) {
                        var neighborCount = _this.numberOfAliveNeighbors(i, j, _this.size.width, _this.size.height);
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
                        _this.context.beginPath();
                        _this.context.strokeStyle = block.borderColor;
                        _this.context.fillStyle = backgroundColor;
                        var xPoint = block.position.x * _this.blockSize.width;
                        var yPoint = block.position.y * _this.blockSize.height;
                        var blockStartPoint = convertPointToScreenPosition(new Point(xPoint, yPoint));
                        _this.context.rect(blockStartPoint.x, blockStartPoint.y, _this.blockSize.width, _this.blockSize.height);
                        _this.context.fill();
                        _this.context.stroke();
                        block = null;
                    }
                }
            }
            _this.updateDOMElements();
        };
        this.redraw = function () {
            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this.draw();
        };
        this.restart = function () {
            _this.time = 0;
            for (var i = 0; i < _this.size.width; i++) {
                for (var j = 0; j < _this.size.height; j++) {
                    _this.data[i][j] = 0;
                }
            }
            _this.redraw();
        };
        this.canvas = canvas;
        this.context = context;
        this.position = new Point(0, 0);
        this.size = new Size(140, 100);
        this.blockSize = new Size(15, 15);
        this.canvas.onmousedown = this.handleMouseDown.bind(this);
        this.canvas.onmouseup = this.handleMouseUp.bind(this);
        this.canvas.onmousemove = this.handleMouseMove.bind(this);
        this.canvas.onmousewheel = this.handleMouseWheel.bind(this);
        this.canvas.onclick = this.handleMouseClick.bind(this);
        this.randomize();
    }
    Game.prototype.updateDOMElements = function () {
        document.getElementById("timeDiv").innerHTML = "Time: " + this.time;
        document.getElementById("populationDiv").innerHTML = "Population: " + this.population;
    };
    return Game;
})();
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
