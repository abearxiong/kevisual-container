// 定义自定义事件类，继承自 Event
export class CustomEvent<T extends { [key: string]: any } = {}> extends Event {
  data: T;
  // 构造函数中接收 type 和自定义的数据
  constructor(type: string, data: T, eventInitDict?: EventInit) {
    // 调用父类的构造函数
    super(type, eventInitDict);
    // 初始化自定义的数据
    this.data = data;
  }
}

type ContainerPosition = {
  type: 'position';
  data?:
    | {
        cid?: string;
        pid?: string;
        rid?: string;
        left?: number;
        top?: number;
      }
    | {
        cid?: string;
        pid?: string;
        rid?: string;
        transform?: string;
      };
};
type ContainerResize = {
  type: 'resize';
  data?: {
    cid?: string;
    pid?: string;
    rid?: string;
    width?: number;
    height?: number;
  };
};
type ContainerRotate = {
  type: 'rotate';
  data?: {
    cid?: string;
    pid?: string;
    rid?: string;
    rotate?: number;
  };
};
type ContainerActive = {
  type: 'active';
  data?: {
    cid?: string;
    pid?: string;
    rid?: string;
  };
};
export type ContainerEventData = ContainerPosition | ContainerResize | ContainerRotate | ContainerActive;

export class ContainerEvent extends CustomEvent<ContainerEventData> {
  constructor(type: string, data: ContainerEventData, eventInitDict?: EventInit) {
    super(type, data, eventInitDict);
  }
}
