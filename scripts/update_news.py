import json
import os
import re
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import xml.etree.ElementTree as ET


FEEDS = [
    (
        "Google News Gold",
        "https://news.google.com/rss/search?q=XAUUSD%20OR%20gold&hl=en-US&gl=US&ceid=US:en",
    ),
    (
        "Google News Forex",
        "https://news.google.com/rss/search?q=forex%20OR%20USD%20OR%20Federal%20Reserve&hl=en-US&gl=US&ceid=US:en",
    ),
    (
        "Google News Economy",
        "https://news.google.com/rss/search?q=CPI%20OR%20NFP%20OR%20FOMC%20OR%20interest%20rates&hl=en-US&gl=US&ceid=US:en",
    ),
]


def fetch_news(url, retries=3):

    for attempt in range(retries):

        try:

            request = Request(
                url,
                headers={
                    "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/120 Safari/537.36"
                },
            )

            with urlopen(request, timeout=30) as response:
                return response.read()

        except HTTPError as error:

            print(
                f"HTTP error {error.code}, "
                f"attempt {attempt + 1}/{retries}"
            )

        except URLError as error:

            print(
                f"URL error: {error}, "
                f"attempt {attempt + 1}/{retries}"
            )

        time.sleep(3)

    return None


def detect_impact(title):

    if re.search(
        r"\b(CPI|NFP|FOMC|Fed|interest rate|rate decision|jobs)\b",
        title,
        re.I,
    ):
        return "High"

    if re.search(
        r"\b(XAUUSD|gold|USD|dollar|inflation|economy)\b",
        title,
        re.I,
    ):
        return "Medium"

    return "Low"


items = []


for source, url in FEEDS:

    print("Checking:", source)

    data = fetch_news(url)

    if not data:
        continue

    try:

        root = ET.fromstring(data)

        for item in root.findall(".//item")[:10]:

            title = (
                item.findtext("title")
                or ""
            ).strip()

            published = (
                item.findtext("pubDate")
                or ""
            ).strip()

            link = (
                item.findtext("link")
                or ""
            ).strip()

            if not title:
                continue

            items.append(
                {
                    "title": title,
                    "source": source,
                    "published": published,
                    "link": link,
                    "impact": detect_impact(title),
                }
            )

    except Exception as error:

        print("RSS parsing error:", error)


# Duplicate newslarni olib tashlash

unique = []
seen = set()

for item in items:

    key = item["title"].lower()

    if key in seen:
        continue

    seen.add(key)
    unique.append(item)


items = unique[:20]


print("News found:", len(items))


# Default analysis

analysis = {
    "summary":
        "Hozircha yetarli yangilik topilmadi.",
    "xauusd_bias":
        "Neutral",
    "risk":
        "Medium",
    "dxy":
        "Monitor",
}


# AI ANALYSIS

api_key = os.getenv("OPENAI_API_KEY")


if api_key and items:

    headlines = "\n".join(
        "- " + item["title"]
        for item in items
    )

    prompt = f"""
Sen professional market-news analystisan.

Quyidagi REAL yangilik sarlavhalarini tahlil qil.

Maqsad:
XAUUSD uchun bozor kontekstini aniqlash.

Quyidagilarni bahola:

1. XAUUSD bias
2. Risk
3. DXY yo‘nalishi
4. Eng muhim yangilik
5. Qisqa sabab

Faqat quyidagi JSON formatida javob ber:

{{
  "summary": "...",
  "xauusd_bias": "Bullish",
  "risk": "High",
  "dxy": "Bearish"
}}

Bias faqat:

Bullish
Bearish
Neutral

Risk faqat:

Low
Medium
High

DXY faqat:

Bullish
Bearish
Neutral

Hech qanday foyda kafolati bermagin.

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
                "Authorization":
                    f"Bearer {api_key}",

                "Content-Type":
                    "application/json",
            },
        )


        with urllib.request.urlopen(
            request,
            timeout=60,
        ) as response:

            response_data = json.loads(
                response.read()
            )


        ai_text = (
            response_data
            .get("output_text", "")
            .strip()
        )


        print("AI response received.")


        if ai_text:

            ai_result = json.loads(
                ai_text
            )

            analysis.update(
                ai_result
            )

    except Exception as error:

        print(
            "AI analysis error:",
            error
        )


# Save result

output = {

    "updated_at":
        datetime.now(
            timezone.utc
        ).isoformat(),

    "items":
        items,

    "analysis":
        analysis,
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


if items:

    print(
        "SUCCESS: News and analysis updated."
    )

else:

    print(
        "WARNING: No news sources returned data."
    )
