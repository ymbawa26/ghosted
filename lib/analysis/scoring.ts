import type {
  AnalysisScores,
  ExtractedFeatures,
  ScoreAdjustment,
  ScoreKey,
} from "@/lib/analysis/types";

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function buildAdjustment(
  label: string,
  points: number,
  sentiment: "positive" | "warning",
): ScoreAdjustment {
  return { label, points, sentiment };
}

function finalizeScore(base: number, adjustments: ScoreAdjustment[]) {
  return clampScore(
    adjustments.reduce((total, adjustment) => total + adjustment.points, base),
  );
}

function finalizeRoiScore(base: number, adjustments: ScoreAdjustment[]) {
  return Math.min(
    95,
    clampScore(
      adjustments.reduce((total, adjustment) => total + adjustment.points, base),
    ),
  );
}

function summarizeSignals(
  adjustments: ScoreAdjustment[],
  sentiment: "positive" | "warning",
) {
  return adjustments
    .filter((adjustment) => adjustment.sentiment === sentiment)
    .sort((left, right) => Math.abs(right.points) - Math.abs(left.points))
    .slice(0, 4)
    .map((adjustment) => adjustment.label);
}

function explainPositiveScore(
  scoreKey: Exclude<ScoreKey, "requirementInflation">,
  score: number,
  strengths: string[],
  warnings: string[],
) {
  const subjectMap = {
    seriousness: "The posting looks",
    transparency: "The posting reads",
    clarity: "The posting feels",
    applicantRoi: "For most applicants, this looks",
  } as const;

  const subject = subjectMap[scoreKey];

  if (score >= 75) {
    return `${subject} strong overall, helped by ${strengths[0]?.toLowerCase() ?? "several concrete signals"}.`;
  }

  if (score >= 55) {
    return `${subject} mixed but workable; ${strengths[0]?.toLowerCase() ?? "some useful detail"} is offset by ${
      warnings[0]?.toLowerCase() ?? "a few weaker signals"
    }.`;
  }

  if (score >= 35) {
    return `${subject} shaky because ${warnings[0]?.toLowerCase() ?? "important context is missing"}.`;
  }

  return `${subject} weak, with multiple signals commonly associated with lower-quality or low-efficiency postings.`;
}

function explainInflationScore(score: number, strengths: string[], warnings: string[]) {
  if (score >= 75) {
    return `The requirements look heavily inflated for the apparent title or scope, especially around ${
      warnings[0]?.toLowerCase() ?? "experience or breadth demands"
    }.`;
  }

  if (score >= 55) {
    return `The posting shows some inflation risk, driven by ${
      warnings[0]?.toLowerCase() ?? "an uneven requirements section"
    }.`;
  }

  if (score >= 35) {
    return `Requirement inflation looks moderate rather than extreme; ${
      strengths[0]?.toLowerCase() ?? "a few reasonable signals"
    } help keep it in check.`;
  }

  return `The requirements look fairly proportionate to the title and posting scope.`;
}

