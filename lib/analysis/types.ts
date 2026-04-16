export type WorkMode = "remote" | "hybrid" | "on-site" | "unspecified";
export type TitleSeniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "director"
  | "unknown";
export type ScoreKey =
  | "seriousness"
  | "transparency"
  | "requirementInflation"
  | "clarity"
  | "applicantRoi";
export type Sentiment = "positive" | "warning";

export type JobPostInput = {
  jobTitle: string;
  companyName: string;
  location: string;
  datePosted?: string;
  salaryRangeText?: string;
  workMode: WorkMode;
  description: string;
};

export type ExtractedFeatures = {
  normalizedDescription: string;
  wordCount: number;
  bulletLineCount: number;
  sectionHeadingCount: number;
  averageSentenceLength: number;
  structureQuality: number;
  readabilitySignal: number;
  vagueBuzzwordDensity: number;
  fillerLanguageDensity: number;
  responsibilityVerbCount: number;
  leadershipVerbCount: number;
  detectedSkills: string[];
  requiredSkillCount: number;
  toolStackBreadth: number;
  hasSalary: boolean;
  hasDatePosted: boolean;
  jobPostAgeDays?: number;
  urgentLanguagePresent: boolean;
  oldButUrgentMismatch: boolean;
  hasClearResponsibilities: boolean;
  hasClearQualifications: boolean;
  hasPreferredQualificationsSection: boolean;
  hasTeamContext: boolean;
  hasReportingStructure: boolean;
  hasConcreteLocation: boolean;
  contradictoryLocationLanguage: boolean;
  titleSeniority: TitleSeniority;
  yearsExperienceMentioned?: number;
  juniorTitleWithHighExperience: boolean;
  highExperienceForTitle: boolean;
  tooManyRequiredSkills: boolean;
  poorRequiredPreferredSeparation: boolean;
  titleResponsibilityMismatch: boolean;
  inflatedRequirementsSignal: boolean;
  unclearBusinessContext: boolean;
};

export type ScoreAdjustment = {
  label: string;
  points: number;
  sentiment: Sentiment;
};

export type ScoreBreakdown = {
  score: number;
  explanation: string;
  contributingSignals: string[];
  warnings: string[];
  adjustments: ScoreAdjustment[];
};

export type AnalysisScores = Record<ScoreKey, ScoreBreakdown>;

export type AnalysisResult = {
  overview: {
    jobTitle: string;
    companyName: string;
    location: string;
    summaryVerdict: string;
    interpretation: string;
  };
  scores: AnalysisScores;
  warnings: string[];
  whyThisMatters: string;
  methodologyNote: string;
  extractedFeatures: ExtractedFeatures;
};
