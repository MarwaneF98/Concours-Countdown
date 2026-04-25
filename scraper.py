import json
import feedparser
from deep_translator import GoogleTranslator
import os
import re

# قاموس تصحيح المصطلحات لضمان "روح" اللهجة المغربية الإدارية
ARABIC_FIXES = {
    "مسابقة": "مباراة",
    "المسابقة": "المباراة",
    "المدارس الكبيرة": "المدارس العليا",
    "الانتقاء المسبق": "الانتقاء الأولي",
    "عتبات": "عتبات الانتقاء",
    "سلك": "سلك الإجازة",
    "تجميع": "الأقسام التحضيرية",
    "التحضيرية": "الأقسام التحضيرية",
    "إرسال": "إيداع ملف الترشيح"
}

def translate_text(text, target_lang):
    try:
        # التعرف التلقائي على اللغة (لأن Tawjihnet يخلط بين العربي والفرنسي في العناوين)
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        # تطبيق تصحيحاتنا الخاصة إذا كانت الوجهة هي العربية
        if target_lang == 'ar':
            for wrong, right in ARABIC_FIXES.items():
                translated = re.sub(wrong, right, translated)
        return translated
    except Exception:
        return text

def scrape_tawjihnet_rss():
    print("📡 جاري الاتصال بخلاصة Tawjihnet RSS...")
    # الرابط المباشر للبيانات النظيفة في ووردبريس
    rss_url = "https://www.tawjihnet.net/feed/"
    
    try:
        # قراءة البيانات
        feed = feedparser.parse(rss_url)
        news_items = []
        
        print(f"✅ تم العثور على {len(feed.entries)} إعلان جديد.")
        
        # جلب أول 15 إعلان (الأحدث)
        for entry in feed.entries[:15]:
            raw_title = entry.title
            real_link = entry.link
            
            print(f"🔄 معالجة وترجمة: {raw_title[:50]}...")
            
            ar_title = translate_text(raw_title, 'ar')
            en_title = translate_text(raw_title, 'en')
            fr_title = translate_text(raw_title, 'fr')
            
            news_items.append({
                "link": real_link,
                "ar": ar_title,
                "en": en_title,
                "fr": fr_title
            })

        # حفظ الملف النهائي للموقع
        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print(f"\n🚀 نجاح! تم تحديث {len(news_items)} خبراً عبر RSS.")

    except Exception as e:
        print(f"❌ خطأ في الاتصال بالـ RSS: {e}")

if __name__ == "__main__":
    scrape_tawjihnet_rss()
