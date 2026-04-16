import { render, screen } from "@testing-library/react";
import { ResultsView } from "@/components/results/results-view";
import { LATEST_ANALYSIS_STORAGE_KEY } from "@/lib/analysis/session";
import { analyzeJobPost } from "@/lib/analysis/analyze-job-post";
import { strongJobPost } from "@/test/fixtures/job-posts";

describe("ResultsView", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("shows an empty state when no stored analysis exists", async () => {
    render(<ResultsView />);

    expect(
      await screen.findByText("Run an analysis to see the score breakdown."),
    ).toBeInTheDocument();
  });

  it("renders the stored analysis payload", async () => {
    window.sessionStorage.setItem(
      LATEST_ANALYSIS_STORAGE_KEY,
      JSON.stringify(analyzeJobPost(strongJobPost)),
    );

    render(<ResultsView />);

    expect(
      await screen.findByText("This posting looks reasonably serious and transparent, with fewer signs of inflated or low-value application effort."),
    ).toBeInTheDocument();
    expect(screen.getByText("Seriousness")).toBeInTheDocument();
    expect(screen.getByText("Applicant ROI")).toBeInTheDocument();
    expect(screen.getByText("Looks promising")).toBeInTheDocument();
  });
});
