import createEmotion from '@emotion/css/create-instance';
import EventEmitter from 'eventemitter3';
import { MD5 } from 'crypto-js';
import { ContainerEvent } from './event/continer';
import { RenderCode } from './render';
import { ContainerStore, createContainerStore } from './store';
import { StoreApi } from 'zustand/vanilla';
type CodeUrl = {
  url: string; // 地址
  code?: string; // 代码
  id?: string; // codeId
  hash?: string;
};
export class CodeUrlManager {
  urls: CodeUrl[] = [];
  urlMap: { [key: string]: CodeUrl } = {};
  constructor() {
    this.urls = [];
  }
  addCode(code: string, id: string, hash?: string) {
    const urlMap = this.urlMap;
    const resultContent = (content: CodeUrl) => {
      const index = this.urls.findIndex((item) => item.id === id);
      if (index === -1) {
        this.urls.push(content);
      }
      return content;
    };
    if (urlMap[hash]) {
      // 可能id不同，但是hash相同。已经加载过了。
      const content = {
        ...urlMap[hash],
        id,
      };
      return resultContent(content);
    }
    const _hash = hash || MD5(code).toString();
    if (urlMap[_hash]) {
      const content = {
        ...urlMap[_hash],
        id,
      };
      return resultContent(content);
    }
    const index = this.urls.findIndex((item) => item.id === id);
    if (index > -1) {
      // 没有共同hash的值了，但是还是找了id，这个时候应该移除之前
      const url = this.urls[index];
      const list = this.urls.filter((item) => item.hash === url.hash);
      if (list.length <= 1) {
        // 这个hash的值没有人用了
        URL.revokeObjectURL(url.url);
        this.urlMap[url.hash] = null;
      }
      this.urls.splice(index, 1);
    }
    /**
     * 全新代码
     *
     */
    const url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
    const content = {
      id,
      url,
      code,
      hash: _hash,
    };

    this.urls.push(content);
    urlMap[_hash] = { ...content, id: null };
    return content;
  }
  removeUrl(id?: string, url?: string) {
    const index = this.urls.findIndex((item) => item.url === url || item.id === id);
    if (index > -1) {
      const url = this.urls[index];
      URL.revokeObjectURL(url.url);
      this.urlMap[url.hash] = null;
      this.urls.splice(index, 1);
    }
  }
}
export const codeUrlManager = new CodeUrlManager();
const handleOneCode = async (data: RenderData) => {
  const { code } = data;
  const urlsBegin = ['http', 'https', 'blob', '/'];
  if (typeof code === 'string' && code && urlsBegin.find((item) => code.startsWith(item))) {
    return data;
  }
  if (typeof code === 'string' && data.codeId) {
    const codeId = data.codeId;
    const { url, hash } = codeUrlManager.addCode(code, codeId, data.hash);
    const { render, unmount, ...rest } = await import(/* @vite-ignore */ url);
    const _data = {
      ...data,
      codeId,
      hash,
      code: {
        render,
        unmount,
        ...rest,
      },
    };
    return _data;
  }
  return data;
};
export const handleCode = async (data: RenderData[]) => {
  const handleData = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const _data = await handleOneCode(item);
    handleData.push(_data);
  }
  return handleData;
};

export type RenderData = {
  id: string; // id不会重复
  children?: string[];
  parents?: string[];
  className?: string;
  style?: React.CSSProperties | { [key: string]: string };
  code: RenderCode | string;
  codeId?: string;
  shadowRoot?: boolean;
  hash?: string;
  [key: string]: any;
};

export type ContainerOpts = {
  root?: HTMLDivElement | string;
  shadowRoot?: ShadowRoot;
  destroy?: () => void;
  data?: RenderData[];
  showChild?: boolean;
};

export class Container {
  root: HTMLDivElement;
  globalCss: any;
  showChild: boolean;
  event: EventEmitter;
  entryId: string = '';
  store: StoreApi<ContainerStore>;
  constructor(opts: ContainerOpts) {
    const data = opts.data || [];
    this.store = createContainerStore();
    this.loadData.apply(this, [data]);

    const rootElement = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root;
    this.root = rootElement || (document.body as any);
    this.globalCss = createEmotion({ key: 'css-global', speedy: true }).css;
    this.showChild = opts.showChild ?? true;
    const event = new EventEmitter();
    this.event = event;
    const listening = this.root.dataset.listening;
    if (listening !== 'true') {
      this.root.addEventListener('onContainer', (e: ContainerEvent) => {
        const { type, data } = e.data;
        this.event.emit(type, data);
      });
    }
  }
  async loadData(data: RenderData[], key: string = '') {
    const store = this.store;
    const res = await store.getState().loadData(data);
    if (res) {
      this.event.emit('loadedData' + key);
    } else {
      // TODO: loading
    }
  }
  async getData({ id, codeId }: { id?: string; codeId?: string }) {
    return await this.store.getState().getData({ id, codeId });
  }
  async updateDataCode(data: RenderData[]) {
    return await this.store.getState().updateDataCode(data);
  }
  async updateData(data: RenderData[]) {
    return await this.store.getState().updateData(data);
  }

