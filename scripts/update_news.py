import json
import os
import re
from datetime import datetime, timezone
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

FEEDS = [
    (
        "Google News",
        "https://news.google.com/rss/search?q=gold%20OR%20XAUUSD%20OR%20Federal%20Reserve%20OR%20CPI%20OR%20NFP%20OR%20USD&hl=en-US&gl=US&ceid=US:en",
    ),
    (
        "Google News",
        "https://news.google.com/rss/search?q=forex%20OR%20dollar%20OR%20Fed&hl=en-US&gl=US&ceid=US:en",
    ),
]


def fetch(url):
    request = Request(
        url,
        headers={"User-Agent": "AI-Trading-Ustoz/1.0"},
    )

    with urlopen(request, timeout=20) as response:
        return response.read()


items = []

for source, url in FEEDS:
    try:
        root = ET.fromstring(fetch(url))

        for item in root.findall(".//item")[:8]:
            title = (item.findtext("title") or "").strip()
            published = (item.findtext("pubDate") or "").strip()
            link = (item.findtext("link") or "").strip()

            if not title:
                continue

            if re.search(
                r"\b(CPI|NFP|FOMC|Fed|interest rate|jobs)\b",
                title,
                re.I,
            ):
                impact = "High"
            else:
                impact = "Medium"

            items.append(
                {
                    "title": title,
                    "source": source,
                    "published": published,
                    "link": link,
                    "impact": impact,
                }
            )

    except Exception as error:
        print("News error:", error)


# Duplicate newslarni olib tashlash
unique = []
seen = set()

for item in items:
    key = item["title"].lower()

    if key not in seen:
        seen.add(key)
        unique.append(item)

items = unique[:12]


analysis = {
    "summary": "Yangiliklar yig‘ildi. AI tahlili tayyorlanmoqda.",
    "xauusd_bias": "Neutral",
    "risk": "Medium",
    "dxy": "Monitor",
}


# OpenAI AI analysis
api_key = os.getenv("OPENAI_API_KEY")

if api_key and items:

    headlines = "\n".join(
        "- " + item["title"]
        for item in items
    )

    prompt = f"""
Sen professional market-news analyst sifatida ishlaysan.

Faqat quyidagi yangilik sarlavhalariga asoslan.

XAUUSD uchun:
- umumiy bias
- risk darajasi
- DXY ehtimoliy yo‘nalishi
- qisqa xulosa

aniq va ehtiyotkor tarzda yoz.

Hech qanday foyda kafolati yoki shaxsiy moliyaviy maslahat bermagin.

Faqat JSON qaytar:

{{
  "summary": "...",
  "xauusd_bias": "Bullish/Bearish/Neutral",
  "risk": "Low/Medium/High",
  "dxy": "Bullish/Bearish/Neutral"
}}

Yangiliklar:

{headlines}
"""

    try:
        import urllib.request

        body = json.dumps(
            {
                "model": "gpt-4.1-mini",
                "input": prompt,
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        with urllib.request.urlopen(
            request,
            timeout=40,
        ) as response:

            data = json.loads(response.read())

        text = data.get("output_text", "").strip()

        if text:
            ai_result = json.loads(text)

            analysis.update(ai_result)

    except Exception as error:
        print("AI analysis error:", error)


output = {
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "items": items,
    "analysis": analysis,
}


with open(
    "news.json",
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        output,
        file,
        ensure_ascii=False,
        indent=2,
    )

print("AI Trading Ustoz news updated successfully.")
