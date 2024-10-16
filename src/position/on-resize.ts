import calculateComponentPositionAndSize from './calculateComponentPositionAndSize';

export class OnResize {
  dragging = false;
  startShapePoint: { x: number; y: number } | null = null;
  position: { left: number; top: number } | null = null;
  area: { width: number; height: number } | null = null;
  rotate = 0;
  constructor() {
    this.dragging = false;
    this.startShapePoint = null;
    this.position = null;
    this.area = null;
    this.rotate = 0;
  }
  drag(e: MouseEvent) {
    const { dragging, startShapePoint, position, area, rotate } = this;
    if (dragging && startShapePoint && position && area) {
      const { left, top } = position;
      const { width, height } = area;
      const rect = { left, top, width, height };
      // 组件宽高比
      const proportion = rect.width / rect.height;
      const style = { left, top, width, height, rotate };
      // 组件中心点
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const editor = document.querySelector('.editor') as HTMLElement;
      // 获取画布位移信息
      const editorRectInfo = editor.getBoundingClientRect();
      // 当前点击圆点相对于画布的中心坐标
      const curPoint = startShapePoint;
      // 获取对称点的坐标
      const symmetricPoint = {
        x: center.x - (curPoint.x - center.x),
        y: center.y - (curPoint.y - center.y),
      };
      const needLockProportion = false; // 是否是锁定宽高比形变
      const curPosition = {
        x: e.clientX - Math.round(editorRectInfo.left),
        y: e.clientY - Math.round(editorRectInfo.top),
      };
      calculateComponentPositionAndSize('rb', style, curPosition, proportion, needLockProportion, {
        center,
        curPoint,
        symmetricPoint,
      });
      console.log('style', style);
      return style;
    }
  }
  mousedown(e: MouseEvent) {
    const event: any = e;
    // 获取初始中心点
    const editor = document.querySelector('.editor') as HTMLElement;
    const editorRectInfo = editor.getBoundingClientRect();
    const pointRect = event.target.getBoundingClientRect();
    // 当前点击圆点相对于画布的中心坐标
    const startShapePoint = {
      x: Math.round(pointRect.left - editorRectInfo.left + event.target.offsetWidth / 2),
      y: Math.round(pointRect.top - editorRectInfo.top + event.target.offsetHeight / 2),
    };
    this.startShapePoint = startShapePoint;
    this.dragging = true;
  }
  mouseup(e: MouseEvent) {
    this.dragging = false;
    this.startShapePoint = null;
    this.clear();
  }
  setDragging(dragging: boolean) {
    this.dragging = dragging;
  }
  setStartShapePoint(startShapePoint: { x: number; y: number }) {
    this.startShapePoint = startShapePoint;
  }
  setPosition(position: { left: number; top: number }) {
    this.position = position;
  }
  setArea(area: { width: number; height: number }) {
    this.area = area;
  }
  setRotate(rotate: number) {
    this.rotate = rotate;
  }
  clear() {
    this.dragging = false;
    this.startShapePoint = null;
    this.position = null;
    this.area = null;
    this.rotate = 0;
  }
}
