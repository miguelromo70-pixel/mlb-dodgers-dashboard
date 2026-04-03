import streamlit as st
from utils.news import get_dodgers_news, get_all_mlb_news
from utils.styles import inject_css

st.set_page_config(page_title="Noticias MLB", page_icon="📰", layout="wide")
inject_css()

st.title("📰 Noticias MLB")
st.caption("Las últimas noticias de la MLB y los LA Dodgers")

tab_dodgers, tab_all = st.tabs(["🔵 Dodgers", "⚾ Toda la MLB"])


def render_articles(articles, limit=20):
    if not articles:
        st.info("No se encontraron noticias")
        return
    for article in articles[:limit]:
        with st.container(border=True):
            st.markdown(f"**[{article['title']}]({article['link']})**")
            st.caption(f"📅 {article['published'].strftime('%d %b %Y %H:%M')} · {article['source']}")
            summary = article.get("summary", "")
            for tag in ["<p>", "</p>", "<br>", "<b>", "</b>", "<em>", "</em>", "<br/>", "<br />"]:
                summary = summary.replace(tag, " ")
            summary = summary.strip()[:220]
            if summary:
                st.write(summary)


with tab_dodgers:
    if st.button("🔄 Refrescar", key="ref_d"):
        st.cache_data.clear()
    with st.spinner("Cargando noticias Dodgers..."):
        try:
            render_articles(get_dodgers_news())
        except Exception as e:
            st.error(f"Error: {e}")

with tab_all:
    if st.button("🔄 Refrescar", key="ref_a"):
        st.cache_data.clear()
    with st.spinner("Cargando noticias MLB..."):
        try:
            render_articles(get_all_mlb_news(), 25)
        except Exception as e:
            st.error(f"Error: {e}")
