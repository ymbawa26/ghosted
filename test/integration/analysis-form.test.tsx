import { LATEST_ANALYSIS_STORAGE_KEY } from "@/lib/analysis/session";
import { analyzeJobPost } from "@/lib/analysis/analyze-job-post";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalysisForm } from "@/components/form/analysis-form";
import { MIN_DESCRIPTION_LENGTH } from "@/lib/validation/job-post-schema";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

function makeDescription(length = MIN_DESCRIPTION_LENGTH + 20) {
  return `This role owns product discovery, execution, and cross-functional planning. ${"B".repeat(
    Math.max(0, length - 75),
  )}`;
}

describe("AnalysisForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    pushMock.mockReset();
  });

  it("shows helpful field errors when submitted empty", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<AnalysisForm />);

    await user.click(screen.getByRole("button", { name: "Analyze Job Post" }));

    expect(
      await screen.findByText(
        "Please fix the highlighted fields so Ghosted has enough structured context to analyze the posting.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Job title is required.")).toBeInTheDocument();
    expect(screen.getByText("Company name is required.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits valid input and shows a success message", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          analysis: analyzeJobPost({
            jobTitle: "Product Designer",
            companyName: "Northstar Health",
            location: "Boston, MA, United States",
            locationCountry: "United States",
            locationRegion: "MA",
            locationCity: "Boston",
            salaryRangeText: "$115,000 - $135,000 base",
            salaryNotListed: false,
            isReposted: false,
            workMode: "hybrid",
            description: makeDescription(),
          }),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<AnalysisForm />);

    await user.type(screen.getByLabelText("Job title"), "Product Designer");
    await user.type(screen.getByLabelText("Company name"), "Northstar Health");
    await user.selectOptions(screen.getByLabelText("Country"), "United States");
    await user.selectOptions(screen.getByLabelText("State"), "MA");
    await user.type(screen.getByLabelText("City"), "Boston");
    await user.selectOptions(screen.getByLabelText("Work mode"), "hybrid");
    await user.type(screen.getByLabelText("Full job description"), makeDescription());
    await user.type(
      screen.getByLabelText("Salary range text"),
      "$115,000 - $135,000 base",
    );

    await user.click(screen.getByRole("button", { name: "Analyze Job Post" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(pushMock).toHaveBeenCalledWith("/results");
    expect(window.sessionStorage.getItem(LATEST_ANALYSIS_STORAGE_KEY)).toContain(
      "Northstar Health",
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/analyze",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