export function scoreJobPost(features: ExtractedFeatures): AnalysisScores {
  const seriousnessAdjustments: ScoreAdjustment[] = [];

  if (features.jobPostAgeDays !== undefined) {
    if (features.jobPostAgeDays <= 14) {
      seriousnessAdjustments.push(
        buildAdjustment("recent posting date", 12, "positive"),
      );
    } else if (features.jobPostAgeDays <= 30) {
      seriousnessAdjustments.push(
        buildAdjustment("reasonably fresh posting date", 7, "positive"),
      );
    } else if (features.jobPostAgeDays > 90) {
      seriousnessAdjustments.push(
        buildAdjustment("older posting age", -18, "warning"),
      );
    } else if (features.jobPostAgeDays > 60) {
      seriousnessAdjustments.push(
        buildAdjustment("possibly stale posting age", -10, "warning"),
      );
    }
  } else {
    seriousnessAdjustments.push(
      buildAdjustment("missing posting date", -4, "warning"),
    );
  }

  if (features.oldButUrgentMismatch) {
    seriousnessAdjustments.push(
      buildAdjustment("urgent wording on an older post", -12, "warning"),
    );
  }

  if (features.repostConcernSignal) {
    seriousnessAdjustments.push(
      buildAdjustment("reposted or renewed role signals", -6, "warning"),
    );
  }

  if (features.hasClearResponsibilities) {
    seriousnessAdjustments.push(
      buildAdjustment("clear responsibilities", 10, "positive"),
    );
  } else {
    seriousnessAdjustments.push(
      buildAdjustment("vague day-to-day responsibilities", -10, "warning"),
    );
  }

  if (features.hasTeamContext) {
    seriousnessAdjustments.push(
      buildAdjustment("concrete team or business context", 7, "positive"),
    );
  } else {
    seriousnessAdjustments.push(
      buildAdjustment("limited team or business context", -6, "warning"),
    );
  }

  if (features.structureQuality >= 70) {
    seriousnessAdjustments.push(
      buildAdjustment("well-structured posting", 6, "positive"),
    );
  } else if (features.structureQuality < 40) {
    seriousnessAdjustments.push(
      buildAdjustment("weak posting structure", -7, "warning"),
    );
  }

  if (features.hasHiringProcessClarity) {
    seriousnessAdjustments.push(
      buildAdjustment("hiring process details are mentioned", 5, "positive"),
    );
  }

  if (features.aiStyleSignal) {
    seriousnessAdjustments.push(
      buildAdjustment("templated or AI-style posting language", -4, "warning"),
    );
  }

  const transparencyAdjustments: ScoreAdjustment[] = [];

  if (features.hasSalary) {
    transparencyAdjustments.push(
      buildAdjustment("salary or pay information is present", 12, "positive"),
    );
  } else {
    transparencyAdjustments.push(
      buildAdjustment("missing salary transparency", -10, "warning"),
    );
  }

  if (features.hasConcreteLocation) {
    transparencyAdjustments.push(
      buildAdjustment("location is provided", 8, "positive"),
    );
  } else {
    transparencyAdjustments.push(
      buildAdjustment("location is missing or vague", -8, "warning"),
    );
  }

  if (features.hasTeamContext) {
    transparencyAdjustments.push(
      buildAdjustment("clear team or business context", 8, "positive"),
    );
  } else {
    transparencyAdjustments.push(
      buildAdjustment("missing team or business context", -9, "warning"),
    );
  }

  if (features.hasReportingStructure) {
    transparencyAdjustments.push(
      buildAdjustment("reporting structure is mentioned", 4, "positive"),
    );
  }

  if (features.hasBenefitsInfo) {
    transparencyAdjustments.push(
      buildAdjustment("benefits or total-comp details are present", 4, "positive"),
    );
  }

  if (features.compensationPosition === "below-typical") {
    transparencyAdjustments.push(
      buildAdjustment("listed pay looks below a rough market range", -8, "warning"),
    );
  } else if (features.compensationPosition === "within-typical") {
    transparencyAdjustments.push(
      buildAdjustment("listed pay looks within a rough market range", 4, "positive"),
    );
  } else if (features.compensationPosition === "above-typical") {
    transparencyAdjustments.push(
      buildAdjustment("listed pay looks above a rough market range", 3, "positive"),
    );
  }

  if (features.hasClearResponsibilities) {
    transparencyAdjustments.push(
      buildAdjustment("role scope is described concretely", 10, "positive"),
    );
  } else {
    transparencyAdjustments.push(
      buildAdjustment("role scope is underspecified", -10, "warning"),
    );
  }

  if (features.hasClearQualifications) {
    transparencyAdjustments.push(
      buildAdjustment("qualifications are separated clearly", 6, "positive"),
    );
  } else {
    transparencyAdjustments.push(
      buildAdjustment("qualification expectations are unclear", -6, "warning"),
    );
  }

  if (features.contradictoryLocationLanguage) {
    transparencyAdjustments.push(
      buildAdjustment("location wording appears contradictory", -10, "warning"),
    );
  }

  if (features.hasHiringProcessClarity) {
    transparencyAdjustments.push(
      buildAdjustment("hiring process expectations are described", 5, "positive"),
    );
  }

  const inflationAdjustments: ScoreAdjustment[] = [];

  if (features.juniorTitleWithHighExperience) {
    inflationAdjustments.push(
      buildAdjustment("junior framing paired with high experience demands", 24, "warning"),
    );
  }

  if (features.highExperienceForTitle) {
    inflationAdjustments.push(
      buildAdjustment("experience requirement looks high for the title", 14, "warning"),
    );
  }

  if (features.tooManyRequiredSkills) {
    inflationAdjustments.push(
      buildAdjustment("large required skill stack", 14, "warning"),
    );
  }

  if (features.poorRequiredPreferredSeparation) {
    inflationAdjustments.push(
      buildAdjustment("required and preferred signals are not well separated", 8, "warning"),
    );
  }

  if (features.titleResponsibilityMismatch) {
    inflationAdjustments.push(
      buildAdjustment("title and implied scope appear mismatched", 10, "warning"),
    );
  }

  if (features.hasPreferredQualificationsSection) {
    inflationAdjustments.push(
      buildAdjustment("posting distinguishes preferred qualifications", -7, "positive"),
    );
  }

  if (!features.inflatedRequirementsSignal) {
    inflationAdjustments.push(
      buildAdjustment("requirements look mostly proportionate", -6, "positive"),
    );
  }

  const clarityAdjustments: ScoreAdjustment[] = [];

  if (features.hasClearResponsibilities) {
    clarityAdjustments.push(
      buildAdjustment("specific day-to-day work is described", 8, "positive"),
    );
  } else {
    clarityAdjustments.push(
      buildAdjustment("specific day-to-day work is missing", -10, "warning"),
    );
  }

  if (features.structureQuality >= 70) {
    clarityAdjustments.push(
      buildAdjustment("sections and structure are easy to follow", 10, "positive"),
    );
  } else if (features.structureQuality < 40) {
    clarityAdjustments.push(
      buildAdjustment("structure is hard to parse", -10, "warning"),
    );
  }

  if (features.readabilitySignal >= 70) {
    clarityAdjustments.push(
      buildAdjustment("language is relatively readable", 8, "positive"),
    );
  } else if (features.readabilitySignal < 40) {
    clarityAdjustments.push(
      buildAdjustment("language is dense or hard to scan", -8, "warning"),
    );
  }

  if (features.vagueBuzzwordDensity >= 2.5) {
    clarityAdjustments.push(
      buildAdjustment("buzzword-heavy wording", -12, "warning"),
    );
  } else if (features.vagueBuzzwordDensity <= 0.8) {
    clarityAdjustments.push(
      buildAdjustment("limited buzzword filler", 5, "positive"),
    );
  }

  if (features.fillerLanguageDensity >= 2) {
    clarityAdjustments.push(
      buildAdjustment("generic filler language", -8, "warning"),
    );
  }

  if (features.aiStyleSignal) {
    clarityAdjustments.push(
      buildAdjustment("overly templated or AI-style wording", -8, "warning"),
    );
  }

  if (features.aiHypeSignal) {
    clarityAdjustments.push(
      buildAdjustment("AI-heavy hype without much concrete detail", -5, "warning"),
    );
  }

  if (features.contradictoryLocationLanguage) {
    clarityAdjustments.push(
      buildAdjustment("remote or location wording appears inconsistent", -12, "warning"),
    );
  }

  if (features.titleResponsibilityMismatch) {
    clarityAdjustments.push(
      buildAdjustment("title and responsibilities do not line up cleanly", -10, "warning"),
    );
  }

  if (features.hasOutcomeSpecificity) {
    clarityAdjustments.push(
      buildAdjustment("posting describes outcomes or success measures", 6, "positive"),
    );
  }

  const seriousnessScore = finalizeScore(58, seriousnessAdjustments);
  const transparencyScore = finalizeScore(52, transparencyAdjustments);
  const requirementInflationScore = finalizeScore(26, inflationAdjustments);
  const clarityScore = finalizeScore(54, clarityAdjustments);

  const roiAdjustments: ScoreAdjustment[] = [];

  if (seriousnessScore >= 70) {
    roiAdjustments.push(buildAdjustment("posting looks actively managed", 8, "positive"));
  } else if (seriousnessScore < 45) {
    roiAdjustments.push(buildAdjustment("posting may be neglected or stale", -10, "warning"));
  }

  if (transparencyScore >= 70) {
    roiAdjustments.push(buildAdjustment("posting gives applicants useful context", 8, "positive"));
  } else if (transparencyScore < 45) {
    roiAdjustments.push(buildAdjustment("posting withholds useful context", -10, "warning"));
  }

  if (clarityScore >= 70) {
    roiAdjustments.push(buildAdjustment("expectations are relatively understandable", 6, "positive"));
  } else if (clarityScore < 45) {
    roiAdjustments.push(buildAdjustment("expectations are hard to interpret", -8, "warning"));
  }

  if (requirementInflationScore >= 65) {
    roiAdjustments.push(buildAdjustment("requirements may create high application friction", -10, "warning"));
  } else if (requirementInflationScore <= 35) {
    roiAdjustments.push(buildAdjustment("requirements look proportionate enough to evaluate quickly", 5, "positive"));
  }

  if (!features.hasSalary) {
    roiAdjustments.push(buildAdjustment("missing salary makes ROI harder to judge", -5, "warning"));
  }

  if (features.oldButUrgentMismatch) {
    roiAdjustments.push(buildAdjustment("urgent language on an older post raises efficiency concerns", -5, "warning"));
  }

  if (features.hasBenefitsInfo) {
    roiAdjustments.push(
      buildAdjustment("benefits context improves applicant decision quality", 4, "positive"),
    );
  }

  if (features.hasApplicationFrictionSignal) {
    roiAdjustments.push(
      buildAdjustment("application process may include extra friction", -7, "warning"),
    );
  }

  if (features.hasContractLanguage) {
    roiAdjustments.push(
      buildAdjustment("temporary or contract language may narrow long-term ROI", -4, "warning"),
    );
  }

  if (features.underpaidSignal) {
    roiAdjustments.push(
      buildAdjustment("listed pay may be below a rough typical range", -10, "warning"),
    );
  } else if (features.compensationPosition === "within-typical") {
    roiAdjustments.push(
      buildAdjustment("listed pay looks roughly market-aligned", 4, "positive"),
    );
  }

  const applicantRoiScore = finalizeRoiScore(
    Math.round(
      seriousnessScore * 0.28 +
        transparencyScore * 0.28 +
        clarityScore * 0.24 +
        (100 - requirementInflationScore) * 0.2,
    ),
    roiAdjustments,
  );

  const scoreMap = {
    seriousness: {
      score: seriousnessScore,
      adjustments: seriousnessAdjustments,
    },
    transparency: {
      score: transparencyScore,
      adjustments: transparencyAdjustments,
    },
    requirementInflation: {
      score: requirementInflationScore,
      adjustments: inflationAdjustments,
    },
    clarity: {
      score: clarityScore,
      adjustments: clarityAdjustments,
    },
    applicantRoi: {
      score: applicantRoiScore,
      adjustments: roiAdjustments,
    },
  } as const;

  return Object.fromEntries(
    Object.entries(scoreMap).map(([scoreKey, entry]) => {
      const contributingSignals = summarizeSignals(entry.adjustments, "positive");
      const warnings = summarizeSignals(entry.adjustments, "warning");
      const explanation =
        scoreKey === "requirementInflation"
          ? explainInflationScore(entry.score, contributingSignals, warnings)
          : explainPositiveScore(
              scoreKey as Exclude<ScoreKey, "requirementInflation">,
              entry.score,
              contributingSignals,
              warnings,
            );

      return [
        scoreKey,
        {
          score: entry.score,
          explanation,
          contributingSignals,
          warnings,
          adjustments: entry.adjustments,
        },
      ];
    }),
  ) as AnalysisScores;
}
