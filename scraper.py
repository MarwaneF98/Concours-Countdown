import json
import feedparser
import google.generativeai as genai
import os

# ضع المفتاح هنا للتجربة السريعة فقط (احذفه قبل رفعه لـ GitHub)
os.environ["GEMINI_API_KEY"] = "AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU"

API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

# استخدام Gemini 1.5 Flash لسرعته الفائقة
model = genai.GenerativeModel('gemini-1.5-flash')

def translate_with_gemini(raw_title):
    prompt = f"""
    أنت خبير في نظام التعليم العالي المغربي (موقع توجيه نت).
    ترجم إعلان المباراة التالي إلى العربية الفصحى الأكاديمية الدقيقة، والإنجليزية، والفرنسية.
    
    القواعد الصارمة:
    - استخدم كلمة 'مباراة' وليس 'مسابقة'.
    - استخدم 'الأقسام التحضيرية' لـ CPGE.
    - استخدم 'المدارس العليا' لـ Grandes Ecoles.
    - إذا كان الإعلان الأصلي بالفرنسية، صغه بعربية مغربية أكاديمية سليمة.
    
    الإعلان: {raw_title}
    
    أرجع فقط كود JSON بهذا الشكل: {{"ar": "...", "en": "...", "fr": "..."}}
    بدون أي نصوص إضافية أو علامات Markdown.
    """
    
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"Gemini error: {e}")
        return {"ar": raw_title, "en": raw_title, "fr": raw_title}

def scrape_tawjihnet_ai():
    print("🧠 جاري استخدام Gemini Flash لتحليل خلاصة Tawjihnet...")
    rss_url = "https://www.tawjihnet.net/feed/"
    
    try:
        feed = feedparser.parse(rss_url)
        news_items = []
        
        # تجربة على أول 5 أخبار فقط للسرعة
        for entry in feed.entries[:5]:
            print(f"🤖 الذكاء الاصطناعي يترجم: {entry.title[:40]}...")
            
            translations = translate_with_gemini(entry.title)
            
            news_items.append({
                "link": entry.link,
                "ar": translations.get("ar", entry.title),
                "en": translations.get("en", entry.title),
                "fr": translations.get("fr", entry.title)
            })

        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print("\n✨ السحر اكتمل! افتح ملف tawjihnet_news.json لترى دقة الترجمة.")

    except Exception as e:
        print(f"حدث خطأ: {e}")

if __name__ == "__main__":
    scrape_tawjihnet_ai()
