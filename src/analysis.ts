import path from "path";
import fs, { ReadStream } from "fs";
import {
  LinksInfoItem,
  PackageJsonType,
  IsVisitType,
  DirectDependenciesType,
  tmpObjType,
  categoriesItem,
  NodesInfoItem,
} from "./type";

let plainData: string = ""; // 存储流式读入的数据
let packages: PackageJsonType; // 所有依赖包信息
let conflictPackages: PackageJsonType = {}; // 冲突包信息
let isVisit: IsVisitType; // 访问标记,用于处理循环依赖
let linksInfo: LinksInfoItem[] = []; // 记录依赖关系
let maxDepth: number = 999;
let thisMaxDepth: number = -1;

// 流式读取文件并处理
function main(): Promise<string> {
  plainData = "";
  const baseUrl: string = path.resolve(process.cwd(), "package-lock.json");
  const readStream: ReadStream = fs.createReadStream(baseUrl, {
    encoding: "utf8",
  });

  return new Promise<string>((resolve, reject) => {
    // 流式读入数据
    readStream.on("data", (chunk) => {
      plainData += chunk;
    });
    // 读入完毕处理数据
    readStream.on("end", async () => {
      // 数据预处理: 解析 json 数据并提取所需信息
      const parseDate = JSON.parse(plainData);

      packages = {};
      Object.keys(parseDate.packages).forEach((item) => {
        let newName: string = item.replace("node_modules/", "");
        packages[newName] = parseDate.packages[item];
      });

      // 提取 packages 空字符串对象中的依赖信息
      let directDependencies: DirectDependenciesType =
        packages?.[""]?.["dependencies"];
      let dependenciesArray: string[] = Object.keys(directDependencies);

      try {
        let url: string = path.join(__dirname, "data");
        if (!fs.existsSync(url)) fs.mkdirSync(url);

        // 递归分析依赖
        await generateAnalysis(dependenciesArray);
        // 生成节点相关信息
        await generateNodeInfo();
        // 生成类别信息
        await generateCategories(dependenciesArray);
        // 记录依赖冲突信息
        await generateConflict();
      } catch (err) {
        reject(err);
      }
      resolve("文件处理完毕");
    });
    readStream.on("error", (error) => {
      reject(error);
    });
  });
}

async function runAnalysis(): Promise<void> {
  try {
    const res = await main();
  } catch (err) {
    console.error("处理文件时发生错误:", err);
  }
}

/**
 * 将数据写入文件,可以使用 await 阻塞
 * @param {string} fileName - 文件名
 * @param {Object} data - 要写入的数据
 * @returns {Promise<string>} - Promise，成功时返回成功消息，失败时返回错误
 * @throws {Error} - 如果写入文件时发生错误，则抛出错误
 */
async function promiseWriteFile<T>(
  fileName: string,
  data: T | object
): Promise<string> {
  let url: string = path.join(__dirname, "data", `${fileName}.json`);
  return new Promise<string>((resolve, reject) => {
    fs.writeFile(url, JSON.stringify(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`-- ${fileName} success --`);
      }
    });
  });
}

/**
 * 递归分析依赖信息
 * @param {Array} keys - 包含直接依赖键名信息的数组
 */
async function generateAnalysis(keys: string[]): Promise<void> {
  let resObj: PackageJsonType = {};
  keys.forEach((item) => {
    isVisit = {};
    resObj[item] = dfs(item, item);
  });
  await promiseWriteFile<PackageJsonType>("dependency", resObj);
}

/**
 * 深度优先搜索，生成依赖关系图
 * @param {string} nowPackageName - 根包名
 * @param {number} depth - 深度
 * @param {string} prefix - 前缀
 * @returns {object} - 依赖关系对象
 */
function dfs(
  rootPackageName: string,
  nowPackageName: string,
  depth: number = 0,
  prefix: string = "NotFound"
): { conflict: boolean } | tmpObjType {
  // 先查找前缀的node_modules目录中是否存在依赖
  let payload: string = `${prefix}/node_modules/${nowPackageName}`;
  let checkPackage: any = packages?.[payload];
  let packageName: string = payload;

  // 存在依赖冲突
  if (checkPackage) {
    conflictPackages[nowPackageName] = conflictPackages[nowPackageName] || {};
    conflictPackages[nowPackageName][checkPackage.version] =
      conflictPackages[nowPackageName][checkPackage.version] || [];
    conflictPackages[nowPackageName][checkPackage.version].push(prefix);
  } else {
    checkPackage = packages?.[nowPackageName];
    packageName = nowPackageName;
  }

  // 处理循环引用的情况
  if (isVisit[packageName]) {
    return {
      packageName,
      version: checkPackage.version,
      dependencies: [],
      conflict: true,
    };
  }

  isVisit[packageName] = true; // 标记已访问
  packages[packageName].category = packages[packageName].category
    ? "shared"
    : rootPackageName; // 标记属于哪个包
  packages[packageName].depth = depth; // 记录包的最小深度
  thisMaxDepth = Math.max(thisMaxDepth, depth); // 统计最大深度,便于计算可视化后的图形大小

  // 记录依赖关系
  if (prefix !== "NotFound")
    linksInfo.push({
      source: prefix,
      target: packageName,
    });

  let { version, dependencies } = checkPackage || {};
  let tmpObj: tmpObjType = { packageName, version, depth, dependencies: [] };

  // 递归检索依赖关系
  if (dependencies) {
    // 限制递归深度
    if (depth + 1 === maxDepth) {
      tmpObj.dependencies = "...";
    } else if (depth + 1 < maxDepth) {
      tmpObj.dependencies = Object.keys(dependencies).map((item) =>
        dfs(rootPackageName, item, depth + 1, packageName)
      );
    }
  }
  return tmpObj;
}
/**
 * 生成 Echarts 所需的 Nodes 与 Links 数据格式
 */
async function generateNodeInfo(): Promise<void> {
  let nodesInfo: (NodesInfoItem | undefined)[] = Object.keys(packages).map(
    (item) => {
      let size = thisMaxDepth - packages[item].depth + 1 || 2;
      if (item)
        return {
          name: item,
          value: `@${packages[item].version}`,
          category: packages[item].category || "alone",
          symbolSize: Math.pow(1.414, size),
        };
    }
  );
  await promiseWriteFile<NodesInfoItem[]>("nodesInfo", nodesInfo.slice(1));
  await promiseWriteFile<LinksInfoItem[]>("linksInfo", linksInfo);
}
/**
 * 生成 Echarts 所需的 categories
 * @param {Array} keys - 包含直接依赖键名信息的数组
 */
async function generateCategories(keys: string[]): Promise<void> {
  let categories: categoriesItem[] = keys.map((item) => {
    return { name: item };
  });
  categories.push({ name: "alone" });
  categories.push({ name: "shared" });
  await promiseWriteFile<categoriesItem[]>("categoriesInfo", categories);
}

/**
 * 生成依赖冲突相关的信息.
 */
async function generateConflict(): Promise<void> {
  Object.keys(conflictPackages).forEach((item) => {
    conflictPackages[item].rootVersion = packages[item]?.version;
  });
  await promiseWriteFile<PackageJsonType>("conflict", conflictPackages);
}

export { runAnalysis };
