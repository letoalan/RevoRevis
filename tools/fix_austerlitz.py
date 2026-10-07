import urllib.request
import json
import os
from PIL import Image
import io

title = "File:La bataille d'Austerlitz. 2 decembre 1805 (François Gérard).jpg"
params = urllib.parse.urlencode({
    "action": "query",
    "titles": title,
    "prop": "imageinfo",
    "iiprop": "url|extmetadata",
    "iiurlwidth": 1000,
    "format": "json"
})
url = f"https://commons.wikimedia.org/w/api.php?{params}"
headers = {'User-Agent': 'RevoRevisEducationalSite/1.0 (History educational project; contact: alano@example.com)'}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    pages = data['query']['pages']
    pid = list(pages.keys())[0]
    info = pages[pid]['imageinfo'][0]
    img_url = info.get('thumburl') or info['url']
    img_req = urllib.request.Request(img_url, headers=headers)
    with urllib.request.urlopen(img_req) as img_resp:
        im = Image.open(io.BytesIO(img_resp.read()))
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        im.thumbnail((960, 960), Image.Resampling.LANCZOS)
        out = 'public/assets/img/bataille_austerlitz.webp'
        im.save(out, 'WEBP', quality=82)
        print('Saved Austerlitz successfully! Size:', os.path.getsize(out))

# Update credits.json
credits_file = "public/credits.json"
if os.path.exists(credits_file):
    with open(credits_file, "r", encoding="utf-8") as f:
        credits_data = json.load(f)
    credits_data = [c for c in credits_data if c.get("file") != "assets/img/bataille_austerlitz.webp"]
    credits_data.append({
        "file": "assets/img/bataille_austerlitz.webp",
        "title": "Bataille d'Austerlitz, 2 décembre 1805",
        "commons_title": title,
        "artist": "François Gérard (1770-1837)",
        "source_url": info.get("descriptionurl", "https://commons.wikimedia.org/wiki/File:La_bataille_d%27Austerlitz._2_decembre_1805_(Fran%C3%A7ois_G%C3%A9rard).jpg"),
        "license": "Public Domain",
        "date": "1810"
    })
    with open(credits_file, "w", encoding="utf-8") as f:
        json.dump(credits_data, f, indent=2, ensure_ascii=False)
print("Austerlitz credits updated.")
