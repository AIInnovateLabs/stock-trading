import axios from 'axios'

interface TechnicalIndicatorsResponse {
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

export async function fetchTechnicalIndicators(
  code: string,
  startDate?: string,
  endDate?: string
): Promise<TechnicalIndicatorsResponse> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await axios.get(`/api/v1/analysis/indicators/${code}?${params.toString()}`)
  return response.data
} 