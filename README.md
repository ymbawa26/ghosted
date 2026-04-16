# Ghosted

Ghosted is a public-facing MVP that evaluates the quality of a job posting itself, not the applicant.

Users paste a job post and Ghosted returns five explainable scores:

- Seriousness
- Transparency
- Requirement Inflation
- Clarity
- Applicant ROI

  TRY HERE: https://ghosted-ivory.vercel.app

Ghosted does not scrape LinkedIn, does not automate LinkedIn activity, and does not claim that a posting is fake.

The current input flow accepts:

- job title
- company name
- structured location fields (country, region/state, optional city)
- date posted
- salary text or a `salary not listed` toggle
- reposted toggle
- work mode
- full pasted job description

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Vitest
- Playwright

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

## How Ghosted Scores Posts

Ghosted uses a deterministic scoring pipeline:

1. Input validation
   Zod validates the pasted posting fields before any analysis runs.

2. Feature extraction
   The engine extracts explicit signals such as:
   - salary presence
   - rough compensation positioning
   - posting age
   - repost clues
   - urgent language
   - AI-style filler language
   - role clarity
   - hiring process clarity
   - benefits specificity
   - application friction
   - qualification structure
   - skill breadth
   - title-to-seniority mismatch
   - contradictory location wording
   - buzzword and filler density

3. Weighted scoring
   Each score is built from bounded adjustments, not an opaque model:
   - Seriousness: signals that suggest an actively managed, worthwhile hiring effort
   - Transparency: concrete details, context, compensation, and role scope
   - Requirement Inflation: signs that demands are excessive for the title or level
   - Clarity: how specific, coherent, and understandable the posting is
   - Applicant ROI: whether the posting looks worth most applicants' time

4. Explanation layer
   Ghosted returns the score, a short explanation, contributing signals, and warning signals for each category.

## Project Structure

```text
app/
  analyze/
  api/analyze/
  methodology/
  results/
components/
  form/
  layout/
  marketing/
  results/
lib/
  analysis/
  validation/
test/
  e2e/
  fixtures/
  integration/
  unit/
```

## Testing Strategy

- Unit tests cover validation logic and scoring behavior.
- Integration tests cover the analyze form, result storage handoff, and results rendering.
- Playwright tests cover homepage/navigation, empty results state, and analyze-to-results flows on desktop and mobile.

## Limitations

- The MVP uses rule-based scoring, not a trained model.
- It only evaluates manually pasted job posts.
- Session storage keeps only the latest analysis for the current browser session.
- The app does not self-train from prior guesses yet; adaptation should come from explicit user feedback and later calibration work.
- The system can flag warning signs, but it does not determine whether a posting is fake.
- The results are decision support, not hiring, legal, or compliance advice.

## Deployment Notes

- The app is Vercel-ready and uses no required environment variables for the MVP.
- Social metadata is defined in the App Router metadata API.
- The Open Graph image is generated dynamically with `next/og`.
