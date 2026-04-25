import json
import feedparser
import google.generativeai as genai
import os

# 1. Setup Gemini
# We get the key from the system environment for security
API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def translate_with_gemini(raw_title):
    prompt = f"""
    You are an expert in the Moroccan educational system (Tawjihnet context).
    Translate this Moroccan exam announcement into perfectly accurate Arabic, English, and French.
    
    Rules:
    - Use 'مباراة' instead of 'مسابقة'.
    - Use 'الأقسام التحضيرية' for CPGE.
    - Use 'المدارس العليا' for Grandes Ecoles.
    - Ensure the Arabic version uses formal Moroccan academic terminology.
    - If the input is in French, translate it to proper Arabic and English.
    
    Announcement: {raw_title}
    
    Return ONLY a JSON object with these keys: "ar", "en", "fr". 
    No extra text or markdown.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean the response in case Gemini adds ```json markdown blocks
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"Gemini error: {e}")
        # Fallback if AI fails
        return {"ar": raw_title, "en": raw_title, "fr": raw_title}

def scrape_tawjihnet_ai():
    print("🧠 Using Gemini Flash to process Tawjihnet RSS...")
    rss_url = "[https://www.tawjihnet.net/feed/](https://www.tawjihnet.net/feed/)"
    
    try:
        feed = feedparser.parse(rss_url)
        news_items = []
        
        # Process the top 12 latest news
        for entry in feed.entries[:12]:
            print(f"🤖 AI Analyzing: {entry.title[:40]}...")
            
            # Gemini gives us all 3 languages in one call!
            translations = translate_with_gemini(entry.title)
            
            news_items.append({
                "link": entry.link,
                "ar": translations.get("ar"),
                "en": translations.get("en"),
                "fr": translations.get("fr")
            })

        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print("\n✨ Success! Website news updated with AI precision.")

    except Exception as e:
        print(f"Scraper failed: {e}")

if __name__ == "__main__":
    if not API_KEY:
        print("❌ Error: GEMINI_API_KEY not found in environment.")
    else:
        scrape_tawjihnet_ai()
