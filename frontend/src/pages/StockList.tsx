import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Card, Input, Select, Space, Button, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { AppDispatch, RootState } from '../store'
import { fetchStockList } from '../store/slices/stockSlice'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Option } = Select

const StockList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { stockList, total, loading, error } = useSelector((state: RootState) => state.stock)
  
  const [searchText, setSearchText] = useState('')
  const [industry, setIndustry] = useState<string>()
  const [market, setMarket] = useState<string>()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  useEffect(() => {
    loadStockList()
  }, [pagination.current, pagination.pageSize, industry, market, searchText])

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total,
    }))
  }, [total])

  const loadStockList = async () => {
    try {
      await dispatch(fetchStockList({
        skip: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        industry,
        market,
        search: searchText,
      })).unwrap()
    } catch (err) {
      message.error('获取股票列表失败')
    }
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'code',
      key: 'code',
      sorter: (a: any, b: any) => a.code.localeCompare(b.code),
    },
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: '市场类型',
      dataIndex: 'market',
      key: 'market',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      render: (text: string) => text ? text.split('T')[0] : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/stock/${record.code}`)}>
            详情
          </Button>
          <Button type="link" onClick={() => navigate(`/analysis/${record.code}`)}>
            技术分析
          </Button>
        </Space>
      ),
    },
  ]

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleIndustryChange = (value: string | undefined) => {
    setIndustry(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleMarketChange = (value: string | undefined) => {
    setMarket(value)
    setPagination({ ...pagination, current: 1 })
  }

  return (
    <Card title="股票列表">
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索股票代码或名称"
          allowClear
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
        <Select
          placeholder="选择行业"
          allowClear
          style={{ width: 200 }}
          onChange={handleIndustryChange}
        >
          <Option value="银行">银行</Option>
          <Option value="证券">证券</Option>
          <Option value="保险">保险</Option>
          {/* 更多行业选项 */}
        </Select>
        <Select
          placeholder="选择市场类型"
          allowClear
          style={{ width: 200 }}
          onChange={handleMarketChange}
        >
          <Option value="主板">主板</Option>
          <Option value="创业板">创业板</Option>
          <Option value="科创板">科创板</Option>
          <Option value="北交所">北交所</Option>
          <Option value="中小板">中小板</Option>
        </Select>
      </Space>
      
      <Table
        columns={columns}
        dataSource={stockList}
        rowKey="code"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  )
}

export default StockList 