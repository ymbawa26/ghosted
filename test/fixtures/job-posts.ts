import type { JobPostInput } from "@/lib/analysis/types";

function daysAgo(days: number) {
  const targetDate = new Date(Date.now() - days * 86_400_000);
  const year = targetDate.getUTCFullYear();
  const month = `${targetDate.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${targetDate.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const strongJobPost: JobPostInput = {
  jobTitle: "Senior Product Designer",
  companyName: "Northstar Health",
  location: "Boston, MA, United States",
  locationCountry: "United States",
  locationRegion: "MA",
  locationCity: "Boston",
  datePosted: daysAgo(6),
  salaryRangeText: "$145,000 - $168,000 base",
  workMode: "hybrid",
  description: `
About the role
Northstar Health is building workflow software for multi-site care teams. This design role sits on our clinician platform team and reports to the Director of Product Design.

Responsibilities
- Design end-to-end experiences for scheduling, documentation, and staffing tools.
- Partner with product managers, engineers, and operations leaders to define roadmap priorities.
- Run discovery interviews, synthesize insights, and improve core workflows with measurable outcomes.
- Maintain our design system and contribute reusable interaction patterns.

Qualifications
- 5+ years of product design experience in complex software environments.
- Strong experience with Figma, prototyping, and cross-functional collaboration.

Preferred qualifications
- Experience in healthcare, B2B SaaS, or regulated environments.
- Familiarity with analytics, experimentation, and service design.
`.trim(),
};

export const inflatedJuniorPost: JobPostInput = {
  jobTitle: "Junior Product Designer",
  companyName: "Velocity Foundry",
  location: "United States",
  locationCountry: "United States",
  datePosted: daysAgo(12),
  workMode: "remote",
  description: `
We are seeking a junior designer to own strategy across the company and lead executive stakeholder alignment.

Requirements
- 5+ years of experience.
- Expert knowledge of Figma, Sketch, Framer, Photoshop, Illustrator, After Effects, React, Next.js, TypeScript, Python, SQL, Tableau, GA4, HubSpot, Salesforce, Jira, Notion, AWS, Docker, Kubernetes, and GraphQL.
- Comfortable mentoring teams and setting design vision.
`.trim(),
};

export const staleUrgentPost: JobPostInput = {
  jobTitle: "Operations Coordinator",
  companyName: "Summit Logistics",
  location: "Atlanta, GA, United States",
  locationCountry: "United States",
  locationRegion: "GA",
  locationCity: "Atlanta",
  datePosted: daysAgo(120),
  workMode: "on-site",
  isReposted: true,
  description: `
We are urgently hiring and need someone to start immediately.

Responsibilities
- Support daily office tasks and vendor coordination.
- Help with scheduling and process documentation.

Qualifications
- 2 years of experience in administrative support.
`.trim(),
};

export const contradictoryRemotePost: JobPostInput = {
  jobTitle: "Product Manager",
  companyName: "Signal Harbor",
  location: "United States",
  locationCountry: "United States",
  datePosted: daysAgo(18),
  workMode: "remote",
  description: `
Signal Harbor helps operations teams manage compliance workflows.

This is a remote role, but employees are expected to work on-site in Chicago three days each week as part of our hybrid model.

Responsibilities
- Lead roadmap prioritization and coordinate launches.
- Partner with engineering and customer success teams.

Qualifications
- 4+ years of product management experience.
`.trim(),
};

export const vagueGenericPost: JobPostInput = {
  jobTitle: "Marketing Specialist",
  companyName: "Apex Growth",
  location: "United States",
  locationCountry: "United States",
  workMode: "unspecified",
  description: `
We are a fast-paced, dynamic environment looking for a rockstar team player.
The ideal candidate will wear many hats, communicate well, and handle various tasks as needed.
Strong communication skills are a must. Other duties as assigned.
`.trim(),
};
