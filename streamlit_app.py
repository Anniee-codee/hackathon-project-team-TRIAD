import streamlit as st
import os

# Streamlit Page Setup
st.set_page_config(
    page_title="RAASTA — Better Streets",
    page_icon="🛣️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Custom CSS to make Streamlit a full-bleed container with zero margin/padding
st.markdown("""
<style>
    /* Completely hide Streamlit UI Chrome */
    #MainMenu, footer, header, .stAppDeployButton { display: none !important; }
    div[data-testid="stToolbar"] { display: none !important; }
    div[data-testid="stDecoration"] { display: none !important; }
    div[data-testid="stStatusWidget"] { display: none !important; }
    div[data-testid="stHeader"] { display: none !important; }
    
    /* Reset all outer page constraints */
    html, body, .stApp, .main, [data-testid="stAppViewContainer"], section.main {
        background: #FAF8F2 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
    }

    .main .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
    }

    div[data-testid="stVerticalBlock"] {
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Fixed 100vw x 100vh iframe fills the entire browser window */
    div[data-testid="stCustomComponentV1"], div[data-testid="stCustomComponentV1"] > iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 999999 !important;
    }
</style>
""", unsafe_allow_html=True)

# Path to the fully inlined standalone React application
html_file = os.path.join(os.path.dirname(__file__), "dist", "standalone.html")

if os.path.exists(html_file):
    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()
    st.components.v1.html(html_content, height=1150, scrolling=True)
else:
    st.error("Application bundle not found. Please run build_standalone.py first.")
