# Next Steps - Roadmap to Enhanced MVP

## 🎯 Current Status

✅ **Completed Core MVP:**

- Three-panel workspace UI
- Monaco Editor with Python syntax
- Docker-based secure code execution
- Step 1: TCP server validation
- Real-time test feedback
- Security constraints

## 🚀 Recommended Next Steps (Priority Order)

### Phase 1: Multi-Step Learning Journey (HIGH PRIORITY)

**Goal:** Enable users to progress through multiple steps in the Redis project

#### 1.1 Create Step Data Structure

```typescript
// types/steps.ts
interface Step {
  id: number;
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  testFile: string;
  hints: string[];
}
```

#### 1.2 Implement Steps 2-5

- **Step 2:** Handle PING command
- **Step 3:** Handle ECHO command
- **Step 4:** Handle SET command
- **Step 5:** Handle GET command

#### 1.3 Add Step Navigation

- Next/Previous buttons
- Progress indicator
- Step completion state

**Files to Create/Modify:**

- `lib/steps-data.ts` - Step definitions
- `docker/test_step2.py` through `test_step5.py`
- `components/StepNavigator.tsx`
- `app/page.tsx` - Add step state management

**Estimated Time:** 2-3 days

---

### Phase 2: Progress Persistence (MEDIUM PRIORITY)

**Goal:** Save user progress so they can continue later

#### 2.1 Local Storage Implementation

- Save current step
- Save user code for each step
- Load on return

#### 2.2 Browser Storage Strategy

```typescript
// lib/storage.ts
interface UserProgress {
  currentStep: number;
  completedSteps: number[];
  codeByStep: Record<number, string>;
  lastUpdated: string;
}
```

**Files to Create:**

- `lib/storage.ts` - LocalStorage wrapper
- `hooks/useProgress.ts` - Progress state management

**Estimated Time:** 1 day

---

### Phase 3: Enhanced Test Feedback (MEDIUM PRIORITY)

**Goal:** Provide better error messages and debugging info

#### 3.1 Structured Test Results

```typescript
interface TestResult {
  passed: boolean;
  name: string;
  error?: string;
  hint?: string;
  output?: string;
}
```

#### 3.2 Visual Test Breakdown

- Show individual test results
- Color-coded pass/fail indicators
- Expandable error details
- Line numbers for errors

**Files to Modify:**

- `docker/test_*.py` - Return structured JSON
- `lib/docker-executor.ts` - Parse test results
- `components/TerminalPanel.tsx` - Display structured results

**Estimated Time:** 2 days

---

### Phase 4: Hint System (LOW PRIORITY)

**Goal:** Provide graduated assistance without giving away answers

#### 4.1 Three-Tier Hint System

- Level 1: Gentle nudge
- Level 2: More specific guidance
- Level 3: Code example (not full solution)

#### 4.2 UI Implementation

- "Need Help?" button
- Progressive hint revelation
- Track hints used

**Files to Create:**

- `components/HintPanel.tsx`
- Update step data with hints

**Estimated Time:** 1-2 days

---

### Phase 5: Better User Experience (ONGOING)

#### 5.1 Loading States

- Show Docker container startup
- Progress indicators
- Estimated time remaining

#### 5.2 Error Handling

- Better error messages
- Docker troubleshooting guide
- Automatic retry on transient failures

#### 5.3 Responsive Design Improvements

- Mobile-friendly layout
- Collapsible panels
- Keyboard shortcuts

**Estimated Time:** 2-3 days

---

## 📋 Detailed Implementation Guide for Phase 1

### Step 1: Create Steps Data Structure

Create `lib/steps-data.ts`:

```typescript
export interface Step {
  id: number;
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  testFile: string;
  hints: string[];
}

export const STEPS: Step[] = [
  {
    id: 1,
    title: 'Listening for Connections',
    description: 'Create a TCP server that binds to port 6379',
    instructions: "Let's start by creating a simple TCP server...",
    initialCode: `# main.py
import socket

def main():
    print("Logs from your program will appear here.")

if __name__ == "__main__":
    main()`,
    testFile: 'test_step1.py',
    hints: [
      'You need to create a socket using socket.socket()',
      'Use the bind() method to attach to port 6379',
      "Don't forget to call listen() to accept connections",
    ],
  },
  {
    id: 2,
    title: 'Handle PING Command',
    description: 'Accept client connections and respond to PING',
    instructions: "Now let's accept a client and handle the PING command...",
    initialCode: `# main.py
import socket

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', 6379))
    server.listen(1)
    
    # TODO: Accept connection and handle PING

