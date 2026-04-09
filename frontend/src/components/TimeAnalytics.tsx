import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, TrendingUp } from 'lucide-react';

interface TimeAnalyticsProps {
  deckId: string;
}

interface CardTimeData {
  id: string;
  front: string;
  avgTime: number;
  reviewCount: number;
  avgRating: number;
}

interface TimeAnalyticsData {
  deckId: string;
  deckName: string;
  summary: {
    quickCards: number;
    mediumCards: number;
    slowCards: number;
    totalAnalyzed: number;
  };
  quickCards: CardTimeData[];
  mediumCards: CardTimeData[];
  slowCards: CardTimeData[];
}

export function TimeAnalytics({ deckId }: TimeAnalyticsProps) {
  const [data, setData] = useState<TimeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeAnalytics();
  }, [deckId]);

  const fetchTimeAnalytics = async () => {
    try {
      const token = localStorage.getItem('fc_token');
      const res = await fetch(`http://localhost:8000/cards/deck/${deckId}/time-analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to load time analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.summary.totalAnalyzed === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No time data yet. Start reviewing cards to see analytics!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time-Based Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{data.summary.quickCards}</p>
              <p className="text-xs text-muted-foreground">Quick Cards</p>
              <p className="text-xs text-muted-foreground">&lt; 10s</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{data.summary.mediumCards}</p>
              <p className="text-xs text-muted-foreground">Medium Cards</p>
              <p className="text-xs text-muted-foreground">10-30s</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{data.summary.slowCards}</p>
              <p className="text-xs text-muted-foreground">Slow Cards</p>
              <p className="text-xs text-muted-foreground">&gt; 30s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.slowCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cards Needing More Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.slowCards.slice(0, 5).map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{card.front}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {card.avgTime}s • {card.reviewCount} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">{card.avgTime}s</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.quickCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mastered Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.quickCards.slice(0, 5).map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{card.front}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {card.avgTime}s • {card.reviewCount} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{card.avgTime}s</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
