import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import StockList from './pages/StockList'
import StockDetail from './pages/StockDetail'
import TechnicalAnalysis from './pages/TechnicalAnalysis'
import './App.css'

const { Header, Content } = Layout

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header className="header">
          <h1>股票交易系统</h1>
        </Header>
        <Content className="content">
          <Routes>
            <Route path="/" element={<StockList />} />
            <Route path="/stock/:code" element={<StockDetail />} />
            <Route path="/analysis/:code" element={<TechnicalAnalysis />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  )
}

export default App
