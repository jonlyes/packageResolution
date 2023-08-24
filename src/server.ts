import fs from "fs";
import path from "path";
import http from "http";
// 处理数据请求
const server = http.createServer();
server.on("request", (req, res) => {
  // 普通文件
  let pathName: string = path.join(__dirname, "../public", req.url!);
  // 首页
  if (req.url === "/") pathName = path.join(__dirname, "../public/index.html");
  // json数据
  if (getContentType(req.url!) === "application/json") {
    pathName = path.join(__dirname, req.url!.replace("/src/data/", "data/"));
  }
  fs.readFile(pathName, (err, data) => {
    if (err) {
      if (err) {
      if (getContentType(req.url!) === "application/octet-stream") {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("服务器无法处理该类型文件");
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": getContentType(pathName) });
      res.end(data);
    }
  });
});

/**
 * 判断请求文件类型
 * @param filePath 文件地址
 * @returns 文件类型
 */
function getContentType(filePath: string) {
  const extname = path.extname(filePath).toLowerCase();
  switch (extname) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".ico":
      return "image/vnd.microsoft.icon";
    default:
      return "application/octet-stream";
  }
}
export default server;
