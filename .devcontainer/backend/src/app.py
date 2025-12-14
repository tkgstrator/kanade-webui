import asyncio
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from bullmq import Queue

app = Flask(__name__)
CORS(app)

async def add_job(name: str, data: dict):
    queue = Queue("default", {
      "connection": {
        "host": os.getenv("REDIS_HOST", "redis"),
        "port": int(os.getenv("REDIS_PORT", "6379"))
      }
    })
    job = await queue.add(name, data)
    return {
        "id": job.id,
        "name": job.name,
        "data": job.data,
        "timestamp": job.timestamp
    }

def enqueue(name: str, data: dict):
    return asyncio.run(add_job(name, data))

@app.route('/api/queues', methods=['POST'])
def create_job():
    data = request.get_json() or {}

    album_id = data.get('album_id')
    options = data.get('options')

    if album_id is None:
        return jsonify({"error": "album_id is required"}), 400

    try:
        album_id = int(album_id)
    except (TypeError, ValueError):
        return jsonify({"error": "album_id must be an integer"}), 400

    if options is None:
        overwrite = True
    elif isinstance(options, dict):
        overwrite = options.get('overwrite', False)
    else:
        return jsonify({"error": "options must be an object"}), 400

    if isinstance(overwrite, str):
        overwrite = overwrite.lower() in ['true', '1', 'yes', 'on']
    else:
        overwrite = bool(overwrite)

    job_info = enqueue("process", {"url": f"https://music.apple.com/jp/album/{album_id}" })
    return jsonify(job_info)

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
