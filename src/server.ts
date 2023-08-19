import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();

// 首页
app.get("/", (req: Request, res: Response) => {
  let url = path.join(__dirname, "../dist/index.html");
  fs.readFile(url, (err: NodeJS.ErrnoException | null, data: Buffer) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.type("text/html").send(data);
    }
  });
});
// 处理数据请求
app.get("/src/data/*", (req: Request, res: Response) => {
  let url: string = path.join(__dirname, "data", req.params[0]);
  fs.readFile(url, (err: NodeJS.ErrnoException | null, data: Buffer) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.type("application/json").send(data);
    }
  });
});
// 设置静态资源路径
app.use(express.static(path.join(__dirname, "../dist")));
// 其他情况处理
app.use((req: Request, res: Response) => {
  res.status(404).send("Page Not Found");
});

export default app;
