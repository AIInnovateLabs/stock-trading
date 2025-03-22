import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, Space, Spin, Collapse, message } from 'antd'
import { DatePicker } from 'antd'
import { Chart } from '@antv/g2'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchStockTrades } from '../services/stock'
import { fetchTechnicalIndicators } from '../services/analysis'
import StockSelect from '../components/StockSelect'
import axios from 'axios'

const { RangePicker } = DatePicker

dayjs.extend(isSameOrBefore)

interface IndicatorData {
  dates: string[]
  ma5: number[]
  ma10: number[]
  ma20: number[]
  macd: {
    macd_line: number[]
    signal_line: number[]
    macd_hist: number[]
  }
  rsi: number[]
  bollinger_bands: {
    middle_band: number[]
    upper_band: number[]
    lower_band: number[]
  }
  volume_ma: number[]
  price_change: {
    change: number
    change_percent: number
  }
}

// 技术指标说明
const indicatorExplanations = {
  bollinger: {
    content: (
      <div>
        <p>布林带由三条线组成：</p>
        <ul>
          <li>中轨（SMA20）：20日简单移动平均线</li>
          <li>上轨：中轨 + 2倍标准差</li>
          <li>下轨：中轨 - 2倍标准差</li>
        </ul>
        <p>使用参考：</p>
        <ul>
          <li>价格突破上轨：可能超买，考虑卖出</li>
          <li>价格突破下轨：可能超卖，考虑买入</li>
          <li>带宽扩大：市场波动加剧</li>
          <li>带宽收窄：市场波动减弱，可能即将突破</li>
        </ul>
      </div>
    )
  },
  macd: {
    content: (
      <div>
        <p>MACD指标由三个组成部分：</p>
        <ul>
          <li>MACD线：12日EMA - 26日EMA</li>
          <li>信号线：MACD的9日EMA</li>
          <li>柱状图：MACD线 - 信号线</li>
        </ul>
        <p>使用参考：</p>
        <ul>
          <li>MACD线上穿信号线：买入信号</li>
          <li>MACD线下穿信号线：卖出信号</li>
          <li>柱状图由负转正：趋势可能转强</li>
          <li>柱状图由正转负：趋势可能转弱</li>
        </ul>
      </div>
    )
  },
  rsi: {
    content: (
      <div>
        <p>RSI（相对强弱指标）衡量价格变动的强度：</p>
        <ul>
          <li>RSI &gt; 70：可能超买</li>
          <li>RSI &lt; 30：可能超卖</li>
          <li>RSI = 50：多空平衡</li>
        </ul>
        <p>使用参考：</p>
        <ul>
          <li>RSI突破70：市场可能过热，考虑卖出</li>
          <li>RSI跌破30：市场可能见底，考虑买入</li>
          <li>RSI背离：价格创新高而RSI未创新高，可能即将回调</li>
        </ul>
      </div>
    )
  }
}

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-'
  return Number(value.toFixed(2))
}

