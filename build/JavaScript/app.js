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
        var _this = this;
        this.maxX = function () {
            return _this.origin.x + _this.size.width;
        };
        this.maxY = function () {
            return _this.origin.y + _this.size.height;
        };
        this.size = new Size(width, height);
        this.origin = new Point(x, y);
    }
    Rect.prototype.isEqual = function (rect) {
        return this.size.isEqual(rect.size) && this.origin.isEqual(rect.origin);
    };
    Rect.prototype.intersectsRect = function (rect) {
        if (this.origin.x < rect.origin.x && this.maxX() > rect.origin.x && this.origin.y < rect.origin.y && this.maxY() > rect.origin.y)
            return false;
        return true;
    };
    return Rect;
})();
/// <reference path="Position.ts"/>
var Layer = (function () {
    function Layer(size) {
        var _this = this;
        this.clear = function () {
            _this.context.clearRect(0, 0, _this.canvas.width, _this, canvas.height);
        };
        this.size = size;
        this.canvas = document.createElement("canvas");
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        this.context = this.canvas.getContext("2d");
    }
    return Layer;
})();
// class View {
// 	canvas: any;
// 	context: any;
// 	frame: Rect;
// 	subviews: Array<View> = [];
// 	superview: View = null;
// 	private requiresRedraw = true;
// 	backgroundColor: string = null;
// 	constructor(frame: Rect) {
// 		this.frame = frame;
// 		this.canvas = document.createElement("canvas");
// 		this.canvas.height = frame.size.height;
// 		this.canvas.width = frame.size.width;
// 		this.context = this.canvas.getContext("2d");
// 	}
// 	addSubview = (subview: View) => {
// 		subview.superview = this;
// 		this.subviews.push(subview);
// 		subview.setRequiresRedraw();
// 	}
// 	setRequiresRedraw = () => {
// 		this.requiresRedraw = true;
// 		if (this.superview)
// 			this.superview.setRequiresRedraw();
// 		else
// 			this.render();
// 	}
// 	render = (rect?: Rect) => {
// 		this.context.clearRect(0, 0, this.frame.size.width, this.frame.size.height);
// 		// Draws the background color property of the view
// 		if (this.backgroundColor) {
// 			this.context.beginPath();
// 			this.context.fillStyle = this.backgroundColor;
// 			this.context.rect(0, 0, this.frame.size.width, this.frame.size.height);
// 			this.context.fill();
// 		}
// 		for (var i = 0; i < this.subviews.length; i++) {
// 			var subview: View = this.subviews[i];
// 			if (true) {
// 				subview.render();
// 				this.context.drawImage(subview.canvas, 0, 0, subview.frame.size.width, subview.frame.size.height, subview.frame.origin.x, subview.frame.origin.y, subview.frame.size.width, subview.frame.size.height);
// 			}
// 		}
// 		this.requiresRedraw = false;
// 	}
// } 
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
/// <reference path="View.ts"/>
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
TODO - Border on scrolling around (i.e. cap movement (limit movement))
TODO - Remove hover block when scrolling
TODO - add stripes over block if hover
*/
var Game = (function () {
    function Game(canvas, context) {
        var _this = this;
        this.hoverBlock = null;
        this.isMouseDown = false;
        this.isScrolling = false;
        this.didScrollSinceLastMouseClick = false;
        this.isPlaying = false;
        this.currentRefreshInterval = null;
        this.previousScrollEvent = null;
        this.time = 0;
        this.population = 0;
        this.speed = 100;
        this.gridLineColor = "#f3f3f3";
        this.randomize = function (probability) {
            _this.data = [];
            for (var i = 0; i < _this.size.width; i++) {
                var newCol = [];
                for (var j = 0; j < _this.size.height; j++) {
                    newCol[j] = Math.floor((Math.random() * 10) + 1) < 10 * probability ? 1 : 0;
                }
                _this.data[i] = newCol;
            }
        };
        this.play = function () {
            if (_this.isPlaying) {
                window.clearInterval(_this.currentRefreshInterval);
            }
            _this.isPlaying = true;
            _this.currentRefreshInterval = window.setInterval(_this.stepForward, _this.speed);
        };
        this.pause = function () {
            if (!_this.isPlaying)
                return;
            _this.isPlaying = false;
            window.clearInterval(_this.currentRefreshInterval);
            _this.currentRefreshInterval = null;
        };
        this.convertScreenPositionToBlock = function (point) {
            return new Point(Math.floor((point.x + _this.position.x) / _this.blockSize.width), Math.floor((point.y + _this.position.y) / _this.blockSize.height));
        };
        this.convertScreenPositionToBoardPosition = function (point) {
            return new Point((point.x + _this.position.x) / _this.blockSize.width, (point.y + _this.position.y) / _this.blockSize.height);
        };
        this.convertBoardPositionToScreenPosition = function (point) {
            return new Point(point.x - _this.position.x, point.y - _this.position.y);
        };
        this.handleMouseDown = function (event) {
            _this.isMouseDown = true;
        };
        this.handleMouseUp = function (event) {
            _this.isMouseDown = false;
            _this.isScrolling = false;
        };
        this.handleMouseMove = function (event) {
            if (_this.isMouseDown && _this.previousScrollEvent !== null) {
                _this.isScrolling = true;
                _this.didScrollSinceLastMouseClick = true;
                var xDiff = event.clientX - _this.previousScrollEvent.clientX;
                var yDiff = event.clientY - _this.previousScrollEvent.clientY;
                _this.position.addVector(-xDiff, -yDiff);
                _this.redraw();
            }
            else {
                var blockStart = _this.convertScreenPositionToBlock(new Point(event.clientX, event.clientY));
                if (blockStart.x >= 0 && blockStart.y >= 0 && blockStart.y < _this.size.height && blockStart.x < _this.size.width)
                    _this.hoverBlock = new Block(blockStart, "clear", "#E47297");
                else
                    _this.hoverBlock = null;
                _this.redraw();
            }
            _this.previousScrollEvent = event;
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
            _this.zoom(delta * 3, new Point(event.clientX, event.clientY));
        };
        this.zoom = function (delta, handle) {
            if (delta < 0) {
                while (_this.blockSize.width + delta < 3 && _this.blockSize.height + delta < 3 && delta < 0)
                    delta++;
            }
            var handleBoardPosition = _this.convertScreenPositionToBoardPosition(new Point(handle.x, handle.y));
            var differenceX = handleBoardPosition.x * delta;
            var differenceY = handleBoardPosition.y * delta;
            _this.position.addVector(differenceX, differenceY);
            _this.blockSize.width += delta;
            _this.blockSize.height += delta;
            _this.backgroundLayer = new Layer(new Size(_this.blockSize.width * _this.size.width, _this.blockSize.height * _this.size.height));
            _this.backgroundLayer.context.strokeStyle = "#f3f3f3";
            for (var i = 0; i <= _this.backgroundLayer.canvas.width; i += _this.blockSize.width) {
                _this.backgroundLayer.context.moveTo(i, 0);
                _this.backgroundLayer.context.lineTo(i, _this.backgroundLayer.canvas.height);
            }
            for (var i = 0; i <= _this.backgroundLayer.canvas.height; i += _this.blockSize.height) {
                _this.backgroundLayer.context.moveTo(0, i);
                _this.backgroundLayer.context.lineTo(_this.backgroundLayer.canvas.width, i);
            }
            _this.backgroundLayer.context.stroke();
            _this.redraw();
        };
        this.numberOfAliveNeighbors = function (x, y, xMax, yMax) {
            var neighborValue = function (i, j) {
                if (this.data[i][j] === 1)
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
        // Begin refactor here
        this.stepForward = function () {
            _this.population = 0;
            var newData = [];
            for (var i = 0; i < _this.size.width; i++) {
                var newCol = [];
                for (var j = 0; j < _this.size.height; j++) {
                    var currentValue = _this.data[i][j];
                    var neighborCount = _this.numberOfAliveNeighbors(i, j, _this.size.width, _this.size.height);
                    if (neighborCount == 2)
                        newCol.push(currentValue);
                    else if (neighborCount == 3)
                        newCol.push(1);
                    else
                        newCol.push(0);
                    if (newCol[j] === 1)
                        _this.population++;
                }
                newData[i] = newCol;
            }
            _this.data = newData;
            _this.time += 1;
            _this.redraw();
        };
        this.draw = function () {
            _this.context.drawImage(_this.backgroundLayer.canvas, _this.position.x, _this.position.y, _this.canvas.width, _this.canvas.height, 0, 0, _this.canvas.width, _this.canvas.height);
            _this.context.fillStyle = "black";
            _this.context.strokeStyle = _this.gridLineColor;
            var convertPointToScreenPosition = function (point) {
                return new Point(point.x - this.position.x, point.y - this.position.y);
            }.bind(_this);
            var convertScreenPositionToBlockPoint = function (point) {
                return new Point(Math.floor((point.x + this.position.x) / this.blockSize.width), Math.floor((point.y + this.position.y) / this.blockSize.height));
            }.bind(_this);
            // Draw cells
            var maxBlockToRender = convertScreenPositionToBlockPoint(new Point(window.innerWidth, window.innerHeight));
            maxBlockToRender.addVector(1, 1);
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
        this.size = new Size(100, 100);
        this.blockSize = new Size(15, 15);
        this.canvas.onmousedown = this.handleMouseDown.bind(this);
        this.canvas.onmouseup = this.handleMouseUp.bind(this);
        this.canvas.onmousemove = this.handleMouseMove.bind(this);
        this.canvas.onmousewheel = this.handleMouseWheel.bind(this);
        this.canvas.onclick = this.handleMouseClick.bind(this);
        this.backgroundLayer = new Layer(new Size(this.blockSize.width * this.size.width, this.blockSize.height * this.size.height));
        this.backgroundLayer.context.strokeStyle = "#f3f3f3";
        for (var i = 0; i <= this.backgroundLayer.canvas.width; i += this.blockSize.width) {
            this.backgroundLayer.context.moveTo(i, 0);
            this.backgroundLayer.context.lineTo(i, this.backgroundLayer.canvas.height);
        }
        for (var i = 0; i <= this.backgroundLayer.canvas.height; i += this.blockSize.height) {
            this.backgroundLayer.context.moveTo(0, i);
            this.backgroundLayer.context.lineTo(this.backgroundLayer.canvas.width, i);
        }
        this.backgroundLayer.context.stroke();
        this.randomize(0.3);
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
    game.randomize(0.3);
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
