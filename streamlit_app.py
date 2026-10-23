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
    #MainMenu {visibility: hidden !important;}
    footer {visibility: hidden !important;}
    header {visibility: hidden !important;}
    .stAppDeployButton {display:none !important;}
    div[data-testid="stToolbar"] {visibility: hidden !important;}
    div[data-testid="stDecoration"] {visibility: hidden !important;}
    div[data-testid="stStatusWidget"] {visibility: hidden !important;}
    
    .stApp {
        background: #FAF8F2 !important;
    }

    .main .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 100% !important;
    }

    iframe {
        width: 100% !important;
        height: 100vh !important;
        min-height: 1050px !important;
        border: none !important;
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
