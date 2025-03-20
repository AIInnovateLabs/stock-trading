# 开发指南

## 调试说明

### API 调试

1. Swagger UI
   - 访问地址：`http://localhost:8000/docs`
   - 提供完整的 API 文档和交互式调试界面
   - 主要用于以下操作：
     - 更新股票基础数据：`POST /api/v1/stocks/basics/update`
     - 更新股票交易数据：`POST /api/v1/stocks/trades/update`
     - 导出数据相关接口
   - 使用方法：
     1. 启动后端服务
     2. 访问 Swagger UI 页面
     3. 选择需要测试的接口
     4. 填写参数（如果需要）
     5. 点击"Execute"执行

2. 调试页面
   - 访问方式：点击应用右下角的齿轮图标
   - 主要功能：
     - 查看数据库表的记录数
     - 预览股票基础数据示例
     - 预览交易数据示例
   - 注意：此页面仅用于数据预览，不提供数据更新功能

### 数据库调试

1. 数据库文件
   - 位置：`backend/stock_trading.db`
   - 类型：SQLite3

2. 推荐工具
   - SQLite Browser
     - 下载：[https://sqlitebrowser.org/](https://sqlitebrowser.org/)
     - 功能：可视化查看和编辑数据库
   - DBeaver
     - 下载：[https://dbeaver.io/](https://dbeaver.io/)
     - 功能：支持多种数据库的统一管理工具

### 前端调试

1. React Developer Tools
   - Chrome/Firefox 插件
   - 用于调试组件层次结构和状态

2. 网络面板（Network）
   - 用于监控 API 请求和响应
   - 查看请求状态和错误信息

3. Console
   - 查看日志输出
   - 调试错误信息

## 开发流程

1. 代码规范
   - 使用 ESLint 进行代码检查
   - 遵循项目既定的代码风格

2. 提交规范
   - feat: 新功能
   - fix: 修复问题
   - docs: 文档修改
   - style: 代码格式修改
   - refactor: 代码重构
   - test: 测试用例修改
   - chore: 其他修改

3. 分支管理
   - main: 主分支，保持稳定
   - develop: 开发分支
   - feature/*: 功能分支
   - bugfix/*: 问题修复分支 