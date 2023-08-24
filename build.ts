import fs from 'fs';
import path from 'path';

// public文件夹路径
const sourceDir = path.join(__dirname, 'public');

// 复制的的public文件夹路径
const targetDir = path.join(__dirname, 'dist', 'public');

// 编译 TypeScript 文件，这里假设您已经安装了 typescript 包
const execSync = require('child_process').execSync;
execSync('tsc');

// 创建dist下的public文件夹
!fs.existsSync(targetDir) ? fs.mkdirSync(targetDir) : null;

// 复制文件
function copyFile(source: string, target: string) {
	const filesName: string[] = fs.readdirSync(source);
	filesName.forEach((filename) => {
		if (fs.statSync(path.join(source, filename)).isDirectory()) {
			!fs.existsSync(path.join(target, filename))
				? fs.mkdirSync(path.join(target, filename))
				: null;
			copyFile(path.join(source, filename), path.join(target, filename));
		} else {
			// 复制文件
			!fs.existsSync(path.join(target, filename))
				? fs.copyFileSync(
						path.resolve(source, filename),
						path.join(target, filename)
				  )
				: null;
		}
	});
}

copyFile(sourceDir, targetDir);

console.log('build completed');
