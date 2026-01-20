import uvicorn
import socket
import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if __name__ == "__main__":
    ports = [8000, 8001, 8080, 5000]
    for port in ports:
        if not is_port_in_use(port):
            try:
                print(f"Attempting to start server on port {port}...")
                # Run the server with reload enabled for development
                # Note: reload=True implies workers=1. 
                # If we want to use 'main:app' string, we must ensure it's importable.
                uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)
                break
            except Exception as e:
                print(f"Failed to start on port {port}: {e}")
        else:
            print(f"Port {port} is already in use.")
