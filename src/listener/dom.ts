import { OnResize } from '../position/on-resize';
import { ContainerEvent, ContainerEventData } from '../event/continer';

let offsetX = 0;
let offsetY = 0;
let dragging = false;
let draggingEl: HTMLDivElement | null = null;
let time = 0;
let root: HTMLDivElement | null = null;
let type = 'absolute' as 'absolute' | 'transform';
let rotateValue = 0; // 保存旋转值
let resizering = false;
let resizerEl: HTMLDivElement | null = null;
const onResize = new OnResize(); // 组建拖动缩放旋转

const dispatch = (data: ContainerEventData) => {
  if (!data.type) {
    return;
  }
  if (data.data) data.data.rid = root.dataset.entryId;
  const event = new ContainerEvent('onContainer', data, {
    // type: 'onPosition',
    bubbles: true, // 事件是否冒泡
    cancelable: true, // 是否可以取消事件的默认动作
    composed: true, // 事件是否会在影子DOM根之外触发侦听器
  });
  root?.dispatchEvent(event);
};
const drag = (e: MouseEvent) => {
  if (resizering && resizerEl) {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    if (rotateValue > 0) {
      // const style = onResize.drag(e);
      // console.log('style', style);
    }
    resizerEl.style.width = `${x}px`;
    resizerEl.style.height = `${y}px`;
    return;
  }
  if (draggingEl && type === 'absolute') {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    draggingEl.style.left = `${x}px`;
    draggingEl.style.top = `${y}px`;
  } else if (draggingEl && type === 'transform') {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    // translate rotate scale skew preserve
    // 更新 translate，并保留其他 transform 属性
    draggingEl.style.transform = `
translate(${x}px, ${y}px)
rotate(${rotateValue}deg)
`;
  }
  if (!draggingEl) {
    //
    const target = e.target as HTMLDivElement;
    const closestDataElement = target.closest('[data-cid]');
    const clearHover = () => {
      const containerHover = root.querySelectorAll('.kv-container.hover');
      containerHover.forEach((item) => {
        item.classList.remove('hover');
      });
    };
    const el = closestDataElement as HTMLDivElement;
    if (el) {
      clearHover();
      const dataset = el.dataset;
      if (dataset.pid !== 'undefined') {
        el.classList.add('hover');
      }
    } else {
      clearHover();
    }
  }
};
const dragEnd = (e) => {
  offsetX = 0;
  offsetY = 0;
  rotateValue = 0;
  // let clickTime = Date.now() - time;
  if (Date.now() - time < 200) {
    dragging = false;
    // 无效移动，但是属于点击事件
  } else {
    setTimeout(() => {
      dragging = false;
    }, 200);
    // 有效移动
    if (draggingEl) {
      const computedStyle = window.getComputedStyle(draggingEl);
      const { left, top, position, transform } = computedStyle;
      if (type !== 'transform') {
        dispatch({
          type: 'position',
          data: {
            cid: draggingEl.dataset.cid,
            pid: draggingEl.dataset.pid,
            left: parseInt(left),
            top: parseInt(top),
          },
        });
      } else {
        const transform = draggingEl.style.transform;
        dispatch({
          type: 'position',
          data: {
            cid: draggingEl.dataset.cid,
            pid: draggingEl.dataset.pid,
            transform,
          },
        });
      }
    }
    if (resizerEl) {
      const computedStyle = window.getComputedStyle(resizerEl);
      const { width, height, left, top } = computedStyle;
      dispatch({
        type: 'resize',
        data: {
          cid: resizerEl.dataset.cid,
          pid: resizerEl.dataset.pid,
          width: parseInt(width),
          height: parseInt(height),
        },
      });
    }
  }
  if (draggingEl) {
    // 移动完成后清除 dragging 样式
    draggingEl.classList.remove('dragging');
  }
  resizering = false;
  resizerEl = null;
  draggingEl = null;
  time = 0;
};

