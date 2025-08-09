
// Stories Summary Interfaces

export interface SummaryStoriesType  {
  startDate: Date;
  tooltipLabel: String;
  label: String;
  numStories: Number;
  numSuccesses: Number;
  numLessonsLearned: Number;
};


// Leaderboard Interfaces

export const enum StoryTellerColor {
    scribe = '#DDCABB',
    raconteur = '#2493A2',
    balladeer = '#57BDA2',
    troubadour = '#DCB13C',
    bard =  '#2C3259',
  };
    
  export const enum StoryTellerLevel {
    scribe = 'Scribe',
    raconteur = 'Raconteur',
    balladeer = 'Balladeer',
    troubadour = 'Troubadour',
    bard = 'Bard',
  };

export interface Contributor  {
    ranking: number,
    level: number,
    fullName: string,
    numStories: number
    tooltipLabel: string
  };


// Min Max Interfaces

export type IndicatorType = "PP" | "SS" | "SC";
export type AugmentedStoryType = "SW" | "LL" | "Combined";


export interface MinMaxIndicators {
  storyType: AugmentedStoryType,
  xAxisLength: number,
  minSet: Array<any>,
  maxSet: Array<any>
};

export interface IndicatorSet {
  type: IndicatorType,
  combined: MinMaxIndicators,
  smallWins: MinMaxIndicators,
  lessonsLearned: MinMaxIndicators
};

