export const GENERATE_INTERVIEW_QUESTIONS_PROMPT = `
Generate interview questions for a {{duration}}-minute interview.

Job Title: {{title}}
Job Description: {{about}}
Required Skills: {{requiredSkills}}
Experience Level: {{experienceLevel}}
Job Type: {{jobType}}

Requirements:
- Generate exactly 4-5 questions only
- Mix: 40-50% technical, 25-35% behavioral (STAR format), 20-30% problem-solving
- Adjust difficulty by level: Entry (foundations/learning), Mid (experience/collaboration), Senior (leadership/architecture)
- Questions: 20-40 words, open-ended, role-specific, answerable in 2-4 min
- Include at least 1 behavioral question, at least 1 scenario-based technical question
- Questions must be job-specific, legally compliant, and bias-free

IMPORTANT: You must return a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Your question text here (20-40 words)",
      "category": "technical|behavioral|problem-solving|scenario|motivation",
      "focusArea": "Specific skill or area being assessed",
      "expectedDuration": "2-3 minutes"
    }
  ]
}

Sequence questions: warm-up → technical → behavioral → problem-solving → closing.
Ensure questions are tailored to the specific job role and required skills.
`;
export const DEFAULT_JOB_OPENING_PAGE = 1;
export const DEFAULT_JOB_OPENING_PAGE_SIZE = 10;
export const DEFAULT_JOB_OPENING_MAX_PAGE_SIZE = 100;
export const DEFAULT_JOB_OPENING_MIN_PAGE_SIZE = 1;
export const JOB_OPENING_DEPARTMENTS: { label: string; value: string }[] = [
  {
    label: "IT",
    value: "IT",
  },
  {
    label: "HR",
    value: "HR",
  },
  {
    label: "FINANCE",
    value: "FINANCE",
  },
  {
    label: "MARKETING",
    value: "MARKETING",
  },
  {
    label: "SALES",
    value: "SALES",
  },
  {
    label: "ENGINEERING",
    value: "ENGINEERING",
  },
  {
    label: "DESIGN",
    value: "DESIGN",
  },
  {
    label: "PRODUCT",
    value: "PRODUCT",
  },
  {
    label: "OTHER",
    value: "OTHER",
  },
];
export const JOB_OPENING_LOCATIONS: { label: string; value: string }[] = [
  {
    label: "REMOTE",
    value: "REMOTE",
  },
  {
    label: "OFFICE",
    value: "OFFICE",
  },
  {
    label: "HYBRID",
    value: "HYBRID",
  },
];
export const JOB_OPENING_EXPERIENCE_LEVELS: { label: string; value: string }[] =
  [
    {
      label: "INTERN",
      value: "INTERN",
    },
    {
      label: "1-2 YEARS",
      value: "1-2 YEARS",
    },
    {
      label: "2-3 YEARS",
      value: "2-3 YEARS",
    },
    {
      label: "3-4 YEARS",
      value: "3-4 YEARS",
    },
    {
      label: "4-5 YEARS",
      value: "4-5 YEARS",
    },
    {
      label: "5-6 YEARS",
      value: "5-6 YEARS",
    },
    {
      label: "6-7 YEARS",
      value: "6-7 YEARS",
    },
    {
      label: "7-8 YEARS",
      value: "7-8 YEARS",
    },
    {
      label: "8-9 YEARS",
      value: "8-9 YEARS",
    },
    {
      label: "9-10 YEARS",
      value: "9-10 YEARS",
    },
    {
      label: "10+ YEARS",
      value: "10+ YEARS",
    },
  ];
export const JOB_OPENING_REQUIRED_SKILLS: { id: string; label: string }[] = [
  {
    id: "1",
    label: "React",
  },
  {
    id: "2",
    label: "Next.js",
  },
  {
    id: "3",
    label: "Tailwind",
  },
  {
    id: "4",
    label: "Typescript",
  },
  {
    id: "5",
    label: "Javascript",
  },
  {
    id: "6",
    label: "Html",
  },
  {
    id: "7",
    label: "Css",
  },
  {
    id: "8",
    label: "Python",
  },
  {
    id: "9",
    label: "Java",
  },
  {
    id: "10",
    label: "C#",
  },
  {
    id: "11",
    label: "C++",
  },
  {
    id: "12",
    label: "C",
  },
  {
    id: "13",
    label: "Sql",
  },
  {
    id: "14",
    label: "Nosql",
  },
  {
    id: "15",
    label: "Docker",
  },
  {
    id: "16",
    label: "Kubernetes",
  },
  {
    id: "17",
    label: "Terraform",
  },
  {
    id: "18",
    label: "Ansible",
  },
  {
    id: "19",
    label: "Ci/Cd",
  },
  {
    id: "20",
    label: "Agile",
  },
  {
    id: "21",
    label: "Scrum",
  },
  {
    id: "22",
    label: "Lean",
  },
  {
    id: "23",
    label: "Other",
  },
];
