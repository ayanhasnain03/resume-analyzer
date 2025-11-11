export type InterviewQuestion = {
  question: string;
  category:
    | "technical"
    | "behavioral"
    | "problem-solving"
    | "scenario"
    | "motivation";
  focusArea: string;
  expectedDuration?: string;
};
