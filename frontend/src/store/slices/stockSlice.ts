import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config'

interface Stock {
  code: string
  name: string
  industry: string
  market: string
  update_time: string
}

interface StockState {
  stockList: Stock[]
  total: number
  currentStock: Stock | null
  loading: boolean
  error: string | null
}

interface FetchStockListParams {
  skip: number
  limit: number
  industry?: string
  market?: string
  search?: string
}

const initialState: StockState = {
  stockList: [],
  total: 0,
  currentStock: null,
  loading: false,
  error: null,
}

export const fetchStockList = createAsyncThunk(
  'stock/fetchStockList',
  async (params: FetchStockListParams) => {
    const response = await axios.get(API_ENDPOINTS.stockList, { params })
    return response.data
  }
)

export const fetchStockDetail = createAsyncThunk(
  'stock/fetchStockDetail',
  async (code: string) => {
    const response = await axios.get(`/api/v1/stocks/basics/${code}`)
    return response.data
  }
)

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStockList.fulfilled, (state, action) => {
        state.loading = false
        state.stockList = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchStockList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '获取股票列表失败'
      })
      .addCase(fetchStockDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStockDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentStock = action.payload
      })
      .addCase(fetchStockDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '获取股票详情失败'
      })
  },
})

export default stockSlice.reducer 