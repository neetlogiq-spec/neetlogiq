# AI Development Protocol

## Core Principle
**"Read @[document name]" thoroughly and follow it to address "[issue here]"**

This protocol ensures efficient, systematic, and secure development practices.

## Step-by-Step Process

### 1. Problem Analysis & Planning
- **Think through the problem** thoroughly
- **Read the codebase** for relevant files
- **Write a plan** to `tasks/todo.md`
- **Ask questions** if anything is unclear
- **NEVER ASSUME** anything

### 2. Plan Verification
- Present the plan with a list of todo items
- **Check in with user** before beginning work
- Wait for user verification of the plan

### 3. Execution Phase
- Begin working on todo items
- **Mark items as complete** as you go
- Provide **high-level explanations** of changes at each step

### 4. Code Principles
- **Simplicity first**: Make every change as simple as possible
- **Minimal impact**: Every change should impact as little code as possible
- **Security focus**: Always production-ready, no matter the circumstance
- **Mark Zuckerberg perspective**: "What would Mark Zuckerberg do in this situation?"

### 5. Security Review
- Check all code for security best practices
- Ensure no sensitive information in frontend
- Verify no vulnerabilities that can be exploited
- Check for crucial files like .env
- Review before pushing to GitHub

### 6. Code Explanation
- Explain functionality and code in detail
- Walk through what was changed and how it works
- **Act like a senior engineer teaching a 16-year-old**

### 7. Documentation Updates
- Add review section to `todo.md` with summary of changes
- Update `dev.md` with functions/code to remove before production
- Check for legacy code, overlapping code, overlapping functions
- Add crucial changes to `steps.md` for future reference

### 8. Quality Assurance
- **Always check for syntax errors** after code completion
- Ensure 100% crystal clarity before execution
- If unsure about anything, ask for clarification
- If I don't know how to do something, state it clearly
- Ask user to do research if needed

## Key Reminders
- **Never assume** - always ask questions
- **Simplicity over complexity** - every change should be minimal
- **Security first** - production-ready code always
- **Document everything** - for future reference
- **Explain clearly** - like teaching a beginner

## File Structure
- `tasks/todo.md` - Current task list and progress
- `dev.md` - Development notes and production cleanup items
- `steps.md` - Crucial steps and important changes
- `PROTOCOL.md` - This protocol document

---
*This protocol should be followed for every major change to ensure consistency, security, and quality.*
