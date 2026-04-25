import json
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os
import re

# قاموس التصحيح للمصطلحات المغربية لضمان دقة الترجمة
ARABIC_FIXES = {
    "مسابقة": "مباراة",
    "المسابقة": "المباراة",
    "المدارس الكبيرة": "المدارس العليا",
    "الانتقاء المسبق": "الانتقاء الأولي",
    "عتبات": "عتبات الانتقاء",
    "سلك": "سلك الإجازة",
    "تجميع": "الأقسام التحضيرية",
    "الترشيحات": "الترشيح للمباريات",
    "الكتيبة": "الفوج",
    "إرسال": "إيداع ملف الترشيح",
    "التحضيرية": "الأقسام التحضيرية"
}

def translate_text(text, target_lang):
    try:
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        # إذا كانت اللغة الهدف هي العربية، نقوم بتطبيق قاموس التصحيح
        if target_lang == 'ar':
            for wrong, right in ARABIC_FIXES.items():
                translated = re.sub(wrong, right, translated)
        
        return translated
    except Exception as e:
        return text

def scrape_tawjihnet():
    print("جاري جلب الأخبار مع تطبيق قاموس التصحيح المغربي...")
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
        
        for article in articles[:15]:
            link_tag = article.find('a')
            if link_tag:
                raw_title = link_tag.text.strip()
                real_link = link_tag['href']
                
                # ترجمة العناوين
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
            
        print("\nتم تحديث الأخبار بجمال ودقة لغوية!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    scrape_tawjihnet()
