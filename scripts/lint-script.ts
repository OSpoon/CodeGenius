import { eslintFix } from "@/command/eslint-fix";
// import { gitUser } from "@/command/git-user";
import { prettierFormat } from "@/command/prettier-format";
import { execCommand, printError } from "@/shared";

async function lint() {
  try {
    // await gitUser({ ruleEmail: "^[a-zA-Z0-9._%+-]+@(gmail)\\.(com)$" });
    await prettierFormat(["./src/", "./scripts/"]);
    await execCommand("git", ["add", "."], {
      stdio: "inherit",
    });
    await eslintFix(["./src/", "./scripts/"]);
  } catch (error) {
    printError(error);
  }
}

lint();