  renderChildren(cid: string, parentElement?: any, pid?: any): void | HTMLDivElement {
    const data = this.store.getState().data;
    const globalCss = this.globalCss;
    if (!parentElement) {
      parentElement = this.root;
      this.root.dataset.entryId = cid;
      this.entryId = cid;
    }
    const renderChildren = this.renderChildren.bind(this);
    const node = data.find((node: RenderData) => node.id === cid);
    const event = this.event;
    if (!node) {
      console.warn('node not found', cid);
      return;
    }
    const { style, code } = node;
    const el = document.createElement('div');
    const root = parentElement.appendChild(el);
    const parentIds = parentElement.dataset.parentIds || '';
    const shadowRoot = node.shadowRoot ? el.attachShadow({ mode: 'open' }) : null;
    const { css, sheet, cache } = createEmotion({ key: 'css' });
    el.dataset.cid = cid;
    el.dataset.pid = pid;
    el.dataset.parentIds = parentIds ? parentIds + ',' + cid : cid;
    if (shadowRoot) {
      cache.insert = (selector: string, serialized: any, sheet: any, shouldCache: boolean) => {
        const style = document.createElement('style');
        style.textContent = selector;
        shadowRoot.appendChild(style);
      };
    }
    el.className = !shadowRoot ? globalCss(style as any) : css(style as any);
    el.classList.add(cid, 'kv-container');
    const { render, unmount } = (code as RenderCode) || {};
    let renderRoot = node.shadowRoot ? shadowRoot : root;
    if (render) {
      render({
        root: root,
        shadowRoot,
        renderRoot,
        event,
        container: this as any,
        code: code as RenderCode,
        data: node,
        css: shadowRoot ? css : globalCss,
      });
    } else {
      // no render, so no insert
    }

    if (event) {
      const destroy = (id: string) => {
        if (id) {
          if (id === cid || node?.parents?.find?.((item) => item === id)) {
            unmount?.(); // 销毁父亲元素有这个元素的
            event.off('destroy', destroy); // 移除监听
          } else {
            // console.warn('destroy id not found, and not find parentIds', id, 'currentid', cid);
          }
        } else if (!id) {
          unmount?.(); //  所有的都销毁
          event.off('destroy', destroy);
        }
        // 不需要销毁子元素
      };
      event.on('destroy', destroy);
    }
    if (shadowRoot) {
      const slot = document.createElement('slot');
      shadowRoot.appendChild(slot);
    }
    if (!this.showChild) {
      return;
    }
    const childrenIds = node.children || [];
    childrenIds.forEach((childId) => {
      renderChildren(childId, root, cid);
    });
    return el;
  }
  async destroy(id?: string) {
    if (!id) {
      this.root.innerHTML = '';
    } else {
      const el = this.root.querySelector(`[data-cid="${id}"]`);
      if (el) {
        el.remove();
      }
    }
    this.event.emit('destroy', id);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 200);
    });
  }
  /**
   * 只能用一次
   * @param entryId
   * @param data
   * @param opts
   * @returns
   */
  async render(entryId: string, data?: RenderData[], opts: { reload?: boolean } = {}) {
    if (this.entryId && this.entryId !== entryId) {
      await this.destroy();
    } else if (this.entryId) {
      this.destroy(entryId);
    }
    const _data = data || this.store.getState().data;
    this.entryId = entryId;
    if (opts?.reload) {
      this.store.getState().setLoading(true);
      await this.loadData.apply(this, [_data]);
    }
    const loading = this.store.getState().loading;
    const loaded = this.store.getState().loaded;
    if (loading || !loaded) {
      this.event.once('loadedData', () => {
        this.renderChildren(entryId);
      });
      return;
    } else {
      this.renderChildren(entryId);
    }
  }
  async hotReload(id: string) {
    await this.destroy(id);
    // const node = document.querySelector(`[data-cid="${id}"]`);
    const loading = this.store.getState().loading;
    if (loading) {
      this.event.once('loadedData', () => {
        this.renderChildren(id);
      });
      return;
    } else {
      this.renderChildren(id);
    }
  }
  async reRender() {
    await this.destroy();
    this.renderChildren(this.entryId);
  }
  async renderId(id: string) {
    if (!this.entryId) {
      this.render(id);
      return;
    }
    if (id === this.entryId) {
      this.reRender();
      return;
    }
    const data = this.store.getState().data;
    const node = data.find((item) => item.id === id);
    if (node?.parents && node.parents.length > 0) {
      const parent = node.parents[node.parents.length - 1];
      const parentElement = this.root.querySelector(`[data-cid="${parent}"]`);
      await this.destroy(id);
      this.renderChildren(id, parentElement, parent);
    }
  }
  close() {
    this.destroy();
    const event = this.event;
    event && event.removeAllListeners();
  }
}

export const render = ({ render, unmount }) => {
  render({ root: document.body });
};
