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
    /* 1. Hide Streamlit Chrome */
    #MainMenu, footer, header, .stAppDeployButton { display: none !important; }
    div[data-testid="stToolbar"] { display: none !important; }
    div[data-testid="stDecoration"] { display: none !important; }
    div[data-testid="stStatusWidget"] { display: none !important; }
    header[data-testid="stHeader"] { display: none !important; }
    
    /* 2. Color entire Streamlit canvas with matching sky blue */
    html, body, .stApp, [data-testid="stAppViewContainer"], section.main, .main {
        background: #90C8DD !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        overflow-x: hidden !important;
    }

    /* 3. Strip all padding from the main block container */
    .main .block-container, div[data-testid="stMainBlockContainer"], section[data-testid="stMain"] > div {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        margin: 0 !important;
        max-width: 100vw !important;
        width: 100vw !important;
    }

    div[data-testid="stVerticalBlock"], div[data-testid="stVerticalBlockBorderWrapper"] {
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* 4. Full 100vw breakout eliminates any side gutters */
    div[data-testid="stCustomComponentV1"], div.stCustomComponentV1 {
        width: 100vw !important;
        position: relative !important;
        left: 50% !important;
        right: 50% !important;
        margin-left: -50vw !important;
        margin-right: -50vw !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding: 0 !important;
    }

    div[data-testid="stCustomComponentV1"] iframe, div.stCustomComponentV1 iframe {
        width: 100vw !important;
        height: 100vh !important;
        min-height: 100vh !important;
        border: none !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
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
