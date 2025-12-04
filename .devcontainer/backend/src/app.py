import asyncio
import os
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
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"error": "url is required"}), 400

    job_info = enqueue("process", {"url": url})
    return jsonify(job_info)

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
