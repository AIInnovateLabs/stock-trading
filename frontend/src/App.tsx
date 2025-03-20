import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import StockList from './pages/StockList'
import StockDetail from './pages/StockDetail'
import TechnicalAnalysis from './pages/TechnicalAnalysis'
import Debug from './pages/Debug'
import './App.css'

const { Header, Content } = Layout

const App = () => {
  const navigateToDebug = () => {
    window.location.href = '/debug';
  };

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
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </Content>
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={navigateToDebug}
          className="debug-button"
        />
      </Layout>
    </Router>
  )
}

export default App
