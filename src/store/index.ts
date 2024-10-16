import { handleCode, RenderData } from '../container';
import { createStore } from 'zustand/vanilla';
export type ContainerStore = {
  loading: boolean;
  loaded: boolean;
  setLoading: (loading: boolean) => void;
  data: RenderData[];
  setData: (data: RenderData[]) => void;
  getData: (opt: { id?: string; codeId?: string }) => Promise<any>;
  updateData: (newData: RenderData[]) => Promise<void>;
  updateDataCode: (newData: RenderData[]) => Promise<void>;
  loadData: (data: RenderData[]) => Promise<RenderData[] | boolean>;
};
export const createContainerStore = () => {
  const containerStore = createStore<ContainerStore>((set, get) => {
    return {
      loading: false,
      setLoading: (loading) => set({ loading }),
      loaded: false,
      data: [],
      setData: (data) => set({ data }),
      getData: async ({ id, codeId }: { id?: string; codeId?: string }) => {
        const { data } = get();
        if (id && codeId) {
          return data.find((item) => item.id === id && item.codeId === codeId);
        }
        if (id) {
          return data.find((item) => item.id === id);
        }
        if (codeId) {
          return data.find((item) => item.codeId === codeId);
        }
        return null;
      },
      loadData: async (data: RenderData[]) => {
        const { loading } = get();
        if (loading) {
          return false;
        }
        set({ loading: true });
        const newData = await handleCode(data);
        set({ data: newData, loaded: true, loading: false });
        return newData;
      },
      updateDataCode: async (newData: RenderData[]) => {
        const { loading, data, loadData } = get();
        if (loading) {
          console.warn('loading');
          return;
        }
        const _data = data.map((item) => {
          const node = newData.find((node) => node.codeId && node.codeId === item.codeId);
          if (node) {
            return {
              ...item,
              ...node,
            };
          }
          return item;
        });
        await loadData(_data);
        set({ data: _data });
      },
      updateData: async (newData: RenderData[]) => {
        const { loading, data, loadData } = get();
        if (loading) {
          console.warn('loading');
          return;
        }
        const _data = data.map((item) => {
          const node = newData.find((node) => node.id === item.id);
          if (node) {
            return {
              ...item,
              ...node,
            };
          }
          return item;
        });
        await loadData(_data);
        set({ data: _data });
      },
    };
  });
  return containerStore;
};