export const onClick = (e: MouseEvent) => {
  if (dragging) {
    return;
  }
  /**
   * 清除所有的active
   */
  const clearActive = (pop = true) => {
    const containerActive = root.querySelectorAll('.kv-container.active');
    containerActive.forEach((item) => {
      item.classList.remove('active');
    });
    if (pop) {
      dispatch({
        type: 'active',
        data: null,
      });
    }
  };
  const target = e.target as HTMLDivElement;
  const closestDataElement = target.closest('[data-cid]') as HTMLDivElement;
  // console.log('target', target, closestDataElement);
  if (!closestDataElement) {
    // console.log('点在了根元素上');
    clearActive();
    return;
  }

  if (!dragging) {
    clearActive(false);
    closestDataElement.classList.add('active');
    dispatch({
      type: 'active',
      data: {
        cid: closestDataElement.dataset.cid,
        pid: closestDataElement.dataset.pid,
      },
    });
  }
  dragging = false;
  resizering = false;
};
export const mousedown = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement;
  // resiver 点击后拖动放大缩小
  if (target.classList.contains('resizer')) {
    time = Date.now();
    resizering = true;
    resizerEl = target.parentElement as HTMLDivElement;
    const computedStyle = window.getComputedStyle(resizerEl);
    const { width, height, left, top } = computedStyle;
    if (computedStyle.transform !== 'none') {
      const transform = computedStyle.transform;
      // 如果旋转了，计算位置
      const matrixValues = transform
        .match(/matrix\(([^)]+)\)/)[1]
        .split(',')
        .map(parseFloat);
      const [a, b, c, d, tx, ty] = matrixValues;

      // 反推计算 rotate, scale, skew
      rotateValue = Math.atan2(b, a) * (180 / Math.PI);
      onResize.setRotate(rotateValue);
      onResize.setPosition({
        left: parseInt(left),
        top: parseInt(top),
      });
      onResize.setArea({
        width: parseInt(width),
        height: parseInt(height),
      });
      onResize.mousedown(e);
    }
    offsetX = e.clientX - resizerEl.offsetWidth;
    offsetY = e.clientY - resizerEl.offsetHeight;
    return;
  }
  const closestDataElement = target.closest('[data-cid]');
  if (!closestDataElement) {
    // console.log('点在了根元素上');
    return;
  }
  time = Date.now();
  dragging = true;
  // console.log('closestDataElement', closestDataElement);
  let el = closestDataElement as HTMLDivElement;
  el.classList.add('dragging');
  const computedStyle = window.getComputedStyle(el);
  const position = computedStyle.position;
  const transform = computedStyle.transform;
  if (position === 'absolute' || position === 'relative' || position === 'fixed' || position === 'sticky') {
    type = 'absolute';
  } else if (transform !== 'none') {
    type = 'transform';
  } else {
    console.error('position is not absolute or relative or fixed or sticky', 'and transform is none');
    el.classList.remove('dragging');
    dragging = false;
    return;
  }

  draggingEl = el;
  if (type === 'absolute') {
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  }
  if (type === 'transform') {
    // console.log('transform', transform);
    // transform: matrix(1, 0, 0, 1, 0, 0); 2d只能反推出这个 rotate, scaleX, scaleY,skwewX
    // transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); 3d
    if (transform !== 'none') {
      const transformArr = transform.split(',');
      offsetX = e.clientX - parseInt(transformArr[4]);
      offsetY = e.clientY - parseInt(transformArr[5]);

      const matrixValues = transform
        .match(/matrix\(([^)]+)\)/)[1]
        .split(',')
        .map(parseFloat);
      const [a, b, c, d, tx, ty] = matrixValues;

      // 反推计算 rotate, scale, skew
      rotateValue = Math.atan2(b, a) * (180 / Math.PI);
      // scaleX = Math.sqrt(a * a + b * b);
      // scaleY = Math.sqrt(c * c + d * d);
      // skewX = Math.atan2(c, d) * (180 / Math.PI);
    } else {
      // 没有 transform 的情况下初始化
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;

      rotateValue = 0;
      // scaleX = 1;
      // scaleY = 1;
      // skewX = 0;
    }
  }
};
export const addListener = (dom: HTMLDivElement | string) => {
  const target = typeof dom === 'string' ? document.querySelector(dom) : dom;
  if (!target) {
    console.error('target is not exist');
    return;
  }
  root = target as HTMLDivElement;
  const listening = root.dataset.listening;
  if (root && listening !== 'true') {
    root.addEventListener('click', onClick);
    root.addEventListener('mousedown', mousedown);
    // 鼠标移动时更新位置
    root.addEventListener('mousemove', drag);
    // // 鼠标松开时结束拖动
    root.addEventListener('mouseup', dragEnd);
    root.dataset.listening = 'true';
  }
};
