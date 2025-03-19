# 股票交易系统

一个基于FastAPI和React的股票交易系统，提供股票数据获取、分析和导出功能。

## 功能特点

- 股票基础数据管理
- 股票交易数据查询
- 技术分析指标计算
- 数据导出（CSV/Excel）
- RESTful API接口
- Swagger API文档

## 技术栈

### 后端
- FastAPI
- SQLAlchemy
- Pandas
- NumPy
- Akshare

### 前端
- React
- TypeScript
- Ant Design
- ECharts

## 项目结构

```
stock-trading/
├── backend/                # 后端项目目录
│   ├── app/               # 应用主目录
│   │   ├── api/          # API路由
│   │   ├── core/         # 核心配置
│   │   ├── db/           # 数据库相关
│   │   ├── models/       # 数据模型
│   │   ├── schemas/      # Pydantic模型
│   │   └── services/     # 业务逻辑
│   ├── tests/            # 测试用例
│   └── requirements.txt  # 依赖包
├── frontend/             # 前端项目目录
│   ├── src/             # 源代码
│   ├── public/          # 静态资源
│   └── package.json     # 依赖配置
└── docs/                # 文档目录
```

## 运行说明

### 后端运行

1. 创建并激活虚拟环境：
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. 运行应用：
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端运行

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，设置API地址等配置
```

3. 运行开发服务器：
```bash
npm run dev
```

## API文档

启动后端服务后，可以通过以下地址访问API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要API接口

### 股票基础数据
- GET /api/v1/stocks/basics - 获取股票基础数据列表
- POST /api/v1/stocks/basics/update - 更新股票基础数据

### 股票交易数据
- GET /api/v1/stocks/trades/{stock_code} - 获取指定股票的交易数据

### 技术分析
- GET /api/v1/analysis/indicators/{stock_code} - 获取技术指标数据
- GET /api/v1/analysis/export/basics - 导出股票基础数据
- GET /api/v1/analysis/export/trades/{stock_code} - 导出股票交易数据
- GET /api/v1/analysis/export/analysis/{stock_code} - 导出分析结果

## 开发说明

### 代码规范
- 使用Black进行代码格式化
- 使用isort进行导入排序
- 使用pylint进行代码检查

### 测试
```bash
cd backend
pytest tests/ -v
```

### 数据库迁移
```bash
cd backend
alembic upgrade head
```

## 部署说明

### 后端部署
1. 构建Docker镜像：
```bash
cd backend
docker build -t stock-trading-backend .
```

2. 运行容器：
```bash
docker run -d -p 8000:8000 stock-trading-backend
```

### 前端部署
1. 构建生产版本：
```bash
cd frontend
npm run build
```

2. 使用Nginx部署：
```bash
# 配置Nginx
sudo cp nginx.conf /etc/nginx/conf.d/stock-trading.conf
sudo nginx -s reload
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License 