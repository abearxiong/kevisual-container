# Container

```js
import { Container } from 'https://kevisual.xiongxiao.me/system/lib/container.js';
const data = [
  {
    id: 'base-root',
    code: {
      render: (ctx) => {
        const rootEl = ctx.renderRoot;
        const div = document.createElement('div');
        div.innerHTML = 'Hello World!';
        rootEl.appendChild(div);
      },
      unmount: (ctx) => {
        console.log('unmount');
      },
    },
  },
];
const container = new Container({
  root: 'root',
  data: data,
});
container.render('base-root');
```

