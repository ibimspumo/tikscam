'use client';

import { useEffect, useState, useRef } from 'react';

interface LikesPerSecondWidgetProps {
  likesPerSecond: {
    last10s: number;
    last20s: number;
    last30s: number;
    last45s: number;
    last60s: number;
  };
}

export function LikesPerSecondWidget({ likesPerSecond }: LikesPerSecondWidgetProps) {
  const currentRate = likesPerSecond.last10s;
  const [peakRate, setPeakRate] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const previousRateRef = useRef(currentRate);
  const startTimeRef = useRef(Date.now());
  const [isInitialPhase, setIsInitialPhase] = useState(true);

  // Track peak rate (only after 30 seconds)
  useEffect(() => {
    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;

    if (elapsedSeconds < 30) {
      setIsInitialPhase(true);
      return;
    }

    setIsInitialPhase(false);

    if (currentRate > peakRate) {
      setPeakRate(currentRate);
    }
  }, [currentRate, peakRate]);

  // Calculate trend
  useEffect(() => {
    const diff = currentRate - previousRateRef.current;
    const threshold = 0.5; // Minimum change to consider as trend

    if (diff > threshold) {
      setTrend('up');
    } else if (diff < -threshold) {
      setTrend('down');
    } else {
      setTrend('stable');
    }

    previousRateRef.current = currentRate;
  }, [currentRate]);

  // Determine color based on rate intensity
  const getTextColor = (rate: number) => {
    if (rate >= 100) return 'text-red-400';
    if (rate >= 50) return 'text-orange-400';
    if (rate >= 20) return 'text-yellow-400';
    if (rate >= 5) return 'text-green-400';
    return 'text-blue-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const percentage = peakRate > 0 ? (currentRate / peakRate) * 100 : 0;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 flex items-center justify-between">
        <span>⚡ Like-Rate</span>
        <span>{getTrendIcon()}</span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${getTextColor(currentRate)} mb-1`}>
        {currentRate.toFixed(1)}
      </div>
      <div className="text-[10px] text-gray-500 mb-2">
        Likes/Sekunde (10s)
      </div>

      {/* Compact progress bar */}
      {!isInitialPhase && peakRate > 0 && (
        <>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 80 ? 'bg-green-500' :
                percentage >= 50 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-600">
            Peak: {peakRate.toFixed(1)} L/s
          </div>
        </>
      )}

      {isInitialPhase && (
        <div className="text-[9px] text-gray-600 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          Kalibrierung...
        </div>
      )}
    </div>
  );
}
