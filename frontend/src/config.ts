export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  stockList: '/api/v1/stocks/basics',
  stockDetail: (code: string) => `/api/v1/stocks/${code}`,
  indicators: (code: string) => `/api/v1/analysis/indicators/${code}`,
  export: (code: string) => `/api/v1/analysis/export/${code}`,
} 