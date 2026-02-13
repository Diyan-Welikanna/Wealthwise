'use client'

interface ChartSkeletonProps {
  height?: number
  type?: 'line' | 'pie' | 'bar'
}

export default function ChartSkeleton({ height = 300, type = 'line' }: ChartSkeletonProps) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 animate-pulse" role="status" aria-label="Loading chart">
      {/* Title skeleton */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      
      {/* Chart area */}
      <div className="relative" style={{ height: `${height}px` }}>
        {type === 'line' && (
          <div className="flex items-end justify-between h-full gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                <div 
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                ></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
              </div>
            ))}
          </div>
        )}
        
        {type === 'pie' && (
          <div className="flex items-center justify-center h-full">
            <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        )}
        
        {type === 'bar' && (
          <div className="flex flex-col justify-between h-full gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div 
                  className="h-6 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Legend skeleton */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {[...Array(type === 'line' ? 7 : 5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
