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
  name: "dev  (功能开发)",
  value: "dev"
}, {
  name: "feature  (功能开发)",
  value: "feature"
}, {
  name: "release  (集成测试)",
  value: "release"
}, {
  name: "hotfix   (问题修复)",
  value: "hotfix"
}, {
  name: "refactor (项目重构)",
  value: "refactor"
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
    choices: ["my", "wy", "xxl", "qxq", "zl", "cyl", "手动输入"]
  }]);

  // 如果选择了"手动输入"，进入输入模式
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
  console.log("prefix", prefix);
  if (["release"].includes(prefix)) {
    const detailAnswer = await inquirer.prompt([{
      type: "list",
      name: "detail",
      message: "请选择分支类型",
      choices: ["master", "ent_sbux", "ent_yum", "ent_sgp", "ent_shangqi", "saas_chanel", "手动输入"]
    }]);

    // 如果选择了"手动输入"，进入输入模式
    if (detailAnswer.detail === "手动输入") {
      const customDetailInput = await handleManualInput("customDetailInput", "请输入分支类型：");
      console.log(`你输入的分支类型: ${customDetailInput}`);
      return customDetailInput;
    } else {
      console.log(`你选择的分支类型: ${detailAnswer.detail}`);
      return detailAnswer.detail;
    }
  } else {
    // 对于其他所有类型的分支，都需要输入功能描述
    const customDetailInput = await handleManualInput("customDetailInput", "请输入分支功能描述：");
    console.log(`你输入的分支功能描述: ${customDetailInput}`);
    return customDetailInput;
  }
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

// 添加新函数：选择分隔符
async function getSeparator() {
  const answer = await inquirer.prompt([{
    type: "list",
    name: "separator",
    message: "请选择分隔符",
    choices: [{
      name: "使用斜杠 (/)",
      value: "/"
    }, {
      name: "使用下划线 (_)",
      value: "_"
    }]
  }]);
  console.log(`你选择的分隔符: ${answer.separator}`);
  return answer.separator;
}

// 修改函数名和逻辑
async function getNeedTime() {
  const answer = await inquirer.prompt([{
    type: "list",
    name: "needTime",
    message: "是否需要添加时间？",
    choices: [{
      name: "需要",
      value: true
    }, {
      name: "不需要",
      value: false
    }]
  }]);
  console.log(`是否添加时间: ${answer.needTime ? "是" : "否"}`);
  return answer.needTime;
}

// 修改创建分支的函数
const createNewBranch = (prefix, username, commit, detail, time, separator, needTime) => {
  let branchName;
  const mainParts = [prefix, username, commit, detail];

  // 先用分隔符连接主要部分
  branchName = mainParts.join(separator);

  // 如果需要时间，添加时间
  if (needTime) {
    branchName = `${branchName}_${time}`;
  }
  execSync(`git checkout -b ${branchName}`);
  console.log(`New branch created: ${branchName}`);
};

// 修改主函数
async function main() {
  const prefix = await getPrefix();
  const username = await getUserName();
  const commit = await getCurrentBranchLastCommit();
  const detail = await getBranchDetail(prefix);
  const separator = await getSeparator();
  const needTime = await getNeedTime();
  const time = await getCurrentTime();

  // 输出最终结果
  console.log(`Prefix: ${prefix}`);
  console.log(`Username: ${username}`);
  console.log(`Commit: ${commit}`);
  console.log(`Detail: ${detail}`);
  console.log(`Separator: ${separator}`);
  console.log(`Need Time: ${needTime}`);
  if (needTime) {
    console.log(`Time: ${time}`);
  }
  createNewBranch(prefix, username, commit, detail, time, separator, needTime);
}

// 运行主函数
main();