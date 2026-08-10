# Universe Eater — WeChat Mini Game build

## 一次性构建

```bash
npm run build:wx     # 单次构建,产出 wx/bundle.js
npm run watch:wx     # 监听 src/ 修改并重新打包
```

## 在微信开发者工具中打开

1. 打开 **微信开发者工具**,选择 **小游戏** 项目类型
2. 目录选择本 `wx/` 目录(不是仓库根)
3. AppID 选 **测试号** 即可(`project.config.json` 里写的是 `touristappid`)
4. 进入后点 **编译**,游戏会在模拟器里启动

## 当前已知差异 / 待办

- **3D 渲染层禁用**:`three.js` 在小游戏环境下需要专门适配
  (`threejs-miniprogram`),当前 build 用空 stub 替换,运行时自动回落到
  纯 2D 渲染(`runtime.ts` 的 try/catch 会接住)
- **键盘输入禁用**:小游戏没有键盘事件,所有操作走触摸摇杆
- **HUD 位置**:暂未针对刘海屏/底部安全区做适配,顶部按钮可能被状态栏遮挡
- **字体**:目前依赖系统字体,中文应该正常显示;若有缺字可后续打包字体文件

## 文件结构

```
wx/
  game.js              — 小游戏入口(微信运行时会自动加载这个)
  game.json            — 小游戏配置(方向、状态栏等)
  project.config.json  — 开发者工具项目配置
  adapter.js           — 浏览器 API polyfill(document/window/touch 等)
  bundle.js            — 由 src/ 构建出的游戏代码(勿手改)
  empty-three.js       — three.js 的空 stub
```
