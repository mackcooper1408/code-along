#!/bin/bash

# Test script to verify Docker code execution

echo "🧪 Testing Docker code execution..."
echo ""

# Test 1: Failing code (no bind)
echo "Test 1: Code without bind() - should fail"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import socket\n\ndef main():\n    print(\"Hello\")\n\nif __name__ == \"__main__\":\n    main()"
  }')

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool
echo ""
echo "---"
echo ""

# Test 2: Passing code (with bind)
echo "Test 2: Code with bind() - should pass"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import socket\n\ndef main():\n    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    server.bind((\"localhost\", 6379))\n    server.listen(1)\n    print(\"Server started\")\n\nif __name__ == \"__main__\":\n    main()"
  }')

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "✓ Tests complete!"
