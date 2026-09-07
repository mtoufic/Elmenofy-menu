import json

SRC = "handoff/Claude-Website-Menu-Handoff-2026-09-07/menu-draft/printed-menu-transcription.json"
OUT = "digital-menu/js/menu-data.js"

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

# Slugify category ids
def slug(en):
    return en.lower().replace(" ", "-").replace("/", "-")

for g in data["groups"]:
    g["id"] = slug(g["en"])

js = "// Auto-generated from menu-draft/printed-menu-transcription.json — do not hand-edit.\n"
js += "// Regenerate from the source JSON if prices/items change.\n"
js += "const MENU_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"

with open(OUT, "w", encoding="utf-8") as f:
    f.write(js)

print("wrote", OUT, len(js), "bytes")
print([ (g['id'], g['en']) for g in data['groups']])
