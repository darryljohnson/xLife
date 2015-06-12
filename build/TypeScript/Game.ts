/// <reference path="TypeDefinitions/jquery.d.ts" />
/// <reference path="Position.ts"/>
/// <reference path="View.ts"/>

class Block {

	position: Point;
	backgroundColor: string;
	borderColor: string;

	constructor(position: Point, backgroundColor: string, borderColor: string) {
		this.position = position;
		this.backgroundColor = backgroundColor;
		this.borderColor = borderColor;
	}
}

/*

TODO - moveTo animated
TODO - Border on scrolling around (i.e. cap movement (limit movement))
TODO - Remove hover block when scrolling
TODO - add stripes over block if hover
*/
class Game {
	canvas: any;
	context: any;

	// Position is defined as the board location of the (0,0) browser location
	position: Point;
	size: Size;
	blockSize: Size;
	hoverBlock: Block = null;

	isMouseDown: boolean = false;
	isScrolling: boolean = false;
	didScrollSinceLastMouseClick: boolean = false;
	isPlaying: boolean = false;

	data: Array<Array<number>>;

	private currentRefreshInterval: any = null;
	private previousScrollEvent: any = null;

	time: number = 0;
	population: number = 0;
	speed: number = 100;

	gridLineColor: string = "#f3f3f3";

	constructor(canvas, context) {

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

		this.randomize(0.3);
	}

	public randomize = (probability: number): void => {
		this.data = [];

		for (var i = 0; i < this.size.width; i++) {
			var newCol = [];

			for (var j = 0; j < this.size.height; j++) {
				newCol[j] = Math.floor((Math.random() * 10) + 1) < 10 * probability ? 1 : 0;
			}

			this.data[i] = newCol;
		}
	}

	public play = (): void => {
		if (this.isPlaying) {
			window.clearInterval(this.currentRefreshInterval);
		}

		this.isPlaying = true;
		this.currentRefreshInterval = window.setInterval(this.stepForward, this.speed);
	}

	public pause = (): void => {
		if (!this.isPlaying)
			return;

		this.isPlaying = false;
		window.clearInterval(this.currentRefreshInterval);
		this.currentRefreshInterval = null;
	}

	private convertScreenPositionToBlock = (point: Point): Point => {
		return new Point(Math.floor((point.x + this.position.x) / this.blockSize.width), Math.floor((point.y + this.position.y) / this.blockSize.height));
	}

	private convertScreenPositionToBoardPosition = (point: Point): Point => {
		return new Point((point.x + this.position.x) / this.blockSize.width, (point.y + this.position.y) / this.blockSize.height);
	}

	private convertBoardPositionToScreenPosition = (point: Point): Point => {
		return new Point(point.x - this.position.x, point.y - this.position.y);
	}

	private handleMouseDown = (event: any): void => {
		this.isMouseDown = true;
	}

	private handleMouseUp = (event: any): void  => {
		this.isMouseDown = false;
		this.isScrolling = false;
	}

	private handleMouseMove = (event): void => {
		if (this.isMouseDown && this.previousScrollEvent !== null) {

			this.isScrolling = true;
			this.didScrollSinceLastMouseClick = true;

			var xDiff = event.clientX - this.previousScrollEvent.clientX;
			var yDiff = event.clientY - this.previousScrollEvent.clientY;

			this.position.addVector(-xDiff, -yDiff);

			this.redraw();

		} else {

			var blockStart: Point = this.convertScreenPositionToBlock(new Point(event.clientX, event.clientY));

			if (blockStart.x >= 0 && blockStart.y >= 0 && blockStart.y < this.size.height && blockStart.x < this.size.width)
				this.hoverBlock = new Block(blockStart, "clear", "#E47297");
			else
				this.hoverBlock = null;

			this.redraw();
		}

		this.previousScrollEvent = event;
	}

	private handleMouseClick = (event): void => {
		if (this.hoverBlock !== null && this.didScrollSinceLastMouseClick === false) {
			var value = this.data[this.hoverBlock.position.x][this.hoverBlock.position.y];

			if (value === 1) {
				this.data[this.hoverBlock.position.x][this.hoverBlock.position.y] = 0;
			} else {
				this.data[this.hoverBlock.position.x][this.hoverBlock.position.y] = 1;
			}

			this.redraw();
		}

		this.didScrollSinceLastMouseClick = false;
	}

	private handleMouseWheel = (event: any): void => {
		var delta: number = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		this.zoom(delta * 3, new Point(event.clientX, event.clientY));
	}

