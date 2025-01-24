import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2 } from "lucide-react";

interface PhraseCardProps {
  phrase: {
    english: string;
    hebrew: string;
    pronunciation: string;
  };
  isActive: boolean;
  onListen: () => void;
  onSpeak: () => void;
}

const PhraseCard = ({ phrase, isActive, onListen, onSpeak }: PhraseCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{phrase.english}</span>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSpeak}
              className="hover:bg-accent"
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="icon"
              onClick={onListen}
              className={`relative ${isActive ? "bg-green-500 hover:bg-green-600" : "hover:bg-accent"}`}
            >
              <Mic className="h-6 w-6" />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-right">{phrase.hebrew}</p>
        <p className="text-sm text-muted-foreground">{phrase.pronunciation}</p>
      </CardContent>
    </Card>
  );
};

export default PhraseCard;