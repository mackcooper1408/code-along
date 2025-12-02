# CodeAlong - AI-Powered Learning Platform

An AI-powered learning tool where users complete coding projects step-by-step with guidance and automated test feedback.

## Overview

This is the **Phase 1 MVP** featuring a complete 5-step learning journey for building a Redis clone in Python. Users progress through structured steps, write code in a browser-based editor, and get immediate feedback from automated tests running in secure Docker containers.

## Technology Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Backend**: Next.js API Routes (Node.js)
- **Code Execution**: Docker-based secure sandboxed execution with comprehensive security constraints
- **Testing**: Playwright for E2E testing (29 tests, 100% passing)

## Features

### Complete 5-Step Learning Journey

**Project: Build Your Own Redis in Python**

1. **Step 1: Listening for Connections** - Create a TCP server that binds to port 6379
2. **Step 2: Handle PING Command** - Accept connections and respond to PING with PONG
3. **Step 3: Handle ECHO Command** - Parse RESP arrays and echo messages back
4. **Step 4: Handle SET Command** - Implement in-memory key-value storage
5. **Step 5: Handle GET Command** - Retrieve stored values and complete the Redis clone

Each step includes:
- Detailed educational content explaining concepts
- Step-specific boilerplate code
- Automated test suites validating correctness
- Helpful hints on test failures
- Visual progress tracking

### Three-Panel Workspace Layout

1. **Left Panel (AI Instructions)**
   - Step-by-step instructions with markdown formatting
   - Code examples and explanations
   - Estimated time per step
   - Dynamic content based on current step

2. **Center Panel (Code Editor)**
   - Monaco Editor with Python syntax highlighting
   - Dark theme (vs-dark)
   - File navigator showing `main.py`
   - Step-specific boilerplate code
   - Full editing capabilities

3. **Right Panel (Terminal + Navigation)**
   - Visual progress bar (5 steps)
   - Progress counter (X / 5 steps completed)
   - Previous/Next navigation buttons
   - "Run Tests" button for code execution
   - Color-coded test feedback (green success / red failure)
   - Detailed test output with hints

### Docker-Based Secure Code Execution

The `/api/run-code` endpoint executes user code safely:

- Accepts POST requests with `{ "code": "...", "stepId": 1-5 }`
- Executes code in isolated Docker containers
- Runs step-specific automated tests
- Network-isolated for security (`--network none`)
- Resource limits: 128MB RAM, 0.5 CPU, 10s timeout, 50 processes
- Read-only filesystem with non-root user
- Automatic container cleanup
- Returns structured test results and feedback

See [DOCKER-IMPLEMENTATION.md](DOCKER-IMPLEMENTATION.md) for detailed security architecture.

### End-to-End Testing

Comprehensive Playwright test suite with **29 tests (100% passing)**:

- Code execution and test feedback
- Multi-step navigation flows
- Step content validation
- Visual regression testing
- Terminal state management

Run tests with: `npm run test:e2e`

## Project Structure

```
code-along/
├── app/
│   ├── api/
│   │   └── run-code/
│   │       └── route.ts          # Code execution API with stepId routing
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main workspace with step state management
│   └── globals.css               # Global styles
├── components/
│   ├── ui/
│   │   └── button.tsx            # shadcn/ui button component
│   ├── AIPanel.tsx               # Left panel - step-specific instructions
│   ├── CodeEditorPanel.tsx       # Center panel - Monaco Editor
│   └── TerminalPanel.tsx         # Right panel - navigation + test output
├── docker/
│   ├── Dockerfile                # Python 3.11 runtime image
│   ├── test_step1.py             # Step 1: TCP server tests
│   ├── test_step2.py             # Step 2: PING command tests
│   ├── test_step3.py             # Step 3: ECHO command tests
│   ├── test_step4.py             # Step 4: SET command tests
│   ├── test_step5.py             # Step 5: GET command tests
│   └── README.md                 # Docker architecture docs
├── e2e/
│   ├── code-execution.spec.ts    # Code execution E2E tests (8 tests)
│   ├── phase1-multi-step.spec.ts # Navigation E2E tests (13 tests)
│   └── step-content.spec.ts      # Content validation tests (8 tests)
├── lib/
│   ├── docker-executor.ts        # Docker container management
│   ├── steps-data.ts             # Step definitions and content
│   └── utils.ts                  # Utility functions
├── scripts/
│   ├── setup-docker.sh           # Docker setup automation
│   └── test-docker-execution.sh  # Integration tests
├── playwright.config.ts          # Playwright E2E configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker Desktop (required for code execution)

### Installation

1. Install Node.js dependencies:

```bash
npm install
```

2. **Set up Docker for code execution** (required):

```bash
./scripts/setup-docker.sh
```

This will:
- Check if Docker is installed and running
- Build the code execution Docker image (`codealong-python-runner`)
- Verify the setup

**Important**: Docker Desktop must be installed and running. Download from [docker.com](https://www.docker.com/products/docker-desktop)

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

Run the E2E test suite:

```bash
npm run test:e2e        # Run all 29 tests
npm run test:e2e:ui     # Run with Playwright UI (recommended)
npm run test:e2e:headed # Run with browser visible
npm run test:e2e:report # View HTML report
```

## Usage

1. **Read the Instructions**: Left panel shows current step's learning content
2. **Write Code**: Center panel provides Monaco Editor with Python boilerplate
3. **Navigate Steps**: Use Previous/Next buttons in right panel
4. **Run Tests**: Click "Run Tests" to validate your code
5. **View Results**: Terminal shows test output with color-coded feedback
6. **Track Progress**: Visual progress bar shows completed steps (green), current step (blue), pending steps (gray)
7. **Complete Journey**: Work through all 5 steps to build a functional Redis clone!

### Example: Completing Step 1

Write code that creates a TCP server:

```python
# main.py
import socket

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Redis server listening on port 6379...")

