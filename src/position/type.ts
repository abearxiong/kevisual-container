export type Point = {
	x: number;
	y: number;
};
export type Position = {
	left: number;
	top: number;
	width?: number;
	height?: number;
	rotate?: number;
	zIndex?: number;
	lock?: boolean;
};
export type Area = {
	width: number;
	height: number;
};
export type PositionData = {
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	rotate?: number;
};
export type Direction = 'lt' | 't' | 'rt' | 'r' | 'rb' | 'b' | 'lb' | 'l';
