/// <reference path="Position.ts"/>


class View {

	canvas: any;
	context: any;

	frame: Rect;
	subviews: Array<View> = [];
	superview: View = null;

	private requiresRedraw = true;

	backgroundColor: string = null;

	constructor(frame: Rect) {
		this.frame = frame;

		this.canvas = document.createElement("canvas");
		this.canvas.height = frame.size.height;
		this.canvas.width = frame.size.width;

		this.context = canvas.getContext("2d");
	}

	addSubview = (subview: View) => {
		subview.superview = this;
		this.subviews.push(subview);
		this.setRequiresRedraw();

		this.render(subview.frame);
	}

	setRequiresRedraw = () => {
		this.requiresRedraw = true;

		if (this.superview)
			this.superview.setRequiresRedraw();
	}


	render = (rect: Rect) => {

		if (!this.requiresRedraw)
			return;

		this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);

		if (this.backgroundColor) {
			this.context.beginPath();
			this.context.fillStyle = this.backgroundColor;
			this.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
			this.context.fill();
		}

		for (var i = 0; i < this.subviews.length; i++) {
			var subview: View = this.subviews[i];
			if (subview.requiresRedraw && subview.frame.intersectsRect(this.frame)) {
				subview.render(subview.frame);
				this.context.clearRect(subview.frame.origin.x, subview.frame.origin.y, subview.frame.size.width, subview.frame.size.height);
				this.context.drawImage(subview.canvas, subview.frame.origin.x, subview.frame.origin.y, subview.frame.size.width, subview.frame.size.height);
			}
			
		}

		this.requiresRedraw = false;
	}


}