const TechnicalAnalysis: React.FC = () => {
  const { code: urlCode } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [trades, setTrades] = useState<any[]>([])
  const [indicators, setIndicators] = useState<IndicatorData | null>(null)
  const [code, setCode] = useState<string>(urlCode || '')
  const today = dayjs().format('YYYY-MM-DD')
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
    today
  ])
  const priceChartRef = useRef<Chart | null>(null)
  const macdChartRef = useRef<Chart | null>(null)
  const rsiChartRef = useRef<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 清理图表的函数
  const clearCharts = useCallback(() => {
    if (priceChartRef.current) {
      priceChartRef.current.destroy()
      priceChartRef.current = null
    }
    if (macdChartRef.current) {
      macdChartRef.current.destroy()
      macdChartRef.current = null
    }
    if (rsiChartRef.current) {
      rsiChartRef.current.destroy()
      rsiChartRef.current = null
    }
  }, [])

  // 处理股票代码变化
  const handleCodeChange = (value: string) => {
    clearCharts() // 清理旧图表
    setCode(value)
    navigate(`/analysis/${value}`)
  }

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!code) {
        clearCharts()
        setTrades([])
        setIndicators(null)
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const tradesData = await fetchStockTrades(code, dateRange[0], dateRange[1])
        const indicatorsData = await fetchTechnicalIndicators(code, dateRange[0], dateRange[1])
        
        // 对交易数据按日期升序排序
        const sortedTrades = [...tradesData.items].sort((a, b) => 
          new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
        )
        
        setTrades(sortedTrades)
        setIndicators(indicatorsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        clearCharts()
        setTrades([])
        setIndicators(null)
        
        // 处理错误消息
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status
          const detail = error.response.data.detail
          
          if (status === 404) {
            setError(detail || '未找到数据')
          } else if (status === 400) {
            setError(detail || '数据不足，无法计算技术指标')
          } else {
            setError('获取数据失败，请稍后重试')
          }
          message.error(detail || '获取数据失败')
        } else {
          setError('获取数据失败，请稍后重试')
          message.error('获取数据失败，请稍后重试')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [code, dateRange, clearCharts])

  // 渲染图表
  useEffect(() => {
    if (!trades.length || !indicators || loading) {
      clearCharts() // 当数据不完整时清理图表
      return
    }

    // 清理旧图表
    clearCharts()

    // 准备数据
    const data = indicators.dates.map((date: string, index: number) => {
      const trade = trades.find(t => t.trade_date === date)
      
      if (!trade?.close_price || 
          !indicators?.macd?.macd_line?.[index] ||
          !indicators?.macd?.signal_line?.[index] ||
          !indicators?.macd?.macd_hist?.[index] ||
          !indicators?.rsi?.[index] ||
          !indicators?.bollinger_bands?.middle_band?.[index] ||
          !indicators?.bollinger_bands?.upper_band?.[index] ||
          !indicators?.bollinger_bands?.lower_band?.[index]) {
        return null
      }

      return {
        date,
        display_date: dayjs(date).format('YYYY-MM-DD'),
        close: formatNumber(trade.close_price),
        macd: formatNumber(indicators.macd.macd_line[index]),
        signal: formatNumber(indicators.macd.signal_line[index]),
        hist: formatNumber(indicators.macd.macd_hist[index]),
        rsi: formatNumber(indicators.rsi[index]),
        middle: formatNumber(indicators.bollinger_bands.middle_band[index]),
        upper: formatNumber(indicators.bollinger_bands.upper_band[index]),
        lower: formatNumber(indicators.bollinger_bands.lower_band[index])
      }
    }).filter(item => item !== null)

    if (data.length === 0) {
      console.warn('No valid data available for charts')
      return
    }

    // 创建K线和布林带图表
    const priceChart = new Chart({
      container: 'price-chart',
      autoFit: true,
      height: 300,
      paddingLeft: 60,
      paddingRight: 20,
      paddingTop: 30,
      paddingBottom: 20
    })

    priceChart.data(data)
    priceChart.scale({
      date: {
        type: 'time',
        tickCount: 10,
        mask: 'YYYY-MM-DD'
      },
      close: { 
        nice: true,
        alias: '价格'
      },
      upper: { 
        nice: true,
        alias: '上轨'
      },
      middle: { 
        nice: true,
        alias: '中轨'
      },
      lower: { 
        nice: true,
        alias: '下轨'
      }
    })

    // 布林带区域
    priceChart
      .area()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.upper)
      .encode('y1', (d: any) => d.lower)
      .encode('series', '布林带')
      .tooltip(false)
      .style('fill', '#e6f4ff')
      .style('fillOpacity', 0.2)

    // 布林带线条
    priceChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.upper)
      .encode('series', '布林上轨')
      .tooltip({
        items: [
          { field: 'upper', name: '布林上轨' }
        ]
      })
      .style('stroke', '#95de64')
      .style('lineWidth', 1)

    priceChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.middle)
      .encode('series', '布林中轨')
      .tooltip({
        items: [
          { field: 'middle', name: '布林中轨' }
        ]
      })
      .style('stroke', '#666666')
      .style('strokeDasharray', [4, 4])
      .style('lineWidth', 1)

    priceChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.lower)
      .encode('series', '布林下轨')
      .tooltip({
        items: [
          { field: 'lower', name: '布林下轨' }
        ]
      })
      .style('stroke', '#ff7875')
      .style('lineWidth', 1)

    // 价格线
    priceChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.close)
      .encode('series', '价格')
      .tooltip({
        items: [
          { field: 'close', name: '价格' }
        ]
      })
      .style('stroke', '#1890ff')
      .style('lineWidth', 2)

    // 创建MACD图表
    const macdChart = new Chart({
      container: 'macd-chart',
      autoFit: true,
      height: 200,
      paddingLeft: 60,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20
    })

    macdChart.data(data)
    macdChart.scale({
      date: {
        type: 'time',
        tickCount: 10,
        mask: 'YYYY-MM-DD'
      },
      macd: { 
        nice: true,
        alias: 'MACD'
      },
      signal: { 
        nice: true,
        alias: 'Signal'
      },
      hist: { 
        nice: true,
        alias: 'MACD柱'
      }
    })

    // MACD柱状图
    macdChart
      .interval()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.hist)
      .tooltip({
        items: [
          { field: 'hist', name: 'MACD柱' }
        ]
      })
      .style('fill', (d: any) => (d.hist >= 0 ? '#f5222d' : '#52c41a'))
      .style('fillOpacity', 0.8)

    // MACD线
    macdChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.macd)
      .tooltip({
        items: [
          { field: 'macd', name: 'MACD' }
        ]
      })
      .style('stroke', '#f5222d')
      .style('lineWidth', 1.5)

    // Signal线
    macdChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.signal)
      .tooltip({
        items: [
          { field: 'signal', name: '信号线' }
        ]
      })
      .style('stroke', '#52c41a')
      .style('lineWidth', 1.5)

    // 创建RSI图表
    const rsiChart = new Chart({
      container: 'rsi-chart',
      autoFit: true,
      height: 200,
      paddingLeft: 60,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20
    })

    rsiChart.data(data)
    rsiChart.scale({
      date: {
        type: 'time',
        tickCount: 10,
        mask: 'YYYY-MM-DD'
      },
      rsi: {
        nice: true,
        min: 0,
        max: 100,
        alias: 'RSI'
      }
    })
    console.log(data)

    // 超买超卖区域
    rsiChart
      .area()
      .data([
        { date: data[0].date, value: 70 },
        { date: data[data.length - 1].date, value: 70 }
      ])
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => 100)
      .encode('y1', (d: any) => 70)
      .encode('series', '超买区域')
      .tooltip(false)
      .style('fill', '#ffccc7')
      .style('fillOpacity', 0.3)

    rsiChart
      .area()
      .data([
        { date: data[0].date, value: 30 },
        { date: data[data.length - 1].date, value: 30 }
      ])
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => 30)
      .encode('y1', (d: any) => 0)
      .encode('series', '超卖区域')
      .tooltip(false)
      .style('fill', '#d9f7be')
      .style('fillOpacity', 0.3)

    // RSI线
    rsiChart
      .line()
      .data(data)
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => d.rsi)
      .encode('series', 'RSI')
      .tooltip({
        items: [
          { 
            field: 'rsi', 
            name: 'RSI',
            valueFormatter: (value: number) => {
              if (value > 70) return `${value} (超买)`
              if (value < 30) return `${value} (超卖)`
              return `${value}`
            }
          }
        ]
      })
      .style('stroke', '#722ed1')
      .style('lineWidth', 1.5)

    // 超买超卖参考线
    rsiChart
      .line()
      .data([
        { date: data[0].date, value: 70 },
        { date: data[data.length - 1].date, value: 70 }
      ])
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => 70)
      .encode('series', '超买线')
      .tooltip(false)
      .style('stroke', '#ff4d4f')
      .style('strokeDasharray', [4, 4])

    rsiChart
      .line()
      .data([
        { date: data[0].date, value: 30 },
        { date: data[data.length - 1].date, value: 30 }
      ])
      .encode('x', (d: any) => d.display_date)
      .encode('y', (d: any) => 30)
      .encode('series', '超卖线')
      .tooltip(false)
      .style('stroke', '#52c41a')
      .style('strokeDasharray', [4, 4])

    // 配置所有图表的公共属性
    ;[priceChart, macdChart, rsiChart].forEach(chart => {
      // 配置坐标轴
      chart.axis('date', {
        label: {
          autoRotate: true,
          autoHide: true,
          formatter: (val: string) => {
            const date = dayjs(val)
            // 如果是年份的第一天，显示完整日期
            if (date.date() === 1 && date.month() === 0) {
              return date.format('YYYY-MM-DD')
            }
            // 如果是月份的第一天，显示月份
            if (date.date() === 1) {
              return date.format('MM-DD')
            }
            // 其他情况只显示日期
            return date.format('DD')
          }
        }
      })

      // 配置图例
      chart.legend({
        position: 'top'
      })

      // 配置提示框交互
      chart.interaction('tooltip', {
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

      // 渲染图表
      chart.render()
    })

    // 保存图表引用
    priceChartRef.current = priceChart
    macdChartRef.current = macdChart
    rsiChartRef.current = rsiChart

    // 清理函数
    return () => {
      if (priceChartRef.current) {
        priceChartRef.current.destroy()
      }
      if (macdChartRef.current) {
        macdChartRef.current.destroy()
      }
      if (rsiChartRef.current) {
        rsiChartRef.current.destroy()
      }
    }
  }, [trades, indicators, loading, clearCharts])

  // 组件卸载时清理图表
  useEffect(() => {
    return () => {
      clearCharts()
    }
  }, [clearCharts])

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <StockSelect
          value={code}
          onChange={handleCodeChange}
          placeholder="请选择股票"
        />
        <RangePicker
          value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
          onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([
                dates[0].format('YYYY-MM-DD'),
                dates[1].format('YYYY-MM-DD')
              ])
            }
          }}
          disabledDate={(current) => {
            return current && current > dayjs().endOf('day')
          }}
        />
      </div>
      <Card title={code ? `${code} 技术分析` : '技术分析'}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Spin spinning={loading}>
            {error ? (
              <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '20px' }}>
                {error}
              </div>
            ) : (
              <>
                <div>
                  <h3>价格走势与布林带</h3>
                  <Collapse ghost size="small">
                    <Collapse.Panel header={<span style={{ fontSize: '12px', color: '#666' }}>查看指标说明</span>} key="1">
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {indicatorExplanations.bollinger.content}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                  <div id="price-chart" style={{ width: '100%', height: '300px' }} />
                </div>
                <div>
                  <h3>MACD指标</h3>
                  <Collapse ghost size="small">
                    <Collapse.Panel header={<span style={{ fontSize: '12px', color: '#666' }}>查看指标说明</span>} key="1">
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {indicatorExplanations.macd.content}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                  <div id="macd-chart" style={{ width: '100%', height: '200px' }} />
                </div>
                <div>
                  <h3>RSI指标</h3>
                  <Collapse ghost size="small">
                    <Collapse.Panel header={<span style={{ fontSize: '12px', color: '#666' }}>查看指标说明</span>} key="1">
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {indicatorExplanations.rsi.content}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                  <div id="rsi-chart" style={{ width: '100%', height: '200px' }} />
                </div>
              </>
            )}
          </Spin>
        </Space>
      </Card>
    </div>
  )
}

export default TechnicalAnalysis 