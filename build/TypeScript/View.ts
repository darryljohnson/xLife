/// <reference path="Position.ts"/>


class Layer {

	canvas: any;
	context: any;

	size: Size;

	constructor(size: Size) {
		this.size = size;

		this.canvas = document.createElement("canvas");
		this.canvas.width = size.width;
		this.canvas.height = size.height;
		this.context = this.canvas.getContext("2d");
	}

	clear = () => {
		this.context.clearRect(0, 0, this.canvas.width, this, canvas.height);
	}

}

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