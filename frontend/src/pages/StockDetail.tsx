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
  ma5?: number
  ma10?: number
  ma20?: number
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
  
  // 如果有多年，所有日期都显示完整年份
  return dates.map(date => date) // 返回 YYYY-MM-DD 格式
}

// 计算移动平均线
const calculateMA = (data: number[], period: number): number[] => {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / period)
  }
  return result
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
        // 按日期升序排序
        const sortedTrades = response.data.items.sort((a, b) => 
          new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
        )
        setTrades(sortedTrades)
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
    const closePrices = trades.map(trade => trade.close_price)

    // 计算MA线
    const ma5Data = calculateMA(closePrices, 5)
    const ma10Data = calculateMA(closePrices, 10)
    const ma20Data = calculateMA(closePrices, 20)

    // 格式化数字，保留3位小数
    const formatNumber = (value: number) => {
      return Number(value.toFixed(3));
    }

    // 转换数据格式
    const chartData: ChartData[] = trades.map((trade, index) => ({
      time: formattedDates[index],
      start: formatNumber(trade.open_price),
      end: formatNumber(trade.close_price),
      max: formatNumber(trade.high_price),
      min: formatNumber(trade.low_price),
      volumn: trade.volume,
      money: trade.amount,
      ma5: ma5Data[index] ? formatNumber(ma5Data[index]) : undefined,
      ma10: ma10Data[index] ? formatNumber(ma10Data[index]) : undefined,
      ma20: ma20Data[index] ? formatNumber(ma20Data[index]) : undefined
    }))

    const chart = new Chart({
      container: 'stock-candlestick',
      autoFit: true,
    })

    chart
      .data(chartData)
      .encode('x', 'time')
      .encode('y', ['start', 'end'])
      .encode('color', (d: ChartData) => {
        const trend = Math.sign(d.end - d.start)
        return trend > 0 ? '上涨' : trend === 0 ? '不变' : '下跌'
      })
      .scale('x', {
        type: 'band',
        paddingInner: 0.2,
        paddingOuter: 0.1
      })
      .scale('y', {
        nice: true,
        tickCount: 8,
        label: {
          formatter: (v: number) => v.toFixed(2)
        }
      })
      .scale('color', {
        domain: ['下跌', '不变', '上涨'],
        range: ['#33b31d', '#999999', '#e41a1c']
      })
      .axis('y', {
        title: '价格',
        grid: {
          line: {
            style: {
              stroke: '#E8E8E8',
              lineDash: [2, 2]
            }
          }
        }
      })
      .interaction('tooltip', {
        shared: true,
        crosshairs: {
          type: 'xy',
          line: {
            style: {
              stroke: '#666',
              lineWidth: 1,
              lineDash: [4, 4]
            }
          }
        }
      })

    // 添加K线图的上下影线
    chart
      .link()
      .encode('y', ['min', 'max'])
      .tooltip(false)
      .style('stroke', (d: ChartData) => {
        const trend = Math.sign(d.end - d.start)
        return trend > 0 ? '#e41a1c' : trend === 0 ? '#999999' : '#33b31d'
      })

    // 添加K线实体
    chart
      .interval()
      .style('fillOpacity', 1)
      .tooltip({
        title: (d: ChartData) => d.time,
        items: [
          { field: 'start', name: '开盘价' },
          { field: 'end', name: '收盘价' },
          { field: 'min', name: '最低价' },
          { field: 'max', name: '最高价' },
        ],
      })

    // 添加MA线
    const addMALine = (field: 'ma5' | 'ma10' | 'ma20', color: string, name: string) => {
      chart
        .line()
        .data(chartData.filter(d => d[field] !== undefined))
        .encode('x', 'time')
        .encode('y', field)
        .encode('color', name)
        .style('stroke', color)
        .style('strokeWidth', 1)
        .tooltip({
          title: (d: ChartData) => d.time,
          items: [
            { field, name }
          ]
        })
        .encode('shape', 'smooth')
    }

    // 添加三条均线
    addMALine('ma5', '#FF8800', 'MA5')
    addMALine('ma10', '#0088FF', 'MA10')
    addMALine('ma20', '#884400', 'MA20')

    // 配置图例
    chart.legend('color', {
      position: 'top'
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