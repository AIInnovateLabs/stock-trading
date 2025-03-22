import axios from 'axios'

interface StockBasicsResponse {
  total: number
  items: Array<{
    code: string
    name: string
    industry: string
    market: string
  }>
  skip: number
  limit: number
}

interface StockTradesResponse {
  total: number
  items: Array<{
    trade_date: string
    open_price: number
    high_price: number
    low_price: number
    close_price: number
    volume: number
    amount: number
  }>
  skip: number
  limit: number
}

export async function fetchStockBasics(
  skip: number = 0,
  limit: number = 100,
  industry?: string,
  market?: string,
  search?: string
): Promise<StockBasicsResponse> {
  const params = new URLSearchParams()
  params.append('skip', skip.toString())
  params.append('limit', limit.toString())
  if (industry) params.append('industry', industry)
  if (market) params.append('market', market)
  if (search) params.append('search', search)

  const response = await axios.get(`/api/v1/stocks/basics?${params.toString()}`)
  return response.data
}

export async function fetchStockTrades(
  code: string,
  startDate?: string,
  endDate?: string,
  skip: number = 0,
  limit: number = 100
): Promise<StockTradesResponse> {
  const params = new URLSearchParams()
  params.append('skip', skip.toString())
  params.append('limit', limit.toString())
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await axios.get(`/api/v1/stocks/trades/${code}?${params.toString()}`)
  return response.data
}

export const fetchStockInfo = async (code: string) => {
  const response = await axios.get(`/api/v1/stocks/basics/${code}`)
  return response.data
} 