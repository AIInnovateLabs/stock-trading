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

## 环境要求

### Docker 环境配置

如果您在使用 Docker 时遇到镜像拉取问题，请参考 [Docker 环境配置指南](docs/docker-setup.md)。

### macOS 环境设置（使用 Colima）

如果您使用 macOS 且不想安装 Docker Desktop，可以使用 Colima 作为替代方案：

1. 安装必要的工具：
```bash
# 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Docker CLI 和相关工具
brew install docker
brew install docker-compose
brew install colima
brew install docker-credential-helper
```

2. 启动 Colima：
```bash
colima start
```

3. 配置 Docker 环境：
```bash
# 创建 Docker 配置
mkdir -p ~/.docker
echo '{"auths":{}}' > ~/.docker/config.json

# 设置 Docker socket 路径
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"

# 可选：将环境变量添加到 shell 配置文件中
echo 'export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"' >> ~/.zshrc  # 如果使用 zsh
# 或
echo 'export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"' >> ~/.bashrc  # 如果使用 bash
```

### 使用 Docker Desktop（替代方案）

如果您更喜欢使用 Docker Desktop：

1. 从 [Docker 官网](https://www.docker.com/products/docker-desktop) 下载并安装 Docker Desktop
2. 启动 Docker Desktop 应用程序
3. 等待 Docker Desktop 完全启动（状态栏图标变成静止状态）

## 项目设置

1. 克隆项目：
```bash
git clone <repository_url>
cd stock-trading
```

2. 启动服务：
```bash
docker compose up --build
```

## 访问服务

服务启动后，可以通过以下地址访问：

- 前端应用：http://localhost/
- 后端 API：http://localhost/api/
- Flower 监控：http://localhost/flower/
  - 用户名：admin
  - 密码：admin

## 项目结构

```
stock-trading/
├── frontend/          # React 前端应用
├── backend/           # FastAPI 后端应用
├── nginx/            # Nginx 配置文件
│   ├── nginx.conf
│   └── .htpasswd
└── docker-compose.yml # Docker 服务配置
```

## 服务说明

- **前端**：React + Vite 开发的 Web 界面
- **后端**：FastAPI 提供的 RESTful API
- **Nginx**：反向代理服务器，处理前端和后端的请求转发
- **PostgreSQL**：数据库服务
- **Redis**：缓存和消息队列
- **Celery**：异步任务处理
- **Flower**：Celery 任务监控界面

## 开发说明

### 环境变量

项目使用 `.env` 文件管理环境变量，主要包括：

- 数据库配置
- Redis 配置
- API 地址配置
- 其他服务配置

### 调试

- 前端开发服务器支持热重载
- 后端服务也配置了开发模式的热重载
- 可以通过 Flower 界面监控异步任务的执行情况

## 常见问题

1. **Docker 守护进程连接问题**
   - 检查 Docker 是否正在运行
   - 确认 DOCKER_HOST 环境变量设置正确

2. **端口占用问题**
   - 确保 80、5432、6379 等端口未被其他服务占用

3. **权限问题**
   - 确保当前用户有权限访问 Docker socket
   - 确保项目目录具有正确的权限

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[添加许可证信息] 