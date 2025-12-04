import subprocess

def run_gamdl(url: str):
    result = subprocess.run(
        ["gamdl", "--config-path", "config.ini", url],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout, result.stderr
