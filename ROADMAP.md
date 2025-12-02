# Development Roadmap: CodeAlong

This roadmap outlines a phased approach to building CodeAlong, ensuring we validate our core assumptions with a strong MVP before expanding into more complex features.

## Phase 1: MVP - The Core Loop (Target: 1-2 Months)

Goal: Validate the "Code-Test-Learn" loop with a single, high-quality, text-based project. Prove that users find this method of learning engaging and effective.

Flagship Project: "Build your own Redis in Python."

Key Technical Tasks:

Frontend: Build the three-panel web interface using Next.js, TypeScript, and Tailwind CSS.

IDE Component: Integrate the Monaco Editor as the core code editor.

Backend API: Create the initial API routes in Next.js to handle code submissions.

Secure Code Execution: Implement a secure, containerized code execution sandbox using Docker. This is the most critical backend component.

Curriculum Development:

Handcraft the complete, step-by-step test suite for the Redis project.

Engineer the AI prompts that will deliver instructions and contextual hints for every step.

## Phase 2: V1.1 - The Visual Experience (Target: Month 3)

Goal: Prove the platform's flexibility by introducing a visual, frontend-only project. This will broaden our appeal and demonstrate a more interactive feedback loop.

Flagship Project: "Build a 3D Solar System with three.js."

Key Technical Tasks:

UI Adaptation: Modify the frontend to support a fourth "Live Preview" panel for rendering the three.js canvas.

Frontend Test Runner: Develop a JavaScript-based test runner that executes in the browser and can inspect the state of the user's three.js scene object.

Curriculum Development: Write the complete test suite and AI prompts for the Solar System project.

Platform Features: Build a simple project selection/landing page.

## Phase 3: V2.0 - Content Expansion & Compiled Languages (Target: Months 4-6)

Goal: Expand the project library and tackle the technical challenge of supporting compiled languages.

Flagship Project: "Build your own Ray Tracer in C++."

Key Technical Tasks:

Advanced Execution Environment: Enhance the Docker sandbox to support C++ compilation (g++, CMake) and execution.

Image Output Handling: Implement a system to transfer generated image files (the output of the ray tracer) from the isolated container back to the user's browser for viewing.

Content Library: Begin building out a library of 5-10 additional handcrafted projects in various popular languages (e.g., Go, Rust, Java).

## Phase 4: V3.0 - The Magic: On-the-Fly Project Generation (Future)

Goal: Fulfill the ultimate vision of a truly dynamic and personalized learning platform where the AI generates entire projects on demand.

Key R&D Tasks:

AI Test Generation: Research and develop a reliable system for an AI to generate a complete, bug-free, and logically sequential test suite for a given project prompt. This is the hardest part.

UI for Generation: Build the user interface for prompting and refining AI-generated projects.
