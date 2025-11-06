import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * RouteResolver component to render different components based on route parameters
 * @param {Object} props
 * @param {React.ReactNode} props.selfComponent - Component to render for self assessments
 * @param {React.ReactNode} props.defaultComponent - Component to render for other assessments
 */
function RouteResolver({ selfComponent, defaultComponent }) {
  const { assessmentType } = useParams();
  
  // Render selfComponent for self assessments, otherwise render defaultComponent
  return assessmentType === 'self' ? selfComponent : defaultComponent;
}

export default RouteResolver;
