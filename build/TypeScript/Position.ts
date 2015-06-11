/*! * Defines a set of classes to manage coordinate systems */class Point {	x: number;	y: number;	constructor(x: number, y: number) {		this.x = x;		this.y = y;	}	addVector(x: number, y: number): void {		this.x += x;		this.y += y;	}	isEqual(point: Point) {		return this.x === point.x && this.y === point.y;	}}class Size {	width: number;	height: number;	constructor(width: number, height: number) {		this.width = width;		this.height = height;	}	isEqual(size: Size) {		return this.width === size.width && this.height === size.height;	}}class Rect {	size: Size;	origin: Point;	constructor(x: number, y: number, width: number, height: number) {		this.size = new Size(width, height);		this.origin = new Point(x,y);	}	isEqual(rect: Rect) {		return this.size.isEqual(rect.size) && this.origin.isEqual(rect.origin);	}}