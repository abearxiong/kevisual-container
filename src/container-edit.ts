import { Container, ContainerOpts } from './container';
import { addListener } from './listener/dom';
export type ContainerEditOpts = {
  edit?: boolean;
  mask?: boolean;
} & ContainerOpts;
let isListener = false;
export class ContainerEdit extends Container {
  edit?: boolean;
  mask?: boolean;
  constructor(opts: ContainerEditOpts) {
    let { edit, mask, data, ...opts_ } = opts;
    let _edit = edit ?? true;
    if (_edit) {
      data = data.map((item) => {
        if (item.shadowRoot) {
          item.shadowRoot = false;
        }
        return item;
      });
    }
    super({ data, ...opts_ });
    this.edit = _edit;
    this.mask = mask ?? true;
    if (_edit) {
      if (!isListener) {
        isListener = true;
        addListener(this.root);
      }
    }
  }
  renderChildren(cid: string, parentElement?: any, pid?: any) {
    const el = super.renderChildren(cid, parentElement, pid);

    if (el) {
      const computedStyle = window.getComputedStyle(el);
      const { position } = computedStyle;
      const isAbsolute = position === 'absolute' || position === 'relative' || position === 'fixed' || position === 'sticky';
      if (isAbsolute) {
        const elResizer = document.createElement('div');
        elResizer.className = 'resizer';
        Object.assign(elResizer.style, {
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          width: '8px',
          height: '8px',
          cursor: 'nwse-resize',
          background: 'white',
          borderRadius: '50%',
          border: '1px solid #70c0ff',
        });
        elResizer.dataset.bindId = pid ? pid + '-' + cid : cid;
        el.appendChild(elResizer);

        const elDragTitle = document.createElement('div');
        elDragTitle.className = 'drag-title';
        Object.assign(elDragTitle.style, {
          position: 'absolute',
          top: '-10px',
          left: '0',
          width: 'calc(100% + 4px)',
          height: '10px',
          cursor: 'move',
          background: '#195ca9',
          transform: 'translateX(-2px)',
          zIndex: '9',
        });
        elDragTitle.dataset.bindId = pid ? pid + '-' + cid : cid;
        el.appendChild(elDragTitle);
      }
    }
  }
}
