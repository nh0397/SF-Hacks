import React, { useState } from "react";
import { Box, Grid } from "@mui/material";
import "./Dashboard.css";
import { useSidebar } from "../../context/SidebarContext";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { isCollapsed } = useSidebar(); // ✅ Get state
  
  // Dummy data for monitoring violations
  const [timeFilter, setTimeFilter] = useState("Month");
  
  // Trend data for violations over time
  const violationTrendData = [
    { month: 'Jan', promptInjection: 12, sensitiveData: 5, unauthorizedAccess: 8 },
    { month: 'Feb', promptInjection: 19, sensitiveData: 7, unauthorizedAccess: 6 },
    { month: 'Mar', promptInjection: 15, sensitiveData: 8, unauthorizedAccess: 10 },
    { month: 'Apr', promptInjection: 25, sensitiveData: 12, unauthorizedAccess: 5 },
    { month: 'May', promptInjection: 18, sensitiveData: 15, unauthorizedAccess: 9 },
    { month: 'Jun', promptInjection: 13, sensitiveData: 6, unauthorizedAccess: 7 },
  ];
  
  // Time of day data for violations
  const timeOfDayData = [
    { time: '12am-4am', violations: 8 },
    { time: '4am-8am', violations: 12 },
    { time: '8am-12pm', violations: 45 },
    { time: '12pm-4pm', violations: 53 },
    { time: '4pm-8pm', violations: 36 },
    { time: '8pm-12am', violations: 19 },
  ];
  
  // Department data for violations
  const departmentData = [
    { name: 'Engineering', value: 42, color: '#0047AB' },
    { name: 'Marketing', value: 28, color: '#3373C4' },
    { name: 'Sales', value: 15, color: '#5E96DD' },
    { name: 'HR', value: 8, color: '#89B9F6' },
    { name: 'Finance', value: 7, color: '#B3D1FF' },
  ];
  
  // Platform data for violations
  const platformData = [
    { name: 'ChatGPT', value: 83, icon: '🤖', color: '#0047AB' },
    { name: 'Claude', value: 64, icon: '🧠', color: '#3373C4' },
    { name: 'CoPilot', value: 26, icon: '👨‍💻', color: '#5E96DD' },
  ];
  
  // Calculate total violations
  const totalViolations = violationTrendData.reduce((sum, item) => 
    sum + item.promptInjection + item.sensitiveData + item.unauthorizedAccess, 0);
  
  // Calculate unique users with violations
  const uniqueUsersWithViolations = 49;
  
  // Calculate average violations per user
  const avgViolationsPerUser = Math.round((totalViolations / uniqueUsersWithViolations) * 10) / 10;
  
  // Calculate blocked requests percentage
  const totalRequests = 4892;
  const blockedPercentage = Math.round((totalViolations / totalRequests) * 100 * 10) / 10;

  // Add platform violations chart data
  const platformChartData = platformData.map(item => ({
    name: item.name,
    value: item.value,
    icon: item.icon,
    color: item.color
  }));

  return (
    <div className={`dashboard ${isCollapsed ? "collapsed" : ""}`}>
      
      {/* Main Content */}
      <main className="dashboard-content">
        <div className="stats-grid">
          {/* Stat Cards */}
          {[
            { icon: '🚫', value: totalViolations, label: 'Policy Violations', color: 'stats-primary' },
            { icon: '👤', value: uniqueUsersWithViolations, label: 'Users with Violations', color: 'stats-primary' },
            { icon: '📊', value: avgViolationsPerUser, label: 'Avg Violations/User', color: 'stats-primary' },
            { icon: '🛑', value: `${blockedPercentage}%`, label: 'Blocked Requests', color: 'stats-primary' }
          ].map((stat, index) => (
            <div key={index} className="stats-card">
              <div className="stats-info">
                <p className="stats-label">{stat.label}</p>
                <h3 className="stats-value">{stat.value}</h3>
              </div>
              <div className={`stats-icon ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
        
        {/* Platform Violations */}
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Violations by Platform</h2>
          </div>
          <div className="platform-cards">
            {platformData.map((platform, index) => (
              <div key={index} className="platform-card">
                <div className="platform-icon" style={{ backgroundColor: platform.color }}>
                  <span role="img" aria-label={platform.name}>{platform.icon}</span>
                </div>
                <div className="platform-info">
                  <h3 className="platform-name">{platform.name}</h3>
                  <p className="platform-value">{platform.value} violations</p>
                  <div className="platform-bar-container">
                    <div 
                      className="platform-bar" 
                      style={{ 
                        width: `${(platform.value / Math.max(...platformData.map(p => p.value))) * 100}%`,
                        backgroundColor: platform.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Violation Types by Month</h2>
            <button className="chart-filter">
              {timeFilter}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chart-filter-icon">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
          
          {/* Chart */}
          <div className="chart-content" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={violationTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="promptInjection" name="Prompt Injection" stackId="a" fill="#0047AB" />
                <Bar dataKey="sensitiveData" name="Sensitive Data" stackId="a" fill="#3373C4" />
                <Bar dataKey="unauthorizedAccess" name="Unauthorized Access" stackId="a" fill="#5E96DD" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Additional Content */}
        <div className="dashboard-grid">
          <div className="dashboard-time-admitted">
            <h2 className="section-title">Violations by Time of Day</h2>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeOfDayData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="violations" stroke="#0047AB" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="dashboard-division">
            <h2 className="section-title">Violations by Department</h2>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#0047AB"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;