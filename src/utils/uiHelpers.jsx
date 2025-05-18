// src/utils/uiHelpers.js
import React from 'react'; // Needed for JSX in getCompatibilityIcon
import { CheckCircle, Info, XCircle } from 'lucide-react';

export const getStatusColor = (tank) => {
  if (tank.currentLevel === 0) return 'bg-blue-100';
  if (tank.currentLevel / tank.capacity > 0.8) return 'bg-red-100';
  return 'bg-green-100';
};

export const getClientColor = (clientName) => {
  if (!clientName) return 'bg-gray-100 text-gray-800';
  
  switch(clientName) {
    case 'Deepwater Invictus': return 'bg-blue-100 text-blue-800';
    case 'Na Kika': return 'bg-purple-100 text-purple-800';
    case 'Stena IceMAX': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getCompatibilityColor = (level) => {
  switch(level) {
    case 2: return 'bg-green-100 border-green-500'; // Fully compatible
    case 1: return 'bg-yellow-100 border-yellow-500'; // Requires cleaning
    case 0: return 'bg-red-100 border-red-500'; // Incompatible
    default: return 'bg-gray-100 border-gray-300';
  }
};

export const getCompatibilityIcon = (level) => {
  switch(level) {
    case 2: return <CheckCircle size={16} className="text-green-600" />;
    case 1: return <Info size={16} className="text-yellow-600" />;
    case 0: return <XCircle size={16} className="text-red-600" />;
    default: return null;
  }
};