import subprocess
import os

mp3_dir = "public/assets/mp3"

for i in range(1, 5):
    m4a_path = os.path.join(mp3_dir, f"p{i}.m4a")
    mp3_path = os.path.join(mp3_dir, f"p{i}.mp3")
    if os.path.exists(m4a_path):
        print(f"Converting {m4a_path} to {mp3_path}...")
        cmd = [
            "ffmpeg", "-y",
            "-i", m4a_path,
            "-c:a", "libmp3lame",
            "-b:a", "128k",
            mp3_path
        ]
        subprocess.run(cmd, check=True)
        print(f"Done: {mp3_path} ({os.path.getsize(mp3_path)} bytes)")
    else:
        print(f"Warning: {m4a_path} not found")

print("All podcasts converted to MP3.")
