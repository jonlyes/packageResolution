# 🌟 npm 依赖分析工具 🐳

`analyze-tool`将从`package-lock.json`文件出发，通过递归分析所有位于`node_modules`目录中的`package.json`文件，来生成依赖关系数据，并利用 Echarts 进行可视化渲染。

## 🎉 开始使用

### 1. 全局安装

```js
npm install analyze-tool -g
```

安装完成后，在项目根目录的命令行窗口中运行以下命令来分析依赖项。分析结果将自动在一个网页中打开。

```js
analyze-cli analyze
```

如果您想提高依赖项的下载速度，可以设置淘宝镜像源：

```js
npm config set registry http://registry.npm.taobao.org/
```

您还可以使用 `--depth [n]` 参数来限制递归分析的深度。

```js
analyze-cli analyze --depth [n]
```

要将依赖关系保存为 JSON 文件而不打开网页，请使用 `--json [file-path]` 参数并指定文件路径。


```js
analyze-cli analyze --json [file-path]
```

### 2. 局部安装

如果您的 npm 支持npx，可以采用下列的命令快速上手.

1. 安装依赖: `npm install analyze-tool` 
2. 运行依赖分析: `npx analyze-tool analyze`
3. 查看所有参数选项: `npx analyze-tool analyze --help`

## 📝 目录结构

```
  │   main.ts                 // 入口函数, 用于处理命令接收参数
  │   .eslintgrnore           // eslint忽略配置文件
  │   .eslintrc.json          // eslint代码规范配置文件
  │   .prettierr.json         // 代码格式化配置文件
  │   analyze.test.ts         // jest测试代码文件
  │   build.ts                // 编译ts到dist，public文件复制到dist
  │   jest.config.js          // jest配置文件
  │   package.json            // 项目配置信息
  │
  ├───public
  │   │   index.html          // 前端可视化基本文件
  │   │
  │   └───js
  │           axios.min.js
  │           echarts.min.js
  │           macarons.js     // Eaharts 主题
  │           renderEcharts.js// 前端渲染主文件
  │           renderReport.js // 分析报告文件
  │
  └───src
  │   │   analysis.ts         // 分析依赖并生成json数据
  │   │   server.ts           // 启动Express服务
  │   │   type.ts             // typescript类型限制处理
  │   │
  │   └───data                // 临时存放生成的json数据 
  │
  └───dist                    // build之后存放的文件
```

## 🎨 Demo 展示

![](https://e1wijx.us.aircodecdn.com/demo-preview.1690731191281_zihoj7txb4a.png)

## 🦄 技术栈

功能开发：
  - 依赖关系图：使用echarts可视化

工程化：
  - 使用 TypeScript 开发；
  - 使用 jest 实现单元测试；
  - 接入 eslint, prettier, lint-staged 代码风格自动化工具；
