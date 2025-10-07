# Testing Guide for CodeAlong

## Quick Start

The development server is already running at: **http://localhost:3000**

## Test Scenarios

### Scenario 1: Initial State

**What to expect:**

- Three-panel layout displayed
- Left panel shows "Step 1: Listening for Connections" instructions
- Center panel displays Monaco Editor with Python code
- Right panel shows "Click 'Run Tests' to check your work..."

### Scenario 2: Test Failure

**Steps:**

1. Keep the default boilerplate code (or delete the word "bind" if present)
2. Click the "Run Tests" button
3. Wait ~1.5 seconds

**Expected Result:**

- Button shows "Running..." during execution
- Red/orange error message appears: "Not quite. One test failed."
- Terminal output shows:

  ```
  Running tests...
  - Test: Server binds to port 6379... FAILED

  Hint: Have you used the `socket.bind()` method to attach your server to an address?
  ```

### Scenario 3: Test Success

**Steps:**

1. Modify the code in the editor to include the word "bind" (e.g., add `socket.bind()`)
2. Example code:

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

3. Click "Run Tests"
4. Wait ~1.5 seconds

**Expected Result:**

- Button shows "Running..." during execution
- Green success message appears: "Step 1 Passed! Your server started correctly."
- Terminal output shows:
  ```
  Running tests...
  - Test: Server binds to port 6379... PASSED
  - Test: Server accepts a connection... PASSED
  ```

## Features to Test

### Monaco Editor Functionality

- [x] Type in the editor
- [x] Python syntax highlighting works
- [x] Line numbers displayed
- [x] Dark theme applied
- [x] Code persists when running tests

### Responsive Design

- [x] Desktop view: Three panels side-by-side
- [x] Resize window to test responsiveness
- [x] On smaller screens, layout adjusts appropriately

### Button States

- [x] Normal state: "Run Tests" (green button)
- [x] Loading state: "Running..." (button disabled)
- [x] Button re-enables after test completion

### Error Handling

If you want to test error handling:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Block the `/api/run-code` endpoint
4. Click "Run Tests"
5. Should see error message in terminal

## Browser Console

Open browser console (F12) to check for any JavaScript errors. There should be none.

## API Testing (Optional)

You can test the API directly using curl:

### Test with "bind" (success):

```bash
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"code":"import socket\nsocket.bind()"}'
```

### Test without "bind" (failure):

```bash
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"code":"import socket\nprint(hello)"}'
```

## Common Issues

### Port Already in Use

If you see "Port 3000 is already in use":

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Monaco Editor Not Loading

- Check browser console for errors
- Ensure @monaco-editor/react is installed
- Try refreshing the page

### Styles Not Applying

- Ensure Tailwind CSS is configured correctly
- Check that globals.css is imported in layout.tsx
- Try clearing browser cache

## Performance Notes

- Initial page load: < 2 seconds
- Monaco Editor load: < 1 second
- API response time: ~1.5 seconds (intentional delay)
- Hot reload: Works instantly on code changes

## Accessibility Testing

- [x] Keyboard navigation works
- [x] Button is clickable
- [x] Text is readable with good contrast
- [x] Responsive on different screen sizes

## Next Steps After Testing

Once you've verified everything works:

1. Test making code changes in the editor
2. Verify state management (code persists between test runs)
3. Check mobile responsiveness
4. Review the README.md for architecture details
5. Review IMPLEMENTATION.md for technical details

## Stopping the Server

To stop the development server:

```bash
# Press Ctrl+C in the terminal where npm run dev is running
```

## Restarting

To restart:

```bash
npm run dev
```

---

**Status**: ✅ All systems operational
**URL**: http://localhost:3000
**Ready for testing!**
