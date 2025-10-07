# CodeAlong - AI-Powered Learning Platform

An AI-powered learning tool where users complete coding projects with guidance from an AI instructor.

## Overview

This is the Minimum Viable Product (MVP) focusing on the core user experience for a single, hardcoded project: "Build your own Redis in Python."

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui for pre-built components
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Backend**: Next.js API Routes (Node.js)
- **Code Execution**: Docker-based secure sandboxed execution with resource limits

## Features

### Three-Panel Workspace Layout

1. **Left Panel (AI Instructions)**

   - Displays step-by-step instructions
   - Currently showing "Step 1: Listening for Connections"
   - Static content for MVP

2. **Center Panel (Code Editor)**

   - Monaco Editor with Python syntax highlighting
   - Dark theme (vs-dark)
   - Simple file navigator showing `main.py`
   - Pre-populated with boilerplate Python code

3. **Right Panel (Terminal Output)**
   - "Run Tests" button to execute code
   - Displays test results with color-coded feedback
   - Shows success (green) or failure (red/orange) messages

### Docker-Based Code Execution

The `/api/run-code` endpoint executes user code securely in Docker containers:

- Accepts POST requests with `{ "code": "USER_CODE_STRING" }`
- Executes code in isolated Docker container
- Runs automated tests against user code
- Enforces resource limits (CPU, memory, time)
- Network-isolated for security
- Returns detailed test results and feedback

See [docker/README.md](docker/README.md) for detailed security and architecture information.

## Project Structure

```
code-along/
├── app/
│   ├── api/
│   │   └── run-code/
│   │       └── route.ts          # Code execution API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main workspace page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/
│   │   └── button.tsx            # shadcn/ui button component
│   ├── AIPanel.tsx               # Left panel - AI instructions
│   ├── CodeEditorPanel.tsx       # Center panel - Monaco Editor
│   └── TerminalPanel.tsx         # Right panel - Test output
├── lib/
│   └── utils.ts                  # Utility functions
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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
- Build the code execution Docker image
- Verify the setup

**Important**: Docker Desktop must be installed and running. Download from [docker.com](https://www.docker.com/products/docker-desktop)

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Read the Instructions**: The left panel contains the current step's instructions
2. **Write Code**: Use the Monaco Editor in the center panel to write your Python code
3. **Run Tests**: Click the "Run Tests" button in the right panel
4. **View Results**: See test output and feedback in the terminal panel

### Example: Passing Step 1

To pass Step 1, your code must include the `socket.bind()` method:

```python
# main.py
import socket

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Server started and listening...")

if __name__ == "__main__":
    main()
```

## API Contract

### POST /api/run-code

**Request Body:**

```json
{
  "code": "string"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Step 1 Passed! Your server started correctly.",
  "output": "Running tests...\n- Test: Server binds to port 6379... PASSED\n- Test: Server accepts a connection... PASSED"
}
```

**Response (Failure):**

```json
{
  "success": false,
  "message": "Not quite. One test failed.",
  "output": "Running tests...\n- Test: Server binds to port 6379... FAILED\n\nHint: Have you used the `socket.bind()` method to attach your server to an address?"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Component Architecture

All components are fully typed with TypeScript:

- **AIPanel.tsx**: Static component displaying instructions
- **CodeEditorPanel.tsx**: Client component managing Monaco Editor state
- **TerminalPanel.tsx**: Client component handling test execution and results

### State Management

The main workspace page (`app/page.tsx`) manages the shared state:

- Code state flows from CodeEditorPanel → Home → TerminalPanel
- TerminalPanel handles API calls and result display independently

## Current Status

✅ **Completed Features:**

- Three-panel responsive workspace layout
- Monaco Editor with Python syntax highlighting
- Docker-based secure code execution
- Automated test validation for Step 1
- Real-time code execution with feedback
- Security constraints (network isolation, resource limits)

## Future Enhancements

### High Priority (Next MVP Steps)

- [ ] Multiple project steps (Step 2, 3, etc.)
- [ ] Dynamic step progression
- [ ] Step completion tracking
- [ ] Enhanced test feedback with specific error messages

### Medium Priority

- [ ] User authentication
- [ ] Progress persistence (save user progress)
- [ ] Multiple projects (Redis, Web Server, etc.)
- [ ] Hint system with graduated assistance

### Nice to Have

- [ ] Multiple programming languages (Node.js, Java, Go)
- [ ] AI-generated hints and explanations
- [ ] Code completion suggestions
- [ ] Collaborative coding sessions
- [ ] Leaderboard and achievements

## Contributing

This is an MVP. Contributions are welcome for:

- Bug fixes
- UI/UX improvements
- Documentation
- Test coverage
