import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DummyWorkflow = ({ reportData }) => {
    if (!Array.isArray(reportData) || reportData.length === 0) {
        return null; 
    }

    const stateCounts = reportData.reduce((acc, item) => {
        const state = item.state || "Unknown"; // Use item.state
        acc[state] = (acc[state] || 0) + 1;
        return acc;
    }, {});
    
    // Convert counts to chart format
    // Recharts Pie chart typically expects the actual count for 'value'
    const chartData = Object.entries(stateCounts).map(([state, count]) => ({
        name: state,
        value: count, // Pass the raw count, not percentage
    }));
    
    const COLORS = ['#FACC15', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#E11D48'];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto mt-4">
        <h2 className="text-xl font-bold mb-6 text-center">Workflow State Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                dataKey="value" 
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${((props.payload.value / reportData.length) * 100).toFixed(2)}%`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};
 
export default DummyWorkflow;