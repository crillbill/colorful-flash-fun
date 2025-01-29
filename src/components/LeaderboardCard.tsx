import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  average_score: number;
  attempts: number;
}

export const LeaderboardCard = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['flashcards-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pronunciation_leaderboard')
        .select('user_id, average_score, attempts')
        .order('average_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as LeaderboardEntry[];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center">Loading leaderboard...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Pronunciation Champions</h2>
      <p className="text-center text-muted-foreground mb-4">
        Top 10 players by average score
      </p>
      {entries.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No Champions Yet</p>
          <p className="text-muted-foreground">
            Be the first to complete some pronunciation challenges!
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
                  {Math.round(entry.average_score)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Average Score
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};