if __name__ == "__main__":
    main()
```

Click "Run Tests" and you'll see:
- ✓ Test: Code includes socket.bind()... PASSED
- ✓ Test: Code includes socket.listen()... PASSED
- ✓ Test: Code imports socket... PASSED
- **"✓ Step 1 Passed! Great work!"**

Progress updates to "1 / 5 steps completed" with Step 1 shown in green.

## API Contract

### POST /api/run-code

**Request Body:**

```json
{
  "code": "string",
  "stepId": 1
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "✓ Step 1 Passed! Great work!",
  "output": "Running tests...\n- Test: Code includes socket.bind()... PASSED\n- Test: Code includes socket.listen()... PASSED\n- Test: Code imports socket... PASSED"
}
```

**Response (Failure):**

```json
{
  "success": false,
  "message": "✗ Not quite. One or more tests failed.",
  "output": "Running tests...\n- Test: Code includes socket.bind()... FAILED\n\nHint: Have you used the `socket.bind()` method to attach your server to an address?"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI

### Component Architecture

All components are fully typed with TypeScript:

- **AIPanel.tsx**: Displays step-specific educational content from `lib/steps-data.ts`
- **CodeEditorPanel.tsx**: Client component managing Monaco Editor state, updates on step change
- **TerminalPanel.tsx**: Client component handling navigation, test execution, and progress tracking

### State Management

The main workspace page (`app/page.tsx`) manages shared state:

- Current step ID (1-5)
- Code content (updates when switching steps)
- Completed steps Set (for progress tracking)
- Step change handlers
- Step completion callbacks

State flows:
- Step data: `lib/steps-data.ts` → `app/page.tsx` → all panels
- Code edits: `CodeEditorPanel` → `app/page.tsx` → `TerminalPanel`
- Navigation: `TerminalPanel` → `app/page.tsx` → updates all panels
- Test results: `TerminalPanel` → API → Docker → updates completion state

## Current Status

✅ **Phase 1 Complete:**

- Three-panel responsive workspace layout
- Monaco Editor with Python syntax highlighting
- Docker-based secure code execution
- **5-step learning journey** (all steps implemented)
- **Step navigation** (Previous/Next buttons)
- **Progress tracking** (visual bar + counter)
- **Step-specific content and tests**
- **Terminal output reset on navigation**
- Real-time test feedback
- Security constraints (network isolation, resource limits)
- **29 passing E2E tests** (100% coverage)

## Future Enhancements

### Phase 2: Progress Persistence (Next Priority)

- [ ] LocalStorage integration to save user progress
- [ ] Restore user's code and current step on page refresh
- [ ] Track completed steps across sessions
- [ ] "Reset Progress" button

See [NEXT-STEPS.md](NEXT-STEPS.md) for detailed implementation guide.

### Phase 3: Enhanced Test Feedback

- [ ] Structured JSON test results (not plain text)
- [ ] Visual test breakdown with expandable sections
- [ ] Line number references for errors
- [ ] Better error messages and hints

### Phase 4: Hint System

- [ ] Three-tier progressive hint system
- [ ] "Need Help?" button in terminal
- [ ] Track hint usage per step

### Long-term (ROADMAP.md)

- [ ] Visual projects (three.js Solar System)
- [ ] Compiled languages (C++ Ray Tracer)
- [ ] AI-generated projects on demand
- [ ] Multiple programming languages
- [ ] User authentication and profiles
- [ ] Collaborative coding sessions

## Documentation

| Document                      | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `README.md`                   | This file - project overview          |
| `MVP-STATUS.md`               | Current status and achievements       |
| `NEXT-STEPS.md`               | Phase 2+ roadmap and implementation   |
| `ROADMAP.md`                  | Long-term vision (4 phases)           |
| `IMPLEMENTATION.md`           | Technical architecture details        |
| `TESTING.md`                  | Testing guide (manual + E2E)          |
| `DOCKER-IMPLEMENTATION.md`    | Docker security architecture          |
| `QUICK-START.md`              | Quick reference                       |
| `CLAUDE.md`                   | Claude AI guidance                    |

## Contributing

This is Phase 1 of a learning platform. Contributions welcome for:

- Bug fixes
- UI/UX improvements
- Documentation enhancements
- Test coverage expansion
- Phase 2 features (see NEXT-STEPS.md)

## License

MIT

---

**Status**: ✅ Phase 1 Complete - Full 5-Step Learning Journey Operational
**E2E Tests**: ✅ 29/29 passing
**Ready for**: User testing, Phase 2 implementation

**Get Started**: `npm install && ./scripts/setup-docker.sh && npm run dev`
