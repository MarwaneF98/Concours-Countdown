import json
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os

def translate_text(text, target_lang):
    try:
        translated = GoogleTranslator(source='ar', target=target_lang).translate(text)
        return translated
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def scrape_tawjihnet():
    print("Fetching and translating latest updates from Tawjihnet...")
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
        
        # We process the top 10 articles
        for article in articles[:10]:
            link_tag = article.find('a')
            if link_tag:
                ar_title = link_tag.text.strip()
                link = link_tag['href']
                
                print(f"Translating: {ar_title}")
                en_title = translate_text(ar_title, 'en')
                fr_title = translate_text(ar_title, 'fr')
                
                news_items.append({
                    "link": link,
                    "ar": ar_title,
                    "en": en_title,
                    "fr": fr_title
                })

        # Save to JSON in the root directory
        filepath = os.path.join(os.path.dirname(__file__), 'tawjihnet_news.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print("News successfully translated and saved to tawjihnet_news.json!")

    except Exception as e:
        print(f"Scraping failed: {e}")

if __name__ == "__main__":
    scrape_tawjihnet()
