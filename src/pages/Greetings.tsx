import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mic, Volume2 } from "lucide-react";
import { useState } from "react";
import VoiceInterface from "@/components/VoiceInterface";
import { AudioButton } from "@/components/AudioButton";
import { supabase } from "@/integrations/supabase/client";

const Greetings = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const currentWord = "שלום"; // Shalom

  const handleGreet = () => {
    toast("Hello there! 👋");
  };

  const handlePlayAudio = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: currentWord,
          voice: "alloy",
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }

      const { data: { audioContent } } = response;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio");
      setIsPlaying(false);
    }
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    setIsListening(false);
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

        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-primary">
              Welcome to Greetings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xl">Hello</span>
              <span className="text-xl font-bold">{currentWord}</span>
              <AudioButton isPlaying={isPlaying} onToggle={handlePlayAudio} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsListening(true)}
                className={isListening ? "bg-red-100" : ""}
              >
                <Mic className="h-6 w-6" />
              </Button>
            </div>
            <VoiceInterface
              currentWord={currentWord}
              onPronunciationResult={handlePronunciationResult}
              isListening={isListening}
            />
            <p className="text-lg text-center text-muted-foreground">
              Click the button below to receive a friendly greeting!
            </p>
            <Button onClick={handleGreet} size="lg">
              Greet Me!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Greetings;