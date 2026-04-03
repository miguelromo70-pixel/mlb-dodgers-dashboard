import feedparser
from datetime import datetime


MLB_RSS_FEEDS = [
    "https://www.mlb.com/feeds/news/rss.xml",
    "https://www.mlb.com/dodgers/feeds/news/rss.xml",
    "https://www.espn.com/espn/rss/mlb/news",
]

DODGERS_KEYWORDS = [
    "dodgers", "los angeles", "ohtani", "freeman", "betts",
    "buehler", "kershaw", "roberts", "chavez ravine",
    "dodger stadium", "lad",
]


def fetch_news(feeds=None, max_per_feed=20):
    """Obtiene noticias de los RSS feeds."""
    if feeds is None:
        feeds = MLB_RSS_FEEDS
    all_articles = []
    for feed_url in feeds:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:max_per_feed]:
                published = entry.get("published_parsed")
                if published:
                    pub_date = datetime(*published[:6])
                else:
                    pub_date = datetime.now()
                all_articles.append({
                    "title": entry.get("title", ""),
                    "summary": entry.get("summary", ""),
                    "link": entry.get("link", ""),
                    "published": pub_date,
                    "source": feed.feed.get("title", feed_url),
                })
        except Exception:
            continue
    all_articles.sort(key=lambda x: x["published"], reverse=True)
    return all_articles


def filter_dodgers_news(articles):
    """Filtra artículos relacionados con los Dodgers."""
    filtered = []
    for article in articles:
        text = (article["title"] + " " + article["summary"]).lower()
        if any(kw in text for kw in DODGERS_KEYWORDS):
            filtered.append(article)
    return filtered


def get_dodgers_news():
    """Obtiene noticias filtradas de los Dodgers."""
    articles = fetch_news()
    return filter_dodgers_news(articles)


def get_all_mlb_news():
    """Obtiene todas las noticias MLB."""
    return fetch_news()
