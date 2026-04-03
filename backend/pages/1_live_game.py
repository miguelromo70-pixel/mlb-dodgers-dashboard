import streamlit as st
import time
from utils import mlb_api
from utils.styles import inject_css

st.set_page_config(page_title="Juego en Vivo", page_icon="📺", layout="wide")
inject_css()

st.title("📺 Juego en Vivo")
st.caption("Sigue el juego pitch a pitch en tiempo real")

# Selector
games = mlb_api.get_todays_games()
if not games:
    st.info("No hay juegos programados para hoy")
    st.stop()

dodgers_game = None
game_options = {}
for g in games:
    label = f"{g['away_name']} @ {g['home_name']} ({g['status']})"
    game_options[label] = g["game_id"]
    if g["home_id"] == mlb_api.DODGERS_ID or g["away_id"] == mlb_api.DODGERS_ID:
        dodgers_game = label

default_idx = list(game_options.keys()).index(dodgers_game) if dodgers_game else 0
c1, c2 = st.columns([5, 1])
with c1:
    selected = st.selectbox("Juego:", list(game_options.keys()), index=default_idx)
with c2:
    auto_refresh = st.toggle("Auto 30s", value=True)

game_id = game_options[selected]
try:
    game_data = mlb_api.get_live_game_data(game_id)
except Exception as e:
    st.error(f"Error: {e}")
    st.stop()

game_state = game_data.get("gameData", {}).get("status", {}).get("detailedState", "")
away_team = game_data.get("gameData", {}).get("teams", {}).get("away", {}).get("name", "Away")
home_team = game_data.get("gameData", {}).get("teams", {}).get("home", {}).get("name", "Home")
linescore = mlb_api.get_linescore(game_data)
is_live = game_state in ("In Progress", "Live")

# ─── SCOREBOARD ───
with st.container(border=True):
    if is_live:
        st.error("🔴 EN VIVO")
    elif game_state == "Final":
        st.success("✓ Final")
    else:
        st.info(f"🕐 {game_state}")

    sc1, sc_vs, sc2 = st.columns([2, 1, 2])
    with sc1:
        st.metric(away_team, linescore["teams"]["away"]["runs"])
        st.caption(f"H: {linescore['teams']['away']['hits']} · E: {linescore['teams']['away']['errors']}")
    with sc_vs:
        st.markdown("###")
        inning_text = f"{linescore['inningHalf']} {linescore['currentInningOrdinal']}" if linescore["currentInning"] > 0 else game_state
        st.markdown(f"**{inning_text}**")
    with sc2:
        st.metric(home_team, linescore["teams"]["home"]["runs"])
        st.caption(f"H: {linescore['teams']['home']['hits']} · E: {linescore['teams']['home']['errors']}")

# ─── LINESCORE ───
innings = linescore.get("innings", [])
if innings:
    st.subheader("📊 Linescore")
    import pandas as pd
    header = [str(i + 1) for i in range(len(innings))] + ["R", "H", "E"]
    away_row = [inn.get("away", {}).get("runs", "") for inn in innings]
    away_row += [linescore["teams"]["away"]["runs"], linescore["teams"]["away"]["hits"], linescore["teams"]["away"]["errors"]]
    home_row = [inn.get("home", {}).get("runs", "") for inn in innings]
    home_row += [linescore["teams"]["home"]["runs"], linescore["teams"]["home"]["hits"], linescore["teams"]["home"]["errors"]]
    df = pd.DataFrame([away_row, home_row], columns=header, index=[away_team, home_team])
    st.dataframe(df, use_container_width=True)

# ─── COUNT + DIAMOND + MATCHUP ───
if is_live:
    col_count, col_diamond, col_matchup = st.columns(3, gap="large")

    with col_count:
        st.subheader("🎯 Count")
        b = linescore.get("balls", 0)
        s = linescore.get("strikes", 0)
        o = linescore.get("outs", 0)
        with st.container(border=True):
            st.write(f"**Balls:** {'🟢' * b}{'⚪' * (4 - b)}")
            st.write(f"**Strikes:** {'🟡' * s}{'⚪' * (3 - s)}")
            st.write(f"**Outs:** {'🔴' * o}{'⚪' * (3 - o)}")

    with col_diamond:
        st.subheader("💎 Bases")
        runners = mlb_api.get_runners(game_data)
        with st.container(border=True):
            # Diamond visual using columns
            _, d2, _ = st.columns([1, 1, 1])
            with d2:
                if runners["second"]:
                    st.markdown("🔷")
                    st.caption(runners["second"])
                else:
                    st.markdown("◇")

            d3, _, d1 = st.columns(3)
            with d3:
                if runners["third"]:
                    st.markdown("🔷")
                    st.caption(runners["third"])
                else:
                    st.markdown("◇")
            with d1:
                if runners["first"]:
                    st.markdown("🔷")
                    st.caption(runners["first"])
                else:
                    st.markdown("◇")

            _, home_col, _ = st.columns([1, 1, 1])
            with home_col:
                st.markdown("🔶")

    with col_matchup:
        st.subheader("⚔️ Matchup")
        matchup = mlb_api.get_current_matchup(game_data)
        with st.container(border=True):
            m1, m_vs, m2 = st.columns([2, 1, 2])
            with m1:
                st.markdown("### 🏏")
                st.write("**Bateador**")
                st.markdown(f"**{matchup['batter']}**")
            with m_vs:
                st.markdown("###")
                st.write("vs")
            with m2:
                st.markdown("### ⚾")
                st.write("**Pitcher**")
                st.markdown(f"**{matchup['pitcher']}**")

# ─── PLAY-BY-PLAY ───
st.subheader("📋 Últimas Jugadas")
plays = mlb_api.get_play_by_play(game_data, last_n=12)
if plays:
    for play in reversed(plays):
        inning_label = f"{play['inning'][:3].upper()} {play['inning_num']}"
        event = play.get("event", "")
        rbi = f" · +{play['rbi']} RBI" if play.get("rbi", 0) > 0 else ""
        with st.container(border=True):
            c_inn, c_play = st.columns([1, 5])
            with c_inn:
                st.caption(f"**{inning_label}**")
            with c_play:
                st.write(f"**{event}**{rbi}")
                st.caption(play["description"])
else:
    st.info("No hay jugadas registradas aún")

# Auto-refresh
if auto_refresh and is_live:
    time.sleep(30)
    st.rerun()
