import {
  ACTION_VERBS,
  BUZZWORDS,
  FILLER_PHRASES,
  LEADERSHIP_VERBS,
  PREFERRED_HEADINGS,
  QUALIFICATION_HEADINGS,
  RESPONSIBILITY_HEADINGS,
  TECH_SKILLS,
} from "@/lib/analysis/constants";
import type {
  ExtractedFeatures,
  JobPostInput,
  TitleSeniority,
} from "@/lib/analysis/types";

function countMatches(text: string, patterns: string[]) {
  return patterns.reduce((count, pattern) => {
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedPattern}\\b`, "gi");
    const matches = text.match(regex);

    return count + (matches?.length ?? 0);
  }, 0);
}

function hasAnyPattern(text: string, patterns: string[]) {
  return patterns.some((pattern) =>
    new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      text,
    ),
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function detectTitleSeniority(jobTitle: string): TitleSeniority {
  const normalizedTitle = jobTitle.toLowerCase();

  if (/\b(intern|internship)\b/.test(normalizedTitle)) {
    return "intern";
  }

  if (/\b(junior|jr\.?|entry level|entry-level|associate)\b/.test(normalizedTitle)) {
    return "junior";
  }

  if (/\b(senior|sr\.?|staff|principal)\b/.test(normalizedTitle)) {
    return "senior";
  }

  if (/\b(lead|head)\b/.test(normalizedTitle)) {
    return "lead";
  }

  if (/\b(manager)\b/.test(normalizedTitle)) {
    return "manager";
  }

  if (/\b(director|vp|vice president)\b/.test(normalizedTitle)) {
    return "director";
  }

  if (/\b(mid|ii|iii)\b/.test(normalizedTitle)) {
    return "mid";
  }

  return "unknown";
}

function extractYearsExperience(text: string) {
  const regex =
    /(?:at least|minimum of|minimum|around|approximately)?\s*(\d+)\+?\s*(?:-|to)?\s*(\d+)?\+?\s+years?(?:\s+of)?\s+(?:experience|exp)/gi;
  const values: number[] = [];

  for (const match of text.matchAll(regex)) {
    const lowerBound = Number.parseInt(match[1], 10);
    const upperBound = match[2] ? Number.parseInt(match[2], 10) : lowerBound;

    values.push(Math.max(lowerBound, upperBound));
  }

  if (values.length === 0) {
    return undefined;
  }

  return Math.max(...values);
}

function computeAgeInDays(datePosted?: string) {
  if (!datePosted) {
    return undefined;
  }

  const postedDate = new Date(`${datePosted}T00:00:00.000Z`);

  if (Number.isNaN(postedDate.getTime())) {
    return undefined;
  }

  const now = new Date();
  const utcToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return Math.max(0, Math.floor((utcToday - postedDate.getTime()) / 86_400_000));
}

function detectLocationContradiction(workMode: JobPostInput["workMode"], text: string) {
  const mentionsRemote = /\bremote\b/i.test(text);
  const mentionsHybrid = /\bhybrid\b/i.test(text);
  const mentionsOnSite =
    /\bon[\s-]?site\b|\bin office\b|\bin-office\b|\bcommute\b|\b3 days in office\b|\b5 days in office\b/i.test(
      text,
    );

  if (workMode === "remote" && (mentionsHybrid || mentionsOnSite)) {
    return true;
  }

  if (workMode === "on-site" && mentionsRemote) {
    return true;
  }

  if (workMode === "hybrid" && mentionsRemote && !mentionsOnSite) {
    return true;
  }

  return mentionsRemote && mentionsHybrid && mentionsOnSite;
}

function computeStructureQuality(
  bulletLineCount: number,
  sectionHeadingCount: number,
  averageSentenceLength: number,
  paragraphCount: number,
) {
  let score = 32;

  score += Math.min(24, bulletLineCount * 2);
  score += Math.min(22, sectionHeadingCount * 6);
  score += Math.min(14, paragraphCount * 2);

  if (averageSentenceLength <= 20) {
    score += 10;
  } else if (averageSentenceLength <= 28) {
    score += 4;
  } else if (averageSentenceLength >= 38) {
    score -= 12;
  }

  return clamp(score, 0, 100);
}

function computeReadabilitySignal(
  averageSentenceLength: number,
  bulletLineCount: number,
  sectionHeadingCount: number,
) {
  let score = 48;

  if (averageSentenceLength <= 18) {
    score += 15;
  } else if (averageSentenceLength <= 24) {
    score += 8;
  } else if (averageSentenceLength >= 35) {
    score -= 14;
  }

  if (bulletLineCount >= 4) {
    score += 10;
  }

  if (sectionHeadingCount >= 3) {
    score += 8;
  }

  return clamp(score, 0, 100);
}

export function extractJobPostFeatures(input: JobPostInput): ExtractedFeatures {
  const normalizedDescription = input.description
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
  const normalizedText = normalizedDescription.toLowerCase();
  const lines = normalizedDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const sentences = normalizedDescription
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const bulletLineCount = lines.filter((line) => /^[-*]/.test(line)).length;
  const sectionHeadingCount =
    [
      ...RESPONSIBILITY_HEADINGS,
      ...QUALIFICATION_HEADINGS,
      ...PREFERRED_HEADINGS,
      "about the role",
      "about us",
      "benefits",
    ].filter((heading) => normalizedText.includes(heading)).length;
  const paragraphCount = normalizedDescription.split(/\n{2,}/).filter(Boolean).length;
  const averageSentenceLength = words.length / Math.max(sentences.length, 1);
  const responsibilityVerbCount = countMatches(normalizedText, ACTION_VERBS);
  const leadershipVerbCount = countMatches(normalizedText, LEADERSHIP_VERBS);
  const buzzwordCount = countMatches(normalizedText, BUZZWORDS);
  const fillerCount = countMatches(normalizedText, FILLER_PHRASES);
  const detectedSkills = TECH_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      normalizedText,
    ),
  );
  const requiredSkillCount = detectedSkills.length;
  const structureQuality = computeStructureQuality(
    bulletLineCount,
    sectionHeadingCount,
    averageSentenceLength,
    paragraphCount,
  );
  const readabilitySignal = computeReadabilitySignal(
    averageSentenceLength,
    bulletLineCount,
    sectionHeadingCount,
  );
  const titleSeniority = detectTitleSeniority(input.jobTitle);
  const yearsExperienceMentioned = extractYearsExperience(normalizedText);
  const hasPreferredQualificationsSection = hasAnyPattern(
    normalizedText,
    PREFERRED_HEADINGS,
  );
  const hasClearResponsibilities =
    hasAnyPattern(normalizedText, RESPONSIBILITY_HEADINGS) ||
    (responsibilityVerbCount >= 6 && (bulletLineCount >= 3 || sentences.length >= 5));
  const hasClearQualifications =
    hasAnyPattern(normalizedText, QUALIFICATION_HEADINGS) ||
    /\bqualifications\b|\brequirements\b|\byou have\b/i.test(normalizedText);
  const hasTeamContext =
    /\bteam\b|\bdepartment\b|\borganization\b|\bmission\b|\bcustomers?\b|\bproduct\b|\bplatform\b|\bbusiness\b/i.test(
      normalizedText,
    );
  const hasReportingStructure =
    /\breports? to\b|\breporting to\b|\bmanager\b|\bdirector\b/i.test(
      normalizedText,
    );
  const hasSalary =
    Boolean(input.salaryRangeText?.trim()) ||
    /\$\s?\d[\d,]*(?:\s?-\s?\$?\d[\d,]*)?|\bper hour\b|\bper year\b|\bsalary\b/i.test(
      normalizedDescription,
    );
  const jobPostAgeDays = computeAgeInDays(input.datePosted);
  const urgentLanguagePresent =
    /\burgent\b|\bimmediate(?:ly)?\b|\basap\b|\bstart immediately\b|\bactively hiring\b/i.test(
      normalizedText,
    );
  const oldButUrgentMismatch = Boolean(
    urgentLanguagePresent && typeof jobPostAgeDays === "number" && jobPostAgeDays > 45,
  );
  const juniorTitleWithHighExperience = Boolean(
    yearsExperienceMentioned &&
      ["intern", "junior"].includes(titleSeniority) &&
      yearsExperienceMentioned >= 4,
  );
  const highExperienceForTitle = Boolean(
    yearsExperienceMentioned &&
      ["unknown", "mid"].includes(titleSeniority) &&
      yearsExperienceMentioned >= 8,
  );
  const tooManyRequiredSkills =
    (titleSeniority === "intern" || titleSeniority === "junior") &&
    requiredSkillCount >= 10
      ? true
      : ["unknown", "mid"].includes(titleSeniority)
        ? requiredSkillCount >= 14
        : requiredSkillCount >= 18;
  const poorRequiredPreferredSeparation = Boolean(
    !hasPreferredQualificationsSection && requiredSkillCount >= 10,
  );
  const titleResponsibilityMismatch = Boolean(
    ["intern", "junior"].includes(titleSeniority) && leadershipVerbCount >= 2,
  );
  const inflatedRequirementsSignal = Boolean(
    juniorTitleWithHighExperience ||
      highExperienceForTitle ||
      tooManyRequiredSkills ||
      (poorRequiredPreferredSeparation &&
        ["intern", "junior", "unknown", "mid"].includes(titleSeniority)),
  );

  return {
    normalizedDescription,
    wordCount: words.length,
    bulletLineCount,
    sectionHeadingCount,
    averageSentenceLength,
    structureQuality,
    readabilitySignal,
    vagueBuzzwordDensity: words.length === 0 ? 0 : (buzzwordCount / words.length) * 100,
    fillerLanguageDensity: words.length === 0 ? 0 : (fillerCount / words.length) * 100,
    responsibilityVerbCount,
    leadershipVerbCount,
    detectedSkills,
    requiredSkillCount,
    toolStackBreadth: requiredSkillCount,
    hasSalary,
    hasDatePosted: Boolean(input.datePosted),
    jobPostAgeDays,
    urgentLanguagePresent,
    oldButUrgentMismatch,
    hasClearResponsibilities,
    hasClearQualifications,
    hasPreferredQualificationsSection,
    hasTeamContext,
    hasReportingStructure,
    hasConcreteLocation: input.location.trim().length > 0,
    contradictoryLocationLanguage: detectLocationContradiction(
      input.workMode,
      normalizedText,
    ),
    titleSeniority,
    yearsExperienceMentioned,
    juniorTitleWithHighExperience,
    highExperienceForTitle,
    tooManyRequiredSkills,
    poorRequiredPreferredSeparation,
    titleResponsibilityMismatch,
    inflatedRequirementsSignal,
    unclearBusinessContext: !hasTeamContext,
  };
}
