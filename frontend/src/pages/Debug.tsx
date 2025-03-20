import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Space } from 'antd';
import axios from 'axios';

interface TableInfo {
  name: string;
  count: number;
}

interface StockBasic {
  code: string;
  name: string;
  industry: string;
  market: string;
  update_time: string;
}

interface StockTrade {
  stock_id: string;
  trade_date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  amount: number;
  update_time: string;
}

interface DbInfo {
  tables: TableInfo[];
  stockBasics: StockBasic[];
  stockTrades: StockTrade[];
}

const Debug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  const fetchDbInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/debug/db-info');
      setDbInfo(response.data);
      message.success('数据库信息获取成功');
    } catch (error) {
      message.error('获取数据库信息失败');
      console.error('Error fetching db info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const tableColumns = [
    { title: '表名', dataIndex: 'name', key: 'name' },
    { title: '记录数', dataIndex: 'count', key: 'count' },
  ];

  const stockBasicColumns = [
    { title: '代码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '行业', dataIndex: 'industry', key: 'industry' },
    { title: '市场', dataIndex: 'market', key: 'market' },
    { title: '更新时间', dataIndex: 'update_time', key: 'update_time' },
  ];

  const stockTradeColumns = [
    { title: '股票ID', dataIndex: 'stock_id', key: 'stock_id' },
    { title: '交易日期', dataIndex: 'trade_date', key: 'trade_date' },
    { title: '开盘价', dataIndex: 'open_price', key: 'open_price' },
    { title: '最高价', dataIndex: 'high_price', key: 'high_price' },
    { title: '最低价', dataIndex: 'low_price', key: 'low_price' },
    { title: '收盘价', dataIndex: 'close_price', key: 'close_price' },
    { title: '成交量', dataIndex: 'volume', key: 'volume' },
    { title: '成交额', dataIndex: 'amount', key: 'amount' },
    { title: '更新时间', dataIndex: 'update_time', key: 'update_time' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="数据库信息" extra={
          <Button onClick={fetchDbInfo} loading={loading}>
            刷新
          </Button>
        }>
          <Table
            dataSource={dbInfo?.tables}
            columns={tableColumns}
            rowKey="name"
            loading={loading}
          />
        </Card>

        <Card title="股票基本信息示例">
          <Table
            dataSource={dbInfo?.stockBasics}
            columns={stockBasicColumns}
            rowKey="code"
            loading={loading}
          />
        </Card>

        <Card title="股票交易数据示例">
          <Table
            dataSource={dbInfo?.stockTrades}
            columns={stockTradeColumns}
            rowKey="stock_id"
            loading={loading}
          />
        </Card>
      </Space>
    </div>
  );
};

export default Debug; 