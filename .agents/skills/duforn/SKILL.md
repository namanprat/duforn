```markdown
# duforn Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `duforn` JavaScript codebase, which is built with the Vite framework. You'll learn about file naming, import/export styles, commit message conventions, and how to structure and run tests. This guide helps ensure consistency and efficiency when contributing to or maintaining the project.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - **Example:**  
    `MyComponent.js`  
    `UserProfile.test.js`

### Import Style
- Use **relative imports** for all modules.
  - **Example:**
    ```javascript
    import { MyComponent } from './MyComponent';
    ```

### Export Style
- Use **named exports** exclusively.
  - **Example:**
    ```javascript
    // MyComponent.js
    export function MyComponent() { ... }
    ```

### Commit Messages
- Follow **conventional commit** format.
- Use the `chore` prefix for maintenance tasks.
- Keep commit messages concise (average 56 characters).
  - **Example:**  
    `chore: update dependencies to latest versions`

## Workflows

### Commit Changes
**Trigger:** When making any code or maintenance changes  
**Command:** `/commit-changes`

1. Stage your changes:
    ```
    git add .
    ```
2. Write a commit message using the conventional format:
    ```
    git commit -m "chore: describe your change"
    ```
3. Push your changes:
    ```
    git push
    ```

### Add a New Component
**Trigger:** When creating a new UI or logic component  
**Command:** `/add-component`

1. Create a new file using PascalCase, e.g., `NewFeature.js`.
2. Implement your component using named exports:
    ```javascript
    export function NewFeature() { ... }
    ```
3. Import your component using a relative path where needed:
    ```javascript
    import { NewFeature } from './NewFeature';
    ```
4. (Optional) Add a test file: `NewFeature.test.js`

### Write and Run Tests
**Trigger:** When adding or updating functionality  
**Command:** `/run-tests`

1. Create a test file with the pattern `*.test.js` (e.g., `MyComponent.test.js`).
2. Write your tests using your preferred framework (framework is currently unknown).
3. Run the test command (replace with actual test runner if known):
    ```
    npm test
    ```
   or
    ```
    yarn test
    ```

## Testing Patterns

- Test files should follow the `*.test.js` naming convention and be placed alongside or near the files they test.
- The specific testing framework is not detected; use the standard test runner configured in the project.
- Example test file:
    ```javascript
    // MyComponent.test.js
    import { MyComponent } from './MyComponent';

    test('renders correctly', () => {
      // Your test logic here
    });
    ```

## Commands
| Command           | Purpose                                         |
|-------------------|-------------------------------------------------|
| /commit-changes   | Guide for committing code using conventions     |
| /add-component    | Steps for adding a new component                |
| /run-tests        | Instructions for writing and running tests      |
```
