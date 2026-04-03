import streamlit as st
import os
from dotenv import load_dotenv
from utils.chat_agent import chat
from utils.styles import inject_css

load_dotenv()

st.set_page_config(page_title="Chat MLB", page_icon="💬", layout="wide")
inject_css()

st.title("💬 Chat MLB")
st.caption("Pregúntame sobre cualquier jugador, equipo o estadística de la MLB")

# Verificar API key
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key or api_key == "tu_api_key_aqui":
    st.warning("🔑 Configura tu ANTHROPIC_API_KEY en el archivo .env")
    st.stop()

# Inicializar historial
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "chat_api_messages" not in st.session_state:
    st.session_state.chat_api_messages = []

# Sugerencias
if not st.session_state.chat_messages:
    st.write("**Prueba preguntar:**")
    sug_cols = st.columns(3)
    suggestions = [
        "¿Cuántos años tiene Ohtani?",
        "Stats de Freddie Freeman 2024",
        "¿Cómo van los Dodgers en el standing?",
    ]
    for i, sug in enumerate(suggestions):
        with sug_cols[i]:
            if st.button(sug, key=f"sug_{i}", use_container_width=True):
                st.session_state.chat_messages.append({"role": "user", "content": sug})
                st.session_state.chat_api_messages.append({"role": "user", "content": sug})
                st.rerun()

# Historial
for msg in st.session_state.chat_messages:
    with st.chat_message(msg["role"], avatar="⚾" if msg["role"] == "assistant" else "👤"):
        st.markdown(msg["content"])

# Input
if prompt := st.chat_input("Ej: ¿Cuántos home runs tiene Ohtani esta temporada?"):
    st.session_state.chat_messages.append({"role": "user", "content": prompt})
    with st.chat_message("user", avatar="👤"):
        st.markdown(prompt)

    st.session_state.chat_api_messages.append({"role": "user", "content": prompt})

    with st.chat_message("assistant", avatar="⚾"):
        with st.spinner("Consultando MLB Stats API..."):
            try:
                response_text, updated_messages = chat(
                    st.session_state.chat_api_messages,
                    api_key=api_key,
                )
                st.markdown(response_text)
                st.session_state.chat_messages.append({"role": "assistant", "content": response_text})
                st.session_state.chat_api_messages = updated_messages
            except Exception as e:
                st.error(f"Error: {e}")

if st.session_state.chat_messages:
    if st.button("🗑️ Limpiar conversación"):
        st.session_state.chat_messages = []
        st.session_state.chat_api_messages = []
        st.rerun()
