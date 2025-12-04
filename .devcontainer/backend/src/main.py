from multiprocessing import Process
import subprocess
import os

# スクリプトのディレクトリを取得
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def start_flask():
    if os.getenv("ENV") == "production":
        subprocess.run([
            "gunicorn",
            "--bind", "0.0.0.0:5000",
            "--workers", "4",
            "--chdir", SCRIPT_DIR,
            "app:app"
        ])
    else:
        subprocess.run(["python", os.path.join(SCRIPT_DIR, "app.py")])

def start_worker():
    subprocess.run(["python", os.path.join(SCRIPT_DIR, "worker.py")])

if __name__ == "__main__":
    processes = []
    for target in [start_flask, start_worker]:
        p = Process(target=target)
        p.start()
        processes.append(p)
    
    # 全プロセスの終了を待つ
    for p in processes:
        p.join()
