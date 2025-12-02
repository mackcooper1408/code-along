"""
Test suite for Step 2: Handle PING Command
Tests if the user's Redis server can accept connections and respond to PING
"""

import socket
import sys
import subprocess
import time
import signal
import os


def start_server():
    """Start the user's server in the background"""
    try:
        process = subprocess.Popen(
            ['python', '/app/main.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid
        )
        time.sleep(0.5)  # Give server time to start
        return process
    except Exception as e:
        print(f"Failed to start server: {e}")
        return None


def stop_server(process):
    """Stop the server process"""
    if process:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait(timeout=2)
        except:
            pass


def test_server():
    """Test the server functionality"""
    print("Running tests...\n")

    # Read the user's code for basic checks
    try:
        with open("/app/main.py", "r") as f:
            code = f.read()
    except Exception as e:
        print(f"Error reading code: {e}")
        return False

    # Test 1: Check if code has accept()
    print("- Test: Code accepts client connections...", end=" ")
    if "accept" not in code:
        print("FAILED")
        print("\nHint: You need to accept incoming connections with `socket.accept()`")
        print("Example: `client_socket, address = server_socket.accept()`")
        return False
    print("PASSED")

    # Test 2: Check if code has recv()
    print("- Test: Code reads data from client...", end=" ")
    if "recv" not in code:
        print("FAILED")
        print("\nHint: You need to receive data from the client with `socket.recv()`")
        print("Example: `data = client_socket.recv(1024)`")
        return False
    print("PASSED")

    # Start the server
    print("- Test: Server responds to PING...", end=" ")
    server_process = start_server()
    if not server_process:
        print("FAILED")
        print("\nHint: Make sure your server starts without errors")
        return False

    try:
        # Give server time to start
        time.sleep(0.3)

        # Connect to the server
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.settimeout(2)
        client.connect(('localhost', 6379))

        # Send PING command (simplified format)
        client.send(b'PING\r\n')

        # Receive response
        response = client.recv(1024)
        client.close()
        stop_server(server_process)

        # Check if response contains PONG
        if b'PONG' in response:
            print("PASSED")
            return True
        else:
            print("FAILED")
            print(f"\nHint: Server should respond with '+PONG\\r\\n' when it receives PING")
            print(f"Your server responded with: {response}")
            return False

    except socket.timeout:
        print("FAILED")
        print("\nHint: Server didn't respond in time. Make sure it sends '+PONG\\r\\n' after receiving PING")
        stop_server(server_process)
        return False
    except ConnectionRefusedError:
        print("FAILED")
        print("\nHint: Couldn't connect to server. Make sure it's binding to port 6379 and listening")
        stop_server(server_process)
        return False
    except Exception as e:
        print("FAILED")
        print(f"\nError: {e}")
        stop_server(server_process)
        return False


if __name__ == "__main__":
    success = test_server()

    if success:
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
