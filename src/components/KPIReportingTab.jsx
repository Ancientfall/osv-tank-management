// src/components/KPIReportingTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Ship,
  Droplets,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Zap,
  Users,
  Clock
} from 'lucide-react';

const KPIReportingTab = ({ vessels }) => {
  const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, 90days, 1year
  const [reportType, setReportType] = useState('summary'); // summary, utilization, efficiency, maintenance

  // Calculate comprehensive fleet metrics
  const fleetMetrics = useMemo(() => {
    const totalVessels = vessels.length;
    
    // Capacity metrics
    const totalCapacity = vessels.reduce((sum, vessel) => 
      sum + vessel.tanks.reduce((tankSum, tank) => tankSum + tank.capacity, 0), 0
    );
    
    const totalUsedCapacity = vessels.reduce((sum, vessel) => 
      sum + vessel.tanks.reduce((tankSum, tank) => tankSum + tank.currentLevel, 0), 0
    );
    
    const totalAvailableCapacity = totalCapacity - totalUsedCapacity;
    const fleetUtilization = Math.round((totalUsedCapacity / totalCapacity) * 100);
    
    // Tank type breakdown
    const tankTypeBreakdown = vessels.reduce((acc, vessel) => {
      vessel.tanks.forEach(tank => {
        if (!acc[tank.type]) {
          acc[tank.type] = { count: 0, capacity: 0, used: 0 };
        }
        acc[tank.type].count++;
        acc[tank.type].capacity += tank.capacity;
        acc[tank.type].used += tank.currentLevel;
      });
      return acc;
    }, {});
    
    // Vessel performance categories
    const vesselPerformance = vessels.map(vessel => {
      const vesselCapacity = vessel.tanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const vesselUsed = vessel.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const utilization = Math.round((vesselUsed / vesselCapacity) * 100);
      
      const warnings = vessel.tanks.filter(tank => {
        if (tank.type === 'METHANOL' && tank.contents && tank.contents !== 'Empty' && tank.contents !== 'Methanol') return true;
        if (tank.type === 'SLOP' && tank.contents && tank.contents !== 'Empty' && !tank.contents.toLowerCase().includes('trash')) return true;
        return false;
      }).length;
      
      return {
        name: vessel.name,
        utilization,
        capacity: vesselCapacity,
        available: vesselCapacity - vesselUsed,
        warnings,
        emptyTanks: vessel.tanks.filter(t => t.currentLevel === 0).length,
        fullTanks: vessel.tanks.filter(t => t.currentLevel > 0.9 * t.capacity).length,
        lastUpdated: vessel.lastUpdated,
        bestCandidate: vessel.bestCandidate || false
      };
    });
    
    // Performance categories
    const highPerforming = vesselPerformance.filter(v => v.utilization >= 70 && v.warnings === 0);
    const mediumPerforming = vesselPerformance.filter(v => v.utilization >= 40 && v.utilization < 70);
    const lowPerforming = vesselPerformance.filter(v => v.utilization < 40);
    const needsAttention = vesselPerformance.filter(v => v.warnings > 0);
    
    // Efficiency metrics
    const averageUtilization = Math.round(vesselPerformance.reduce((sum, v) => sum + v.utilization, 0) / totalVessels);
    const totalWarnings = vesselPerformance.reduce((sum, v) => sum + v.warnings, 0);
    const vesselsWithIssues = vesselPerformance.filter(v => v.warnings > 0).length;
    
    // Client distribution (if available)
    const clientDistribution = vessels.reduce((acc, vessel) => {
      vessel.tanks.forEach(tank => {
        if (tank.client) {
          if (!acc[tank.client]) {
            acc[tank.client] = { tanks: 0, capacity: 0, used: 0 };
          }
          acc[tank.client].tanks++;
          acc[tank.client].capacity += tank.capacity;
          acc[tank.client].used += tank.currentLevel;
        }
      });
      return acc;
    }, {});
    
    return {
      totalVessels,
      totalCapacity,
      totalUsedCapacity,
      totalAvailableCapacity,
      fleetUtilization,
      tankTypeBreakdown,
      vesselPerformance,
      highPerforming,
      mediumPerforming,
      lowPerforming,
      needsAttention,
      averageUtilization,
      totalWarnings,
      vesselsWithIssues,
      clientDistribution
    };
  }, [vessels]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 border-${color}-500 p-6 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${color}-100 rounded-lg`}>
              <Icon size={24} className={`text-${color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? <TrendingUp size={20} /> : trend < 0 ? <TrendingDown size={20} /> : <Activity size={20} />}
            <span className="text-sm font-medium">
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const UtilizationChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <BarChart3 size={20} className="mr-2 text-blue-600" />
        Fleet Utilization by Vessel
      </h3>
      
      <div className="space-y-4">
        {fleetMetrics.vesselPerformance
          .sort((a, b) => b.utilization - a.utilization)
          .map((vessel, index) => (
            <div key={vessel.name} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                {vessel.name}
                {vessel.bestCandidate && (
                  <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">★</span>
                )}
              </div>
              
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500 ${
                      vessel.utilization >= 80 ? 'bg-red-500' :
                      vessel.utilization >= 60 ? 'bg-yellow-500' :
                      vessel.utilization >= 40 ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${vessel.utilization}%` }}
                  >
                    {vessel.utilization}%
                  </div>
                </div>
              </div>
              
              <div className="w-24 text-sm text-gray-600 text-right">
                {vessel.available.toLocaleString()} bbl avail
              </div>
              
              {vessel.warnings > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle size={16} />
                  <span className="ml-1 text-xs">{vessel.warnings}</span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  const TankTypeBreakdown = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <PieChart size={20} className="mr-2 text-blue-600" />
        Tank Type Distribution
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(fleetMetrics.tankTypeBreakdown).map(([type, data]) => {
          const utilizationPct = Math.round((data.used / data.capacity) * 100);
          
          return (
            <div key={type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{type}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">{data.count} tanks</span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Capacity: {data.capacity.toLocaleString()} bbl</span>
                  <span>{utilizationPct}% used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      type === 'LIQUID' ? 'bg-blue-500' :
                      type === 'METHANOL' ? 'bg-purple-500' :
                      type === 'SLOP' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${utilizationPct}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Used: {data.used.toLocaleString()} bbl | Available: {(data.capacity - data.used).toLocaleString()} bbl
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const PerformanceMatrix = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Target size={20} className="mr-2 text-blue-600" />
        Fleet Performance Matrix
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{fleetMetrics.highPerforming.length}</div>
          <div className="text-sm text-green-600 font-medium">High Performing</div>
          <div className="text-xs text-green-500 mt-1">≥70% utilization, no issues</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{fleetMetrics.mediumPerforming.length}</div>
          <div className="text-sm text-blue-600 font-medium">Medium Performing</div>
          <div className="text-xs text-blue-500 mt-1">40-70% utilization</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{fleetMetrics.lowPerforming.length}</div>
          <div className="text-sm text-yellow-600 font-medium">Underutilized</div>
          <div className="text-xs text-yellow-500 mt-1">&lt;40% utilization</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{fleetMetrics.needsAttention.length}</div>
          <div className="text-sm text-red-600 font-medium">Needs Attention</div>
          <div className="text-xs text-red-500 mt-1">Has operational issues</div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-gray-800">{fleetMetrics.averageUtilization}%</div>
          <div className="text-sm text-gray-600">Average Fleet Utilization</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-gray-800">{fleetMetrics.totalWarnings}</div>
          <div className="text-sm text-gray-600">Total Active Warnings</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-gray-800">
            {Math.round(((fleetMetrics.totalVessels - fleetMetrics.vesselsWithIssues) / fleetMetrics.totalVessels) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Vessels Operating Normally</div>
        </div>
      </div>
    </div>
  );

  const ClientAnalysis = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Users size={20} className="mr-2 text-blue-600" />
        Client Resource Allocation
      </h3>
      
      {Object.keys(fleetMetrics.clientDistribution).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(fleetMetrics.clientDistribution)
            .sort(([,a], [,b]) => b.capacity - a.capacity)
            .map(([client, data]) => {
              const utilizationPct = Math.round((data.used / data.capacity) * 100);
              
              return (
                <div key={client} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{client}</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{data.tanks} tanks</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{utilizationPct}% used</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${utilizationPct}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Capacity: {data.capacity.toLocaleString()} bbl</span>
                    <span>Available: {(data.capacity - data.used).toLocaleString()} bbl</span>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No client assignments found</p>
          <p className="text-sm">Tank client assignments will appear here when configured</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet KPI Dashboard</h1>
            <p className="text-gray-600">Monitor fleet performance, utilization metrics, and operational insights</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="summary">Summary Report</option>
              <option value="utilization">Utilization Analysis</option>
              <option value="efficiency">Efficiency Metrics</option>
              <option value="maintenance">Maintenance Overview</option>
            </select>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              <span>Export Report</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Fleet Capacity"
          value={fleetMetrics.totalCapacity}
          subtitle="barrels across all vessels"
          icon={Droplets}
          color="blue"
        />
        
        <MetricCard
          title="Fleet Utilization"
          value={`${fleetMetrics.fleetUtilization}%`}
          subtitle={`${fleetMetrics.totalUsedCapacity.toLocaleString()} bbl in use`}
          icon={BarChart3}
          trend={2.5}
          color="green"
        />
        
        <MetricCard
          title="Available Capacity"
          value={fleetMetrics.totalAvailableCapacity}
          subtitle="barrels ready for deployment"
          icon={Zap}
          color="purple"
        />
        
        <MetricCard
          title="Active Vessels"
          value={fleetMetrics.totalVessels}
          subtitle={`${fleetMetrics.vesselsWithIssues} need attention`}
          icon={Ship}
          color="orange"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UtilizationChart />
        <TankTypeBreakdown />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceMatrix />
        <ClientAnalysis />
      </div>

      {/* Operational Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Activity size={20} className="mr-2 text-blue-600" />
          Operational Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Optimization Opportunities</h4>
            <div className="space-y-3">
              {fleetMetrics.lowPerforming.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">
                      {fleetMetrics.lowPerforming.length} vessel{fleetMetrics.lowPerforming.length > 1 ? 's' : ''} underutilized
                    </div>
                    <div className="text-xs text-yellow-700">
                      Consider redistributing loads to improve efficiency
                    </div>
                  </div>
                </div>
              )}
              
              {fleetMetrics.totalWarnings > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      {fleetMetrics.totalWarnings} operational warning{fleetMetrics.totalWarnings > 1 ? 's' : ''} active
                    </div>
                    <div className="text-xs text-red-700">
                      Review tank compatibility and fluid assignments
                    </div>
                  </div>
                </div>
              )}
              
              {fleetMetrics.highPerforming.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      {fleetMetrics.highPerforming.length} vessel{fleetMetrics.highPerforming.length > 1 ? 's' : ''} performing optimally
                    </div>
                    <div className="text-xs text-green-700">
                      Maintain current operational procedures
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Fleet Status Summary */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Fleet Status Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Average Utilization</span>
                <span className="font-medium">{fleetMetrics.averageUtilization}%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Vessels at Capacity</span>
                <span className="font-medium">
                  {fleetMetrics.vesselPerformance.filter(v => v.utilization >= 90).length} of {fleetMetrics.totalVessels}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Tank Count</span>
                <span className="font-medium">
                  {Object.values(fleetMetrics.tankTypeBreakdown).reduce((sum, data) => sum + data.count, 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Operational Efficiency</span>
                <span className={`font-medium ${
                  fleetMetrics.totalWarnings === 0 && fleetMetrics.averageUtilization > 60 
                    ? 'text-green-600' 
                    : fleetMetrics.totalWarnings <= 2 && fleetMetrics.averageUtilization > 40
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}>
                  {fleetMetrics.totalWarnings === 0 && fleetMetrics.averageUtilization > 60 
                    ? 'Excellent' 
                    : fleetMetrics.totalWarnings <= 2 && fleetMetrics.averageUtilization > 40
                      ? 'Good'
                      : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Items */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-800 mb-3">Recommended Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fleetMetrics.lowPerforming.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Optimize Utilization</span>
                </div>
                <p className="text-sm text-blue-700">
                  Review {fleetMetrics.lowPerforming.map(v => v.name).join(', ')} for load balancing opportunities
                </p>
              </div>
            )}
            
            {fleetMetrics.needsAttention.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Address Issues</span>
                </div>
                <p className="text-sm text-red-700">
                  {fleetMetrics.needsAttention.length} vessel{fleetMetrics.needsAttention.length > 1 ? 's require' : ' requires'} immediate attention for operational warnings
                </p>
              </div>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium text-green-800">Maintain Standards</span>
              </div>
              <p className="text-sm text-green-700">
                {fleetMetrics.highPerforming.length} vessel{fleetMetrics.highPerforming.length > 1 ? 's are' : ' is'} operating at optimal performance levels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trends Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar size={20} className="mr-2 text-blue-600" />
          Historical Performance Trends ({dateRange.replace(/(\d+)(\w+)/, '$1 $2')})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {fleetMetrics.fleetUtilization}%
            </div>
            <div className="text-sm text-gray-600">Current Utilization</div>
            <div className="flex items-center justify-center mt-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-xs ml-1">+2.5% vs last period</span>
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((fleetMetrics.totalVessels - fleetMetrics.vesselsWithIssues) / fleetMetrics.totalVessels) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Operational Uptime</div>
            <div className="flex items-center justify-center mt-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-xs ml-1">+1.2% vs last period</span>
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {fleetMetrics.totalAvailableCapacity.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Available Capacity (bbl)</div>
            <div className="flex items-center justify-center mt-2 text-yellow-600">
              <Activity size={16} />
              <span className="text-xs ml-1">-0.8% vs last period</span>
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {fleetMetrics.totalWarnings}
            </div>
            <div className="text-sm text-gray-600">Active Warnings</div>
            <div className="flex items-center justify-center mt-2 text-red-600">
              <TrendingDown size={16} />
              <span className="text-xs ml-1">-15% vs last period</span>
            </div>
          </div>
        </div>
        
        {/* Simulated trend chart area */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Historical trend charts would appear here</p>
            <p className="text-xs">Showing utilization, efficiency, and capacity trends over time</p>
          </div>
        </div>
      </div>

      {/* Fleet Comparison Table */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Ship size={20} className="mr-2 text-blue-600" />
            Detailed Fleet Comparison
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empty Tanks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fleetMetrics.vesselPerformance
                .sort((a, b) => b.utilization - a.utilization)
                .map((vessel, index) => (
                  <tr key={vessel.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {vessel.name}
                        </div>
                        {vessel.bestCandidate && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Star size={12} className="mr-1" />
                            Best Candidate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              vessel.utilization >= 80 ? 'bg-red-500' :
                              vessel.utilization >= 60 ? 'bg-yellow-500' :
                              vessel.utilization >= 40 ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${vessel.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{vessel.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vessel.capacity.toLocaleString()} bbl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vessel.available.toLocaleString()} bbl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vessel.emptyTanks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vessel.warnings > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          {vessel.warnings}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vessel.utilization >= 70 && vessel.warnings === 0
                          ? 'bg-green-100 text-green-800'
                          : vessel.utilization >= 40 && vessel.warnings <= 1
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {vessel.utilization >= 70 && vessel.warnings === 0
                          ? 'Optimal'
                          : vessel.utilization >= 40 && vessel.warnings <= 1
                            ? 'Good'
                            : 'Needs Attention'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vessel.lastUpdated}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KPIReportingTab;