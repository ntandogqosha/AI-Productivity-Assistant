# AI Productivity Companion

Build a web app called "AI Productivity Assistant" with this user journey:

## HOME PAGE (Public)

- Purple-blue gradient hero with app name and tagline

- Two buttons: "Get Started" (leads to Sign Up) and "Sign In" (leads to Sign In)

- 5 feature preview cards below (non-functional previews)

## AUTHENTICATION

- Sign Up page with: Full Name, Email, Password, Confirm Password, Create Account button

- Sign In page with: Email, Password, Sign In button

- Use Supabase Auth

- After login → redirect to Dashboard

## DASHBOARD (Protected - requires login)

- Left sidebar: User avatar + name, navigation links (Dashboard, Email Generator, Meeting Summarizer, Task Planner, Research Assistant, Chat, Settings), Logout button

- Main area: Dashboard view with:

  - 4 stats cards (Total Tasks, Emails Generated, Meetings Summarized, Research Topics)

  - 5 Quick Action Cards (colorful, clickable → navigate to each feature):

    - Generate Email (Blue)

    - Summarize Notes (Green)

    - Plan My Day (Orange)

    - Research Topic (Purple)

    - Chat Assistant (Pink)

## FIVE CORE FEATURES (All must work):

1. EMAIL GENERATOR (Blue): Form with Recipient, Subject, Key Points, Tone dropdown (Formal/Informal/Persuasive), Audience dropdown (Client/Manager/Team). Generate button → shows AI email preview. Copy and Regenerate buttons.

2. MEETING SUMMARIZER (Green): Textarea for notes. Summarize button → shows Key Points, Decisions, Action Items, Deadlines, Responsibilities.

3. TASK PLANNER (Orange): Add tasks with Name, Priority (High/Medium/Low), Due Date, Category (Work/Personal/Urgent). Show tasks by priority. Generate Daily Plan button → creates schedule with time blocks.

4. RESEARCH ASSISTANT (Purple): Input for topic/URL. Research button → shows Summary, Key Insights, Recommendations, Sources. Simplify button for plain language.

5. CHAT ASSISTANT (Pink): Chat interface with message bubbles. Quick action buttons above input: "Generate email", "Summarize notes", "Plan my day", "Research topic". Typing indicator.

## STYLING

- Colorful design with purple-blue gradients

- Feature colors: Email Blue (#2563EB), Summarizer Green (#10B981), Planner Orange (#F59E0B), Research Purple (#8B5CF6), Chat Pink (#EC4899)

- Glassmorphism on cards

- Responsive (mobile + desktop)

## AI INTEGRATION

- Connect to OpenAI or Gemini API

- Use environment variables for API keys

- Show disclaimer: "AI-generated content may contain errors. Please review before use."

- Error handling with user-friendly messages

## TECH STACK

- React

- Tailwind CSS

- Supabase (Auth + Database)

- React Router for navigation

- OpenAI or Gemini API

## RESPONSIBLE AI

- "Report Issue" button on generated content

- Input validation

- Footer disclaimer

Build as complete working prototype. Start with Home Page → Authentication → Dashboard → Features. All five features must be fully functional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3727e057-ba8a-4137-bd81-c61adec34507).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
