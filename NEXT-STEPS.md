# Next Steps - Phase 2+ Roadmap

## 🎯 Current Status

✅ **Phase 1 Complete:**

- Three-panel workspace UI
- Monaco Editor with Python syntax
- Docker-based secure code execution
- **5-step learning journey** (Steps 1-5 all implemented)
- Step navigation with Previous/Next buttons
- Visual progress tracking (0/5 steps completed)
- Dynamic step content and boilerplate code
- Step-specific test suites (docker/test_step*.py)
- Real-time test feedback
- Terminal output reset on navigation
- Security constraints
- **29 passing Playwright E2E tests**

## 🚀 Recommended Next Steps (Priority Order)

### Phase 2: Progress Persistence (HIGH PRIORITY)

**Goal:** Save user progress so they can continue their learning journey across sessions

#### 2.1 Local Storage Implementation

**Tasks:**
1. Save current step number
2. Save user code for each step (5 separate keys)
3. Track completed steps
4. Auto-save on code changes (debounced)
5. Restore state on page load

**Files to Create/Modify:**

```typescript
// lib/storage.ts
export interface UserProgress {
  currentStepId: number;
  completedSteps: number[];
  codeByStep: Record<number, string>;
  lastUpdated: string;
}

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem('codealong-progress', JSON.stringify(progress));
};

export const loadProgress = (): UserProgress | null => {
  const stored = localStorage.getItem('codealong-progress');
  return stored ? JSON.parse(stored) : null;
};

export const clearProgress = () => {
  localStorage.removeItem('codealong-progress');
};
```

```typescript
// hooks/useProgress.ts
export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    // Load on mount
    const saved = loadProgress();
    if (saved) {
      setProgress(saved);
    }
  }, []);

  const saveCurrentProgress = useCallback((newProgress: UserProgress) => {
    setProgress(newProgress);
    saveProgress(newProgress);
  }, []);

  return { progress, saveCurrentProgress, clearProgress };
}
```

**Update `app/page.tsx`:**
- Use `useProgress` hook
- Load saved progress on mount
- Save progress on step change
- Save code changes (debounced)
- Add "Reset Progress" button

**Estimated Time:** 1-2 days

---

### Phase 3: Enhanced Test Feedback (MEDIUM PRIORITY)

**Goal:** Provide visual, structured test results instead of plain text output

#### 3.1 Structured Test Results

**Current (text):**
```
Running tests...
- Test: Server binds to port 6379... PASSED
- Test: Server accepts a connection... PASSED
```

**New (structured JSON):**
```typescript
interface TestResult {
  stepId: number;
  passed: boolean;
  tests: Array<{
    name: string;
    passed: boolean;
    error?: string;
    hint?: string;
    lineNumber?: number;
  }>;
  totalTests: number;
  passedTests: number;
  executionTime: number;
}
```

**Tasks:**

1. Update all `docker/test_step*.py` files to return JSON
2. Parse JSON in `lib/docker-executor.ts`
3. Create `components/TestResultsDisplay.tsx` component
4. Show expandable test results with:
   - Green checkmarks for passed tests
   - Red X for failed tests
   - Clickable error details
   - Inline hints
   - Line number references

**Files to Modify:**

- `docker/test_step1.py` through `test_step5.py` - Return JSON
- `lib/docker-executor.ts` - Parse JSON results
- `components/TerminalPanel.tsx` - Use TestResultsDisplay component
- Create `components/TestResultsDisplay.tsx`

**Example Python test output:**
```python
import json

results = {
    "passed": True,
    "tests": [
        {
            "name": "Server binds to port 6379",
            "passed": True
        },
        {
            "name": "Server accepts connection",
            "passed": True
        }
    ],
    "totalTests": 2,
    "passedTests": 2,
    "executionTime": 1.2
}

print(json.dumps(results))
```

**Estimated Time:** 2-3 days

---

### Phase 4: Hint System (LOW PRIORITY)

**Goal:** Provide graduated assistance without giving away answers

#### 4.1 Three-Tier Hint System

