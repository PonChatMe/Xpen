import React from 'react';

export default function VolumeCharts({ transactionsByDay = [], monthlyTrends = [], sCurveData = [], sCurveRange = 1, setSCurveRange = () => {} }) {
  const maxValue = Math.max(...transactionsByDay.map(d => d.value), 1);
  
  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-900">
      <div className="mb-3 text-lg font-semibold text-white">Volume Charts</div>
      <div className="text-sm text-gray-400 mb-6">Data points: {transactionsByDay.length} • {monthlyTrends.length} • {sCurveData.length}</div>
      
      {/* Daily Transaction Volume Chart */}
      {transactionsByDay.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-300 mb-3 font-medium">Daily Transaction Volume</div>
          <div className="flex items-end justify-between h-24 gap-1 bg-gray-800 p-3 rounded-lg">
            {transactionsByDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300"
                  style={{ 
                    height: `${(day.value / maxValue) * 100}%`,
                    minHeight: day.value > 0 ? '4px' : '0px'
                  }}
                ></div>
                <div className="text-xs text-gray-400 mt-2">{day.day}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* S-Curve Range Control */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">S-Curve Range: {sCurveRange} year{sCurveRange > 1 ? 's' : ''}</div>
        <input 
          type="range" 
          min={1} 
          max={5} 
          value={sCurveRange} 
          onChange={(e) => setSCurveRange(Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Monthly Trends Summary */}
      {monthlyTrends.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Monthly Trends</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {monthlyTrends.slice(0, 6).map((trend, index) => (
              <div key={index} className="flex justify-between">
                <span>{trend.month}</span>
                <span className="text-green-600">+{trend.Income.toFixed(0)}</span>
                <span className="text-red-600">-{trend.Expense.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* S-Curve Data Summary */}
      {sCurveData.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Cumulative Growth</div>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Start:</span>
              <span>{sCurveData[0]?.value.toFixed(0) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Current:</span>
              <span>{sCurveData[sCurveData.length - 1]?.value.toFixed(0) || 0}</span>
            </div>
          </div>
        </div>
      )}
      
      {transactionsByDay.length === 0 && monthlyTrends.length === 0 && sCurveData.length === 0 && (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
          Add some transactions to see charts
        </div>
      )}
    </div>
  );
}