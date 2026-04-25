import json
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os

# القاموس السحري: أي كلمة يترجمها جوجل بشكل غبي، نضعها هنا مع بديلها الصحيح
ARABIC_FIXES = {
    # إصلاح كارثة "La" الفرنسية (لا النافية)
    "لا لأقسام": "الأقسام",
    "لا الأقسام": "الأقسام",
    "لا قائمة": "لائحة",
    "لا لوائح": "لوائح",
    "لا ": "الـ ", # للقبض على أي "لا" في بداية الكلمات
    
    # إصلاح المصطلحات التقنية
    "التبرؤز": "التبريز",  # Agrégation
    "التبرؤز:": "التبريز:",
    "مسابقة": "مباراة",
    "المسابقة": "المباراة",
    "مسابقات": "مباريات",
    "المسابقات": "المباريات",
    "المدارس الكبيرة": "المدارس العليا",
    "المدارس العظيمة": "المدارس العليا",
    "الانتقاء المسبق": "الانتقاء الأولي",
    "عتبات": "عتبات الانتقاء",
    "سلك": "سلك الإجازة",
    "تجميع": "الأقسام التحضيرية",
    "الترشيحات": "الترشيح للمباريات",
    "الكتيبة": "الفوج",
    "إرسال": "إيداع ملف الترشيح",
    "التحضيرية": "الأقسام التحضيرية",
    "الباكلوريا": "البكالوريا",
    "المعاهد العالية": "المعاهد العليا"
}

def translate_text(text, target_lang):
    try:
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        # إذا كانت اللغة الهدف هي العربية، نقوم بتطبيق قاموس التصحيح
        if target_lang == 'ar':
            for wrong, right in ARABIC_FIXES.items():
                # نستخدم replace بدلاً من re لضمان دقة الاستبدال مع الحروف العربية
                translated = translated.replace(wrong, right)
            
            # تنظيف أي مسافات مزدوجة قد تنتج عن الاستبدال
            translated = " ".join(translated.split())
            
        return translated
    except Exception as e:
        return text

def scrape_tawjihnet():
    print("جاري جلب الأخبار مع تطبيق قاموس التصحيح المغربي (النسخة المحدثة)...")
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
        
        # نجلب أول 15 إعلان
        for article in articles[:15]:
            link_tag = article.find('a')
            if link_tag:
                raw_title = link_tag.text.strip()
                real_link = link_tag['href']
                
                # ترجمة العناوين وتصحيحها
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
            
        print("\nتم تحديث الأخبار! المشاكل اللغوية ('لا' و 'التبرؤز') قد اختفت.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    scrape_tawjihnet()
