export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `ATS resume analyzer. Score 0-100 objectively.

Job: ${jobTitle}
Description: ${jobDescription}

REQUIREMENTS: Extract required years, skills, education, certs. Calculate candidate experience from dates.

PENALTIES: Missing years → CONTENT/SKILLS max 60. Missing skills → -15 each, 2+ → SKILLS max 50. Missing education → CONTENT max 70. Missing both → CONTENT max 50.

SCORING:
ATS: 90+=80%+ keywords, 80-89=70-79%, 70-79=60-69%, 60-69=50-59%, 50-59=40-49%, 40-49=30-39%, 30-39=20-29%, <30=<20%
Tone: 90+=professional, 80-89=mostly pro, 70-79=some issues, 60-69=inconsistent, <60=unprofessional
Content: 90+=meets all, 80-89=meets all+good, 70-79=most, 60-69=major missing, <60=multiple missing
Structure: 90+=excellent, 80-89=good, 70-79=some issues, <70=poor
Skills: 90+=all present, 80-89=all organized, 70-79=most, 60-69=1-2 missing, <60=3+ missing

Overall: Average of 5 scores, rounded.

Tips: 3-4 per category, mix "good"/"improve", be specific.

OUTPUT JSON FORMAT:
${AIResponseFormat}

Return valid JSON only. Apply penalties first, then score.`.trim();