	public zoom = (delta: number, handle: Point): void => {

		if (delta < 0) {
			while (this.blockSize.width + delta < 3 && this.blockSize.height + delta < 3 && delta < 0)
				delta++;
		}

		var handleBoardPosition = this.convertScreenPositionToBoardPosition(new Point(handle.x, handle.y));
		var differenceX: number = handleBoardPosition.x * delta;
		var differenceY: number = handleBoardPosition.y * delta;

		this.position.addVector(differenceX, differenceY);

		this.blockSize.width += delta;
		this.blockSize.height += delta;

		this.redraw();
	}

	public numberOfAliveNeighbors = (x: number, y: number, xMax: number, yMax: number): number => {
		var neighborValue = function(i: number, j: number): number {
			if (this.data[i][j] === 1)
				return 1;

			return 0;
		}.bind(this);

		function mod(x: number, m: number): number {
			m = Math.abs(m);
			return (x % m + m) % m;
		}

		var sum: number = 0;

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
	}
	// Begin refactor here
	public stepForward = (): void => {

		this.population = 0;

		var newData = [];

		for (var i = 0; i < this.size.width; i++) {
			var newCol = [];

			for (var j = 0; j < this.size.height; j++) {
				var currentValue = this.data[i][j];
				var neighborCount: number = this.numberOfAliveNeighbors(i, j, this.size.width, this.size.height);

				if (neighborCount == 2)
					newCol.push(currentValue)
				else if (neighborCount == 3)
					newCol.push(1);
				else
					newCol.push(0);

				if (newCol[j] === 1)
					this.population++;

			}

			newData[i] = newCol;
		}

		this.data = newData;
		this.time += 1;

		this.redraw();
	}

	public draw = (): void => {

		this.context.fillStyle = "black";
		this.context.strokeStyle = this.gridLineColor;

		var convertPointToScreenPosition = function(point: Point): Point {
			return new Point(point.x - this.position.x, point.y - this.position.y);
		}.bind(this);

		var convertScreenPositionToBlockPoint = function(point: Point): Point {
			return new Point(Math.floor((point.x + this.position.x) / this.blockSize.width), Math.floor((point.y + this.position.y) / this.blockSize.height));
		}.bind(this);

		var pixelGameRect: Rect = new Rect(convertPointToScreenPosition(new Point(0, 0)).x, convertPointToScreenPosition(new Point(0, 0)).y, convertPointToScreenPosition(new Point(this.blockSize.width * this.size.width, this.blockSize.height * this.size.height)).x, convertPointToScreenPosition(new Point(this.blockSize.width * this.size.width, this.blockSize.height * this.size.height)).y);

		this.context.beginPath();

		// Draws vertical gridlines
		var xDiff: number = this.position.x % this.blockSize.width;
		var xposition: number = this.position.x - xDiff;

		for (var i: number = -xDiff; i <= this.canvas.width; i += this.blockSize.width, xposition += this.blockSize.width) {

			if (xposition < 0 || xposition > this.blockSize.width * this.size.width)
				continue;

			this.context.moveTo(i, pixelGameRect.origin.y);
			this.context.lineTo(i, pixelGameRect.size.height);

		}


		// Draws horizontal gridlines
		var yDiff: number = this.position.y % this.blockSize.height;
		var yposition: number = this.position.y - yDiff;

		for (var i: number = -yDiff; i <= this.canvas.height; i += this.blockSize.height, yposition += this.blockSize.height) {

			if (yposition < 0 || yposition > this.blockSize.height * this.size.height)
				continue;


			this.context.moveTo(pixelGameRect.origin.x, i);
			this.context.lineTo(pixelGameRect.size.width, i);

		}

		this.context.stroke();

		// Draw cells

		var maxBlockToRender: Point = convertScreenPositionToBlockPoint(new Point(window.innerWidth, window.innerHeight));
		var minBlockToRender: Point = convertScreenPositionToBlockPoint(new Point(0, 0));

		if (minBlockToRender.x < 0)
			minBlockToRender.x = 0;
		if (minBlockToRender.y < 0)
			minBlockToRender.y = 0;
		if (maxBlockToRender.x > this.size.width)
			maxBlockToRender.x = this.size.width;
		if (maxBlockToRender.y > this.size.height)
			maxBlockToRender.y = this.size.height;

		for (var i: number = minBlockToRender.x; i < maxBlockToRender.x; i++) {
			for (var j: number = minBlockToRender.y; j < maxBlockToRender.y; j++) {

				if (this.data[i][j] === 1) {
					var neighborCount: number = this.numberOfAliveNeighbors(i, j, this.size.width, this.size.height);

					var backgroundColor: string = "#EFF5F9";

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

					var block: Block = new Block(new Point(i, j), backgroundColor, "#DEECF7");

					this.context.beginPath();
					this.context.strokeStyle = block.borderColor;
					this.context.fillStyle = backgroundColor;

					var xPoint: number = block.position.x * this.blockSize.width;
					var yPoint: number = block.position.y * this.blockSize.height;

					var blockStartPoint: Point = convertPointToScreenPosition(new Point(xPoint, yPoint));
					this.context.rect(blockStartPoint.x, blockStartPoint.y, this.blockSize.width, this.blockSize.height);

					this.context.fill();
					this.context.stroke();

					block = null;

				}
			}
		}

		// Draw hover block
		if (this.hoverBlock) {
			this.context.beginPath();

			this.context.strokeStyle = this.hoverBlock.borderColor;
			this.context.fillStyle = this.hoverBlock.backgroundColor;

			var xPoint: number = this.hoverBlock.position.x * this.blockSize.width;
			var yPoint: number = this.hoverBlock.position.y * this.blockSize.height;

			var hoverBlockStartPoint: Point = convertPointToScreenPosition(new Point(xPoint, yPoint));

			this.context.rect(hoverBlockStartPoint.x, hoverBlockStartPoint.y, this.blockSize.width, this.blockSize.height);

			if (this.hoverBlock.backgroundColor !== "clear")
				this.context.fill();

			if (this.hoverBlock.borderColor !== "clear")
				this.context.stroke();

		}



		this.updateDOMElements();
	}

