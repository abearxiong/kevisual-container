// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
/**
 * @type {import('rollup').RollupOptions}
 */
const config1 = {
  input: 'src/index.ts', // TypeScript 入口文件
  output: {
    file: 'dist/index.js', // 输出文件
    format: 'es', // 输出格式设置为 ES 模块
  },
  plugins: [
    resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
    commonjs(), //
    typescript({
      allowImportingTsExtensions: true,
      noEmit: true,
    }), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
  ],
};

const config2 = {
  input: 'src/edit.ts', // TypeScript 入口文件
  output: {
    file: 'dist/edit.js', // 输出文件
    format: 'es', // 输出格式设置为 ES 模块
  },
  plugins: [
    resolve(), // 使用 @rollup/plugin-node-resolve 解析 node_modules 中的模块
    commonjs(), //
    typescript({
      allowImportingTsExtensions: true,
      noEmit: true,
    }), // 使用 @rollup/plugin-typescript 处理 TypeScript 文件
    // 复制/src/container.css 到dist/container.css
    copy({
      targets: [{ src: 'src/container.css', dest: 'dist' }],
    }),
  ],
};

export default [config1, config2];
