import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlashCard } from "@/components/FlashCard";
import { Leaderboard } from "@/components/Leaderboard";
import { Header1 } from "@/components/ui/header";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CategorySelector, type Category } from "@/components/CategorySelector";

interface Word {
  hebrew: string;
  english: string;
  transliteration?: string | null;
}

const fetchContent = async (category: Category): Promise<Word[]> => {
  if (category === "all") {
    // Fetch from all tables and combine results
    const [phrases, words, letters, verbs] = await Promise.all([
      supabase.from('hebrew_phrases').select('hebrew, english, transliteration'),
      supabase.from('hebrew_words').select('hebrew, english, transliteration'),
      supabase.from('hebrew_alphabet').select('letter, name, transliteration'),
      supabase.from('hebrew_verbs').select('hebrew, english, transliteration')
    ]);

    // Combine and type the results
    const allContent: Word[] = [
      ...(phrases.data || []),
      ...(words.data || []),
      ...(letters.data?.map(letter => ({
        hebrew: letter.letter,
        english: letter.name,
        transliteration: letter.transliteration
      })) || []),
      ...(verbs.data || [])
    ];

    // Shuffle the combined results
    return allContent.sort(() => Math.random() - 0.5);
  }

  // Special handling for letters table which has different column names
  if (category === 'letters') {
    const { data, error } = await supabase
      .from('hebrew_alphabet')
      .select('letter, name, transliteration');
    
    if (error) throw error;
    
    return (data || []).map(letter => ({
      hebrew: letter.letter,
      english: letter.name,
      transliteration: letter.transliteration
    }));
  }

  // Handle other categories
  const tableMap = {
    phrases: 'hebrew_phrases',
    words: 'hebrew_words',
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

  const handlePrevious = () => {
    setCurrentWordIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  if (!user || isLoading) {
    return null;
  }

  if (error) {
    toast.error("Failed to load content");
    return null;
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <h1 className="text-2xl font-bold mb-4">No content available</h1>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header1 />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-primaryPurple via-vividPurple to-magentaPink text-transparent bg-clip-text">
            Learn Hebrew Pronunciation
          </h1>
          
          <CategorySelector value={category} onChange={setCategory} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:bg-gray-100">
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
            
            <div className="bg-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:bg-gray-100">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primaryPurple to-vividPurple text-transparent bg-clip-text">
                Leaderboard
              </h2>
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
