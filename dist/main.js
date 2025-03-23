#!/usr/bin/env node
"use strict";

const inquirer = require("inquirer");
const {
  execSync
} = require("child_process");

// 添加配置对象统一管理
const CONFIG = {
  prefixChoices: [{
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
  }],
  usernames: ["my", "wy", "xxl", "qxq", "zl", "cyl"],
  releaseTypes: ["master", "ent_sbux", "ent_yum", "ent_sgp", "ent_shangqi", "saas_chanel"]
};

// 添加错误处理工具函数
const execSyncWithError = command => {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`执行命令失败: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

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
    choices: CONFIG.prefixChoices
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
  const choices = [...CONFIG.usernames, "手动输入"];
  const {
    username
  } = await inquirer.prompt([{
    type: "list",
    name: "username",
    message: "请选择用户名",
    choices
  }]);
  if (username === "手动输入") {
    return handleManualInput("customNameInput", "请输入用户名：");
  }
  console.log(`你选择的用户名: ${username}`);
  return username;
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
      choices: CONFIG.releaseTypes
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
class BranchNameBuilder {
  constructor() {
    this.parts = {};
  }
  setPart(key, value) {
    this.parts[key] = value;
    return this;
  }
  build(separator, needTime) {
    const {
      prefix,
      username,
      commit,
      detail,
      time
    } = this.parts;
    const mainParts = [prefix, username, commit, detail];
    let branchName = mainParts.join(separator);
    if (needTime) {
      branchName = `${branchName}_${time}`;
    }
    return branchName;
  }
}

// 修改主函数
async function main() {
  try {
    const branchBuilder = new BranchNameBuilder();

    // 收集所有信息
    const prefix = await getPrefix();
    const username = await getUserName();
    const commit = execSyncWithError("git rev-parse --abbrev-ref HEAD | xargs git log --pretty=format:'%h' -n 1");
    const detail = await getBranchDetail(prefix);
    const separator = await getSeparator();
    const needTime = await getNeedTime();
    const time = getCurrentTime();

    // 构建分支名
    branchBuilder.setPart("prefix", prefix).setPart("username", username).setPart("commit", commit.slice(0, 8)).setPart("detail", detail).setPart("time", time);

    // 生成分支名
    const branchName = branchBuilder.build(separator, needTime);

    // 显示确认信息
    console.log("\n分支信息预览:");
    console.log("-".repeat(30));
    console.log(`前缀: ${prefix}`);
    console.log(`用户: ${username}`);
    console.log(`Commit: ${commit.slice(0, 8)}`);
    console.log(`描述: ${detail}`);
    console.log(`分隔符: ${separator}`);
    console.log(`添加时间: ${needTime ? "是" : "否"}`);
    if (needTime) {
      console.log(`时间: ${time}`);
    }
    console.log(`最终分支名: ${branchName}`);
    console.log("-".repeat(30));

    // 确认创建
    const {
      confirmCreate
    } = await inquirer.prompt([{
      type: "confirm",
      name: "confirmCreate",
      message: "确认创建该分支？",
      default: true
    }]);
    if (confirmCreate) {
      execSyncWithError(`git checkout -b ${branchName}`);
      console.log(`\n✨ 成功创建新分支: ${branchName}`);
    } else {
      console.log("\n已取消创建分支");
    }
  } catch (error) {
    console.error("\n❌ 创建分支失败:");
    console.error(error.message);
    process.exit(1);
  }
}

// 运行主函数
main();