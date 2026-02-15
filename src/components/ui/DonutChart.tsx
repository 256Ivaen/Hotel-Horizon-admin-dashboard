import React, { useState } from "react";

const DonutChart = ({ data, size = 200, strokeWidth = 20, centerContent }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  
  const totalValue = data.reduce((sum, segment) => sum + segment.value, 0);
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      onMouseLeave={() => setHoveredSegment(null)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {data.map((segment, index) => {
          if (segment.value === 0) return null;
          
          const percentage = (segment.value / totalValue) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
          const isActive = hoveredSegment === segment.label;
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              style={{
                filter: isActive ? `drop-shadow(0px 0px 6px ${segment.color})` : 'none',
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                transformOrigin: 'center'
              }}
              onMouseEnter={() => setHoveredSegment(segment.label)}
            />
          );
        })}
      </svg>
      
      {centerContent && (
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            width: size - strokeWidth * 2.5,
            height: size - strokeWidth * 2.5
          }}
        >
          {typeof centerContent === 'function' ? centerContent(hoveredSegment) : centerContent}
        </div>
      )}
    </div>
  );
};

export default DonutChart;