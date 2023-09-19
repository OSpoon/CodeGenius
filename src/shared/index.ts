import execa from "execa";
import fs from "fs";
import path from "path";
import type { Options } from "execa";
import process from "node:process";
import { green, lightYellow, lightGreen, lightRed } from "kolorist";
import { ACTIVATION } from "./config";

export const execCommand = async (
  cmd: string,
  args: string[],
  options?: Options,
) => {
  try {
    const res = await execa(cmd, args, options);
    return res?.stdout?.trim() || "";
  } catch (error: unknown) {
    loggerError(error);
  }
};

export class PrettyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === "function")
      Error.captureStackTrace(this, this.constructor);
    else this.stack = new Error(message).stack;
  }
}

export function handleError(error: unknown) {
  if (error instanceof PrettyError) loggerError(error);
  process.exitCode = 1;
}

export const loggerInfo = (content: string) => {
  if (ACTIVATION) {
    console.log(green(`[CG INFO]：`), `${content}`);
  }
};

export const loggerWarring = (content: string) => {
  if (ACTIVATION) {
    console.log(lightYellow(`[CG WARRING]：`), `${content}`);
  }
};

export const loggerSuccess = (content: string) => {
  if (ACTIVATION) {
    console.log(lightGreen(`[CG SUCCESS]：`), `${content}`);
  }
};

export const loggerError = (content: string | unknown) => {
  if (ACTIVATION) {
    console.log(lightRed(`[CG ERROR]：`), `${content}`);
  }
};

export const printInfo = (content: string) => {
  console.log(green(`[CG INFO]：`), `${content}`);
};

export const printWarring = (content: string) => {
  console.log(lightYellow(`[CG WARRING]：`), `${content}`);
};

export const printSuccess = (content: string) => {
  console.log(lightGreen(`[CG SUCCESS]：`), `${content}`);
};

export const printError = (content: string | unknown) => {
  console.log(lightRed(`[CG ERROR]：`), `${content}`);
};

/**
 * 根据后缀列表过滤获取合法的文件列表
 * @param fileList
 * @param suffixes
 * @returns
 */
export function getFiilesBySuffixes(
  fileList: string[],
  suffixes: string[],
): string[] {
  const paths: string[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    for (let j = 0; j < suffixes.length; j++) {
      const extension = suffixes[j];

      if (file.endsWith(extension)) {
        paths.push(file);
        break;
      }
    }
  }
  return paths;
}

/**
 * 获取目录列表下所有的文件列表
 *
 * @param paths
 * @returns
 */
export function getEveryFiles(paths: string[]): string[] {
  const fileList: string[] = [];
  function traverseDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        traverseDirectory(filePath);
      } else {
        fileList.push(filePath);
      }
    });
  }

  paths.forEach((dirPath) => {
    traverseDirectory(dirPath);
  });

  return Array.from(new Set(fileList));
}

/**
 * 获取指定目录后暂存区所有符合给定后缀的文件列表
 * @param cwd
 * @param staged
 * @param paths
 * @param suffix
 * @returns
 */
export const getEveryFilesBySuffixes = async (
  cwd: string,
  staged: boolean,
  paths: string[],
  suffix: string[],
) => {
  let files: string[] = [];
  if (staged) {
    const result = await execCommand("git", [
      "diff",
      "--name-only",
      "--diff-filter=d",
      "--cached",
    ]);
    files = result?.split("\n").map((path) => `${cwd}/${path}`) || [];
  } else {
    files = getEveryFiles(paths.map((path) => `${cwd}/${path}`));
  }
  return getFiilesBySuffixes(files, suffix);
};
