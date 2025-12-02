# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeAlong is an AI-powered learning platform where users complete coding projects (currently "Build your own Redis in Python") with step-by-step guidance. The MVP features a three-panel workspace: AI instructions (left), Monaco code editor (center), and test results terminal (right).

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint
```

### Docker Setup (Required for code execution)
```bash
./scripts/setup-docker.sh              # Initial setup - builds Docker image
docker build -t codealong-python-runner ./docker  # Manual image rebuild
docker images | grep codealong-python-runner       # Verify image exists
```

**Critical**: Docker Desktop must be running for code execution to work. The app uses Docker containers to safely execute user Python code with security constraints.

## Architecture

### Data Flow
```
User writes code in Monaco Editor (CodeEditorPanel)
    ↓
Code state lifted to Home component (app/page.tsx)
    ↓
Passed to TerminalPanel → Click "Run Tests"
    ↓
POST /api/run-code → DockerExecutor (lib/docker-executor.ts)
    ↓
Spawns isolated Docker container with security constraints
    ↓
Runs test_step1.py against user's main.py
    ↓
Returns results → TerminalPanel displays output
```

### Key Components

**Frontend (Next.js App Router)**
- `app/page.tsx`: Main workspace - manages shared code state between editor and terminal
- `components/AIPanel.tsx`: Displays static step instructions (currently Step 1)
- `components/CodeEditorPanel.tsx`: Monaco Editor wrapper, emits code changes via `onCodeChange` callback
- `components/TerminalPanel.tsx`: Receives code prop, handles test execution via API, displays results

**Backend**
- `app/api/run-code/route.ts`: API endpoint that accepts code, delegates to DockerExecutor
- `lib/docker-executor.ts`: Singleton service managing Docker container lifecycle
  - Creates temp files with unique run IDs
  - Mounts user code and test files as read-only volumes
  - Enforces security: no network, 128MB RAM, 0.5 CPU, 10s timeout, read-only filesystem
  - Auto-cleans up containers and temp files

**Docker Execution**
- `docker/Dockerfile`: Python 3.11 slim runtime, runs as non-root user `coderunner`
- `docker/test_step1.py`: Test suite validating socket binding and connections
- Temp directory: `/tmp/codealong/` (files named `main_<runId>.py`)

### Security Model

Docker containers run with multiple isolation layers:
- `--network none`: No network access
- `--read-only`: Immutable root filesystem
- `--memory=128m --cpus=0.5 --pids-limit=50`: Resource constraints
- `--security-opt=no-new-privileges`: Prevents privilege escalation
- User code mounted as read-only volumes
- Non-root execution inside container

### State Management

Simple prop-based state flow (no Redux/Context):
- Editor maintains local code state
- Home component receives updates via callback
- Terminal receives code as prop for test execution

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root (see `tsconfig.json`).

## Development Guidelines

### Working with Code Execution

When modifying the execution system:
1. Changes to `docker/Dockerfile` or test files require rebuilding the image: `docker build -t codealong-python-runner ./docker`
2. The DockerExecutor singleton auto-builds the image if missing but won't detect changes
3. Test files are mounted at runtime - no rebuild needed for test changes unless dependencies change
4. Always maintain security constraints when modifying Docker commands

### Adding New Steps

Currently hardcoded to Step 1. To add steps:
1. Create new test file (e.g., `docker/test_step2.py`)
2. Update `lib/docker-executor.ts` to accept step parameter
3. Modify `app/api/run-code/route.ts` to handle step routing
4. Update `AIPanel.tsx` with new instructions

### Component Changes

- Components use TypeScript with strict typing
- UI components from shadcn/ui (Radix primitives)
- All panels are client components ('use client')
- Monaco Editor options configured in `CodeEditorPanel.tsx:47-54`

## Troubleshooting

**"Docker is not running" errors**: Start Docker Desktop application

**Image not found**: Run `./scripts/setup-docker.sh` to build the image

**Code execution timeouts**: Expected behavior for infinite loops. 10-second hard limit enforced.

**Test failures**: Check `docker/test_step1.py` for requirements. Step 1 requires `socket.bind()` call.
