#!/usr/bin/env python
import uvicorn
import sys

if __name__ == "__main__":
    try:
        print("Starting server on 0.0.0.0:8000...")
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
