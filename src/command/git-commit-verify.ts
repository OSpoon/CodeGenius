import { readFileSync } from "node:fs";
import path from "node:path";

import { printError, printInfo, execCommand } from "@/shared/index";
import { action, command } from "@/shared/reflect";
import { BaseCommand } from "@/shared/types";

export const gitCommitVerify = async () => {
  const dogit = await execCommand("git", ["rev-parse", "--show-toplevel"], {
    stdio: "inherit",
  });
  const root = path.join(dogit || "", ".git", "COMMIT_EDITMSG");
  const content = readFileSync(root, { encoding: "utf-8" }).trim();
  const REG_EXP =
    /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
  if (!REG_EXP.test(content)) {
    printError("Git 提交信息不符合 Angualr 规范~");
    printInfo("推荐: 运行 `npx code-genius commit` 生成提交信息");
    process.exit(1);
  }
};

@command("verify", "校验 COMMIT_EDITMSG 中的信息是否符合 Angualr 规范")
export class GitCommitVerifyCommand extends BaseCommand {
  @action
  protected async action(): Promise<void> {
    await gitCommitVerify();
  }
}
