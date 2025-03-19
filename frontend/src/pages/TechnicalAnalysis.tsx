import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, DatePicker, Select, Space, Button, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import axios from 'axios'
import dayjs from 'dayjs'
import { API_ENDPOINTS } from '../config'

const { RangePicker } = DatePicker
const { Option } = Select

interface IndicatorData {
  date: string
  value: number
}

interface ChartData {
  dates: string[]
  values: number[]
}

const TechnicalAnalysis = () => {
  const { code } = useParams<{ code: string }>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])
  const [selectedIndicator, setSelectedIndicator] = useState('MA')
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({
    dates: [],
    values: [],
  })

  useEffect(() => {
    if (code) {
      loadIndicatorData()
    }
  }, [code, dateRange, selectedIndicator])

  const loadIndicatorData = async () => {
    if (!code) return

    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.indicators(code), {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          indicators: [selectedIndicator],
        },
      })
      
      const data = response.data
      setChartData({
        dates: data.map((item: IndicatorData) => item.date),
        values: data.map((item: IndicatorData) => item.value),
      })
    } catch (err) {
      console.error('Error loading indicator data:', err)
      message.error('获取技术指标数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!code) return

    try {
      const response = await axios.get(API_ENDPOINTS.export(code), {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          format: 'csv',
        },
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${code}_${selectedIndicator}_${dateRange[0].format('YYYY-MM-DD')}_${dateRange[1].format('YYYY-MM-DD')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error exporting data:', err)
      message.error('导出数据失败')
    }
  }

  const getChartOption = (): EChartsOption => ({
    title: {
      text: `${selectedIndicator}指标`,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category' as const,
      data: chartData.dates,
    },
    yAxis: {
      type: 'value' as const,
    },
    series: [
      {
        name: selectedIndicator,
        type: 'line' as const,
        data: chartData.values,
        smooth: true,
      },
    ],
  })

  return (
    <Card title="技术分析">
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
        />
        <Select
          value={selectedIndicator}
          onChange={setSelectedIndicator}
          style={{ width: 200 }}
        >
          <Option value="MA">移动平均线</Option>
          <Option value="MACD">MACD</Option>
          <Option value="RSI">RSI</Option>
          <Option value="KDJ">KDJ</Option>
        </Select>
        <Button type="primary" onClick={handleExport}>
          导出数据
        </Button>
      </Space>
      
      <ReactECharts
        option={getChartOption()}
        style={{ height: '400px' }}
        notMerge={true}
        showLoading={loading}
      />
    </Card>
  )
}

export default TechnicalAnalysis 