**Structure:**
```typescript
hints: [
  {
    level: 1,
    text: "Think about what Python method is used to bind a socket to an address"
  },
  {
    level: 2,
    text: "You need to call socket.bind() with a tuple of (host, port)"
  },
  {
    level: 3,
    text: "Example: server_socket.bind(('localhost', 6379))",
    code: true
  }
]
```

**UI Implementation:**

- "Need Help?" button in Terminal panel
- Shows hints progressively (must reveal Level 1 before Level 2)
- Track hints used per step
- Visual indicator showing hint level used
- Hints collapse when tests pass

**Files to Create:**

- `components/HintPanel.tsx` - Collapsible hint display
- Update `lib/steps-data.ts` - Convert hint strings to hint objects
- Update `components/TerminalPanel.tsx` - Add hint UI

**Estimated Time:** 1-2 days

---

### Phase 5: Better User Experience (ONGOING)

#### 5.1 Loading States & Feedback

**Tasks:**
- Show Docker container status ("Spinning up container...", "Running tests...", "Cleaning up...")
- Add progress indicator with estimated time
- Show execution time for completed tests
- Add "Reset Code" button per step
- Add "Download Code" button
- Show total time spent on project

#### 5.2 Keyboard Shortcuts

- `Cmd/Ctrl + Enter` - Run tests
- `Cmd/Ctrl + [` - Previous step
- `Cmd/Ctrl + ]` - Next step
- `Cmd/Ctrl + R` - Reset code
- `?` - Show keyboard shortcuts

#### 5.3 Responsive Design Improvements

- Mobile-friendly collapsible panels
- Touch-friendly buttons
- Optimized layout for tablets
- Breakpoint refinements

#### 5.4 Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation throughout
- Screen reader support
- High contrast mode
- Focus indicators

**Estimated Time:** 2-3 days

---

## 📋 Detailed Implementation Guide for Phase 2

### Step-by-Step: LocalStorage Progress Persistence

**Step 1: Create Storage Utility**

Create `lib/storage.ts`:

```typescript
const STORAGE_KEY = 'codealong-progress';

export interface UserProgress {
  currentStepId: number;
  completedSteps: number[];
  codeByStep: Record<number, string>;
  lastUpdated: string;
}

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (): UserProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};

export const getDefaultProgress = (): UserProgress => ({
  currentStepId: 1,
  completedSteps: [],
  codeByStep: {},
  lastUpdated: new Date().toISOString(),
});
```

**Step 2: Create Progress Hook**

Create `hooks/useProgress.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProgress, loadProgress, saveProgress, getDefaultProgress } from '@/lib/storage';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(getDefaultProgress());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setProgress(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save progress helper
  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  return {
    progress,
    isLoaded,
    updateProgress,
  };
}
```

**Step 3: Update app/page.tsx**

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { STEPS, getStepById } from '@/lib/steps-data';
import AIPanel from '@/components/AIPanel';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import TerminalPanel from '@/components/TerminalPanel';

export default function Home() {
  const { progress, isLoaded, updateProgress } = useProgress();
  const [code, setCode] = useState<string>('');

  const currentStep = getStepById(progress.currentStepId);

  // Initialize code from saved progress or step default
  useEffect(() => {
    if (isLoaded && currentStep) {
      const savedCode = progress.codeByStep[currentStep.id];
      setCode(savedCode || currentStep.initialCode);
    }
  }, [isLoaded, currentStep, progress.codeByStep]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Debounced save happens in the hook
    updateProgress({
      codeByStep: {
        ...progress.codeByStep,
        [progress.currentStepId]: newCode,
      },
    });
  };

  const handleStepChange = (newStepId: number) => {
    updateProgress({ currentStepId: newStepId });
  };

  const handleStepComplete = (stepId: number) => {
    if (!progress.completedSteps.includes(stepId)) {
      updateProgress({
        completedSteps: [...progress.completedSteps, stepId],
      });
    }
  };

  if (!isLoaded || !currentStep) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <AIPanel step={currentStep} />
      <CodeEditorPanel
        step={currentStep}
        onCodeChange={handleCodeChange}
      />
      <TerminalPanel
        code={code}
        currentStepId={currentStep.id}
        totalSteps={STEPS.length}
        completedSteps={new Set(progress.completedSteps)}
        onStepChange={handleStepChange}
        onStepComplete={handleStepComplete}
      />
    </div>
  );
}
```

**Step 4: Add Reset Button**

In `components/TerminalPanel.tsx`, add a "Reset Progress" button:

```typescript
import { clearProgress } from '@/lib/storage';

