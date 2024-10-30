#!/usr/bin/env node

import inquirer from "inquirer";

// 1. 定义 功能
// [‘feature’, ‘release’, ‘hofix’]

// 2. Username: 输入

// 3. Commit: node child_process 去取当前分支的最新commit 的前 8位

// 4. detail: 输入 / 选择
//    4.1 feature: 输入
//    4.2 release: [‘master’, ‘ent’] _ time
//    4.3 hotfix: 输入

// 总的环境list [‘aws’, ‘sbux’, ‘chanel’, ‘nana’]

// release/username/commit/release_projectname_20220808

// 封装的通用手动输入逻辑
async function handleManualInput(questionName, message) {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: questionName,
      message,
    },
  ]);
  return answer[questionName];
}

// prefix
async function getPrefix() {
  const answer1 = await inquirer.prompt([
    {
      type: "list",
      name: "prefix",
      message: "请选择分支前缀",
      choices: [
        "feature  (功能开发)",
        "release  (集成测试)",
        "hotfix   (问题修复)",
        "自己输入",
      ],
    },
  ]);

  if (answer1.prefix === "自己输入") {
    const customPrefixInput = await handleManualInput(
      "customPrefixInput",
      "请手动输入前缀："
    );
    console.log(`你输入的前缀: ${customPrefixInput}`);
    return customPrefixInput;
  } else {
    console.log(`你选择的前缀: ${answer1.prefix}`);
    return answer1.prefix;
  }
}

// username
async function getUserName() {
  const answer2 = await inquirer.prompt([
    {
      type: "list",
      name: "username",
      message: "请选择用户名",
      choices: ["my", "wy", "xxl", "qxq", "zl", "手动输入"],
    },
  ]);

  // 如果选择了“手动输入”，进入输入模式
  if (answer2.question2 === "手动输入") {
    const customNameInput = await handleManualInput(
      "customNameInput",
      "请输入用户名："
    );
    console.log(`你输入的用户名: ${customNameInput}`);
    return customNameInput; // 返回用户输入的值
  } else {
    console.log(`你选择的用户名: ${answer2.username}`);
    return answer2.username; // 返回选择的值
  }
}

// commit
const getCurrentBranchLastCommit = () => {
  const { execSync } = require("child_process");
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  const commit = execSync(`git log --pretty=format:'%h' -n 1 ${branch}`)
    .toString()
    .trim();
  return commit.slice(0, 8);
};

// 主函数
async function main() {
  console.log("Starting questions...");
  const prefix = await getPrefix();
  const username = await getUserName();
  const commit = await getCurrentBranchLastCommit();

  // 输出最终结果
  console.log("\nFinal Results:");
  console.log(`Prefix: ${prefix}`);
  console.log(`Username: ${username}`);
  console.log(`Commit: ${commit}`);
}

// 运行主函数
main();
