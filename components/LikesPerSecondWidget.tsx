'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface LikesPerSecondWidgetProps {
  likesPerSecond: {
    last10s: number;
    last20s: number;
    last30s: number;
    last45s: number;
    last60s: number;
  };
}

export const LikesPerSecondWidget= React.memo(({ likesPerSecond }: LikesPerSecondWidgetProps) => {
  const { t } = useTranslation();
  const currentRate = likesPerSecond.last10s;
  const [peakRate, setPeakRate] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const previousRateRef = useRef(currentRate);
  const startTimeRef = useRef(Date.now());
  const [isInitialPhase, setIsInitialPhase] = useState(true);

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

  useEffect(() => {
    const diff = currentRate - previousRateRef.current;
    const threshold = 0.5;

    if (diff > threshold) {
      setTrend('up');
    } else if (diff < -threshold) {
      setTrend('down');
    } else {
      setTrend('stable');
    }

    previousRateRef.current = currentRate;
  }, [currentRate]);

  const getColorClass = (rate: number) => {
    if (rate >= 100) return 'text-red-500';
    if (rate >= 50) return 'text-orange-500';
    if (rate >= 20) return 'text-yellow-500';
    if (rate >= 5) return 'text-green-500';
    return 'text-blue-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();
  const percentage = peakRate > 0 ? (currentRate / peakRate) * 100 : 0;

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            {t('likesPerSecond.title').toUpperCase()}
          </div>
          <TrendIcon className="h-3 w-3 text-muted-foreground" />
        </div>

        <div className={`text-2xl font-bold ${getColorClass(currentRate)} mb-1`}>
          {currentRate.toFixed(1)}
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          {t('likesPerSecond.last10s')}
        </p>

        {!isInitialPhase && peakRate > 0 && (
          <>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 80 ? 'bg-green-500' :
                  percentage >= 50 ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Peak: {peakRate.toFixed(1)} L/s
            </p>
          </>
        )}

        {isInitialPhase && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            Kalibrierung...
          </div>
        )}
      </CardContent>
    </Card>
  );
});

LikesPerSecondWidget.displayName = 'LikesPerSecondWidget';
