'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SpendingEntry, SPENDING_CATEGORIES, USER_OPTIONS, CURRENCY_OPTIONS } from '@/types/spending';

interface SpendingChartsProps {
  entries: SpendingEntry[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
];

export default function SpendingCharts({ entries }: SpendingChartsProps) {
  const getCategoryInfo = (category: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.value === category) || 
           { emoji: '📝', label: 'Other' };
  };

  const getUserInfo = (user: string) => {
    return USER_OPTIONS.find(u => u.value === user) || 
           { emoji: '🤝', label: 'Sharing' };
  };

  const getCurrencyInfo = (currency: string) => {
    return CURRENCY_OPTIONS.find(c => c.value === currency) || 
           { emoji: '🇯🇵', symbol: '¥', label: 'Japanese Yen' };
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
    });
    return formatter.format(amount);
  };

  // Calculate spending by category
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const category = getCategoryInfo(entry.category).label;
      categoryMap.set(category, (categoryMap.get(category) || 0) + entry.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Calculate spending by user
  const userData = useMemo(() => {
    const userMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const user = getUserInfo(entry.user).label;
      userMap.set(user, (userMap.get(user) || 0) + entry.amount);
    });

    return Array.from(userMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Calculate spending by currency
  const currencyData = useMemo(() => {
    const currencyMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const currency = getCurrencyInfo(entry.currency).label;
      currencyMap.set(currency, (currencyMap.get(currency) || 0) + entry.amount);
    });

    return Array.from(currencyMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Calculate monthly spending trend
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + entry.amount);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, value]) => ({ 
        month, 
        value,
        label: new Date(month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [entries]);

  // eslint-disable-next-line
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            {formatAmount(data.value, 'JPY')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-lg">No data to visualize</p>
        <p className="text-gray-400 text-sm">Add some expenses to see charts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">📊 Spending Analytics</h3>
        <p className="text-gray-600">Visual breakdown of your expenses</p>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by User</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Currency Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by Currency</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {currencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">
            {categoryData.length}
          </div>
          <div className="text-sm text-blue-600">Categories Used</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">
            {userData.length}
          </div>
          <div className="text-sm text-green-600">Users</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">
            {currencyData.length}
          </div>
          <div className="text-sm text-purple-600">Currencies</div>
        </div>
      </div>
    </div>
  );
} 