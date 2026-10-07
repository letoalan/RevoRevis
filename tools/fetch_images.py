import urllib.request
import json
import urllib.parse
import os
import time
from PIL import Image
import io
import re

os.makedirs("public/assets/img", exist_ok=True)

# List of queries that are still needed
search_queries = [
    ("Interieur d un comite revolutionnaire Fragonard", "comite_revolutionnaire.webp"),
    ("Jacques-Louis David The Coronation of Napoleon Louvre", "sacre_napoleon.webp"),
    ("Bataille d Austerlitz Francois Gerard Versailles", "bataille_austerlitz.webp")
]

headers = {'User-Agent': 'RevoRevisEducationalSite/1.0 (History revision for highschool students; contact: alano@example.com)'}

credits_file = "public/credits.json"
credits_data = []
if os.path.exists(credits_file):
    try:
        with open(credits_file, "r", encoding="utf-8") as f:
            credits_data = json.load(f)
    except Exception:
        credits_data = []

existing_files = {item.get("file") for item in credits_data}

for query, filename in search_queries:
    out_path = os.path.join("public", "assets", "img", filename)
    rel_path = f"assets/img/{filename}"
    if os.path.exists(out_path) and rel_path in existing_files:
        print(f"Skipping {filename}, already exists.")
        continue

    print(f"Searching for: {query}")
    time.sleep(2)
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json&srlimit=1"
    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            results = res.get("query", {}).get("search", [])
            if not results:
                print(f"  No results for {query}")
                continue
            title = results[0]["title"]
            print(f"  Found title: {title}")

            time.sleep(2)
            info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json"
            req_info = urllib.request.Request(info_url, headers=headers)
            with urllib.request.urlopen(req_info) as info_res:
                info_data = json.loads(info_res.read().decode())
                pages = info_data["query"]["pages"]
                page_id = list(pages.keys())[0]
                image_info = pages[page_id]["imageinfo"][0]
                img_download_url = image_info.get("thumburl") or image_info.get("url")
                
                extmeta = image_info.get("extmetadata", {})
                artist = extmeta.get("Artist", {}).get("value", "Domaine Public")
                clean_artist = re.sub('<[^<]+?>', '', artist) if artist else "Inconnu"
                
                print(f"  Downloading from: {img_download_url}")
                time.sleep(2)
                img_req = urllib.request.Request(img_download_url, headers=headers)
                with urllib.request.urlopen(img_req) as img_resp:
                    img_bytes = img_resp.read()
                    
                    im = Image.open(io.BytesIO(img_bytes))
                    if im.mode in ("RGBA", "P"):
                        im = im.convert("RGB")
                    
                    max_dim = 960
                    if im.width > max_dim or im.height > max_dim:
                        im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                        
                    im.save(out_path, "WEBP", quality=82)
                    size_kb = os.path.getsize(out_path) / 1024
                    print(f"  Saved to {out_path} ({size_kb:.1f} KB)")
                    
                    credits_data.append({
                        "file": rel_path,
                        "title": query,
                        "commons_title": title,
                        "artist": clean_artist.strip(),
                        "source_url": image_info.get("descriptionurl", ""),
                        "license": extmeta.get("LicenseShortName", {}).get("value", "Public Domain"),
                        "date": extmeta.get("DateTimeOriginal", {}).get("value", "Époque contemporaine / Consulat / Empire")
                    })
    except Exception as e:
        print(f"  Error processing {query}: {e}")

with open(credits_file, "w", encoding="utf-8") as f:
    json.dump(credits_data, f, indent=2, ensure_ascii=False)
print("Finished! credits.json updated.")
