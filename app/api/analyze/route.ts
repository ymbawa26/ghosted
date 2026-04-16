import { analyzeJobPost } from "@/lib/analysis/analyze-job-post";
import { NextResponse } from "next/server";
import {
  getJobPostFieldErrors,
  validateJobPostInput,
} from "@/lib/validation/job-post-schema";

export async function POST(request: Request) {
  const payload = await request.json();
  const validationResult = validateJobPostInput(payload);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        message:
          "Ghosted could not validate that submission. Please review the highlighted fields.",
        fieldErrors: getJobPostFieldErrors(validationResult),
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message:
        "Job post analyzed successfully. The dedicated results view will attach to this flow in the next phase.",
      analysis: analyzeJobPost(validationResult.data),
    },
    { status: 200 },
  );
}
