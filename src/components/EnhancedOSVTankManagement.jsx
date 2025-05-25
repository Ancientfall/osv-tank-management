// src/components/EnhancedOSVTankManagement.jsx
import React, { useState } from 'react';
import TankManagementTab from './TankManagementTab';
import FleetViewTab from './FleetViewTab';
import KPIReportingTab from './KPIReportingTab';
import { vessels } from '../data/appData';

const EnhancedOSVTankManagement = () => {
  const [activeTab, setActiveTab] = useState('fleet-view');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [expandedTank, setExpandedTank] = useState(null);

  // Add error handling for vessels data
  if (!vessels || !Array.isArray(vessels) || vessels.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Data Loading Error</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Unable to load vessel data. Please check your data file.</p>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Expected: Array of vessels from ../data/appData.js<br/>
            Received: {vessels ? typeof vessels : 'undefined'}
          </div>
        </div>
      </div>
    );
  }

  const handleSelectVessel = (vessel) => {
    setSelectedVessel(vessel);
    setExpandedTank(null);
    setActiveTab('tank-management');
  };

  const tabs = [
    {
      id: 'fleet-view',
      label: 'Fleet Overview',
      description: 'View and compare all vessels with compatibility checking',
      icon: '🚢'
    },
    {
      id: 'tank-management',
      label: 'Tank Management',
      description: 'Manage individual vessel tanks, plan operations, and check compatibility',
      icon: '🛢️'
    },
    {
      id: 'kpi-reporting',
      label: 'KPI Dashboard',
      description: 'Analytics, performance metrics, and fleet reporting',
      icon: '📊'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Enhanced Navigation Header */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 0'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                margin: 0
              }}>
                <span style={{ marginRight: '0.75rem', fontSize: '2.5rem' }}>⚓</span>
                OSV Tank Management System
              </h1>
              <p style={{
                color: '#6b7280',
                marginTop: '0.25rem',
                margin: 0
              }}>
                Comprehensive fleet and tank management solution
              </p>
              {selectedVessel && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontWeight: '500'
                  }}>
                    Active Vessel: {selectedVessel.name}
                  </span>
                  <span style={{ color: '#9ca3af' }}>
                    Last Updated: {selectedVessel.lastUpdated}
                  </span>
                </div>
              )}
            </div>
            
            {/* Enhanced Tab Navigation */}
            <nav style={{
              display: 'flex',
              gap: '0.25rem',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem',
              borderRadius: '0.5rem'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                    color: activeTab === tab.id ? '#1d4ed8' : '#6b7280',
                    boxShadow: activeTab === tab.id ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                  title={tab.description}
                >
                  <span style={{ fontSize: '1.125rem' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }}></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description Bar */}
          <div style={{ paddingBottom: '1rem' }}>
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  color: '#2563eb',
                  fontSize: '1.125rem'
                }}>
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </span>
                <span style={{
                  color: '#1e40af',
                  fontWeight: '500'
                }}>
                  {tabs.find(tab => tab.id === activeTab)?.label}:
                </span>
                <span style={{ color: '#1d4ed8' }}>
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {activeTab === 'fleet-view' && (
          <div>
            <FleetViewTab
              vessels={vessels}
              onSelectVessel={handleSelectVessel}
            />
          </div>
        )}
        
        {activeTab === 'tank-management' && (
          <div>
            {selectedVessel ? (
              <TankManagementTab
                vessels={vessels}
                selectedVessel={selectedVessel}
                onSetSelectedVessel={setSelectedVessel}
                expandedTank={expandedTank}
                onSetExpandedTank={setExpandedTank}
              />
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚢</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.5rem'
                  }}>
                    No Vessel Selected
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem'
                  }}>
                    Please select a vessel from the Fleet Overview to manage its tanks.
                  </p>
                  <button
                    onClick={() => setActiveTab('fleet-view')}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Go to Fleet Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'kpi-reporting' && (
          <div>
            <KPIReportingTab vessels={vessels} />
          </div>
        )}
      </div>

      {/* Enhanced Status Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0.75rem 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ color: '#059669', fontWeight: '500' }}>System Online</span>
              </div>
              
              <div style={{ color: '#6b7280' }}>
                Fleet Status: 
                <span style={{ fontWeight: '500', color: '#111827', marginLeft: '0.25rem' }}>
                  {vessels.length} vessels active
                </span>
              </div>
              
              {selectedVessel && (
                <div style={{ color: '#6b7280' }}>
                  Current Vessel: 
                  <span style={{ fontWeight: '500', color: '#111827', marginLeft: '0.25rem' }}>
                    {selectedVessel.name}
                  </span>
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div style={{ color: '#6b7280' }}>
                Active Tab: 
                <span style={{ fontWeight: '500', color: '#111827', marginLeft: '0.25rem' }}>
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </span>
              </div>
              
              <div style={{ color: '#6b7280' }}>
                Total Capacity: 
                <span style={{ fontWeight: '500', color: '#2563eb', marginLeft: '0.25rem' }}>
                  {vessels.reduce((total, vessel) => 
                    total + vessel.tanks.reduce((sum, tank) => sum + tank.capacity, 0), 0
                  ).toLocaleString()} bbl
                </span>
              </div>
              
              <div style={{ color: '#6b7280' }}>
                Available: 
                <span style={{ fontWeight: '500', color: '#059669', marginLeft: '0.25rem' }}>
                  {vessels.reduce((total, vessel) => 
                    total + vessel.tanks.reduce((sum, tank) => sum + (tank.capacity - tank.currentLevel), 0), 0
                  ).toLocaleString()} bbl
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add some padding to account for fixed status bar */}
      <div style={{ height: '4rem' }}></div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedOSVTankManagement;