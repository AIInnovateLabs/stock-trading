## 数据获取策略

### 问题背景
股票数据量巨大（约5000只股票，每只股票可能有30年的历史数据），不适合全量下载保存在代码仓库中。需要实现按需加载和任务队列管理机制。

### 初始数据
- 所有股票的基础信息
- 华策影视（300133）近一年交易数据作为示例

### 数据获取策略
1. 按需获取：用户访问时触发数据获取
2. 队列处理：短时间内的多个请求进入队列
3. 持久化：任务队列需要能够在服务重启后恢复

### 方案选择

经过评估，我们选择了方案1：Redis + Celery + Docker 的实现方案。

#### 选择原因
1. 使用 Docker 封装复杂性，降低部署和使用门槛
2. Redis + Celery 组合成熟稳定，社区支持好
3. Celery 的 Flower 提供现成的监控界面
4. 便于后期扩展和性能优化

#### 具体实现
使用 Docker Compose 编排以下服务：

1. 前端服务 (Vite + React)
   - 端口: 3000
   - 提供用户界面和监控界面
   - 支持热重载开发

2. 后端服务 (FastAPI)
   - 端口: 8000
   - 处理 API 请求
   - 触发数据获取任务

3. Celery Worker
   - 处理数据获取任务
   - 支持任务优先级
   - 错误重试机制

4. Celery Beat
   - 处理定时任务
   - 数据定期更新
   - 任务队列维护

5. Flower 监控
   - 端口: 5555
   - 监控任务状态
   - 查看任务历史

6. PostgreSQL 数据库
   - 端口: 5432
   - 存储股票数据
   - 存储任务历史

7. Redis 服务
   - 端口: 6379
   - 任务队列
   - 结果后端

### 部署架构

```
docker-compose.yml
├── frontend (Vite + React)
├── backend (FastAPI)
├── celery_worker
├── celery_beat
├── flower
├── postgres
└── redis
```

### 数据模型

```sql
-- 任务队列表
CREATE TABLE task_queue (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(10) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    priority INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    parameters JSONB
);

-- 数据获取记录表
CREATE TABLE data_fetch_history (
    stock_code VARCHAR(10) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    fetch_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    last_trade_date DATE,
    PRIMARY KEY (stock_code, data_type)
);
```

### 任务优先级
1. HIGH: 用户正在查看的股票
2. MEDIUM: 用户最近查看过的股票
3. LOW: 后台预加载的股票

### 监控功能
1. 任务队列可视化 (Flower)
2. 数据获取进度展示
3. 任务优先级管理
4. 错误任务重试
5. 任务取消功能

### 开发和部署流程
1. 安装 Docker 和 Docker Compose
2. 克隆项目代码
3. 运行 `docker-compose up`
4. 访问相应端口使用服务：
   - 前端界面: http://localhost:3000
   - API 文档: http://localhost:8000/docs
   - 任务监控: http://localhost:5555 