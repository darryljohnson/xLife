class View {

	frame: Rect;
	children: Array<View>;

	private canvas: any;
	private context: any;

	constructor(frame: Rect) {
		this.frame = frame;

		this.canvas = document.createElement("canvas");
		this.canvas.height = frame.size.height;
		this.canvas.width = frame.size.width;

		this.context = canvas.getContext("2d");
	}
}