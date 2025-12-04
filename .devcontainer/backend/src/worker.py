import asyncio
import os
import re
import subprocess
from bullmq import Worker
from tasks import run_gamdl

MAX_LOG_LINES = 50

# ANSI カラーコードを除去する正規表現
ANSI_ESCAPE = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def strip_ansi(text: str) -> str:
    return ANSI_ESCAPE.sub('', text)

def get_redis_connection():
    return {
        "host": os.getenv("REDIS_HOST", "redis"),
        "port": int(os.getenv("REDIS_PORT", "6379"))
    }

async def log_lines(job, output: str):
    """出力をログに残す（最初と最後の N 行）"""
    if not output:
        return

    lines = [l for l in strip_ansi(output).strip().split('\n') if l]

    if len(lines) > MAX_LOG_LINES * 2:
        for line in lines[:MAX_LOG_LINES]:
            await job.log(line)
        await job.log(f"... {len(lines) - MAX_LOG_LINES * 2} lines truncated ...")
        for line in lines[-MAX_LOG_LINES:]:
            await job.log(line)
    else:
        for line in lines:
            await job.log(line)

async def handler(job, token):
    """ジョブを処理するハンドラー"""
    url = job.data.get("url")

    if not url:
        await job.log("Error: url is missing")
        return {"status": "error", "message": "url is required"}

    await job.log(f"Starting gamdl for {url}")

    try:
        stdout, stderr = run_gamdl(url)

        # stdout と stderr を両方ログに残す
        await log_lines(job, stdout)
        await log_lines(job, stderr)

        await job.log("Completed successfully")
        return {"status": "completed", "url": url}

    except subprocess.CalledProcessError as e:
        await log_lines(job, e.stdout)
        await log_lines(job, e.stderr)
        await job.log(f"Failed with exit code {e.returncode}")
        raise e
    except Exception as e:
        await job.log(f"Error: {str(e)}")
        raise e

async def main():
    worker = Worker(
        "default",
        handler,
        {"connection": get_redis_connection()}
    )

    print("Worker started, waiting for jobs...")

    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