// In the component:
const handleResetProgress = () => {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    clearProgress();
    window.location.reload();
  }
};

// In the JSX:
<button onClick={handleResetProgress} className="text-xs text-red-400 hover:text-red-300">
  Reset Progress
</button>
```

---

## 🎨 UI/UX Improvements Checklist

- [ ] Add debounced auto-save indicator ("Saving..." → "Saved")
- [ ] Show loading spinner during Docker execution
- [ ] Display execution time in terminal
- [ ] Add "Reset Code" button (per step)
- [ ] Implement keyboard shortcuts (Cmd+Enter to run)
- [ ] Add dark/light mode toggle
- [ ] Improve mobile responsiveness
- [ ] Add tooltips for buttons
- [ ] Show Docker status indicator
- [ ] Add step completion checkmarks in progress bar
- [ ] Implement code syntax validation before execution
- [ ] Add "Download Code" button
- [ ] Show total time spent on project

---

## 🔧 Technical Debt & Optimizations

### Performance

- [ ] Container pooling (reuse containers instead of creating/destroying)
- [ ] Cache Docker image layers better
- [ ] Optimize Monaco Editor bundle size
- [ ] Implement code execution queue (prevent multiple simultaneous runs)
- [ ] Add service worker for offline capability

### Code Quality

- [ ] Add unit tests for React components (Jest + React Testing Library)
- [ ] Add integration tests for API routes
- [ ] Implement error boundaries for graceful failures
- [ ] Add logging and monitoring (Sentry, LogRocket)
- [ ] Enable TypeScript strict mode
- [ ] Add Storybook for component development

### Security

- [ ] Rate limiting for API endpoint (prevent abuse)
- [ ] Input validation and sanitization (prevent injection attacks)
- [ ] Container resource monitoring (alert on anomalies)
- [ ] Audit logging for code execution
- [ ] CSRF protection for API routes

---

## 📊 Success Metrics

Track these metrics to measure success:

1. **User Engagement**

   - Average steps completed per session
   - Time spent per step
   - Retry attempts before success
   - Return user rate (with progress persistence)

2. **Technical Performance**

   - Average code execution time
   - API response times
   - Docker container startup time
   - Error rates
   - Page load time

3. **Learning Effectiveness**
   - Step completion rate
   - Hint usage frequency (when implemented)
   - Time to complete full project
   - User satisfaction (future surveys)

---

## 🎯 Recommendation: START WITH PHASE 2

**Why Progress Persistence?**

1. **High User Value**: Users can take breaks without losing work
2. **Low Complexity**: Straightforward LocalStorage implementation
3. **Foundation for Future**: Sets up state management patterns
4. **Quick Win**: Can be completed in 1-2 days

**Implementation Plan:**

- **Day 1**: Build storage utilities and hook, update page.tsx
- **Day 2**: Add reset functionality, test thoroughly, handle edge cases

Once Phase 2 is complete, users will have a much better experience and you'll have validated the persistence layer before adding more complex features.

---

## 📚 Additional Resources

### For Phase 2 (Progress Persistence):
- MDN LocalStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- React Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks

### For Phase 3 (Enhanced Feedback):
- JSON in Python: https://docs.python.org/3/library/json.html
- Redis Protocol Spec: https://redis.io/docs/reference/protocol-spec/

### For Phase 4 (Hints):
- Progressive Disclosure UX Pattern: https://www.nngroup.com/articles/progressive-disclosure/

### Future Phases:
- ROADMAP.md - Long-term vision (Phases 2-4)
- Docker Best Practices: Already implemented
- Next.js Data Fetching: For future auth integration

---

**Ready to implement Phase 2?** The path forward is clear and well-documented. LocalStorage persistence is the natural next step!
