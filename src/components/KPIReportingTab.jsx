// src/components/KPIReportingTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Ship,
  Droplets,
  Download,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const KPIReportingTab = ({ vessels }) => {
  const [dateRange, setDateRange] = useState('30days');

  // Safety check
  if (!vessels || !Array.isArray(vessels)) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>No Data Available</h3>
          <p style={{ color: '#6b7280' }}>Unable to load vessel data for analytics.</p>
        </div>
      </div>
    );
  }

  // Calculate fleet metrics
  const fleetMetrics = useMemo(() => {
    const totalVessels = vessels.length;
    
    // Separate liquid and dry bulk calculations
    const liquidTanks = vessels.flatMap(v => v.tanks.filter(t => t.type !== 'DRY BULK'));
    const dryBulkTanks = vessels.flatMap(v => v.tanks.filter(t => t.type === 'DRY BULK'));
    
    const liquidCapacity = liquidTanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0);
    const liquidUsed = liquidTanks.reduce((sum, tank) => sum + (tank.currentLevel || 0), 0);
    const liquidAvailable = liquidCapacity - liquidUsed;
    const liquidUtilization = liquidCapacity > 0 ? Math.round((liquidUsed / liquidCapacity) * 100) : 0;
    
    const dryBulkCapacity = dryBulkTanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0);
    const dryBulkUsed = dryBulkTanks.reduce((sum, tank) => sum + (tank.currentLevel || 0), 0);
    
    // Vessel performance
    const vesselPerformance = vessels.map(vessel => {
      const vesselLiquidTanks = vessel.tanks.filter(t => t.type !== 'DRY BULK');
      const vesselCapacity = vesselLiquidTanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0);
      const vesselUsed = vesselLiquidTanks.reduce((sum, tank) => sum + (tank.currentLevel || 0), 0);
      const utilization = vesselCapacity > 0 ? Math.round((vesselUsed / vesselCapacity) * 100) : 0;
      
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
        emptyTanks: vessel.tanks.filter(t => (t.currentLevel || 0) === 0).length,
        totalTanks: vessel.tanks.length,
        lastUpdated: vessel.lastUpdated,
        bestCandidate: vessel.bestCandidate || false
      };
    });
    
    const averageUtilization = totalVessels > 0 ? Math.round(vesselPerformance.reduce((sum, v) => sum + v.utilization, 0) / totalVessels) : 0;
    const totalWarnings = vesselPerformance.reduce((sum, v) => sum + v.warnings, 0);
    const totalTanks = vessels.reduce((sum, v) => sum + v.tanks.length, 0);
    
    return {
      totalVessels,
      liquidCapacity,
      liquidUsed,
      liquidAvailable,
      liquidUtilization,
      dryBulkCapacity,
      dryBulkUsed,
      vesselPerformance,
      averageUtilization,
      totalWarnings,
      totalTanks
    };
  }, [vessels]);

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const cardHoverStyle = {
    ...cardStyle,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
          alignItems: window.innerWidth < 1024 ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              🚢 Fleet Performance Dashboard
            </h1>
            <p style={{ color: '#6b7280' }}>Real-time analytics and key performance indicators</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                fontSize: '0.875rem'
              }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            
            <button
              style={primaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            
            <button
              style={secondaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Fleet Utilization */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #2563eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '8px'
            }}>
              <BarChart3 size={24} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Fleet Utilization</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{fleetMetrics.averageUtilization}%</div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Average across all vessels</p>
            </div>
          </div>
        </div>

        {/* Liquid Capacity */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #059669'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#d1fae5',
              borderRadius: '8px'
            }}>
              <Droplets size={24} style={{ color: '#059669' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Liquid Capacity</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{fleetMetrics.liquidCapacity.toLocaleString()}</div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{fleetMetrics.liquidAvailable.toLocaleString()} bbl available</p>
            </div>
          </div>
        </div>

        {/* Active Vessels */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #7c3aed'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#ede9fe',
              borderRadius: '8px'
            }}>
              <Ship size={24} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Active Vessels</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{fleetMetrics.totalVessels}</div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{fleetMetrics.totalTanks} tanks total</p>
            </div>
          </div>
        </div>

        {/* Operational Status */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #ea580c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#fed7aa',
              borderRadius: '8px'
            }}>
              <Target size={24} style={{ color: '#ea580c' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Operational Status</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {Math.round(((fleetMetrics.totalVessels - fleetMetrics.vesselPerformance.filter(v => v.warnings > 0).length) / fleetMetrics.totalVessels) * 100)}%
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{fleetMetrics.totalWarnings} active warnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Utilization Chart */}
      <div style={{ ...cardStyle, marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <BarChart3 size={20} style={{ color: '#2563eb' }} />
          Fleet Utilization by Vessel
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fleetMetrics.vesselPerformance
            .sort((a, b) => b.utilization - a.utilization)
            .map((vessel, index) => (
              <div key={vessel.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '8rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {vessel.name}
                  {vessel.bestCandidate && (
                    <span style={{
                      marginLeft: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: '#fed7aa',
                      color: '#ea580c',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '4px'
                    }}>★</span>
                  )}
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '1.5rem'
                  }}>
                    <div 
                      style={{
                        height: '1.5rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '0.5rem',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        transition: 'all 0.5s ease',
                        width: `${vessel.utilization}%`,
                        backgroundColor: vessel.utilization >= 80 ? '#ef4444' :
                                       vessel.utilization >= 60 ? '#eab308' :
                                       vessel.utilization >= 40 ? '#3b82f6' : '#10b981'
                      }}
                    >
                      {vessel.utilization}%
                    </div>
                  </div>
                </div>
                
                <div style={{
                  width: '6rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  textAlign: 'right'
                }}>
                  {vessel.available.toLocaleString()} bbl avail
                </div>
                
                {vessel.warnings > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#dc2626' }}>
                    <AlertTriangle size={16} />
                    <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>{vessel.warnings}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Vessel Performance Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1.5rem'
        }}>Vessel Performance</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {fleetMetrics.vesselPerformance.map(vessel => (
            <div 
              key={vessel.name}
              style={{
                ...cardStyle,
                borderLeft: `4px solid ${
                  vessel.bestCandidate ? '#ea580c' : 
                  vessel.warnings > 0 ? '#dc2626' : '#059669'
                }`,
                background: vessel.bestCandidate ? 'linear-gradient(to right, #fff7ed, white)' : 'white'
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: vessel.bestCandidate ? '#fed7aa' : 
                                     vessel.warnings > 0 ? '#fecaca' : '#d1fae5'
                    }}>
                      <Ship size={20} style={{
                        color: vessel.bestCandidate ? '#ea580c' :
                               vessel.warnings > 0 ? '#dc2626' : '#059669'
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{vessel.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Updated: {vessel.lastUpdated}</p>
                    </div>
                  </div>
                  
                  {vessel.bestCandidate && (
                    <div style={{
                      backgroundColor: '#fed7aa',
                      color: '#ea580c',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Best Candidate
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb' }}>{vessel.capacity.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Capacity</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669' }}>{vessel.available.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Available</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      color: vessel.utilization >= 80 ? '#dc2626' :
                             vessel.utilization >= 60 ? '#d97706' : '#059669'
                    }}>
                      {vessel.utilization}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Utilized</div>
                  </div>
                </div>
                
                <div style={{
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <div 
                    style={{
                      height: '0.5rem',
                      borderRadius: '9999px',
                      transition: 'all 0.5s ease',
                      width: `${vessel.utilization}%`,
                      backgroundColor: vessel.utilization >= 80 ? '#dc2626' :
                                     vessel.utilization >= 60 ? '#d97706' : '#059669'
                    }}
                  ></div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: '#6b7280' }}>{vessel.emptyTanks} empty / {vessel.totalTanks} total tanks</span>
                  
                  {vessel.warnings > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#dc2626' }}>
                      <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} />
                      {vessel.warnings} warnings
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                      <CheckCircle size={14} style={{ marginRight: '0.25rem' }} />
                      Operational
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={cardStyle}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1.5rem'
        }}>Fleet Summary</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#dbeafe',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{fleetMetrics.liquidUtilization}%</div>
            <div style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: '500' }}>Liquid Tank Utilization</div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>
              {fleetMetrics.liquidUsed.toLocaleString()} / {fleetMetrics.liquidCapacity.toLocaleString()} bbl
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#d1fae5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{fleetMetrics.liquidAvailable.toLocaleString()}</div>
            <div style={{ fontSize: '0.875rem', color: '#047857', fontWeight: '500' }}>Available Liquid Capacity</div>
            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>Ready for deployment</div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#ede9fe',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>{fleetMetrics.dryBulkCapacity.toLocaleString()}</div>
            <div style={{ fontSize: '0.875rem', color: '#6d28d9', fontWeight: '500' }}>Dry Bulk Capacity</div>
            <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.25rem' }}>{fleetMetrics.dryBulkUsed.toLocaleString()} cf used</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIReportingTab;