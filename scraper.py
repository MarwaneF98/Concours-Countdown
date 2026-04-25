import json
import feedparser
import google.generativeai as genai
import os
import re
import time  # <-- Added this to handle the API speed limit

# Get the API key securely from GitHub Secrets
API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY or API_KEY == "AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU":
    print("❌ ERROR: Gemini API Key is missing! The script will fall back to original text.")
else:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash')

def translate_with_gemini(raw_title):
    if not API_KEY or API_KEY == "ضع_مفتاحك_هنا":
        return {"ar": raw_title, "en": raw_title, "fr": raw_title}

    prompt = f"""
    Translate this Moroccan exam announcement into formal Arabic, English, and French.
    Context: Moroccan Tawjihnet.
    Terms: 'Concours' = 'مباراة', 'CPGE' = 'الأقسام التحضيرية'.
    Headline: {raw_title}
    
    Return ONLY a JSON dictionary exactly like this:
    {{"ar": "...", "en": "...", "fr": "..."}}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Extract JSON safely
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
            return json.loads(clean_json)
        else:
            raise ValueError("No valid JSON found in Gemini response.")
            
    except Exception as e:
        print(f"⚠️ Translation failed: {e}")
        # Fallback to original text if AI is blocked or fails
        return {"ar": raw_title, "en": raw_title, "fr": raw_title}

def scrape_tawjihnet_ai():
    print("🧠 Starting Gemini AI Scraper...")
    rss_url = "https://www.tawjihnet.net/feed/"
    
    try:
        feed = feedparser.parse(rss_url)
        news_items = []
        
        entries = feed.entries[:15]
        print(f"✅ Found {len(entries)} items to translate.")
        
        for index, entry in enumerate(entries):
            print(f"🤖 Processing {index + 1}/15: {entry.title[:40]}...")
            
            translations = translate_with_gemini(entry.title)
            
            news_items.append({
                "link": entry.link,
                "ar": translations.get("ar", entry.title),
                "en": translations.get("en", entry.title),
                "fr": translations.get("fr", entry.title)
            })
            
            # THE FIX: Wait 4 seconds to avoid hitting the free API speed limit
            if index < len(entries) - 1:
                time.sleep(4)

        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print(f"\n✨ Success! Saved {len(news_items)} translated items to tawjihnet_news.json.")

    except Exception as e:
        print(f"❌ Scraper failed: {e}")

if __name__ == "__main__":
    scrape_tawjihnet_ai()
