import subprocess
import os

os.makedirs("public/assets/mp3", exist_ok=True)

# Generate a pleasant educational audio podcast track (chords/bell tones) of 20 seconds for each episode
episodes = [
    ("p1.mp3", 440, "Épisode 1 : 1789-1791 - La fin de l'Ancien Régime et la Monarchie constitutionnelle"),
    ("p2.mp3", 523, "Épisode 2 : 1791-1792 - La chute de la royauté et l'avènement de la République"),
    ("p3.mp3", 392, "Épisode 3 : 1793-1799 - La République en péril : Terreur et Directoire"),
    ("p4.mp3", 659, "Épisode 4 : 1799-1815 - Du Consulat à l'Empire : L'ordre napoléonien")
]

for filename, base_freq, title in episodes:
    out_file = os.path.join("public", "assets", "mp3", filename)
    # Generate a rich chime audio intro and background tone using ffmpeg
    # A melodic 15-second progression with fade in/out
    filter_expr = (
        f"sine=frequency={base_freq}:duration=18[a]; "
        f"sine=frequency={int(base_freq*1.25)}:duration=18[b]; "
        f"sine=frequency={int(base_freq*1.5)}:duration=18[c]; "
        f"[a][b][c]amix=inputs=3[mix]; "
        f"[mix]afade=t=in:ss=0:d=1,afade=t=out:st=16:d=2,volume=0.35"
    )
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"sine=frequency={base_freq}:duration=18",
        "-filter_complex", filter_expr,
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        "-metadata", f"title={title}",
        "-metadata", "artist=RevoRevis - Podcast Histoire 1ère",
        out_file
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated {out_file} ({os.path.getsize(out_file)} bytes)")

print("All audio files generated successfully.")
