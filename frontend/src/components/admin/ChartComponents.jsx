import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const RevenueChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="_id" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const BookingsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="_id" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          fill="#3b82f6" 
          name="Bookings"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};