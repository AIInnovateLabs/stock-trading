# G2 V5 K线图实现文档

## 版本信息
- 包名：`@antv/g2`
- 版本：`^5.2.12`

## 实现概述
本文档详细记录了使用G2 V5实现K线图的完整方案，包括K线主图、MA均线、图例、tooltip等功能的具体实现。

## 代码实现

### 1. 基础图表配置
```typescript
const chart = new Chart({
  container: 'stock-candlestick',
  autoFit: true,
})
```

### 2. K线主体配置
```typescript
chart
  .data(chartData)
  .encode('x', 'time')
  .encode('y', ['start', 'end'])
  .encode('color', (d: ChartData) => {
    const trend = Math.sign(d.end - d.start)
    return trend > 0 ? '上涨' : trend === 0 ? '不变' : '下跌'
  })
  .scale('x', {
    type: 'band',
    paddingInner: 0.2,
    paddingOuter: 0.1
  })
  .scale('y', {
    nice: true,
    tickCount: 8,
    label: {
      formatter: (v: number) => v.toFixed(2)
    }
  })
  .scale('color', {
    domain: ['下跌', '不变', '上涨'],
    range: ['#e41a1c', '#999999', '#4daf4a']
  })
```

### 3. 坐标轴和网格线配置
```typescript
.axis('y', {
  title: '价格',
  grid: {
    line: {
      style: {
        stroke: '#E8E8E8',
        lineDash: [2, 2]
      }
    }
  }
})
```

### 4. Tooltip配置
```typescript
.interaction('tooltip', {
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
```

### 5. K线影线配置
```typescript
chart
  .link()
  .encode('y', ['min', 'max'])
  .tooltip(false)
  .style('stroke', (d: ChartData) => {
    const trend = Math.sign(d.end - d.start)
    return trend > 0 ? '#4daf4a' : trend === 0 ? '#999999' : '#e41a1c'
  })
```

### 6. MA线配置
```typescript
const addMALine = (field: 'ma5' | 'ma10' | 'ma20', color: string, name: string) => {
  chart
    .line()
    .data(chartData.filter(d => d[field] !== undefined))
    .encode('x', 'time')
    .encode('y', field)
    .encode('color', name)  // 使用color编码来生成图例
    .style('stroke', color)
    .style('strokeWidth', 1)
    .tooltip({
      title: (d: ChartData) => d.time,
      items: [
        { field, name }
      ]
    })
    .encode('shape', 'smooth')
}

// 添加三条均线
addMALine('ma5', '#FF8800', 'MA5')
addMALine('ma10', '#0088FF', 'MA10')
addMALine('ma20', '#884400', 'MA20')
```

### 7. 图例配置
```typescript
chart.legend('color', {
  position: 'top'
})
```

## 关键注意点

1. **API版本兼容性**
   - 本实现基于G2 V5.2.12版本
   - 不同版本的API可能有显著差异
   - 升级版本时需要注意API变化

2. **图例实现**
   - 使用`encode('color', name)`来实现图例，而不是直接使用`.legend(name)`
   - 图例位置通过`chart.legend('color', { position: 'top' })`配置

3. **Tooltip配置**
   - 使用`.interaction('tooltip', {...})`而不是`.tooltip()`
   - 支持共享tooltip和十字准线

4. **数据编码**
   - 使用`encode()`方法设置视觉通道
   - 使用`scale()`方法配置数据比例尺

5. **性能优化**
   - 过滤掉MA线中的undefined值
   - 在组件卸载时调用`chart.destroy()`清理资源

## 数据接口定义

```typescript
interface ChartData {
  time: string;
  start: number;  // 开盘价
  end: number;    // 收盘价
  max: number;    // 最高价
  min: number;    // 最低价
  ma5?: number;   // 5日均线
  ma10?: number;  // 10日均线
  ma20?: number;  // 20日均线
}
```

## 数据预处理建议

1. **日期格式化**
   - 确保time字段格式统一
   - 考虑使用dayjs等库进行格式化

2. **数值精度控制**
   - 使用toFixed(3)控制显示精度
   - 注意处理异常值和空值

3. **MA数据计算**
   - 计算移动平均线时注意处理边界情况
   - 对空值和异常值进行适当处理

## 使用建议

1. **环境准备**
   ```bash
   npm install @antv/g2@^5.2.12
   ```

2. **组件生命周期**
   ```typescript
   useEffect(() => {
     const chart = new Chart({...})
     // 图表配置...
     return () => chart.destroy()
   }, [trades])
   ```

3. **错误处理**
   - 添加适当的错误边界
   - 处理数据加载和渲染异常

## 常见问题解决

1. **图例显示问题**
   - 确保使用正确的encode方法
   - 检查color编码是否正确设置

2. **Tooltip重复问题**
   - 使用shared属性合并tooltip
   - 适当配置tooltip显示内容

3. **性能优化**
   - 控制数据量
   - 使用适当的更新策略

## 后续优化建议

1. **交互优化**
   - 添加缩放功能
   - 实现数据区间选择

2. **样式优化**
   - 自定义主题
   - 响应式适配

3. **功能扩展**
   - 添加更多技术指标
   - 支持更多图表类型

## 参考资源

- [G2 V5官方文档](https://g2.antv.antgroup.com/manual/introduction)
- [G2 V5 API参考](https://g2.antv.antgroup.com/api/overview)
- [AntV图表示例](https://g2.antv.antgroup.com/examples) 