import type {
  CompensationPosition,
  JobPostInput,
  TitleSeniority,
} from "@/lib/analysis/types";

type RoleFamily =
  | "engineering"
  | "design"
  | "product"
  | "data"
  | "marketing"
  | "sales"
  | "operations"
  | "unknown";

type CompensationAnalysis = {
  parsedSalaryMinAnnual?: number;
  parsedSalaryMaxAnnual?: number;
  compensationPosition: CompensationPosition;
  compensationNote?: string;
  underpaidSignal: boolean;
};

const BENCHMARKS: Record<
  Exclude<RoleFamily, "unknown">,
  Record<TitleSeniority, [number, number]>
> = {
  engineering: {
    intern: [60000, 90000],
    junior: [85000, 120000],
    mid: [115000, 160000],
    senior: [150000, 210000],
    lead: [175000, 240000],
    manager: [180000, 250000],
    director: [210000, 285000],
    unknown: [110000, 165000],
  },
  design: {
    intern: [50000, 75000],
    junior: [70000, 100000],
    mid: [95000, 135000],
    senior: [130000, 180000],
    lead: [150000, 200000],
    manager: [160000, 210000],
    director: [180000, 230000],
    unknown: [95000, 140000],
  },
  product: {
    intern: [60000, 85000],
    junior: [80000, 120000],
    mid: [110000, 155000],
    senior: [140000, 190000],
    lead: [160000, 210000],
    manager: [165000, 220000],
    director: [185000, 245000],
    unknown: [110000, 160000],
  },
  data: {
    intern: [65000, 90000],
    junior: [85000, 120000],
    mid: [110000, 160000],
    senior: [145000, 200000],
    lead: [165000, 225000],
    manager: [170000, 230000],
    director: [190000, 255000],
    unknown: [110000, 165000],
  },
  marketing: {
    intern: [45000, 65000],
    junior: [55000, 85000],
    mid: [70000, 110000],
    senior: [95000, 140000],
    lead: [110000, 155000],
    manager: [110000, 160000],
    director: [140000, 190000],
    unknown: [75000, 115000],
  },
  sales: {
    intern: [45000, 65000],
    junior: [60000, 90000],
    mid: [80000, 120000],
    senior: [95000, 145000],
    lead: [110000, 165000],
    manager: [120000, 175000],
    director: [150000, 210000],
    unknown: [80000, 125000],
  },
  operations: {
    intern: [40000, 55000],
    junior: [50000, 75000],
    mid: [65000, 95000],
    senior: [85000, 120000],
    lead: [95000, 135000],
    manager: [100000, 145000],
    director: [130000, 180000],
    unknown: [65000, 100000],
  },
};

function detectRoleFamily(title: string): RoleFamily {
  const normalizedTitle = title.toLowerCase();

  if (/\b(engineer|developer|software|frontend|backend|full stack|platform|devops)\b/.test(normalizedTitle)) {
    return "engineering";
  }

  if (/\b(designer|design|ux|ui|product design|visual design|brand design)\b/.test(normalizedTitle)) {
    return "design";
  }

  if (/\b(product manager|product owner|product)\b/.test(normalizedTitle)) {
    return "product";
  }

  if (/\b(data|analytics|analyst|scientist|bi|machine learning)\b/.test(normalizedTitle)) {
    return "data";
  }

  if (/\b(marketing|growth|content|brand|seo|sem|communications)\b/.test(normalizedTitle)) {
    return "marketing";
  }

  if (/\b(account executive|sales|business development|revenue)\b/.test(normalizedTitle)) {
    return "sales";
  }

  if (/\b(operations|coordinator|program manager|project manager|office manager|customer success)\b/.test(normalizedTitle)) {
    return "operations";
  }

  return "unknown";
}

function getCountryFactor(input: JobPostInput) {
  switch (input.locationCountry) {
    case "United States": {
      const premiumStates = new Set(["CA", "NY", "WA", "MA", "DC", "NJ", "CT"]);
      const elevatedStates = new Set(["TX", "CO", "IL", "GA", "PA", "VA", "MD"]);

      if (input.locationRegion && premiumStates.has(input.locationRegion.toUpperCase())) {
        return 1.12;
      }

      if (input.locationRegion && elevatedStates.has(input.locationRegion.toUpperCase())) {
        return 1.04;
      }

      return 1;
    }
    case "Canada":
      return 0.74;
    case "United Kingdom":
      return 0.7;
    case "Australia":
      return 0.8;
    case "Germany":
      return 0.72;
    case "India":
      return 0.28;
    default:
      return 1;
  }
}

