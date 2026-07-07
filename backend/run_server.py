#!/usr/bin/env python
import subprocess
import sys

# First install packages
packages = [
    'fastapi==0.111.0',
    'uvicorn==0.30.1',
    'sqlalchemy==2.0.30',
    'pydantic==2.7.4',
]

print("Installing packages...")
for pkg in packages:
    print(f"Installing {pkg}...")
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg])

print("\nAll packages installed!")
print("\nStarting server...")
subprocess.call([sys.executable, '-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'])
