import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import VoiceInterface from "@/components/VoiceInterface";
import { supabase } from "@/integrations/supabase/client";
import PhraseCard from "@/components/PhraseCard";

interface PhraseData {
  english: string;
  hebrew: string;
  pronunciation: string;
}

const Greetings = () => {
  const [activeListening, setActiveListening] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const phrases: PhraseData[] = [
    {
      english: "Hello",
      hebrew: "שלום",
      pronunciation: "sha-LOHM"
    },
    {
      english: "How are you today?",
      hebrew: "מה שלומך היום",
      pronunciation: "ma shlo-m-CHA ha-YOM"
    },
    {
      english: "What time is lunch?",
      hebrew: "מתי ארוחת צהריים",
      pronunciation: "ma-TAI a-ru-CHAT tzo-ho-RA-yim"
    }
  ];

  const handlePronunciationResult = (word: string, isCorrect: boolean) => {
    setActiveListening(null);
    if (isCorrect) {
      toast.success("Perfect pronunciation!", {
        description: "Great job! You pronounced it correctly.",
        duration: 3000
      });
      speakWord("Excellent! Your pronunciation was perfect.", false);
    } else {
      const tip = getPronunciationTip(word);
      toast.error("Let's try again", {
        description: tip,
        duration: 5000
      });
      speakWord(`Let's practice once more. ${tip}`, false);
    }
  };

  const getPronunciationTip = (word: string) => {
    const tips: { [key: string]: string } = {
      'שלום': "Try saying 'sha-LOHM' with emphasis on the second syllable",
      'מה שלומך היום': "Break it down: 'ma' (like 'ma' in mama) + 'shlo-m-CHA' + 'ha-YOM'",
      'מתי ארוחת צהריים': "Break it down: 'ma-TAI' + 'a-ru-CHAT' + 'tzo-ho-RA-yim'",
    };
    return tips[word] || "";
  };

  const speakWord = async (word: string, isHebrew = true) => {
    if (isSpeaking) return;

    try {
      setIsSpeaking(true);
      toast.info("Speaking...", { duration: 1000 });
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: word,
          voice: isHebrew ? 'nova' : 'alloy'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      return new Promise<void>((resolve) => {
        audio.onended = () => {
          setIsSpeaking(false);
          resolve();
        };

        audio.onerror = () => {
          console.error('Error playing audio');
          setIsSpeaking(false);
          toast.error("Failed to play the word");
          resolve();
        };

        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsSpeaking(false);
          toast.error("Failed to play the word");
          resolve();
        });
      });
    } catch (error) {
      console.error('Error speaking word:', error);
      toast.error("Failed to speak the word");
      setIsSpeaking(false);
      return Promise.resolve();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Back to Hebrew Letters
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-primary">
            Hebrew Greetings Practice
          </h2>
          <p className="text-muted-foreground">
            Click the microphone icon to practice pronunciation. 
            The red dot indicates when the microphone is listening.
          </p>
        </div>

        {phrases.map((phrase) => (
          <PhraseCard
            key={phrase.hebrew}
            phrase={phrase}
            isActive={activeListening === phrase.hebrew}
            onListen={() => {
              if (activeListening === phrase.hebrew) {
                setActiveListening(null);
              } else {
                setActiveListening(phrase.hebrew);
                toast.info("Listening...", {
                  description: "Speak now! I'm listening for your pronunciation.",
                  duration: 2000
                });
              }
            }}
            onSpeak={() => speakWord(phrase.hebrew, true)}
          />
        ))}

        {activeListening && (
          <VoiceInterface
            currentWord={activeListening}
            onPronunciationResult={(isCorrect) => handlePronunciationResult(activeListening, isCorrect)}
            isListening={!!activeListening}
          />
        )}
      </div>
    </div>
  );
};

export default Greetings;