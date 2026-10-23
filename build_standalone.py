import os
import base64
import re

base_dir = r"c:\Users\DELL\Downloads\New folder\hackathon-project-team-TRIAD"
dist_dir = os.path.join(base_dir, "dist")
index_html = os.path.join(dist_dir, "index.html")

with open(index_html, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Base64 encode hero-diorama.png
hero_path = os.path.join(dist_dir, "hero-diorama.png")
hero_b64 = ""
if os.path.exists(hero_path):
    with open(hero_path, "rb") as f:
        hero_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    print("Encoded hero-diorama.png to base64, length:", len(hero_b64))

# 2. Read and inline CSS
css_file = os.path.join(dist_dir, "assets", "index-BxyZoryv.css")
with open(css_file, "r", encoding="utf-8") as f:
    css_content = f.read()

# Replace <link rel="stylesheet"...> with <style>...</style>
reset_style = "<style>html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-height: 100vh !important; background: #90C8DD !important; }</style>"
content = re.sub(
    r'<link rel="stylesheet"[^>]*href="/assets/[^"]+\.css"[^>]*>',
    lambda m: f'{reset_style}\n<style>{css_content}</style>',
    content
)

# 3. Read and inline JS
js_file = os.path.join(dist_dir, "assets", "index-B4XZ_cTj.js")
with open(js_file, "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace /hero-diorama.png reference in JS
if hero_b64:
    js_content = js_content.replace('"/hero-diorama.png"', f'"{hero_b64}"')
    js_content = js_content.replace("'/hero-diorama.png'", f"'{hero_b64}'")

# Replace <script type="module" crossorigin src="/assets/index-...js"></script> with inline script
content = re.sub(
    r'<script type="module"[^>]*src="/assets/[^"]+\.js"[^>]*></script>',
    lambda m: f'<script type="module">{js_content}</script>',
    content
)

out_html = os.path.join(dist_dir, "standalone.html")
with open(out_html, "w", encoding="utf-8") as f:
    f.write(content)

print("Created standalone.html successfully! Size:", os.path.getsize(out_html), "bytes")
