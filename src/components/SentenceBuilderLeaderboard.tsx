import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatTime } from "@/utils/wordSearchUtils";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  best_time: number;
  attempts: number;
}

export const SentenceBuilderLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('sentence_builder_leaderboard')
          .select('*')
          .order('best_time', { ascending: true })
          .limit(10);

        if (error) throw error;
        setEntries(data);
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
      <h2 className="text-2xl font-bold mb-4 text-center">Sentence Builder Champions</h2>
      <p className="text-center text-muted-foreground mb-4">
        Fastest times with perfect accuracy
      </p>
      {entries.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No Champions Yet</p>
          <p className="text-muted-foreground">
            Be the first to complete all sentences perfectly!
          </p>
        </div>
      ) : (
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
                  {formatTime(entry.best_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Best time
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};