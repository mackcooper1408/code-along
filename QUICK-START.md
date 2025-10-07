# Quick Reference - Docker Code Execution

## Quick Start

```bash
# Build Docker image (first time only)
./scripts/setup-docker.sh

# Start development server
npm run dev

# Open http://localhost:3000
```

## File Structure

```
code-along/
├── docker/
│   ├── Dockerfile              # Python 3.11 runtime
│   ├── test_step1.py          # Test validation
│   └── README.md              # Detailed docs
├── lib/
│   └── docker-executor.ts     # Container management
├── app/api/run-code/
│   └── route.ts               # Updated with Docker
└── scripts/
    ├── setup-docker.sh        # Build image
    └── test-docker-execution.sh # Test script
```

## How It Works

1. User writes Python code in editor
2. Clicks "Run Tests"
3. Code sent to `/api/run-code`
4. Docker Executor:
   - Creates temp file with user code
   - Launches secure Docker container
   - Runs test suite against code
   - Returns results
   - Cleans up

## Security

- ✓ Network isolated (`--network none`)
- ✓ Read-only filesystem
- ✓ Non-root user execution
- ✓ 128MB memory limit
- ✓ 10-second timeout
- ✓ No privilege escalation

## Testing

### Via Browser

1. Go to http://localhost:3000
2. Write code in editor
3. Click "Run Tests"

### Via curl

```bash
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"code":"import socket\nserver = socket.socket()\nserver.bind((\"localhost\", 6379))\nserver.listen(1)"}'
```

### Integration Tests

```bash
./scripts/test-docker-execution.sh
```

## Passing Code Example

```python
import socket

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', 6379))
    server.listen(1)
    print("Server started!")

if __name__ == "__main__":
    main()
```

## Common Issues

| Problem            | Solution                              |
| ------------------ | ------------------------------------- |
| Docker not running | Start Docker Desktop                  |
| Image not found    | Run `./scripts/setup-docker.sh`       |
| Port 3000 in use   | Change port: `npm run dev -- -p 3001` |
| Slow execution     | Check Docker Desktop resources        |

## Key Commands

```bash
# Rebuild Docker image
docker build -t codealong-python-runner ./docker

# List Docker images
docker images codealong-python-runner

# Test API directly
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"hello\")"}'

# View container logs (if running)
docker ps
docker logs <container-id>

# Clean up containers
docker container prune -f

# Remove image (if needed)
docker rmi codealong-python-runner
```

## Documentation

- **Full Architecture**: `DOCKER-IMPLEMENTATION.md`
- **Docker Details**: `docker/README.md`
- **Project README**: `README.md`
- **Original Spec**: `IMPLEMENTATION.md`

## Status Check

```bash
# Verify Docker
docker info

# Verify image
docker images | grep codealong

# Verify server
curl -I http://localhost:3000
```

## What's Next?

### For Testing Right Now:

1. Open http://localhost:3000
2. Try the default code (should fail)
3. Add `socket.bind()` and `socket.listen()`
4. Run tests again (should pass!)

### For Development:

See **`NEXT-STEPS.md`** for the complete roadmap!

**Top Priority:** Implement multi-step progression (Steps 2-5) to complete the Redis learning journey.

---

## 📊 Current Status

✅ **Completed:**

- Three-panel workspace UI ✓
- Monaco Editor integration ✓
- Docker secure execution ✓
- Step 1: TCP server ✓
- Real-time feedback ✓

🚧 **Next Phase:**

- Multiple steps (2-5)
- Step navigation
- Progress tracking

---

🎉 **Everything is ready! Start coding!**
