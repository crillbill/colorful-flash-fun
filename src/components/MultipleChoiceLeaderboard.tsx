import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatTime } from "@/utils/wordSearchUtils";

interface LeaderboardEntry {
  user_id: string;
  best_time: number;
  attempts: number;
}

export const MultipleChoiceLeaderboard = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['multiple-choice-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('multiple_choice_leaderboard')
        .select('user_id, best_time, attempts')
        .order('best_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as LeaderboardEntry[];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-center">Loading leaderboard...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-2 text-center">Top Players</h2>
      <p className="text-center text-muted-foreground text-sm mb-3">
        Fastest times with 100% accuracy
      </p>
      {entries.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No Champions Yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to achieve a perfect score!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className="flex items-center justify-between p-2 bg-secondary rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{index + 1}</span>
                <div>
                  <p className="font-medium text-sm">User {entry.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.attempts} attempts
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  {formatTime(entry.best_time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};