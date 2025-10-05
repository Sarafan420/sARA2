import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ConnectionsSpiderChart = ({ data }) => {
  // Подготавливаем данные для радарного графика
  const chartData = data.map(item => ({
    skill: item.name,
    value: item.count,
    fullMark: Math.max(...data.map(d => d.count)) + 2 // Максимальное значение + отступ
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid 
            gridType="polygon"
            radialLines={true}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ 
              fontSize: 12, 
              fill: '#6b7280',
              textAnchor: 'middle'
            }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'dataMax']} 
            tick={{ 
              fontSize: 10, 
              fill: '#9ca3af' 
            }}
            tickCount={4}
          />
          <Radar
            name="Навыки"
            dataKey="value"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.1}
            strokeWidth={2}
            dot={{ 
              fill: '#4f46e5', 
              strokeWidth: 2, 
              stroke: '#fff',
              r: 4 
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Легенда */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {chartData.map((item) => (
          <div key={item.skill} className="flex items-center text-xs text-gray-600">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1 opacity-20"></div>
            <span>{item.skill}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionsSpiderChart;
