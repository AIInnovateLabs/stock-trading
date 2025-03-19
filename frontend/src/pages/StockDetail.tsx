import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Card, Descriptions, Spin, message } from 'antd'
import { AppDispatch, RootState } from '../store'
import { fetchStockDetail } from '../store/slices/stockSlice'

const StockDetail = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { code } = useParams<{ code: string }>()
  const { currentStock, loading, error } = useSelector((state: RootState) => state.stock)

  useEffect(() => {
    if (code) {
      loadStockDetail()
    }
  }, [code])

  const loadStockDetail = async () => {
    try {
      await dispatch(fetchStockDetail(code!)).unwrap()
    } catch (err) {
      message.error('获取股票详情失败')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )
  }

  if (!currentStock) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>未找到股票信息</p>
      </div>
    )
  }

  return (
    <Card title={`${currentStock.name} (${currentStock.code})`}>
      <Descriptions bordered>
        <Descriptions.Item label="股票代码">{currentStock.code}</Descriptions.Item>
        <Descriptions.Item label="股票名称">{currentStock.name}</Descriptions.Item>
        <Descriptions.Item label="所属行业">{currentStock.industry}</Descriptions.Item>
        <Descriptions.Item label="市场类型">{currentStock.market}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{currentStock.update_time}</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default StockDetail 