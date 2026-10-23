import { createFileRoute } from "@tanstack/react-router";
import ResumeStudio from "@/components/resume-studio/ResumeStudio";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: "Resume Studio — CareerPilot AI" },
      {
        name: "description",
        content:
          "A premium AI-powered resume workspace. Build ATS-friendly resumes with live preview, smart suggestions, and one-click export.",
      },
    ],
  }),
  component: ResumeStudio,
});