import json
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os

def translate_text(text, target_lang):
    try:
        # استخدام مترجم جوجل
        return GoogleTranslator(source='ar', target=target_lang).translate(text)
    except Exception as e:
        return text

def scrape_tawjihnet():
    print("جاري جلب جميع الأخبار والروابط الحقيقية من Tawjihnet...")
    url = "https://www.tawjihnet.net/actualites/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        news_items = []
        # استهداف جميع العناوين في الصفحة
        articles = soup.find_all('h2', class_='entry-title')
        
        print(f"تم العثور على {len(articles)} خبراً. جاري الترجمة واستخراج الروابط...")
        
        # إزالة التحديد السابق [:10] لجلب كل شيء
        for article in articles:
            link_tag = article.find('a')
            if link_tag:
                ar_title = link_tag.text.strip()
                real_link = link_tag['href'] # استخراج الرابط الحقيقي للخبر
                
                print(f"-> {ar_title}")
                en_title = translate_text(ar_title, 'en')
                fr_title = translate_text(ar_title, 'fr')
                
                news_items.append({
                    "link": real_link,
                    "ar": ar_title,
                    "en": en_title,
                    "fr": fr_title
                })

        # حفظ الملف في نفس مسار السكريبت
        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print("\nنجاح! تم استخراج جميع الأخبار الحقيقية وحفظها في tawjihnet_news.json")

    except Exception as e:
        print(f"فشل الاتصال أو الاستخراج: {e}")

if __name__ == "__main__":
    scrape_tawjihnet()
