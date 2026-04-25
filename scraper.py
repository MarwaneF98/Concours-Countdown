import json
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os

def translate_text(text, target_lang):
    try:
        # استخدام خاصية التعرف التلقائي على اللغة (source='auto')
        return GoogleTranslator(source='auto', target=target_lang).translate(text)
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
        articles = soup.find_all('h2', class_='entry-title')
        
        print(f"تم العثور على {len(articles)} خبراً. جاري معالجة اللغات...")
        
        for article in articles:
            link_tag = article.find('a')
            if link_tag:
                raw_title = link_tag.text.strip() # النص الأصلي (قد يكون فرنسي أو عربي)
                real_link = link_tag['href']
                
                print(f"-> النص الأصلي: {raw_title}")
                
                # إجبار الترجمة لكل لغة بناءً على التعرف التلقائي
                ar_title = translate_text(raw_title, 'ar')
                en_title = translate_text(raw_title, 'en')
                fr_title = translate_text(raw_title, 'fr')
                
                news_items.append({
                    "link": real_link,
                    "ar": ar_title,
                    "en": en_title,
                    "fr": fr_title
                })

        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print("\nنجاح! تم ضبط اللغات وحفظها في tawjihnet_news.json")

    except Exception as e:
        print(f"فشل الاتصال أو الاستخراج: {e}")

if __name__ == "__main__":
    scrape_tawjihnet()
