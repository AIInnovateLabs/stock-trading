import { useState, useEffect, useCallback } from 'react'
import { fetchStockBasics } from '../services/stock'
import { debounce } from 'lodash'

interface Stock {
  code: string
  name: string
  industry: string
  market: string
}

export function useStockList() {
  const [data, setData] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 获取初始数据（前100条）
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const response = await fetchStockBasics()
        setData(response.items)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stock list'))
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // 搜索函数
  const searchStocks = useCallback(async (search: string) => {
    if (!search) return
    setLoading(true)
    try {
      const response = await fetchStockBasics(0, 20, undefined, undefined, search)
      setData(response.items)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search stocks'))
    } finally {
      setLoading(false)
    }
  }, [])

  // 防抖处理的搜索函数
  const debouncedSearch = debounce(searchStocks, 300)

  return { data, loading, error, onSearch: debouncedSearch }
} 