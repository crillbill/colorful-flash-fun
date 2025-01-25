import React, { createContext, useContext } from 'react';

type ColorPalette = {
  neutralGray: string;
  primaryPurple: string;
  secondaryPurple: string;
  tertiaryPurple: string;
  darkPurple: string;
  lightPurple: string;
  softGreen: string;
  softYellow: string;
  softOrange: string;
  softPurple: string;
  softPink: string;
  softPeach: string;
  softBlue: string;
  softGray: string;
  vividPurple: string;
  magentaPink: string;
  brightOrange: string;
  oceanBlue: string;
  charcoalGray: string;
  pureWhite: string;
  mediumGray: string;
  brightBlue: string;
  darkCharcoal: string;
};

const colorPalette: ColorPalette = {
  neutralGray: '#8E9196',
  primaryPurple: '#9b87f5',
  secondaryPurple: '#7E69AB',
  tertiaryPurple: '#6E59A5',
  darkPurple: '#1A1F2C',
  lightPurple: '#D6BCFA',
  softGreen: '#F2FCE2',
  softYellow: '#FEF7CD',
  softOrange: '#FEC6A1',
  softPurple: '#E5DEFF',
  softPink: '#FFDEE2',
  softPeach: '#FDE1D3',
  softBlue: '#D3E4FD',
  softGray: '#F1F0FB',
  vividPurple: '#8B5CF6',
  magentaPink: '#D946EF',
  brightOrange: '#F97316',
  oceanBlue: '#0EA5E9',
  charcoalGray: '#403E43',
  pureWhite: '#FFFFFF',
  mediumGray: '#8A898C',
  brightBlue: '#1EAEDB',
  darkCharcoal: '#221F26'
};

const ColorContext = createContext<ColorPalette | undefined>(undefined);

export const useColors = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
};

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ColorContext.Provider value={colorPalette}>
      {children}
    </ColorContext.Provider>
  );
};