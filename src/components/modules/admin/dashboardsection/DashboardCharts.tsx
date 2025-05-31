'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardChartsProps {
  reviewCounts: {
    published: number;
    pending: number;
    unpublished: number;
  };
  totalEarning: number;
  totalReviews: number;
}

const DashboardCharts = ({ reviewCounts, totalEarning, totalReviews }: DashboardChartsProps) => {
  // Prepare chart data
  const pieChartData = [
    { name: 'Published', value: reviewCounts?.published || 0, color: '#10B981' },
    { name: 'Pending', value: reviewCounts?.pending || 0, color: '#F59E0B' },
    { name: 'Unpublished', value: reviewCounts?.unpublished || 0, color: '#EF4444' },
  ];

  // Prepare monthly earnings data (you might want to fetch this from your API)
  const monthlyData = [
    { month: 'Jan', earnings: totalEarning * 0.15, reviews: Math.floor(totalReviews * 0.1) },
    { month: 'Feb', earnings: totalEarning * 0.18, reviews: Math.floor(totalReviews * 0.12) },
    { month: 'Mar', earnings: totalEarning * 0.22, reviews: Math.floor(totalReviews * 0.15) },
    { month: 'Apr', earnings: totalEarning * 0.25, reviews: Math.floor(totalReviews * 0.18) },
    { month: 'May', earnings: totalEarning * 0.20, reviews: Math.floor(totalReviews * 0.20) },
    { month: 'Jun', earnings: totalEarning, reviews: totalReviews },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Review Status Distribution Chart */}
      <div className="bg-red-50 rounded-lg shadow p-2">
        <h3 className="text-gray-700 text-lg font-semibold mb-4">Review Status </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} reviews`, name]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-yellow-50 rounded-lg shadow p-2">
        <h3 className="text-gray-700 text-lg font-semibold mb-4">Monthly Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'earnings' ? `$${Number(value).toFixed(2)}` : value,
                  name === 'earnings' ? 'Earnings' : 'Reviews'
                ]}
              />
              <Legend />
              <Bar
                dataKey="earnings"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="earnings"
                barSize={30}
              />
              <Bar
                dataKey="reviews"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                name="reviews"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;