function parseSalaryText(rawText?: string) {
  if (!rawText) {
    return null;
  }

  const normalizedText = rawText
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\$|usd|cad|eur|gbp|aud|rs\.?/g, " ")
    .trim();
  const matches = [...normalizedText.matchAll(/(\d+(?:\.\d+)?)\s*(k)?/g)];

  if (matches.length === 0) {
    return null;
  }

  const values = matches
    .map((match) => {
      const baseValue = Number.parseFloat(match[1]);
      return match[2] ? baseValue * 1000 : baseValue;
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return null;
  }

  const periodMultiplier =
    /\bper hour\b|\bhourly\b|\/hr\b/.test(normalizedText)
      ? 2080
      : /\bper week\b|\/wk\b/.test(normalizedText)
        ? 52
        : /\bper month\b|\/mo\b|\bmonthly\b/.test(normalizedText)
          ? 12
          : 1;

  const min = Math.min(...values) * periodMultiplier;
  const max = Math.max(...values) * periodMultiplier;

  if (max < 20000) {
    return null;
  }

  return {
    minAnnual: Math.round(min),
    maxAnnual: Math.round(max),
  };
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function analyzeCompensation(
  input: JobPostInput,
  titleSeniority: TitleSeniority,
): CompensationAnalysis {
  if (input.salaryNotListed) {
    return {
      compensationPosition: "unknown",
      underpaidSignal: false,
    };
  }

  const parsedSalary = parseSalaryText(input.salaryRangeText || input.description);

  if (!parsedSalary) {
    return {
      compensationPosition: "unknown",
      underpaidSignal: false,
    };
  }

  const roleFamily = detectRoleFamily(input.jobTitle);

  if (roleFamily === "unknown") {
    return {
      parsedSalaryMinAnnual: parsedSalary.minAnnual,
      parsedSalaryMaxAnnual: parsedSalary.maxAnnual,
      compensationPosition: "unknown",
      compensationNote: "Salary is present, but Ghosted does not have a confident benchmark for this title family yet.",
      underpaidSignal: false,
    };
  }

  const factor = getCountryFactor(input);
  const [benchmarkLow, benchmarkHigh] = BENCHMARKS[roleFamily][titleSeniority];
  const adjustedLow = Math.round(benchmarkLow * factor);
  const adjustedHigh = Math.round(benchmarkHigh * factor);
  const midpoint = (parsedSalary.minAnnual + parsedSalary.maxAnnual) / 2;

  if (midpoint < adjustedLow * 0.9) {
    return {
      parsedSalaryMinAnnual: parsedSalary.minAnnual,
      parsedSalaryMaxAnnual: parsedSalary.maxAnnual,
      compensationPosition: "below-typical",
      compensationNote: `Listed pay looks below a rough typical range of ${formatCurrency(adjustedLow)} to ${formatCurrency(adjustedHigh)} for this title and location.`,
      underpaidSignal: true,
    };
  }

  if (midpoint > adjustedHigh * 1.1) {
    return {
      parsedSalaryMinAnnual: parsedSalary.minAnnual,
      parsedSalaryMaxAnnual: parsedSalary.maxAnnual,
      compensationPosition: "above-typical",
      compensationNote: `Listed pay looks above a rough typical range of ${formatCurrency(adjustedLow)} to ${formatCurrency(adjustedHigh)} for this title and location.`,
      underpaidSignal: false,
    };
  }

  return {
    parsedSalaryMinAnnual: parsedSalary.minAnnual,
    parsedSalaryMaxAnnual: parsedSalary.maxAnnual,
    compensationPosition: "within-typical",
    compensationNote: `Listed pay falls within a rough typical range of ${formatCurrency(adjustedLow)} to ${formatCurrency(adjustedHigh)} for this title and location.`,
    underpaidSignal: false,
  };
}
