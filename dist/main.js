#!/usr/bin/env node
"use strict";

const inquirer = require("inquirer");
const {
  execSync
} = require("child_process");

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

const prefixChoices = [{
  name: "feature  (功能开发)",
  value: "feature"
}, {
  name: "release  (集成测试)",
  value: "release"
}, {
  name: "hotfix   (问题修复)",
  value: "hotfix"
}, {
  name: "自己输入",
  value: "custom"
}];

// 封装的通用手动输入逻辑
async function handleManualInput(questionName, message) {
  const answer = await inquirer.prompt([{
    type: "input",
    name: questionName,
    message
  }]);
  return answer[questionName];
}

// prefix
async function getPrefix() {
  const answer1 = await inquirer.prompt([{
    type: "list",
    name: "prefix",
    message: "请选择分支前缀",
    choices: prefixChoices
  }]);
  if (answer1.prefix === "custom") {
    const customPrefixInput = await handleManualInput("customPrefixInput", "请手动输入前缀：");
    console.log(`你输入的前缀: ${customPrefixInput}`);
    return customPrefixInput;
  } else {
    console.log(`你选择的前缀: ${answer1.prefix}`);
    return answer1.prefix;
  }
}

// username
async function getUserName() {
  const answer2 = await inquirer.prompt([{
    type: "list",
    name: "username",
    message: "请选择用户名",
    choices: ["my", "wy", "xxl", "qxq", "zl", "手动输入"]
  }]);

  // 如果选择了“手动输入”，进入输入模式
  if (answer2.question2 === "手动输入") {
    const customNameInput = await handleManualInput("customNameInput", "请输入用户名：");
    console.log(`你输入的用户名: ${customNameInput}`);
    return customNameInput; // 返回用户输入的值
  } else {
    console.log(`你选择的用户名: ${answer2.username}`);
    return answer2.username; // 返回选择的值
  }
}

// commit
const getCurrentBranchLastCommit = () => {
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  const commit = execSync(`git log --pretty=format:'%h' -n 1 ${branch}`).toString().trim();
  return commit.slice(0, 8);
};

// detail
async function getBranchDetail(prefix) {
  const customDetailInput = await handleManualInput("customDetailInput", "请输入分支功能描述，不需要输入时间哦：");
  console.log(`你输入的分支功能描述: ${customDetailInput}`);
  return customDetailInput;
}

// time
const getCurrentTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const timeStr = `${year}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
  return timeStr;
};

// 创建新分支
const createNewBranch = (prefix, username, commit, detail, time) => {
  const branchName = `${prefix}/${username}/${commit}/${detail}_${time}`;
  execSync(`git checkout -b ${branchName}`);
  console.log(`New branch created: ${branchName}`);
};

// 主函数
async function main() {
  const prefix = await getPrefix();
  const username = await getUserName();
  const commit = await getCurrentBranchLastCommit();
  const detail = await getBranchDetail(prefix);
  const time = await getCurrentTime();

  // 输出最终结果
  console.log(`Prefix: ${prefix}`);
  console.log(`Username: ${username}`);
  console.log(`Commit: ${commit}`);
  console.log(`Detail: ${detail}`);
  console.log(`Time: ${time}`);
  createNewBranch(prefix, username, commit, detail, time);
}

// 运行主函数
main();