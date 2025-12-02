/**
 * Step Data Structure for CodeAlong
 * Defines all steps for the "Build Your Own Redis" learning journey
 */

export interface Step {
  id: number;
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  testFile: string;
  hints: string[];
  estimatedMinutes: number;
}

export const STEPS: Step[] = [
  {
    id: 1,
    title: 'Step 1: Listening for Connections',
    description: 'Create a TCP server that binds to port 6379 and listens for incoming connections.',
    instructions: `## Welcome to Building Your Own Redis!

In this project, you'll build a simplified version of Redis, the popular in-memory data store. By the end, you'll have a working server that can handle basic Redis commands.

### What You'll Learn
- TCP socket programming in Python
- The Redis Serialization Protocol (RESP)
- Building a command-line server application
- In-memory key-value storage

### Step 1: Create a TCP Server

Redis is a **TCP server** that listens on port 6379. Before we can handle any Redis commands, we need to create a server that can accept incoming client connections.

#### Your Task
Create a TCP server using Python's \`socket\` module that:
1. Creates a socket using \`socket.AF_INET\` (IPv4) and \`socket.SOCK_STREAM\` (TCP)
2. Binds to \`localhost\` on port \`6379\`
3. Starts listening for connections with \`listen()\`

#### Key Concepts
- **TCP (Transmission Control Protocol)**: A reliable, connection-oriented protocol
- **Port 6379**: Redis's default port number
- **Socket Binding**: Attaching your server to a specific address and port

#### Hints
- Import the \`socket\` module
- Create a socket: \`socket.socket(socket.AF_INET, socket.SOCK_STREAM)\`
- Bind to the address: \`server_socket.bind(('localhost', 6379))\`
- Start listening: \`server_socket.listen()\``,
    initialCode: `# main.py
import socket

def main():
    print("Logs from your program will appear here.")
    # TODO: Create a TCP server that binds to port 6379

if __name__ == "__main__":
    main()`,
    testFile: 'test_step1.py',
    hints: [
      'You need to import the socket module',
      'Create a socket with socket.socket(socket.AF_INET, socket.SOCK_STREAM)',
      'Use socket.bind() to attach to localhost:6379',
      'Call socket.listen() to start accepting connections'
    ],
    estimatedMinutes: 15
  },
  {
    id: 2,
    title: 'Step 2: Handle PING Command',
    description: 'Accept client connections and respond to the PING command with PONG.',
    instructions: `## Step 2: Accepting Connections and Handling PING

Now that your server is listening, it's time to accept actual client connections and respond to your first Redis command: **PING**.

### Understanding PING
The PING command is Redis's simplest command - it's used to test if the server is alive and responding. When a client sends PING, the server should respond with "+PONG\\r\\n".

### The RESP Protocol
Redis uses the **RES**is **S**erialization **P**rotocol (RESP) for client-server communication. It's a simple text-based protocol.

#### RESP Data Types:
- **Simple Strings**: Start with \`+\`, end with \`\\r\\n\`
  - Example: \`+OK\\r\\n\`
- **Errors**: Start with \`-\`, end with \`\\r\\n\`
  - Example: \`-Error message\\r\\n\`
- **Integers**: Start with \`:\`, end with \`\\r\\n\`
  - Example: \`:1000\\r\\n\`
- **Bulk Strings**: Start with \`$\` followed by length
  - Example: \`$5\\r\\nhello\\r\\n\`
- **Arrays**: Start with \`*\` followed by count
  - Example: \`*2\\r\\n$4\\r\\nPING\\r\\n$0\\r\\n\\r\\n\`

### Your Task
Enhance your server to:
1. Accept an incoming connection using \`accept()\`
2. Read data from the client
3. Detect if the message contains "PING"
4. Respond with \`+PONG\\r\\n\` (a RESP Simple String)

#### Key Concepts
- **accept()**: Blocks until a client connects, returns (client_socket, address)
- **recv()**: Receives data from the connected client
- **send()**: Sends data back to the client

#### Implementation Tips
- After binding and listening, call \`server_socket.accept()\` to get a client connection
- Use \`client_socket.recv(1024)\` to read the client's message
- Check if "PING" is in the received data
- Send back \`+PONG\\r\\n\` using \`client_socket.send(b'+PONG\\r\\n')\`
- Don't forget to encode strings as bytes!`,
    initialCode: `# main.py
import socket

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Redis server listening on port 6379...")

    # TODO: Accept a connection
    # TODO: Read the client's message
    # TODO: If message contains PING, respond with +PONG\\r\\n

if __name__ == "__main__":
    main()`,
    testFile: 'test_step2.py',
    hints: [
      'Use server_socket.accept() to get (client_socket, address)',
      'Read data with client_socket.recv(1024)',
      'Check if b"PING" is in the received data',
      'Send the response: client_socket.send(b"+PONG\\r\\n")',
      'Remember to handle the connection in a way that keeps the server running'
    ],
    estimatedMinutes: 20
  },
  {
    id: 3,
    title: 'Step 3: Handle ECHO Command',
    description: 'Parse the RESP protocol format and implement the ECHO command.',
    instructions: `## Step 3: Parsing RESP and Implementing ECHO

The ECHO command returns whatever message the client sends. To implement it, you'll need to properly parse the RESP protocol format.

### Understanding RESP Arrays
Redis commands are sent as RESP Arrays. For example, the command \`ECHO hello\` is sent as:

\`\`\`
*2\\r\\n          # Array with 2 elements
$4\\r\\n          # Bulk string of length 4
ECHO\\r\\n        # The command name
$5\\r\\n          # Bulk string of length 5
hello\\r\\n       # The argument
\`\`\`

### RESP Parsing Strategy
To parse RESP commands, you need to:
1. Read the first character to determine the type
2. For arrays (\`*\`), read the count
3. For bulk strings (\`$\`), read the length, then read that many bytes
4. Continue parsing each element in the array

### Your Task
Implement proper RESP parsing and handle the ECHO command:
1. Parse the incoming RESP array format
2. Extract the command name (first element)
3. Extract the argument (second element)
4. If the command is ECHO, respond with the argument as a RESP Bulk String

#### RESP Bulk String Format
To send "hello" as a bulk string:
\`\`\`
$5\\r\\n          # $ followed by length
hello\\r\\n       # The actual string
\`\`\`

#### Implementation Tips
- Split the received data by \`\\r\\n\` to parse line by line
- Look for lines starting with \`*\` (array count), \`$\` (bulk string length), or plain text (the actual data)
- Extract the command (usually "ECHO") and its argument
- Format your response as: \`$<length>\\r\\n<message>\\r\\n\`

#### Example
**Input**: \`*2\\r\\n$4\\r\\nECHO\\r\\n$5\\r\\nhello\\r\\n\`
**Output**: \`$5\\r\\nhello\\r\\n\`

Don't worry about handling all edge cases - focus on parsing the basic structure!`,
    initialCode: `# main.py
import socket

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Redis server listening on port 6379...")

    client_socket, address = server_socket.accept()
    print(f"Client connected from {address}")

    while True:
        data = client_socket.recv(1024)
        if not data:
            break

        message = data.decode('utf-8')

        # TODO: Parse the RESP format
        # TODO: Extract the command and arguments
        # TODO: If command is ECHO, respond with the argument as a bulk string

if __name__ == "__main__":
    main()`,
    testFile: 'test_step3.py',
    hints: [
      'Split the message by "\\r\\n" to get individual lines',
      'Look for lines starting with $ to find bulk string lengths',
      'The command name comes after the first $<length>\\r\\n',
      'The argument comes after the second $<length>\\r\\n',
      'Format response as: f"$' + '{len(argument)}\\r\\n{argument}\\r\\n"'
    ],
    estimatedMinutes: 25
  },
  {
    id: 4,
    title: 'Step 4: Handle SET Command',
    description: 'Implement in-memory key-value storage with the SET command.',
    instructions: `## Step 4: Implementing the SET Command

Now it's time to add actual data storage! The SET command is how Redis stores key-value pairs in memory.

### Understanding SET
The SET command takes two arguments: a key and a value.
- **Command**: \`SET mykey myvalue\`
- **Response**: \`+OK\\r\\n\` (Simple String indicating success)

### RESP Format for SET
When a client sends \`SET name Alice\`, it looks like:
\`\`\`
*3\\r\\n          # Array with 3 elements
$3\\r\\n          # Bulk string of length 3
SET\\r\\n         # The command
$4\\r\\n          # Bulk string of length 4
name\\r\\n        # The key
$5\\r\\n          # Bulk string of length 5
Alice\\r\\n       # The value
\`\`\`

### Your Task
Implement in-memory storage:
1. Create a dictionary to store key-value pairs
2. Parse SET commands (3 elements: command, key, value)
3. Store the key-value pair in your dictionary
4. Respond with \`+OK\\r\\n\`

#### Key Concepts
- **In-Memory Storage**: Data stored in RAM (fast but volatile)
- **Hash Table**: Python dictionaries are perfect for key-value storage
- **Persistence**: For this exercise, data only lives while the server runs

#### Implementation Tips
- Create a global dictionary: \`store = {}\`
- Parse the command to extract: command_name, key, value
- Store with: \`store[key] = value\`
- Always respond with \`+OK\\r\\n\` for successful SET commands

#### Handling Multiple Commands
You'll need to keep your server running in a loop to handle multiple commands from the same client. Make sure your parsing logic can handle both ECHO and SET!

#### Example Flow
1. Client: \`SET name Alice\`
2. Server: Parse command → \`store["name"] = "Alice"\`
3. Server: Respond with \`+OK\\r\\n\``,
    initialCode: `# main.py
import socket

# Create an in-memory store
store = {}

def parse_resp(data):
    """Parse RESP format and return command and arguments"""
    # TODO: Implement RESP parsing
    # Should return (command, [args...])
    pass

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Redis server listening on port 6379...")

    client_socket, address = server_socket.accept()
    print(f"Client connected from {address}")

    while True:
        data = client_socket.recv(1024)
        if not data:
            break

        command, args = parse_resp(data)

        if command == "PING":
            client_socket.send(b"+PONG\\r\\n")
        elif command == "ECHO":
            # TODO: Handle ECHO
            pass
        elif command == "SET":
            # TODO: Store key-value pair and respond with +OK\\r\\n
            pass

if __name__ == "__main__":
    main()`,
    testFile: 'test_step4.py',
    hints: [
      'Create a dictionary at module level: store = {}',
      'For SET, extract both key and value from the parsed arguments',
      'Store with: store[args[0]] = args[1]',
      'Always respond with b"+OK\\r\\n" after a successful SET',
      'Make sure your RESP parser returns command name and all arguments'
    ],
    estimatedMinutes: 25
  },
  {
    id: 5,
    title: 'Step 5: Handle GET Command',
    description: 'Retrieve stored values with the GET command and complete your Redis implementation.',
    instructions: `## Step 5: Implementing GET - Completing Your Redis!

Congratulations on making it to the final step! Now you'll implement GET to retrieve the values you've stored with SET.

### Understanding GET
The GET command retrieves the value associated with a key.
- **Command**: \`GET mykey\`
- **Response**: The value as a Bulk String, or \`$-1\\r\\n\` (null) if the key doesn't exist

### RESP Format for GET
When a client sends \`GET name\`:
\`\`\`
*2\\r\\n          # Array with 2 elements
$3\\r\\n          # Bulk string of length 3
GET\\r\\n         # The command
$4\\r\\n          # Bulk string of length 4
name\\r\\n        # The key
\`\`\`

### Response Format
If the key exists with value "Alice":
\`\`\`
$5\\r\\n          # Bulk string of length 5
Alice\\r\\n       # The value
\`\`\`

If the key doesn't exist:
\`\`\`
$-1\\r\\n         # Null bulk string
\`\`\`

### Your Task
Complete your Redis implementation:
1. Parse GET commands (2 elements: command, key)
2. Look up the key in your store dictionary
3. If found: respond with the value as a RESP Bulk String
4. If not found: respond with \`$-1\\r\\n\` (RESP null)

#### Key Concepts
- **Null Response**: In RESP, \`$-1\\r\\n\` indicates a null/missing value
- **Dictionary Lookup**: Use \`.get()\` method to safely check if a key exists
- **Complete Redis**: With GET/SET/ECHO/PING, you have a functional key-value store!

#### Implementation Tips
- Use \`store.get(key)\` to safely retrieve values
- If value exists: format as \`f"$' + '{len(value)}\\r\\n{value}\\r\\n"\`
- If value is None: respond with \`$-1\\r\\n\`
- Test the full workflow: SET a key, then GET it back!

#### Example Workflow
\`\`\`
Client: SET user Alice
Server: +OK\\r\\n

Client: GET user
Server: $5\\r\\nAlice\\r\\n

Client: GET nonexistent
Server: $-1\\r\\n
\`\`\`

### 🎉 Congratulations!
Once you pass this step, you'll have built a working Redis-like server that can:
- Accept TCP connections
- Parse the RESP protocol
- Store and retrieve key-value pairs
- Handle multiple Redis commands

This is the foundation of how real Redis works! From here, Redis adds features like:
- Persistence (saving to disk)
- Data structures (lists, sets, sorted sets)
- Pub/Sub messaging
- Replication and clustering
- Expiration and eviction policies

But you've mastered the core concepts. Well done! 🚀`,
    initialCode: `# main.py
import socket

store = {}

def parse_resp(data):
    """Parse RESP format and return command and arguments"""
    lines = data.decode('utf-8').split('\\r\\n')
    elements = []
    i = 0
    while i < len(lines):
        if lines[i].startswith('$') and i + 1 < len(lines):
            elements.append(lines[i + 1])
            i += 2
        else:
            i += 1

    if not elements:
        return None, []

    command = elements[0].upper()
    args = elements[1:]
    return command, args

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 6379))
    server_socket.listen(1)
    print("Redis server listening on port 6379...")

    client_socket, address = server_socket.accept()
    print(f"Client connected from {address}")

    while True:
        data = client_socket.recv(1024)
        if not data:
            break

        command, args = parse_resp(data)

        if command == "PING":
            client_socket.send(b"+PONG\\r\\n")
        elif command == "ECHO" and len(args) > 0:
            msg = args[0]
            response = f"$' + '{len(msg)}\\r\\n{msg}\\r\\n"
            client_socket.send(response.encode())
        elif command == "SET" and len(args) >= 2:
            store[args[0]] = args[1]
            client_socket.send(b"+OK\\r\\n")
        elif command == "GET" and len(args) > 0:
            # TODO: Retrieve the value from store
            # TODO: If exists, send as bulk string
            # TODO: If not exists, send $-1\\r\\n
            pass

if __name__ == "__main__":
    main()`,
    testFile: 'test_step5.py',
    hints: [
      'Use store.get(key) to safely retrieve the value',
      'If value is not None: format as f"$' + '{len(value)}\\r\\n{value}\\r\\n"',
      'If value is None: send b"$-1\\r\\n"',
      'Make sure to encode your response before sending',
      'Test by setting a key first, then getting it back'
    ],
    estimatedMinutes: 20
  }
];

// Helper function to get a step by ID
export function getStepById(id: number): Step | undefined {
  return STEPS.find(step => step.id === id);
}

// Helper function to get the total number of steps
export function getTotalSteps(): number {
  return STEPS.length;
}

// Helper function to check if a step ID is valid
export function isValidStepId(id: number): boolean {
  return id >= 1 && id <= STEPS.length;
}
