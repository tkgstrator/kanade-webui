from multiprocessing import Process
import subprocess
import os

def start_flask():
    if os.getenv("ENV") == "production":
        subprocess.run([
            "gunicorn",
            "--bind", "0.0.0.0:5000",
            "--workers", "4",
            "app:app"
        ])
    else:
        subprocess.run(["python", "app.py"])

def start_worker():
    subprocess.run(["python", "worker.py"])

if __name__ == "__main__":
    for target in [start_flask, start_worker]:
        p = Process(target=target)
        p.start()
