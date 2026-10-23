import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) {
    env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
  }
});

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("Testing Supabase connection URL:", url);
const supabase = createClient(url, key);

async function run() {
  const tables = [
    "profiles",
    "resume_builder",
    "resume_analysis",
    "skill_assessments",
    "mock_interviews",
    "resumes",
    "assessment_results",
    "interview_reports",
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`Table '${t}': NOT FOUND or error -> ${error.message}`);
    } else {
      console.log(`Table '${t}': READY (found ${data?.length} row(s))`);
    }
  }
}

run();
