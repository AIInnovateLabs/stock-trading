import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Card, Descriptions, message } from 'antd'
import { AppDispatch, RootState } from '../store'
import { fetchStockDetail } from '../store/slices/stockSlice'
import { Chart } from '@antv/g2'
import axios from 'axios'

interface StockTrade {
  trade_date: string
  open_price: number
  close_price: number
  high_price: number
  low_price: number
  volume: number
  amount: number
}

interface ApiResponse {
  code: number
  message: string
  items: StockTrade[]
  total: number
}

interface ChartData {
  time: string
  start: number
  end: number
  max: number
  min: number
  volumn: number
  money: number
}

// 日期格式化函数
const formatDate = (dates: string[]) => {
  if (dates.length === 0) return []
  
  // 获取所有年份
  const years = new Set(dates.map(date => date.substring(0, 4)))
  
  // 如果只有一年，则所有日期只显示月-日
  if (years.size === 1) {
    return dates.map(date => date.substring(5)) // 返回 MM-DD 格式
  }
  
  // 如果有多年，第一个日期显示完整年份，之后的日期根据年份是否变化决定是否显示年份
  let currentYear = ''
  return dates.map((date, index) => {
    const year = date.substring(0, 4)
    if (index === 0 || year !== currentYear) {
      currentYear = year
      return date // 返回 YYYY-MM-DD 格式
    }
    return date.substring(5) // 返回 MM-DD 格式
  })
}

const StockDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { code } = useParams<{ code: string }>()
  const { currentStock, loading, error } = useSelector((state: RootState) => state.stock)
  const [trades, setTrades] = useState<StockTrade[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    if (code) {
      dispatch(fetchStockDetail(code))
    }
  }, [dispatch, code])

  useEffect(() => {
    const fetchStockTrades = async () => {
      try {
        setChartLoading(true)
        const response = await axios.get<ApiResponse>(`/api/v1/stocks/trades/${code}`)
        setTrades(response.data.items)
      } catch (error) {
        message.error('获取交易数据失败')
        console.error('Error fetching stock trades:', error)
      } finally {
        setChartLoading(false)
      }
    }

    if (code) {
      fetchStockTrades()
    }
  }, [code])

  useEffect(() => {
    if (!trades.length) return

    // 获取所有日期并格式化
    const dates = trades.map(trade => trade.trade_date)
    const formattedDates = formatDate(dates)

    // 转换数据格式
    const chartData: ChartData[] = trades.map((trade, index) => ({
      time: formattedDates[index],
      start: trade.open_price,
      end: trade.close_price,
      max: trade.high_price,
      min: trade.low_price,
      volumn: trade.volume,
      money: trade.amount
    }))

    const chart = new Chart({
      container: 'stock-candlestick',
      autoFit: true,
    })

    chart
      .data(chartData)
      .encode('x', 'time')
      .encode('color', (d: ChartData) => {
        const trend = Math.sign(d.start - d.end)
        return trend > 0 ? '下跌' : trend === 0 ? '不变' : '上涨'
      })
      .scale('x', {
        compare: (a: string, b: string) => {
          // 为了正确排序，在比较时需要添加年份（如果被省略）
          const getFullDate = (date: string) => {
            if (date.length <= 5) { // 如果是 MM-DD 格式
              // 使用第一个日期的年份
              const firstYear = trades[0].trade_date.substring(0, 4)
              return `${firstYear}-${date}`
            }
            return date
          }
          return new Date(getFullDate(a)).getTime() - new Date(getFullDate(b)).getTime()
        },
      })
      .scale('color', {
        domain: ['下跌', '不变', '上涨'],
        range: ['#4daf4a', '#999999', '#e41a1c'],
      })

    chart
      .link()
      .encode('y', ['min', 'max'])
      .tooltip({
        title: 'time',
        items: [
          { field: 'start', name: '开盘价' },
          { field: 'end', name: '收盘价' },
          { field: 'min', name: '最低价' },
          { field: 'max', name: '最高价' },
        ],
      })

    chart
      .interval()
      .encode('y', ['start', 'end'])
      .style('fillOpacity', 1)
      .style('stroke', (d: ChartData) => {
        if (d.start === d.end) return '#999999'
      })
      .axis('y', {
        title: false,
      })
      .tooltip({
        title: 'time',
        items: [
          { field: 'start', name: '开盘价' },
          { field: 'end', name: '收盘价' },
          { field: 'min', name: '最低价' },
          { field: 'max', name: '最高价' },
        ],
      })

    chart.render()

    return () => {
      chart.destroy()
    }
  }, [trades])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title={`${currentStock?.name} (${currentStock?.code})`} loading={loading}>
        <Descriptions bordered>
          <Descriptions.Item label="代码">{currentStock?.code}</Descriptions.Item>
          <Descriptions.Item label="名称">{currentStock?.name}</Descriptions.Item>
          <Descriptions.Item label="行业">{currentStock?.industry}</Descriptions.Item>
          <Descriptions.Item label="市场">{currentStock?.market}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{currentStock?.update_time}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="K线图" style={{ marginTop: 24 }} loading={chartLoading}>
        <div id="stock-candlestick" style={{ height: 400 }} />
      </Card>
    </div>
  )
}

export default StockDetail 