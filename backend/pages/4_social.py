import streamlit as st
from utils.social import fetch_reddit_posts, fetch_bluesky_posts, get_social_feed
from utils.styles import inject_css

st.set_page_config(page_title="Social Media", page_icon="📱", layout="wide")
inject_css()

st.title("📱 Social Media")
st.caption("Lo que se dice sobre los Dodgers en redes sociales")


def render_post(source_icon, source, author, text, score, comments, date_str, url, title=""):
    with st.container(border=True):
        st.caption(f"{source_icon} {source} · {author} · {date_str}")
        if title:
            st.markdown(f"**[{title}]({url})**")
        if text:
            t = text[:250] + ("..." if len(text) > 250 else "")
            st.write(t)
        st.caption(f"👍 {score} · 💬 {comments} · [Ver →]({url})")


tab_all, tab_reddit, tab_bluesky = st.tabs(["🌐 Feed Unificado", "🤖 Reddit", "🦋 Bluesky"])

with tab_all:
    if st.button("🔄 Refrescar", key="ref_all"):
        st.cache_data.clear()
    with st.spinner("Cargando feed..."):
        try:
            feed = get_social_feed()
            if feed:
                for p in feed[:30]:
                    si = "🤖" if p["source"] == "Reddit" else "🦋"
                    render_post(si, p["source"], p["author"], p.get("text", ""),
                                p["score"], p["comments"],
                                p["created"].strftime("%d %b %H:%M"),
                                p["url"], p.get("title", ""))
            else:
                st.info("No se encontraron posts")
        except Exception as e:
            st.error(f"Error: {e}")

with tab_reddit:
    c1, c2 = st.columns(2)
    with c1:
        sub = st.selectbox("Subreddit:", ["Dodgers", "baseball", "mlb"])
    with c2:
        sort = st.selectbox("Ordenar:", ["hot", "new", "top"])
    if st.button("🔄 Refrescar", key="ref_r"):
        st.cache_data.clear()
    with st.spinner("Cargando Reddit..."):
        try:
            posts = fetch_reddit_posts(subreddit=sub, sort=sort, limit=20)
            if posts:
                for p in posts:
                    render_post("🤖", f"r/{p['subreddit']}", f"u/{p['author']}",
                                p.get("selftext", ""), p["score"], p["num_comments"],
                                p["created"].strftime("%d %b %H:%M"), p["url"], p["title"])
            else:
                st.info(f"No hay posts en r/{sub}")
        except Exception as e:
            st.error(f"Error: {e}")

with tab_bluesky:
    query = st.text_input("Buscar:", value="Dodgers", placeholder="Buscar en Bluesky...")
    if st.button("🔄 Refrescar", key="ref_b"):
        st.cache_data.clear()
    with st.spinner("Cargando Bluesky..."):
        try:
            posts = fetch_bluesky_posts(query=query, limit=20)
            if posts:
                for p in posts:
                    render_post("🦋", "Bluesky", p["author"],
                                p["text"], p["likes"], p["replies"],
                                p["created"].strftime("%d %b %H:%M"), p["url"])
            else:
                st.info("No se encontraron posts")
        except Exception as e:
            st.error(f"Error: {e}")
