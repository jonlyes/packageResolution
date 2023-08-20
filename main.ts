#!/usr/bin/env node
import path from "path";
import fs from "fs";

import { Command } from "commander";
import chalk from "chalk";
import boxen from "boxen";
import server from "./src/server";
import { Server, IncomingMessage, ServerResponse } from "http";
import { runAnalysis } from "./src/analysis";

const baseUrl: string = path.join(__dirname, "src", "data");

let port: string = "5152";

const program: Command = new Command();
program
  .command("analyze")
  .description("分析 package-lock.json 中的依赖关系")
  .option("--depth [n]", "限制递归深度")
  .option("--json [file-path]", "将依赖关系以json格式导入指定路径中")
  .action(async (options): Promise<void> => {
    const depth = options.depth || 0;
    const jsonFilePath = options.json;
    // // 执行依赖分析
    await runAnalysis();
    // // 启动服务器
    const serverInstance: Server<
      typeof IncomingMessage,
      typeof ServerResponse
    > = server.listen(port, () => {
      console.log(getBeautifulMsg());
    });
    // 监听 Ctrl+C 退出事件
    process.on("SIGINT", () => {
      // 关闭express
      serverInstance.close();
      // 删除临时文件
      const files: string[] = fs.readdirSync(baseUrl);
      files.forEach((item) => {
        const filePath: string = path.join(baseUrl, item);
        fs.unlinkSync(filePath);
      });
      console.log("Bye~");
      process.exit(0);
    });
  });

function getBeautifulMsg(): string {
  const message: string = `
    Serving!
    
    - Local:    ${chalk.blue(`http://localhost:${port}`)}
    - Network:  ${chalk.blue(`http://192.168.10.10:${port}`)}
    
    Copied local address to clipboard!
    `;
  const boxedMessage: string = boxen(message, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
  });
  return boxedMessage;
}

program.parse(process.argv);
