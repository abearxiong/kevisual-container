import EventEmitter from 'eventemitter3';
import type { Container } from './container';
import type { ContainerEdit } from './container-edit';
import { Emotion } from '@emotion/css/create-instance';

export type RenderContext<T extends { [key: string]: any } = {}> = {
  root?: HTMLDivElement;
  shadowRoot?: ShadowRoot;
  container?: Container | ContainerEdit;
  event?: EventEmitter;
  code?: {
    render: Render;
    unmount?: Unmount;
    [key: string]: (...args: any[]) => any;
  };
  css?: Emotion['css'];
} & T;
export type RenderCode = {
  render: Render;
  unmount?: Unmount;
  [key: string]: any;
};
type Render = <T extends { [key: string]: any }>(ctx: RenderContext<T>) => Promise<any>;
type Unmount = <T extends { [key: string]: any }>(ctx?: RenderContext<T>) => Promise<any>;