	public redraw = (): void => {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.draw();
	};

	public restart = (): void => {
		this.time = 0;

		for (var i = 0; i < this.size.width; i++) {
			for (var j = 0; j < this.size.height; j++) {
				this.data[i][j] = 0;
			}
		}

		this.redraw();
	};

	public updateDOMElements(): void {
		document.getElementById("timeDiv").innerHTML = "Time: " + this.time;
		document.getElementById("populationDiv").innerHTML = "Population: " + this.population;
	}

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


// var game = new Game(canvas, context);


var view = new View(new Rect(0,0,500,500));
view.canvas = canvas;
view.context = context;
view.backgroundColor = "#000000";
view.render(view.frame);

var view2 = new View(new Rect(100,100,100,100));
view2.backgroundColor = "#D1F6C2";
view.addSubview(view2);

var view3 = new View(new Rect(250, 250, 100, 100));
view3.backgroundColor = "#A1A6C2";
view.addSubview(view3);

var view4 = new View(new Rect(10, 10, 10, 10));
view4.backgroundColor = "#A1A6C2";
view2.addSubview(view4);

buttonPlayPress();

// Button interactions

function buttonPlayPress() {

	var playButton = document.getElementById('button_play').children[0];
	var fastForwardButton = document.getElementById('button_fast');
	var stepButton = document.getElementById('button_step');

	if (game.isPlaying) {
		buttonStopPress();
	} else {
		playButton.className = "fa fa-pause";
		fastForwardButton.className = fastForwardButton.className.replace( /(?:^|\s)disabled(?!\S)/g , '' );
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
	stepButton.className = stepButton.className.replace( /(?:^|\s)disabled(?!\S)/g , '' );
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
	if(game.speed === 40) {
		game.speed = 100;
		game.play();

		var fastButton = document.getElementById('button_fast').children[0];
		fastButton.className = fastButton.className.replace( /(?:^|\s)fa-close(?!\S)/g , '' );
		fastButton.className += " fa-forward"
	} else {
		var fastButton = document.getElementById('button_fast').children[0];
		fastButton.className = fastButton.className.replace( /(?:^|\s)fa-forward(?!\S)/g , '' );
		fastButton.className += " fa-close"

		game.speed = 40;
		game.play();
	}

}

function buttonZoomInPress() {
	game.zoom(5, new Point(window.innerWidth/2, window.innerHeight/2));
}

function buttonZoomOutPress() {
	game.zoom(-5, new Point(window.innerWidth/2, window.innerHeight/2));
}

$('#entirePanel').hoverIntent(function(){
	$("#additionalContentWrapper").show("fast");
}, function(){
	$("#additionalContentWrapper").hide("fast");
});

// Enables all tooltips in the document
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});








