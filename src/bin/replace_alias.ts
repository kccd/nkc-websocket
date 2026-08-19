import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

type TsConfig = {
  compilerOptions: {
    outDir: string;
    paths: Record<string, string[]>;
  };
};

const projectRoot = path.resolve(__dirname, '../..');
const tsconfigPath = path.resolve(projectRoot, './tsconfig.json');
const tsconfig = JSON5.parse<TsConfig>(fs.readFileSync(tsconfigPath, 'utf8'));
const {outDir, paths} = tsconfig.compilerOptions;

const aliasPath = Object.keys(paths)[0] || '';
if (!aliasPath) {
  throw new Error('tsconfig.json 中未找到 paths 配置，无法执行别名替换。');
}

const aliasKey = aliasPath.replace('/*', '');
const distTarget = path.resolve(projectRoot, outDir);

console.log(`开始处理别名替换: ${aliasKey} -> ${distTarget}`);

const files = fs.globSync(`${distTarget}/**/*.js`);

files.forEach((filePath: string) => {
  const fileDir = path.dirname(filePath);
  const regex = new RegExp(
    `(require\\(['"])${aliasKey}/([^'"]+)(['"]\\))`,
    'g',
  );

  let hasChanged = false;
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(
    regex,
    (_match, prefix: string, suffix: string, suffixEnd: string) => {
      const fullTargetPath = path.resolve(distTarget, suffix);
      let relativePath = path
        .relative(fileDir, fullTargetPath)
        .replace(/\\/g, '/');

      if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
      }

      hasChanged = true;
      console.log(
        `  [替换] ${filePath}: ${aliasKey}/${suffix} -> ${relativePath}`,
      );
      return `${prefix}${relativePath}${suffixEnd}`;
    },
  );

  if (hasChanged) {
    fs.writeFileSync(filePath, newContent);
  }
});

console.log('别名替换完成');
