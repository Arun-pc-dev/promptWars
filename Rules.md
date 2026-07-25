# PromptWars AI Agent Instructions

> **Purpose**
>
> This document is the **single source of truth** for the AI agent building this application.
>
> Every implementation decision, feature, API, UI component, workflow, and deployment **MUST** comply with these rules.
>
> **These are NOT suggestions. They are strict requirements.**

---

# PRIMARY OBJECTIVE

Build a **fully functional, production-ready application** that solves the given problem statement.

The solution will be evaluated based on:

- Code Quality
- Problem Statement Alignment
- Security
- Efficiency
- Testing
- Accessibility

The evaluator will manually verify the application after submission.

---

# DEVELOPMENT PRIORITIES

The following priorities MUST be followed in order.

## Priority 1 (Highest)

### Problem Statement Alignment

Requirements

- Every feature MUST directly solve the problem statement.
- Every workflow MUST support the intended user journey.
- Do NOT build unrelated features.
- Do NOT add unnecessary complexity.
- Quality is more important than quantity.

---

### Code Quality

Requirements

- Clean architecture
- Modular design
- Maintainable code
- Readable code
- Proper naming conventions
- Reusable components
- Separation of concerns
- Consistent coding standards
- Proper folder structure

---

## Priority 2 (Medium)

### Security

Requirements

- Validate all user inputs.
- Sanitize request data.
- Never expose secrets.
- Never expose API keys.
- Use secure authentication.
- Follow secure authorization practices.
- Avoid common security vulnerabilities.

---

### Efficiency

Requirements

- Optimize rendering.
- Optimize API usage.
- Optimize memory usage.
- Optimize execution time.
- Avoid unnecessary computations.
- Avoid duplicate API requests.
- Lazy load whenever appropriate.

---

## Priority 3 (Lower)

### Testing

Requirements

- Components should be testable.
- Business logic should be testable.
- User flows should be testable.
- Avoid tightly coupled code.

---

### Accessibility

Requirements

- Responsive UI
- Semantic HTML
- Keyboard navigation
- Proper labels
- Accessible colors
- Good readability
- Mobile compatibility

---

# IMPLEMENTATION RULES

The application MUST be fully functional.

## Every Feature MUST

- Actually work.
- Be connected to the backend.
- Return real results.
- Complete the entire workflow.
- Be production ready.

Never implement fake functionality.

---

# AI IMPLEMENTATION RULES

If the application uses AI:

## MUST

- Use a real AI API.
- Use a real model.
- Return genuine model responses.
- Handle API failures gracefully.
- Handle loading states.
- Handle rate limits.

## NEVER

- Hardcode AI outputs.
- Fake AI responses.
- Simulate AI behavior.
- Return placeholder responses.

---

# DATA RULES

## MUST

Use

- Real backend
- Real database
- Real APIs
- Real responses

## NEVER

Use

- Fake data
- Static data
- Placeholder data
- Mock responses
- Hardcoded outputs

unless explicitly allowed by the challenge.

---

# UI RULES

The UI should never fake functionality.

Bad

- Button does nothing
- Fake loading
- Fake AI response
- Static dashboard pretending to be dynamic

Good

- Every button triggers real logic.
- Every page loads actual data.
- Every chart reflects real data.
- Every workflow completes successfully.

---

# FEATURE RULES

Every implemented feature MUST satisfy all of the following:

- Functional
- End-to-end working
- Connected to backend
- Connected to database
- Handles errors
- Handles loading
- Handles edge cases

---

# DEPLOYMENT RULES

The deployed application MUST

- Be online
- Be publicly accessible
- Load successfully
- Have working APIs
- Have working authentication
- Have working database connections
- Have working AI integrations
- Have no broken pages

Deployment is part of evaluation.

---

# AUTHENTICATION

If authentication exists

Provide evaluator credentials.

Example

Email

Password

The evaluator MUST be able to access every feature.

---

# CODE QUALITY CHECKLIST

The codebase MUST

- Follow a clean architecture
- Be modular
- Avoid duplicated logic
- Have reusable components
- Have meaningful variable names
- Have meaningful function names
- Separate UI and business logic
- Separate API layer
- Separate utilities
- Separate configuration

---

# PERFORMANCE CHECKLIST

Optimize

- Initial load
- Bundle size
- Rendering
- API calls
- Database queries
- Image loading
- Caching

Avoid

- Unnecessary re-renders
- Duplicate requests
- Heavy synchronous work

---

# SECURITY CHECKLIST

Never

- Expose secrets
- Expose API keys
- Trust client input
- Store passwords insecurely

Always

- Validate inputs
- Handle authentication securely
- Handle authorization securely
- Sanitize user input

---

# ACCESSIBILITY CHECKLIST

Ensure

- Responsive layout
- Mobile friendly
- Keyboard accessible
- Proper focus states
- Proper labels
- Accessible forms
- Readable typography

---

# TESTING CHECKLIST

Before submission verify

- Every page works
- Every button works
- Every API works
- Every form works
- Every workflow works
- Authentication works
- Database works
- AI integration works
- Deployment works

---

# STRICTLY PROHIBITED

The following WILL result in disqualification.

## Static Pages

Do NOT

- Fake functionality
- Show UI without logic

---

## Mock Data

Do NOT

- Show fake outputs
- Show placeholder content as real
- Fake backend responses

---

## Fake AI

Do NOT

- Hardcode AI responses
- Simulate LLM output
- Pretend a model generated text

---

## False Positives

Do NOT

- Build demo-only functionality
- Fake success
- Fake API responses
- Fake completed workflows

If a feature appears to work but fails during evaluation, it may result in disqualification.

---

# FINAL EVALUATION

The evaluation team will verify

- Every feature
- Every workflow
- Every API
- Every AI call
- Deployment
- Authentication
- Problem statement alignment

The evaluator will manually test the application.

---

# LEADERBOARD RULES

The leaderboard is determined using platform evaluation parameters.

Assessment includes

- Code Quality
- Security
- Accessibility
- Efficiency
- Testing
- Problem Statement Alignment

Warm-up submissions do NOT affect final rankings.

The live leaderboard reflects only code assessment scores.

---

# AGENT DECISION FRAMEWORK

Before implementing any feature, ask:

1. Does this directly solve the problem statement?
2. Is this fully functional?
3. Is there real backend logic?
4. Is AI actually being called?
5. Can an evaluator verify it?
6. Is it production ready?
7. Is it secure?
8. Is it efficient?
9. Is it maintainable?
10. Will this survive manual evaluation?

If **any answer is NO**, do not implement until it satisfies all requirements.

---

# DEFINITION OF DONE

A task is considered complete ONLY when

- Feature is fully implemented
- Backend is connected
- Database is connected
- AI is connected (if applicable)
- Error handling exists
- Loading states exist
- Edge cases handled
- Mobile responsive
- Accessible
- Secure
- Efficient
- Deployed successfully
- Verified end-to-end

---

# SUCCESS CRITERIA

The final application should

- Solve the intended problem exceptionally well.
- Prioritize correctness over quantity.
- Have clean, maintainable code.
- Use real APIs and real AI.
- Be fully functional from end to end.
- Be deployable and production ready.
- Pass manual evaluation without failures.

---

# GOLDEN RULE

> **Never build features that merely look complete. Build fewer features that work perfectly. Every feature shown to the evaluator must be real, functional, production-ready, and directly aligned with the problem statement.**