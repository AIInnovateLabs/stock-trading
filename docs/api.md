# API文档

## 基础信息

- 基础URL: `http://localhost:8000/api/v1`
- 所有请求和响应均使用JSON格式
- 时间格式：ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

## 认证

目前API不需要认证，但后续会添加JWT认证机制。

## 错误处理

所有API在发生错误时会返回以下格式：

```json
{
    "detail": "错误信息描述"
}
```

常见HTTP状态码：
- 200: 请求成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

## 调试接口

### 获取数据库信息

获取数据库表信息和示例数据。

- **接口**: `GET /api/v1/debug/db-info`
- **描述**: 获取数据库中的表信息和部分示例数据
- **返回数据**:
  ```json
  {
    "tables": [
      {
        "name": "stock_basics",
        "count": 0
      },
      {
        "name": "stock_trades",
        "count": 0
      }
    ],
    "stockBasics": [
      {
        "code": "string",
        "name": "string",
        "industry": "string",
        "market": "string",
        "update_time": "string"
      }
    ],
    "stockTrades": [
      {
        "stock_id": "string",
        "trade_date": "string",
        "open_price": 0,
        "close_price": 0,
        "volume": 0
      }
    ]
  }
  ```

## 接口列表

### 股票基础数据

#### 获取股票基础数据列表

```http
GET /stocks/basics
```

查询参数：
- `skip`: 跳过记录数（默认：0）
- `limit`: 返回记录数（默认：100，最大：100）
- `industry`: 行业筛选
- `market`: 市场类型筛选

响应示例：
```json
[
    {
        "code": "000001",
        "name": "平安银行",
        "industry": "银行",
        "market": "主板",
        "update_time": "2024-03-20T10:00:00Z"
    }
]
```

#### 更新股票基础数据

```http
POST /stocks/basics/update
```

响应示例：
```json
{
    "message": "更新成功",
    "updated_count": 5000
}
```

#### 获取单个股票详情

```http
GET /stocks/basics/{code}
```

路径参数：
- `code`: 股票代码

响应示例：
```json
{
    "code": "000001",
    "name": "平安银行",
    "industry": "银行",
    "market": "主板",
    "update_time": "2024-03-20T10:00:00Z"
}
```

### 股票交易数据

#### 获取股票交易数据

```http
GET /stocks/trades/{stock_code}
```

**参数说明：**
- `stock_code`: 股票代码

**响应格式：**
```json
{
  "code": 0,
  "message": "success",
  "items": [
    {
      "trade_date": "2024-01-01",
      "open_price": 10.5,
      "close_price": 11.2,
      "high_price": 11.5,
      "low_price": 10.3,
      "volume": 1000000,
      "amount": 11200000
    }
  ],
  "total": 1
}
```

**响应字段说明：**
- `items`: 交易数据列表
  - `trade_date`: 交易日期
  - `open_price`: 开盘价
  - `close_price`: 收盘价
  - `high_price`: 最高价
  - `low_price`: 最低价
  - `volume`: 成交量
  - `amount`: 成交额
- `total`: 总记录数

### 技术分析

#### 获取技术指标数据

```http
GET /analysis/indicators/{stock_code}
```

路径参数：
- `stock_code`: 股票代码

查询参数：
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）

响应示例：
```json
{
    "ma5": [10.2, 10.5, 10.8],
    "ma10": [10.0, 10.3, 10.6],
    "ma20": [9.8, 10.0, 10.2],
    "macd": [0.1, 0.2, 0.3],
    "macd_signal": [0.05, 0.15, 0.25],
    "macd_hist": [0.05, 0.05, 0.05],
    "rsi": [55, 60, 65],
    "kdj_k": [50, 55, 60],
    "kdj_d": [45, 50, 55],
    "kdj_j": [60, 65, 70],
    "boll_upper": [11.5, 11.8, 12.0],
    "boll_middle": [10.5, 10.8, 11.0],
    "boll_lower": [9.5, 9.8, 10.0]
}
```

#### 导出股票基础数据

```http
GET /analysis/export/basics
```

查询参数：
- `format`: 导出格式（csv/excel）

响应：
- 文件下载

#### 导出股票交易数据

```http
GET /analysis/export/trades/{stock_code}
```

路径参数：
- `stock_code`: 股票代码

查询参数：
- `format`: 导出格式（csv/excel）
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）

响应：
- 文件下载

#### 导出分析结果

```http
GET /analysis/export/analysis/{stock_code}
```

路径参数：
- `stock_code`: 股票代码

查询参数：
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）

响应：
- Excel文件下载，包含多个sheet（交易数据、技术指标、分析图表）
