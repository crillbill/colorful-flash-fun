import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  attempts: number;
  average_score: number;
}

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('pronunciation_leaderboard')
          .select('*')
          .order('average_score', { ascending: false })
          .limit(10);

        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center">Loading leaderboard...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Top Pronunciations</h2>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className="flex items-center justify-between p-3 bg-secondary rounded-lg"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">{index + 1}</span>
              <div>
                <p className="font-semibold">User {entry.user_id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.attempts} attempts
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {Math.round(entry.average_score)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {entry.total_score}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};