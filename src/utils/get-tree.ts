import { RenderData } from '../container';

export const getTree = (data: RenderData[], id: string) => {
  const node = data.find((node) => node.id === id);
  if (!node) {
    return null;
  }
  const children = node.children || [];
  const childNodes = children.map((childId) => getTree(data, childId));
  return {
    ...node,
    children: childNodes,
  };
};