if __name__ == "__main__":
    main()`,
    testFile: 'test_step2.py',
    hints: [
      'Use server.accept() to get a client connection',
      'Read the command with connection.recv()',
      "Send back '+PONG\\r\\n' for PING commands",
    ],
  },
  // Add more steps...
];
```

### Step 2: Create Test for Step 2

Create `docker/test_step2.py`:

```python
"""
Test suite for Step 2: Handle PING Command
"""
import socket
import sys
import time
import subprocess
import os
import signal

def test_ping_command():
    print("Running tests...\\n")

    # Start the user's server in the background
    proc = subprocess.Popen(
        ['python', '/app/main.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    time.sleep(1)  # Give server time to start

    try:
        print("- Test: Server accepts connection...", end=" ")
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect(('localhost', 6379))
        print("PASSED")

        print("- Test: Server responds to PING...", end=" ")
        client.send(b"*1\\r\\n$4\\r\\nPING\\r\\n")
        response = client.recv(1024).decode()

        if response == "+PONG\\r\\n":
            print("PASSED")
            return True
        else:
            print("FAILED")
            print(f"\\nExpected: +PONG\\r\\n")
            print(f"Got: {repr(response)}")
            return False

    except Exception as e:
        print("FAILED")
        print(f"\\nError: {e}")
        return False
    finally:
        proc.kill()
        client.close()

if __name__ == "__main__":
    success = test_ping_command()
    sys.exit(0 if success else 1)
```

### Step 3: Update Page Component

Modify `app/page.tsx` to support multiple steps:

```typescript
'use client';

import React, { useState } from 'react';
import AIPanel from '@/components/AIPanel';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import TerminalPanel from '@/components/TerminalPanel';
import { STEPS } from '@/lib/steps-data';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState(STEPS[0].initialCode);

  const step = STEPS[currentStep];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Progress Bar */}
      <div className="h-2 bg-slate-200">
        <div
          className="h-full bg-green-600 transition-all"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_400px]">
        <AIPanel step={step} />
        <CodeEditorPanel initialCode={step.initialCode} onCodeChange={setCode} />
        <TerminalPanel
          code={code}
          stepId={step.id}
          onStepComplete={() => {
            if (currentStep < STEPS.length - 1) {
              setCurrentStep(currentStep + 1);
            }
          }}
        />
      </div>
    </div>
  );
}
```

---

## 🎨 UI/UX Improvements Checklist

- [ ] Add loading spinner during Docker execution
- [ ] Show execution time in terminal
- [ ] Add "Reset Code" button
- [ ] Implement keyboard shortcuts (Cmd+Enter to run)
- [ ] Add dark/light mode toggle
- [ ] Improve mobile responsiveness
- [ ] Add tooltips for buttons
- [ ] Show Docker status indicator
- [ ] Add step completion checkmarks
- [ ] Implement code syntax validation before execution

---

## 🔧 Technical Debt & Optimizations

### Performance

- [ ] Container pooling (reuse containers)
- [ ] Cache Docker image layers better
- [ ] Optimize Monaco Editor bundle size
- [ ] Implement code execution queue

### Code Quality

- [ ] Add unit tests for components
- [ ] Add integration tests for Docker executor
- [ ] Implement error boundaries
- [ ] Add logging and monitoring
- [ ] TypeScript strict mode

### Security

- [ ] Rate limiting for API endpoint
- [ ] Input validation and sanitization
- [ ] Container resource monitoring
- [ ] Audit logging for code execution

---

## 📊 Success Metrics

Track these metrics to measure MVP success:

1. **User Engagement**

   - Average steps completed per session
   - Time spent per step
   - Retry attempts before success

2. **Technical Performance**

   - Average code execution time
   - API response times
   - Docker container startup time
   - Error rates

3. **Learning Effectiveness**
   - Step completion rate
   - Hint usage frequency
   - Time to complete full project

---

## 🎯 Final Recommendation: START WITH PHASE 1

**Why?**

- Provides immediate value (more content)
- Demonstrates the full learning journey
- Uses existing infrastructure
- Can be tested immediately

**Implementation Plan:**

1. Day 1: Create steps data structure and Step 2 tests
2. Day 2: Implement step navigation and update UI
3. Day 3: Create Steps 3-5 and test thoroughly

Once Phase 1 is complete, you'll have a truly functional MVP that users can complete end-to-end!

---

## 📚 Additional Resources

- Redis Protocol Spec: https://redis.io/docs/reference/protocol-spec/
- RESP (Redis Serialization Protocol): Needed for Steps 2+
- Docker Best Practices: Already implemented
- Next.js Data Fetching: For future auth integration

---

**Ready to implement Phase 1?** Let me know and I can help build out the multi-step system!
