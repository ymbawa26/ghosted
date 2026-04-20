import { analyzeJobPost } from "@/lib/analysis/analyze-job-post";
import { extractJobPostFeatures } from "@/lib/analysis/feature-extraction";
import {
  contradictoryRemotePost,
  inflatedJuniorPost,
  staleUrgentPost,
  strongJobPost,
  vagueGenericPost,
} from "@/test/fixtures/job-posts";

describe("analysis engine", () => {
  it("extracts explainable features from a strong posting", () => {
    const features = extractJobPostFeatures(strongJobPost);

    expect(features.hasSalary).toBe(true);
    expect(features.hasClearResponsibilities).toBe(true);
    expect(features.hasTeamContext).toBe(true);
    expect(features.hasReportingStructure).toBe(true);
    expect(features.hasPreferredQualificationsSection).toBe(true);
    expect(features.requiredSkillCount).toBeGreaterThanOrEqual(1);
    expect(features.hasBenefitsInfo).toBe(false);
    expect(features.compensationPosition).toBe("within-typical");
  });

  it("scores a strong posting as relatively high quality", () => {
    const analysis = analyzeJobPost(strongJobPost);

    expect(analysis.scores.seriousness.score).toBeGreaterThanOrEqual(70);
    expect(analysis.scores.transparency.score).toBeGreaterThanOrEqual(70);
    expect(analysis.scores.clarity.score).toBeGreaterThanOrEqual(65);
    expect(analysis.scores.applicantRoi.score).toBeGreaterThanOrEqual(70);
    expect(analysis.scores.requirementInflation.score).toBeLessThanOrEqual(45);
    expect(analysis.overview.interpretation).toBe("Looks promising");
    expect(analysis.overview.authenticityNote).toContain("Authenticity lean:");
  });

  it("flags junior postings with inflated requirements", () => {
    const analysis = analyzeJobPost(inflatedJuniorPost);

    expect(analysis.extractedFeatures.juniorTitleWithHighExperience).toBe(true);
    expect(analysis.extractedFeatures.tooManyRequiredSkills).toBe(true);
    expect(analysis.scores.requirementInflation.score).toBeGreaterThanOrEqual(70);
    expect(analysis.overview.interpretation).toBe("Likely authentic, but high-friction");
    expect(analysis.warnings).toContain(
      "Entry-level or junior framing with inflated experience requirements",
    );
  });

  it("flags when listed pay looks below a rough typical range", () => {
    const analysis = analyzeJobPost({
      ...strongJobPost,
      salaryRangeText: "$70,000 - $85,000 base",
    });

    expect(analysis.extractedFeatures.underpaidSignal).toBe(true);
    expect(analysis.extractedFeatures.compensationPosition).toBe("below-typical");
    expect(analysis.overview.compensationNote).toContain("below a rough typical range");
    expect(analysis.warnings).toContain(
      "Listed pay appears below a rough typical range for the title",
    );
  });

  it("penalizes old posts that still use urgent language", () => {
    const analysis = analyzeJobPost(staleUrgentPost);

    expect(analysis.extractedFeatures.oldButUrgentMismatch).toBe(true);
    expect(analysis.extractedFeatures.repostConcernSignal).toBe(true);
    expect(analysis.scores.seriousness.score).toBeLessThan(55);
    expect(analysis.warnings).toContain(
      "Urgent hiring language paired with an older posting date",
    );
  });

  it("detects contradictory location wording and lowers clarity", () => {
    const analysis = analyzeJobPost(contradictoryRemotePost);

    expect(analysis.extractedFeatures.contradictoryLocationLanguage).toBe(true);
    expect(analysis.scores.clarity.score).toBeLessThan(60);
    expect(analysis.scores.transparency.score).toBeLessThan(65);
    expect(analysis.warnings).toContain(
      "Contradictory remote, hybrid, or on-site wording",
    );
  });

  it("treats vague generic postings as low-transparency and low-ROI", () => {
    const analysis = analyzeJobPost(vagueGenericPost);

    expect(analysis.extractedFeatures.aiStyleSignal).toBe(true);
    expect(analysis.scores.transparency.score).toBeLessThan(50);
    expect(analysis.scores.clarity.score).toBeLessThan(45);
    expect(analysis.scores.applicantRoi.score).toBeLessThan(45);
    expect(analysis.warnings).toContain("Vague responsibilities");
  });
});
