# 数据库设计文档

## 数据库概述

本项目使用SQLite作为数据库，主要用于存储股票基础数据和交易数据。

## 表结构设计

### 股票基础数据表 (stock_basics)

存储股票的基本信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| code | VARCHAR(10) | 股票代码 | PRIMARY KEY |
| name | VARCHAR(50) | 股票名称 | NOT NULL |
| industry | VARCHAR(50) | 所属行业 | |
| market | VARCHAR(20) | 市场类型 | NOT NULL |
| update_time | DATETIME | 更新时间 | NOT NULL |

索引：
- `idx_code`: (code)
- `idx_industry`: (industry)
- `idx_market`: (market)

### 股票交易数据表 (stock_trades)

存储股票的每日交易数据。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY AUTOINCREMENT |
| stock_code | VARCHAR(10) | 股票代码 | NOT NULL |
| trade_date | DATE | 交易日期 | NOT NULL |
| open_price | DECIMAL(10,2) | 开盘价 | NOT NULL |
| high_price | DECIMAL(10,2) | 最高价 | NOT NULL |
| low_price | DECIMAL(10,2) | 最低价 | NOT NULL |
| close_price | DECIMAL(10,2) | 收盘价 | NOT NULL |
| volume | INTEGER | 成交量 | NOT NULL |
| amount | DECIMAL(20,2) | 成交额 | NOT NULL |
| change_percent | DECIMAL(5,2) | 涨跌幅 | NOT NULL |
| update_time | DATETIME | 更新时间 | NOT NULL |

索引：
- `idx_stock_code`: (stock_code)
- `idx_trade_date`: (trade_date)
- `idx_stock_date`: (stock_code, trade_date)

## 表关系

- `stock_trades.stock_code` 外键关联 `stock_basics.code`

## 数据库迁移

使用Alembic进行数据库迁移管理：

1. 创建迁移：
```bash
alembic revision --autogenerate -m "描述"
```

2. 应用迁移：
```bash
alembic upgrade head
```

3. 回滚迁移：
```bash
alembic downgrade -1
```

## 数据备份

定期备份数据库文件：
```bash
cp stocks.db stocks.db.backup
```

## 性能优化

1. 索引优化
   - 为常用查询字段创建索引
   - 避免过多索引影响写入性能

2. 查询优化
   - 使用参数化查询
   - 避免全表扫描
   - 合理使用分页

3. 数据清理
   - 定期清理过期数据
   - 压缩数据库文件

## 注意事项

1. 数据一致性
   - 使用事务确保数据一致性
   - 定期检查数据完整性

2. 并发控制
   - 使用数据库锁机制
   - 避免死锁

3. 数据安全
   - 定期备份数据
   - 控制数据库访问权限
