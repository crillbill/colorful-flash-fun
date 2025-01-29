import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlashCard } from "@/components/FlashCard";
import { Leaderboard } from "@/components/Leaderboard";
import { Header1 } from "@/components/ui/header";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CategorySelector, type Category } from "@/components/CategorySelector";
import { Mic, Trophy, Sparkles, Brain } from "lucide-react";

interface Word {
  hebrew: string;
  english: string;
  transliteration?: string | null;
}

const fetchContent = async (category: Category): Promise<Word[]> => {
  if (category === "all") {
    const [phrases, words, letters, verbs] = await Promise.all([
      supabase.from('hebrew_phrases').select('hebrew, english, transliteration'),
      supabase.from('hebrew_words').select('hebrew, english, transliteration'),
      supabase.from('hebrew_alphabet').select('hebrew, english, transliteration'),
      supabase.from('hebrew_verbs').select('hebrew, english, transliteration')
    ]);

    const allContent: Word[] = [
      ...(phrases.data || []),
      ...(words.data || []),
      ...(letters.data || []),
      ...(verbs.data || [])
    ];

    return allContent.sort(() => Math.random() - 0.5);
  }

  const tableMap = {
    phrases: 'hebrew_phrases',
    words: 'hebrew_words',
    letters: 'hebrew_alphabet',
    verbs: 'hebrew_verbs'
  } as const;

  const table = tableMap[category as keyof typeof tableMap];
  
  const { data, error } = await supabase
    .from(table)
    .select('hebrew, english, transliteration');

  if (error) throw error;
  return data || [];
};

const PronunciationChallenge = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState<Category>("words");
  const navigate = useNavigate();

  const { data: words = [], isLoading, error } = useQuery({
    queryKey: ['content', category],
    queryFn: () => fetchContent(category),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast("Please sign in to save your scores", {
          description: "You'll be redirected to the login page",
          icon: "🔒"
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
      toast("Please sign in to save your scores", {
        icon: "🔒"
      });
      return;
    }

    const score = 100;
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
      toast.success("Perfect pronunciation! 🎯", {
        description: "Keep up the great work! ⭐",
      });
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score ❌");
    }
  };

  const handleIncorrect = async () => {
    if (!user) {
      toast("Please sign in to save your scores", {
        icon: "🔒"
      });
      return;
    }

    const score = 50;
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
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score ❌");
    }
  };

  const handleNext = () => {
    setTotalAttempts(prev => prev + 1);
    setCurrentWordIndex(prev => (prev + 1) % words.length);
  };

  const handlePrevious = () => {
    setCurrentWordIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <Brain className="animate-pulse w-12 h-12 mx-auto mb-4 text-primaryPurple" />
          <p className="text-lg">Loading your pronunciation practice... 🎯</p>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load content ❌");
    return null;
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-8 pt-24">
        <div className="max-w-2xl mx-auto text-center bg-white/90 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4 text-primaryPurple">No content available 😢</h1>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primaryPurple via-vividPurple to-magentaPink text-transparent bg-clip-text">
            Pronunciation Practice 🎯
          </h1>
          
          <div className="mb-6">
            <CategorySelector value={category} onChange={setCategory} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Mic className="w-6 h-6 text-primaryPurple" />
                  <h2 className="text-2xl font-bold text-primaryPurple">Practice Mode</h2>
                </div>
                <FlashCard
                  question={words[currentWordIndex].hebrew}
                  answer={words[currentWordIndex].english}
                  transliteration={words[currentWordIndex].transliteration}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  showPrevious={currentWordIndex > 0}
                  showNext={currentWordIndex < words.length - 1}
                />
              </div>
            </div>
            
            <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primaryPurple" />
                <h3 className="text-xl font-semibold text-primaryPurple">Top Speakers 🏆</h3>
              </div>
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PronunciationChallenge;