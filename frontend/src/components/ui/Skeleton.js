import React from 'react';

const Skeleton = ({ className = 'h-4 bg-gray-200 rounded', style = {} }) => (
  <div
    role="status"
    aria-busy="true"
    className={`animate-pulse ${className}`}
    style={style}
  />
);

export default Skeleton;
