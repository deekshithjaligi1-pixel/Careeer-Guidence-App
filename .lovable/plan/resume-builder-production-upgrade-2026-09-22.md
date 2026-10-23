# Resume Builder Production Upgrade

## Goal
Rebuild only the existing Resume Builder into a polished, responsive Nexoraa workspace while preserving the global navigation, site theme, public access, and all unrelated features.

## What will change

### 1. Workspace and navigation
- Remove the oversized promotional mockup from the builder page and replace it with a compact workspace header.
- Use a stable two-column desktop layout: organized editor on the left and a sticky A4 preview on the right.
- Switch to a stacked, touch-friendly layout on tablet/mobile with clear Editor and Preview access.
- Replace the crowded horizontal step strip with a scannable section navigator and real completion progress.
- Keep all styling scoped to Resume Builder so no other page changes.

### 2. Complete resume data and editing
- Support Personal Information, Professional Summary, Education, Skills, Work Experience, Projects, Certifications, and Achievements.
- Add/edit/remove repeatable entries without losing data.
- Add practical placeholders, required-field cues, inline validation, empty states, and accessible labels.
- Preserve and migrate existing browser-saved drafts; show explicit saved/saving status and provide a manual Save Draft action.
- Keep template choice and entered content independent so template changes never reset the draft.

### 3. Professional templates and preview
- Provide five distinct templates: Modern, Minimal, Professional, Corporate, and Technical.
- Replace text-only template buttons with compact visual thumbnails and a clear selected state.
- Render true A4-proportioned pages with safe margins, stable typography, section spacing, and automatic continuation pages when content exceeds one page.
- Prevent long links, dates, bullets, and section content from overlapping or escaping page boundaries.
- Provide separate Print and Download PDF actions using the dedicated print layout.

### 4. Working AI features
- Repair the existing server-side AI integration using the project’s assigned Lovable AI model and validated structured output.
- Add “Build Resume with AI” from the user’s actual role, skills, education, and experience inputs.
- Keep field-level “Improve with AI” for summary, work experience, projects, and other meaningful text, with before/after review and Accept/Reject controls.
- Add contextual writing suggestions for the active section without silent failures or automatic overwrites.
- Change “Improve Entire Resume” from an analysis-only action into a complete proposed revision that the user can review and accept.
- Keep prompts, model calls, and credentials server-side; display safe, specific loading and error states and never fabricate a successful result.

### 5. Verification
- Check compilation and current runtime diagnostics.
- Test draft persistence, all add/edit/remove controls, progress, template switching, preview updates, overflow, print/PDF layout, and AI error handling.
- Run the full AI generation and improvement path against the real server integration.
- Verify desktop, tablet, and mobile layouts and confirm unrelated routes remain unchanged.

## Technical details
- Extend the existing ResumeData types rather than introducing a competing builder model.
- Split the oversized builder into focused editor, template, preview, AI review, and export components where this reduces risk.
- Use the existing design tokens and Button component; add only Resume Builder-scoped semantic styles.
- Use server functions for AI operations and the OpenAI Responses API through Lovable AI with streaming consumed server-side, strict-compatible schemas, and normalized safe errors.
- Keep browser storage as the draft store because the site intentionally has no sign-in requirement.
- Update the Resume Builder page metadata to Nexoraa-specific title, description, Open Graph, and Twitter fields.

## Out of scope
- No homepage, navbar, Resume Review, Skill Assessment, Mock Interview, authentication, database, or global branding changes.
