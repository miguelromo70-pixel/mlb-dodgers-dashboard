import streamlit as st


def inject_css():
    """Inyecta CSS mínimo para mejorar la apariencia."""
    st.html("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    .stApp { font-family: 'Inter', sans-serif !important; }
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0d1220 0%, #111827 100%) !important;
    }
    header[data-testid="stHeader"] { background: transparent !important; }
    #MainMenu, footer { visibility: hidden; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    </style>
    """)
