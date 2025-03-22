import React from 'react'
import { Select } from 'antd'
import { useStockList } from '../hooks/useStockList'

interface StockSelectProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

const StockSelect: React.FC<StockSelectProps> = ({ value, onChange, placeholder }) => {
  const { data: stockList, loading, onSearch } = useStockList()

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      loading={loading}
      style={{ width: 200 }}
      onChange={onChange}
      onSearch={onSearch}
      filterOption={false}
      defaultActiveFirstOption={false}
      showArrow={false}
      notFoundContent={loading ? '加载中...' : '未找到匹配的股票'}
      options={stockList?.map(stock => ({
        value: stock.code,
        label: `${stock.code} ${stock.name}`
      }))}
    />
  )
}

export default StockSelect 