import streamlit as st
from dotenv import load_dotenv
from utils import mlb_api
from utils.styles import inject_css
from utils.news import get_dodgers_news
from utils.social import get_social_feed

load_dotenv()

st.set_page_config(page_title="MLB Dashboard — Dodgers", page_icon="⚾", layout="wide")
inject_css()

st.title("⚾ MLB Dashboard")
st.caption("Tu companion para seguir la temporada de los LA Dodgers")

# ─── TOP: Game + Standings ───
col_game, col_standings = st.columns([3, 2], gap="large")

with col_game:
    st.subheader("🏟️ Dodgers Hoy")
    try:
        game = mlb_api.get_dodgers_game_today()
        if game:
            status = game.get("status", "")
            away = game.get("away_name", "")
            home = game.get("home_name", "")
            away_score = game.get("away_score", 0)
            home_score = game.get("home_score", 0)
            is_live = status in ("In Progress", "Live")

            with st.container(border=True):
                if is_live:
                    st.error("🔴 EN VIVO")
                elif status == "Final":
                    st.success("✓ Final")
                else:
                    st.info(f"🕐 {status}")

                sc1, sc_vs, sc2 = st.columns([2, 1, 2])
                with sc1:
                    st.metric(label=away, value=away_score)
                with sc_vs:
                    st.markdown("###")
                    st.markdown("**VS**")
                with sc2:
                    st.metric(label=home, value=home_score)

                if is_live:
                    inning = f"{game.get('inning_state', '')} {game.get('current_inning', '')}"
                    st.caption(f"📍 {inning}")
                    st.page_link("pages/1_live_game.py", label="📺 Ver juego en vivo →")
        else:
            with st.container(border=True):
                st.info("No hay juego de los Dodgers hoy")
    except Exception as e:
        st.error(f"Error: {e}")

with col_standings:
    st.subheader("📊 NL West Standings")
    try:
        standings = mlb_api.get_standings("nl_west")
        if standings:
            with st.container(border=True):
                for i, team in enumerate(standings):
                    is_dod = "Dodgers" in team["name"]
                    icon = "🔵" if is_dod else "⚪"
                    cols = st.columns([0.5, 3, 1.5, 1, 1, 1])
                    cols[0].write(f"**{i+1}**")
                    cols[1].write(f"{icon} **{team['name']}**" if is_dod else f"{icon} {team['name']}")
                    cols[2].write(f"{team['wins']}W-{team['losses']}L")
                    cols[3].write(team['pct'])
                    cols[4].write(f"GB:{team['gb']}")
                    cols[5].write(team['streak'])
                    if i < len(standings) - 1:
                        st.divider()
        else:
            with st.container(border=True):
                st.info("Standings no disponibles")
    except Exception as e:
        st.error(f"Error: {e}")

# ─── SCHEDULE ───
st.subheader("📅 Calendario Reciente")
try:
    schedule = mlb_api.get_schedule(days_back=3, days_ahead=5)
    if schedule:
        game_cols = st.columns(min(len(schedule[:6]), 6))
        for idx, game in enumerate(schedule[:6]):
            with game_cols[idx]:
                with st.container(border=True):
                    status = game.get("status", "")
                    away = game.get("away_name", "")
                    home = game.get("home_name", "")
                    date = game.get("game_date", "")

                    st.caption(date)
                    if status == "Final":
                        st.success("Final", icon="✅")
                        st.write(f"**{away}**")
                        st.markdown(f"### {game.get('away_score', 0)} - {game.get('home_score', 0)}")
                        st.write(f"**{home}**")
                    else:
                        st.info(status, icon="🕐")
                        st.write(f"**{away}**")
                        st.write("@")
                        st.write(f"**{home}**")
    else:
        st.info("No hay juegos programados.")
except Exception as e:
    st.error(f"Error: {e}")

# ─── NEWS + SOCIAL ───
col_news, col_social = st.columns(2, gap="large")

with col_news:
    st.subheader("📰 Noticias Dodgers")
    try:
        articles = get_dodgers_news()
        if articles:
            for article in articles[:5]:
                with st.container(border=True):
                    st.markdown(f"**[{article['title']}]({article['link']})**")
                    summary = article["summary"]
                    for tag in ["<p>", "</p>", "<br>", "<b>", "</b>", "<em>", "</em>", "<br/>", "<br />"]:
                        summary = summary.replace(tag, " ")
                    summary = summary.strip()[:180]
                    st.caption(f"📅 {article['published'].strftime('%d %b %Y')} · {article['source']}")
                    st.write(summary)
        else:
            st.info("Sin noticias de Dodgers")
    except Exception:
        st.warning("Error cargando noticias")
    st.page_link("pages/3_news.py", label="Ver todas las noticias →")

with col_social:
    st.subheader("📱 Social Media")
    try:
        feed = get_social_feed()
        if feed:
            for post in feed[:5]:
                with st.container(border=True):
                    src_icon = "🤖" if post["source"] == "Reddit" else "🦋"
                    st.caption(f"{src_icon} {post['source']} · {post['author']} · {post['created'].strftime('%d %b %H:%M')}")
                    if post.get("title"):
                        st.markdown(f"**[{post['title']}]({post['url']})**")
                    text = post.get("text", "")[:200]
                    if text:
                        st.write(text)
                    st.caption(f"👍 {post['score']} · 💬 {post['comments']}")
        else:
            st.info("Sin posts recientes")
    except Exception:
        st.warning("Error cargando feed")
    st.page_link("pages/4_social.py", label="Ver todo el social feed →")

# ─── QUICK LINKS ───
st.divider()
st.subheader("⚡ Acceso Rápido")
q1, q2, q3, q4 = st.columns(4)
links = [
    (q1, "📺", "Juego en Vivo", "Score, plays, matchups", "pages/1_live_game.py"),
    (q2, "💬", "Chat MLB", "Pregunta sobre jugadores", "pages/2_chat.py"),
    (q3, "📰", "Noticias", "MLB & Dodgers news", "pages/3_news.py"),
    (q4, "📱", "Social Media", "Reddit & Bluesky", "pages/4_social.py"),
]
for col, icon, title, desc, page in links:
    with col:
        with st.container(border=True):
            st.markdown(f"### {icon}")
            st.markdown(f"**{title}**")
            st.caption(desc)
            st.page_link(page, label="Abrir →")
