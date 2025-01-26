import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlashCard } from "@/components/FlashCard";
import { Leaderboard } from "@/components/Leaderboard";
import { Header1 } from "@/components/ui/header";
import { useNavigate } from "react-router-dom";

interface Word {
  hebrew: string;
  english: string;
}

const words: Word[] = [
  { hebrew: "שלום", english: "Hello" },
  { hebrew: "מה שלומך היום", english: "How are you today?" },
  { hebrew: "מתי ארוחת צהריים", english: "What time is lunch?" },
];

const PronunciationChallenge = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save your scores", {
          description: "You'll be redirected to the login page"
        });
        navigate("/login");
        return;
      }
      setUser(user);
    };
    
    checkAuth();
  }, [navigate]);

  const handleCorrect = async () => {
    if (!user) {
      toast.error("Please sign in to save your scores");
      return;
    }

    const score = 100; // Perfect score for correct pronunciation
    try {
      const { error } = await supabase
        .from('pronunciation_scores')
        .insert([
          {
            user_id: user.id,
            word: words[currentWordIndex].hebrew,
            score: score
          }
        ]);

      if (error) {
        console.error('Error saving score:', error);
        throw error;
      }
      
      setCorrectCount(prev => prev + 1);
      toast.success("Perfect pronunciation!", {
        description: "Keep up the great work!"
      });
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score");
    }
  };

  const handleIncorrect = async () => {
    if (!user) {
      toast.error("Please sign in to save your scores");
      return;
    }

    const score = 50; // Partial score for incorrect pronunciation
    try {
      const { error } = await supabase
        .from('pronunciation_scores')
        .insert([
          {
            user_id: user.id,
            word: words[currentWordIndex].hebrew,
            score: score
          }
        ]);

      if (error) {
        console.error('Error saving score:', error);
        throw error;
      }
      
      toast.error("Keep practicing!", {
        description: "Try again to improve your pronunciation."
      });
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score");
    }
  };

  const handleNext = () => {
    setTotalAttempts(prev => prev + 1);
    setCurrentWordIndex(prev => (prev + 1) % words.length);
  };

  if (!user) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <>
      <Header1 />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Pronunciation Challenge
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FlashCard
                question={words[currentWordIndex].hebrew}
                answer={words[currentWordIndex].english}
                onNext={handleNext}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
              />
            </div>
            
            <div>
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PronunciationChallenge;