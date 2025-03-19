# 前端开发文档

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design (UI组件库)
- ECharts (图表库)
- Axios (HTTP客户端)
- React Router (路由)
- Redux Toolkit (状态管理)

## 项目结构

```
frontend/
├── src/
│   ├── api/           # API接口定义
│   ├── components/    # 公共组件
│   ├── pages/        # 页面组件
│   ├── store/        # Redux状态管理
│   ├── types/        # TypeScript类型定义
│   ├── utils/        # 工具函数
│   ├── App.tsx       # 根组件
│   └── main.tsx      # 入口文件
├── public/           # 静态资源
├── index.html        # HTML模板
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript配置
└── vite.config.ts    # Vite配置
```

## 开发规范

1. 组件开发规范
   - 使用函数组件和Hooks
   - 组件文件使用.tsx扩展名
   - 组件名使用大驼峰命名
   - 组件文件与组件名保持一致

2. 状态管理规范
   - 使用Redux Toolkit管理全局状态
   - 组件内部状态使用useState
   - 复杂状态逻辑使用useReducer

3. 样式规范
   - 使用CSS Modules
   - 遵循BEM命名规范
   - 使用主题变量

4. 代码规范
   - 使用ESLint和Prettier
   - 遵循TypeScript严格模式
   - 使用函数式编程范式

## 功能模块

### 1. 股票列表页面

- 展示所有股票基本信息
- 支持分页和搜索
- 支持按行业、市场类型筛选
- 展示股票代码、名称、行业、市场类型等信息

### 2. 股票详情页面

- 展示单个股票的详细信息
- 包含基本信息、交易数据、技术指标等
- 支持查看历史交易数据
- 展示技术分析图表

### 3. 技术分析页面

- 展示K线图、成交量图
- 展示技术指标（MA、MACD、RSI等）
- 支持指标参数调整
- 支持图表交互

### 4. 数据导出功能

- 支持导出股票列表
- 支持导出交易数据
- 支持导出技术指标数据
- 支持自定义导出字段

## API接口

### 1. 股票基础数据

```typescript
// 获取股票列表
GET /api/v1/stocks/basics
Query参数：
- skip: number (分页起始位置)
- limit: number (每页数量)
- industry: string (行业筛选)
- market: string (市场类型筛选)

// 获取单个股票详情
GET /api/v1/stocks/basics/{code}

// 更新股票基础数据
POST /api/v1/stocks/basics/update
```

### 2. 股票交易数据

```typescript
// 获取股票交易数据
GET /api/v1/stocks/trades/{code}
Query参数：
- start_date: string (开始日期)
- end_date: string (结束日期)
- skip: number (分页起始位置)
- limit: number (每页数量)

// 更新股票交易数据
POST /api/v1/stocks/trades/{code}/update
```

### 3. 技术分析

```typescript
// 获取技术指标数据
GET /api/v1/analysis/indicators/{code}
Query参数：
- start_date: string (开始日期)
- end_date: string (结束日期)
- indicators: string[] (指标列表)

// 导出数据
GET /api/v1/analysis/export/{code}
Query参数：
- start_date: string (开始日期)
- end_date: string (结束日期)
- format: string (导出格式)
```

## 开发流程

1. 环境搭建
   ```bash
   # 安装依赖
   npm install
   
   # 启动开发服务器
   npm run dev
   
   # 构建生产版本
   npm run build
   ```

2. 开发步骤
   - 创建新的功能分支
   - 实现功能模块
   - 编写单元测试
   - 提交代码审查
   - 合并到主分支

3. 部署流程
   - 构建生产版本
   - 运行测试
   - 部署到服务器

## 注意事项

1. 性能优化
   - 使用React.memo优化组件重渲染
   - 使用useMemo和useCallback优化计算和回调
   - 实现虚拟滚动处理大量数据
   - 使用懒加载优化首屏加载

2. 错误处理
   - 实现全局错误边界
   - 添加请求错误处理
   - 添加数据验证
   - 实现友好的错误提示

3. 安全性
   - 实现请求认证
   - 防止XSS攻击
   - 防止CSRF攻击
   - 实现数据加密

4. 可维护性
   - 编写清晰的注释
   - 遵循代码规范
   - 实现模块化设计
   - 保持代码简洁 