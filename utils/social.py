import requests
from datetime import datetime


DODGERS_KEYWORDS = ["dodgers", "LAD", "Ohtani", "Shohei", "Freddie Freeman", "Mookie Betts"]

REDDIT_SUBREDDITS = ["Dodgers", "baseball"]


def fetch_reddit_posts(subreddit="Dodgers", sort="hot", limit=15):
    """Obtiene posts de un subreddit usando la API JSON pública."""
    url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={limit}"
    headers = {"User-Agent": "MLBDashboard/1.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        posts = []
        for child in data.get("data", {}).get("children", []):
            post = child.get("data", {})
            created = datetime.fromtimestamp(post.get("created_utc", 0))
            posts.append({
                "title": post.get("title", ""),
                "author": post.get("author", ""),
                "score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "selftext": post.get("selftext", "")[:300],
                "created": created,
                "subreddit": subreddit,
                "source": "Reddit",
            })
        return posts
    except Exception:
        return []


def fetch_all_reddit(subreddits=None):
    """Obtiene posts de múltiples subreddits."""
    if subreddits is None:
        subreddits = REDDIT_SUBREDDITS
    all_posts = []
    for sub in subreddits:
        posts = fetch_reddit_posts(sub)
        all_posts.extend(posts)
    all_posts.sort(key=lambda x: x["created"], reverse=True)
    return all_posts


def fetch_bluesky_posts(query="Dodgers", limit=15):
    """Busca posts públicos en Bluesky sobre un tema."""
    url = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"
    params = {"q": query, "limit": limit, "sort": "latest"}
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        posts = []
        for post in data.get("posts", []):
            record = post.get("record", {})
            author = post.get("author", {})
            created_str = record.get("createdAt", "")
            try:
                created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                created = created.replace(tzinfo=None)
            except (ValueError, AttributeError):
                created = datetime.now()
            posts.append({
                "text": record.get("text", ""),
                "author": author.get("displayName", author.get("handle", "")),
                "handle": author.get("handle", ""),
                "likes": post.get("likeCount", 0),
                "reposts": post.get("repostCount", 0),
                "replies": post.get("replyCount", 0),
                "created": created,
                "source": "Bluesky",
                "url": f"https://bsky.app/profile/{author.get('handle', '')}/post/{post.get('uri', '').split('/')[-1]}",
            })
        return posts
    except Exception:
        return []


def get_social_feed():
    """Obtiene un feed unificado de Reddit y Bluesky."""
    reddit_posts = fetch_all_reddit()
    bluesky_posts = fetch_bluesky_posts("Dodgers")
    bluesky_mlb = fetch_bluesky_posts("MLB Dodgers")

    combined = []
    for post in reddit_posts:
        combined.append({
            "source": "Reddit",
            "subreddit": post.get("subreddit", ""),
            "title": post["title"],
            "text": post.get("selftext", ""),
            "author": post["author"],
            "score": post["score"],
            "comments": post["num_comments"],
            "url": post["url"],
            "created": post["created"],
        })
    for post in bluesky_posts + bluesky_mlb:
        combined.append({
            "source": "Bluesky",
            "subreddit": "",
            "title": "",
            "text": post["text"],
            "author": f"{post['author']} (@{post['handle']})",
            "score": post["likes"],
            "comments": post["replies"],
            "url": post["url"],
            "created": post["created"],
        })

    # Dedup bluesky by URL
    seen = set()
    deduped = []
    for item in combined:
        if item["url"] not in seen:
            seen.add(item["url"])
            deduped.append(item)

    deduped.sort(key=lambda x: x["created"], reverse=True)
    return deduped
