import path from "node:path";
import fs from "node:fs/promises";

import enquirer from "enquirer";

import { execCommand } from "@/shared/index";
import { action, command } from "@/shared/reflect";
import { BaseCommand } from "@/shared/types";

export const npmRun = async (cwd = process.cwd()) => {
  const root = path.join(cwd, "package.json");
  const pkgContent = await fs.readFile(root, { encoding: "utf-8" });
  const scripts = JSON.parse(pkgContent)?.scripts;
  const scriptChoices = Object.keys(scripts).map((key) => {
    return {
      name: scripts[key],
      message: key,
    };
  });

  const result = await enquirer.prompt<{ script: string }>([
    {
      name: "script",
      type: "select",
      message: "请选择运行脚本",
      choices: scriptChoices,
    },
  ]);

  if (result.script) {
    const script = result.script;
    const cmd = script.split(" ")[0];
    const args = script.split(" ").slice(1);
    execCommand(cmd, args, { stdio: "inherit" });
  }
};

@command("run", "列出可以运行的全部脚本")
export class NpmRunCommand extends BaseCommand {
  @action
  protected async action(): Promise<void> {
    await npmRun();
  }
}
