type UnloadOpts = {
  // 传入参数
  root?: HTMLDivElement | string;
  callback?: () => void;
};
export class Unload {
  observer: MutationObserver;
  constructor(opts?: UnloadOpts) {
    let targetNode: HTMLDivElement;
    if (typeof opts?.root === 'string') {
      targetNode = document.querySelector(opts?.root)!;
    } else {
      targetNode = opts?.root!;
    }
    if (!targetNode) {
      console.error('targetNode is not exist');
      return;
    }
    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        mutation.removedNodes.forEach((removedNode) => {
          if (removedNode === targetNode) {
            opts?.callback?.();
            // 在这里处理元素被移除的逻辑
            // 停止监听 (当不再需要时)
            observer.disconnect();
          }
        });
      });
    });
    // 配置监听子节点的变化
    observer.observe(targetNode.parentNode, { childList: true });
    this.observer = observer;
  }
}
