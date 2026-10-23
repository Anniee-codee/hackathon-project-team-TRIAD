import streamlit as st
import json
import os
import base64
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="Raasta — Better Streets",
    page_icon="🛣️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Load / initialize session state for persistent reports
if "reports" not in st.session_state:
    st.session_state.reports = [
        {
            "id": "rst-1001",
            "reference": "RST-1001",
            "title": "Deep pothole near Shahrah-e-Faisal service road",
            "description": "Deep road depression in the service lane causing vehicle damage and traffic congestion.",
            "category": "Roads & potholes",
            "location_text": "Shahrah-e-Faisal, Karachi",
            "latitude": 24.8607,
            "longitude": 67.0700,
            "status": "In Progress",
            "created_at": "2026-10-14T09:30:00Z",
            "confirmations_count": 0,
            "has_confirmed": False,
        },
        {
            "id": "rst-1002",
            "reference": "RST-1002",
            "title": "Overflowing drain on main market street",
            "description": "Severely clogged municipal drain overflowing sewage across shopping stalls and main road.",
            "category": "Drainage & sewage",
            "location_text": "Gulshan-e-Iqbal, Karachi",
            "latitude": 24.9180,
            "longitude": 67.0971,
            "status": "Under Review",
            "created_at": "2026-10-17T11:00:00Z",
            "confirmations_count": 6,
            "has_confirmed": False,
        },
        {
            "id": "rst-1003",
            "reference": "RST-1003",
            "title": "Garbage pile beside school gate",
            "description": "Massive uncollected garbage accumulation right outside primary school main entrance.",
            "category": "Garbage",
            "location_text": "Gulberg, Lahore",
            "latitude": 31.5204,
            "longitude": 74.3587,
            "status": "Resolved",
            "created_at": "2026-10-11T08:15:00Z",
            "confirmations_count": 2,
            "has_confirmed": False,
        },
        {
            "id": "rst-1004",
            "reference": "RST-1004",
            "title": "Streetlights out on entire block",
            "description": "All street lamps non-functional on Sector F-7 block causing severe dark spots.",
            "category": "Streetlights",
            "location_text": "F-7, Islamabad",
            "latitude": 33.7294,
            "longitude": 73.0551,
            "status": "Reported",
            "created_at": "2026-10-19T18:45:00Z",
            "confirmations_count": 1,
            "has_confirmed": False,
        },
        {
            "id": "rst-1005",
            "reference": "RST-1005",
            "title": "No water supply for 4 days",
            "description": "Whole lane without municipal water.",
            "category": "Water supply",
            "location_text": "Peoples Colony, Faisalabad",
            "latitude": 31.4187,
            "longitude": 73.0791,
            "status": "Under Review",
            "created_at": "2026-10-20T12:00:00Z",
            "confirmations_count": 3,
            "has_confirmed": False,
        },
        {
            "id": "rst-1006",
            "reference": "RST-1006",
            "title": "Broken footpath tiles",
            "description": "Severely cracked pedestrian tiles making it hazardous for elderly and children.",
            "category": "Other infrastructure",
            "location_text": "Clifton, Karachi",
            "latitude": 24.8138,
            "longitude": 67.0299,
            "status": "Rejected",
            "created_at": "2026-10-08T15:20:00Z",
            "confirmations_count": 0,
            "has_confirmed": False,
        },
    ]

if "status_history" not in st.session_state:
    st.session_state.status_history = {
        "rst-1005": [
            {"status": "Reported", "date": "2026-10-20", "note": "Whole lane without municipal water."},
            {"status": "Under Review", "date": "2026-10-21", "note": "Verification with WASA Faisalabad in progress."}
        ]
    }

if "mod_authenticated" not in st.session_state:
    st.session_state.mod_authenticated = False

if "current_nav" not in st.session_state:
    st.session_state.current_nav = "Home"

if "selected_report_id" not in st.session_state:
    st.session_state.selected_report_id = "rst-1005"

# Custom Styling to match screenshots exactly
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .stApp {
        background: linear-gradient(180deg, #96CBE0 0%, #D8EDF5 30%, #FAF8F2 70%);
        color: #1F2421;
    }

    .raasta-serif {
        font-family: 'Lora', serif;
    }

    /* Status Badges */
    .badge-in-progress {
        color: #7C3AED;
        border: 1px solid #A78BFA;
        background: #FAF5FF;
        padding: 3px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        display: inline-block;
    }
    .badge-under-review {
        color: #2563EB;
        border: 1px solid #60A5FA;
        background: #EFF6FF;
        padding: 3px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        display: inline-block;
    }
    .badge-resolved {
        color: #166534;
        border: 1px solid #4ADE80;
        background: #F0FDF4;
        padding: 3px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        display: inline-block;
    }
    .badge-reported {
        color: #D97706;
        border: 1px solid #FBBF24;
        background: #FFFBEB;
        padding: 3px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        display: inline-block;
    }
    .badge-rejected {
        color: #4B5563;
        border: 1px solid #9CA3AF;
        background: #F9FAFB;
        padding: 3px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        display: inline-block;
    }

    /* Card styling */
    .raasta-card {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #DEE5E0;
        border-radius: 16px;
        padding: 18px 22px;
        margin-bottom: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .stButton>button {
        border-radius: 10px;
        font-weight: 600;
    }

    /* Primary Forest Green button */
    .btn-forest {
        background-color: #1B4D3E !important;
        color: white !important;
    }

    /* Amber button */
    .btn-amber {
        background-color: #EAA235 !important;
        color: white !important;
    }
</style>
""", unsafe_allow_html=True)

# Helper function for status badge HTML
def get_status_badge(status):
    mapping = {
        "In Progress": "badge-in-progress",
        "Under Review": "badge-under-review",
        "Resolved": "badge-resolved",
        "Reported": "badge-reported",
        "Rejected": "badge-rejected",
        "Duplicate": "badge-rejected"
    }
    cls = mapping.get(status, "badge-reported")
    return f'<span class="{cls}">{status}</span>'

# Header & Navigation
col_logo, col_nav = st.columns([1, 2])

with col_logo:
    st.markdown("""
        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #1B4D3E; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(27,77,62,0.25);">
                <span style="color: #F59E0B; font-weight: 900; font-size: 18px;">//</span>
            </div>
            <div>
                <div class="raasta-serif" style="font-weight: 900; font-size: 20px; line-height: 1; color: #1B4D3E; letter-spacing: 0.05em;">RAASTA</div>
                <div style="font-size: 9px; font-weight: 700; color: #2C6955; letter-spacing: 0.2em; text-transform: uppercase;">BETTER STREETS</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

with col_nav:
    nav_cols = st.columns(4)
    with nav_cols[0]:
        if st.button("🏠 Home", key="btn_nav_home", use_container_width=True):
            st.session_state.current_nav = "Home"
            st.rerun()
    with nav_cols[1]:
        if st.button("🗺️ Issue Map", key="btn_nav_map", use_container_width=True):
            st.session_state.current_nav = "Issue Map"
            st.rerun()
    with nav_cols[2]:
        if st.button("📝 Report", key="btn_nav_report", use_container_width=True):
            st.session_state.current_nav = "Report"
            st.rerun()
    with nav_cols[3]:
        if st.button("🛡️ Moderator", key="btn_nav_mod", use_container_width=True):
            st.session_state.current_nav = "Moderator"
            st.rerun()

st.markdown("<hr style='border: none; border-top: 1px solid rgba(222,229,224,0.6); margin: 8px 0 20px 0;'>", unsafe_allow_html=True)

# ==========================================
# PAGE 1: HOME / LANDING PAGE
# ==========================================
if st.session_state.current_nav == "Home":
    hero_left, hero_right = st.columns([1.1, 1])
    
    with hero_left:
        hero_img_path = os.path.join(os.path.dirname(__file__), "public", "hero-diorama.png")
        if os.path.exists(hero_img_path):
            st.image(hero_img_path, use_container_width=True)
        else:
            st.info("Raasta 3D City Diorama")

    with hero_right:
        st.markdown("""
            <div style="padding-top: 20px;">
                <h1 class="raasta-serif" style="font-size: 46px; font-weight: 900; line-height: 1.1; color: #1B4D3E;">
                    Your<br>Neighborhood.<br>Your Voice.<br>Better Streets.
                </h1>
                <p style="color: #2E3832; font-size: 15px; margin-top: 16px; line-height: 1.6;">
                    Report potholes, overflowing drains, garbage and broken streetlights. See what others have reported nearby and follow every update in public.
                </p>
            </div>
        """, unsafe_allow_html=True)
        
        btn_c1, btn_c2 = st.columns(2)
        with btn_c1:
            if st.button("📷 Report an Issue", key="hero_report_btn", use_container_width=True):
                st.session_state.current_nav = "Report"
                st.rerun()
        with btn_c2:
            if st.button("📍 Explore the map", key="hero_map_btn", use_container_width=True):
                st.session_state.current_nav = "Issue Map"
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)
    
    # How Raasta works & Latest reports
    sec_left, sec_right = st.columns(2)
    
    with sec_left:
        st.markdown("""
            <h2 class="raasta-serif" style="font-size: 24px; font-weight: 700; color: #1B4D3E; margin-bottom: 16px;">
                How Raasta works
            </h2>
            <div style="display: flex; flex-direction: column; gap: 14px; font-size: 14px; color: #2E3832;">
                <div>📷 &nbsp;<strong>Snap a photo, pick a category and drop a pin on the map.</strong></div>
                <div>📍 &nbsp;<strong>Raasta shows similar reports nearby so you don't file a duplicate.</strong></div>
                <div>☑️ &nbsp;<strong>Moderators update the status — everyone sees the same public timeline.</strong></div>
            </div>
        """, unsafe_allow_html=True)
        
        # Stats Cards
        st.markdown("<br>", unsafe_allow_html=True)
        sc1, sc2, sc3 = st.columns(3)
        total = len(st.session_state.reports)
        active = sum(1 for r in st.session_state.reports if r["status"] in ["Reported", "Under Review", "In Progress"])
        resolved = sum(1 for r in st.session_state.reports if r["status"] == "Resolved")
        
        with sc1:
            st.markdown(f"""
                <div style="background: white; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #E5E9E4;">
                    <div class="raasta-serif" style="font-size: 28px; font-weight: 700; color: #1B4D3E;">{total}</div>
                    <div style="font-size: 11px; color: #526359; font-weight: 600;">Reports</div>
                </div>
            """, unsafe_allow_html=True)
        with sc2:
            st.markdown(f"""
                <div style="background: white; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #E5E9E4;">
                    <div class="raasta-serif" style="font-size: 28px; font-weight: 700; color: #1B4D3E;">{active}</div>
                    <div style="font-size: 11px; color: #526359; font-weight: 600;">Active</div>
                </div>
            """, unsafe_allow_html=True)
        with sc3:
            st.markdown(f"""
                <div style="background: white; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #E5E9E4;">
                    <div class="raasta-serif" style="font-size: 28px; font-weight: 700; color: #1B4D3E;">{resolved}</div>
                    <div style="font-size: 11px; color: #526359; font-weight: 600;">Resolved</div>
                </div>
            """, unsafe_allow_html=True)
            
        st.caption("Across 4 cities - counted from reports in this demo.")

    with sec_right:
        st.markdown("""
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                <h2 class="raasta-serif" style="font-size: 24px; font-weight: 700; color: #1B4D3E; margin: 0;">
                    Latest reports
                </h2>
            </div>
        """, unsafe_allow_html=True)
        
        for rep in st.session_state.reports[:4]:
            st.markdown(f"""
                <div class="raasta-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
                    <div>
                        <div style="font-weight: 600; font-size: 13.5px; color: #1B4D3E;">{rep['title']}</div>
                        <div style="font-size: 11px; color: #73857B; margin-top: 2px;">{rep['location_text']} - 14/10/2026</div>
                    </div>
                    <div>{get_status_badge(rep['status'])}</div>
                </div>
            """, unsafe_allow_html=True)

    # What you can report
    st.markdown("<br><h2 class='raasta-serif' style='font-size: 24px; font-weight: 700; color: #1B4D3E; margin-bottom: 16px;'>What you can report</h2>", unsafe_allow_html=True)
    cats = [
        ("🚧", "Roads & potholes"),
        ("🌊", "Drainage & sewage"),
        ("🗑️", "Garbage"),
        ("💡", "Streetlights"),
        ("💧", "Water supply"),
        ("🔧", "Other infrastructure")
    ]
    cat_cols = st.columns(3)
    for i, (icon, cname) in enumerate(cats):
        with cat_cols[i % 3]:
            st.markdown(f"""
                <div class="raasta-card" style="display: flex; align-items: center; gap: 14px; padding: 16px;">
                    <span style="font-size: 24px;">{icon}</span>
                    <span style="font-weight: 600; font-size: 14px; color: #1B4D3E; text-decoration: underline;">{cname}</span>
                </div>
            """, unsafe_allow_html=True)

# ==========================================
# PAGE 2: REPORT AN ISSUE
# ==========================================
elif st.session_state.current_nav == "Report":
    r_col1, r_col2 = st.columns([1, 1.1])
    
    with r_col1:
        st.markdown("<h1 class='raasta-serif' style='font-size: 32px; font-weight: 700; color: #1B4D3E;'>Report an issue</h1>", unsafe_allow_html=True)
        
        with st.form("report_form"):
            category = st.selectbox(
                "Category",
                ["Roads & potholes", "Drainage & sewage", "Garbage", "Streetlights", "Water supply", "Other infrastructure"]
            )
            title = st.text_input("Title", placeholder="e.g. Deep pothole outside bakery")
            description = st.text_area("Description", placeholder="Describe the civic issue in detail...")
            address = st.text_input("Area / address", placeholder="e.g. Block 6, Gulshan-e-Iqbal, Karachi")
            photo = st.file_uploader("Photo (JPG/PNG, max 3 MB)", type=["jpg", "png", "jpeg"])
            
            submitted = st.form_submit_button("Submit report", use_container_width=True)
            if submitted:
                if not title.strip() or not description.strip() or not address.strip():
                    st.error("Please fill in title, description, and area.")
                else:
                    ref_code = f"RST-10{len(st.session_state.reports) + 1:02d}"
                    new_item = {
                        "id": ref_code.lower(),
                        "reference": ref_code,
                        "title": title.strip(),
                        "description": description.strip(),
                        "category": category,
                        "location_text": address.strip(),
                        "latitude": 24.8607,
                        "longitude": 67.0700,
                        "status": "Reported",
                        "created_at": datetime.now().strftime("%Y-%m-%d"),
                        "confirmations_count": 0,
                        "has_confirmed": False,
                    }
                    st.session_state.reports.insert(0, new_item)
                    st.success(f"Report filed successfully! Reference: {ref_code}")

    with r_col2:
        st.markdown("<p style='font-size: 13px; font-weight: 600; color: #1F2421; margin-bottom: 6px;'>Click the map to mark the exact location</p>", unsafe_allow_html=True)
        # Leaflet OpenStreetMap iframe
        leaflet_html = """
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <div id="map" style="height: 480px; width: 100%; border-radius: 16px; border: 1px solid #CBD5D0;"></div>
        <script>
            var map = L.map('map').setView([30.3753, 69.3451], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            var marker = L.marker([31.4187, 73.0791]).addTo(map);
            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
            });
        </script>
        """
        st.components.v1.html(leaflet_html, height=500)

# ==========================================
# PAGE 3: ISSUE MAP & EXPLORER
# ==========================================
elif st.session_state.current_nav == "Issue Map":
    st.markdown("<h1 class='raasta-serif' style='font-size: 32px; font-weight: 700; color: #1B4D3E;'>Raasta Issue Map</h1>", unsafe_allow_html=True)
    
    # Filters Bar
    f1, f2, f3, f4 = st.columns([1.5, 1, 1, 1])
    with f1:
        search_q = st.text_input("Search", placeholder="Search area, title or ref...", label_visibility="collapsed")
    with f2:
        cat_filter = st.selectbox(
            "Category",
            ["All categories", "Roads & potholes", "Drainage & sewage", "Garbage", "Streetlights", "Water supply", "Other infrastructure"],
            label_visibility="collapsed"
        )
    with f3:
        status_filter = st.selectbox(
            "Status",
            ["All statuses", "Reported", "Under Review", "In Progress", "Resolved", "Rejected", "Duplicate"],
            label_visibility="collapsed"
        )
    with f4:
        view_mode = st.radio("View", ["Map", "List", "Pulse"], horizontal=True, label_visibility="collapsed")

    # Filtered list
    filtered = st.session_state.reports
    if search_q.strip():
        q = search_q.lower()
        filtered = [r for r in filtered if q in r["title"].lower() or q in r["location_text"].lower() or q in r["reference"].lower()]
    if cat_filter != "All categories":
        filtered = [r for r in filtered if r["category"] == cat_filter]
    if status_filter != "All statuses":
        filtered = [r for r in filtered if r["status"] == status_filter]

    st.caption(f"{len(filtered)} reports")

    # VIEW 1: MAP
    if view_mode == "Map":
        pins_js = ""
        for r in filtered:
            color = "#7C3AED" if r["status"] == "In Progress" else "#2563EB" if r["status"] == "Under Review" else "#166534" if r["status"] == "Resolved" else "#D97706"
            pins_js += f"""
                L.circleMarker([{r['latitude']}, {r['longitude']}], {{
                    color: '{color}',
                    fillColor: '{color}',
                    fillOpacity: 0.85,
                    radius: 8
                }}).addTo(map).bindPopup("<strong>{r['reference']}: {r['title']}</strong><br>{r['location_text']}<br><em>{r['status']}</em>");
            """
        
        map_html = f"""
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <div id="issue_map" style="height: 520px; width: 100%; border-radius: 16px; border: 1px solid #CBD5D0;"></div>
        <script>
            var map = L.map('issue_map').setView([29.5, 69.8], 5.5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {{
                attribution: '&copy; OpenStreetMap'
            }}).addTo(map);
            {pins_js}
        </script>
        """
        st.components.v1.html(map_html, height=540)

    # VIEW 2: LIST (2-Column Grid)
    elif view_mode == "List":
        cols = st.columns(2)
        for idx, rep in enumerate(filtered):
            with cols[idx % 2]:
                st.markdown(f"""
                    <div class="raasta-card">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-weight: 700; font-size: 15px; color: #1B4D3E;">{rep['title']}</div>
                                <div style="font-size: 11.5px; color: #73857B; margin-top: 4px;">
                                    {rep['category']} · {rep['location_text']} · 14/10/2026
                                </div>
                            </div>
                            <div>{get_status_badge(rep['status'])}</div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)

    # VIEW 3: PULSE (Ranked Priority Feed)
    elif view_mode == "Pulse":
        pulse_list = [r for r in st.session_state.reports if r["status"] not in ["Resolved", "Rejected", "Duplicate"]]
        # Score calculation formula
        for r in pulse_list:
            r["score"] = r.get("confirmations_count", 0) * 3 + (6 if r["status"] == "Under Review" else 4)
        pulse_list.sort(key=lambda x: x["score"], reverse=True)

        for i, rep in enumerate(pulse_list):
            p_col1, p_col2 = st.columns([4, 1])
            with p_col1:
                st.markdown(f"""
                    <div class="raasta-card" style="display: flex; align-items: center; gap: 16px;">
                        <span class="raasta-serif" style="font-size: 26px; font-weight: 900; color: #1B4D3E; width: 45px;">#{i+1}</span>
                        <div>
                            <div style="font-weight: 600; font-size: 15px; color: #1F2421;">{rep['title']}</div>
                            <div style="font-size: 11.5px; color: #73857B;">{rep['location_text']} · {rep['confirmations_count']} confirmed</div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
            with p_col2:
                st.markdown(f"""
                    <div style="padding-top: 14px; text-align: right;">
                        <span style="font-weight: 700; font-size: 13.5px; margin-right: 8px;">Score {rep['score']}</span>
                        {get_status_badge(rep['status'])}
                    </div>
                """, unsafe_allow_html=True)
                if st.button("👍 Affects me", key=f"conf_{rep['id']}", use_container_width=True):
                    rep["confirmations_count"] = rep.get("confirmations_count", 0) + 1
                    st.rerun()

# ==========================================
# PAGE 4: MODERATOR DASHBOARD
# ==========================================
elif st.session_state.current_nav == "Moderator":
    if not st.session_state.mod_authenticated:
        st.markdown("<br>", unsafe_allow_html=True)
        login_col1, login_col2, login_col3 = st.columns([1, 1.2, 1])
        with login_col2:
            st.markdown("""
                <div class="raasta-card" style="text-align: center; padding: 32px 24px;">
                    <h2 class="raasta-serif" style="font-size: 28px; font-weight: 700; color: #1B4D3E; margin-bottom: 6px;">Moderator sign in</h2>
                    <p style="font-size: 12px; color: #526359; margin-bottom: 20px;">Demo mode — PIN: <code>raasta2026</code></p>
                </div>
            """, unsafe_allow_html=True)
            pin = st.text_input("PIN", type="password", placeholder="PIN", label_visibility="collapsed")
            if st.button("Sign in", use_container_width=True):
                if pin == "raasta2026":
                    st.session_state.mod_authenticated = True
                    st.rerun()
                else:
                    st.error("Invalid PIN. Use demo PIN: raasta2026")
    else:
        m_head_col, m_out_col = st.columns([4, 1])
        with m_head_col:
            st.markdown("<h1 class='raasta-serif' style='font-size: 32px; font-weight: 700; color: #1B4D3E;'>Moderator dashboard</h1>", unsafe_allow_html=True)
        with m_out_col:
            if st.button("Sign out", key="mod_signout"):
                st.session_state.mod_authenticated = False
                st.rerun()

        m_left, m_right = st.columns([1.1, 1.2])

        with m_left:
            st.markdown("<div class='raasta-card'>", unsafe_allow_html=True)
            m_search = st.text_input("Filter", placeholder="Search...", label_visibility="collapsed")
            m_status = st.selectbox(
                "Filter Status",
                ["All", "Reported", "Under Review", "In Progress", "Resolved", "Rejected", "Duplicate"],
                label_visibility="collapsed"
            )
            
            m_list = st.session_state.reports
            if m_search.strip():
                m_list = [r for r in m_list if m_search.lower() in r["title"].lower() or m_search.lower() in r["reference"].lower()]
            if m_status != "All":
                m_list = [r for r in m_list if r["status"] == m_status]

            for rep in m_list:
                is_selected = st.session_state.selected_report_id == rep["id"]
                bg_color = "#E2EFE7" if is_selected else "#FFFFFF"
                btn_txt = f"{rep['reference']} {rep['title']} — {rep['status']}"
                if st.button(btn_txt, key=f"mod_sel_{rep['id']}", use_container_width=True):
                    st.session_state.selected_report_id = rep["id"]
                    st.rerun()
            st.markdown("</div>", unsafe_allow_html=True)

        with m_right:
            sel_rep = next((r for r in st.session_state.reports if r["id"] == st.session_state.selected_report_id), None)
            if sel_rep:
                st.markdown(f"""
                    <div class="raasta-card">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h3 class="raasta-serif" style="font-size: 22px; font-weight: 700; color: #1F2421; margin: 0;">{sel_rep['title']}</h3>
                                <div style="font-size: 11.5px; color: #73857B; margin-top: 4px;">{sel_rep['reference']} · {sel_rep['category']} · {sel_rep['location_text']}</div>
                            </div>
                            <div>{get_status_badge(sel_rep['status'])}</div>
                        </div>
                        <div style="margin: 16px 0; font-size: 13.5px; color: #2E3832; line-height: 1.5; border-top: 1px solid #EEF2EF; border-bottom: 1px solid #EEF2EF; padding: 10px 0;">
                            {sel_rep['description']}
                        </div>
                    </div>
                """, unsafe_allow_html=True)

                new_st = st.selectbox(
                    "Update status",
                    ["Reported", "Under Review", "In Progress", "Resolved", "Rejected", "Duplicate"],
                    index=["Reported", "Under Review", "In Progress", "Resolved", "Rejected", "Duplicate"].index(sel_rep['status'])
                )
                note = st.text_area("Public progress update", placeholder="Public progress update")
                
                if st.button("Update status", key="save_status_btn"):
                    sel_rep["status"] = new_st
                    st.success(f"Status updated to {new_st}!")
                    st.rerun()
            else:
                st.info("Select a report to review.")

# Footer
st.markdown("<br><hr style='border: none; border-top: 1px solid #DEE5E0; margin: 30px 0 16px 0;'>", unsafe_allow_html=True)
foot_1, foot_2, foot_3 = st.columns(3)
with foot_1:
    st.markdown("<strong>© 2026 Raasta</strong><br><span style='font-size: 11px; color: #73857B;'>Citizen-powered civic reporting for Pakistan.</span>", unsafe_allow_html=True)
with foot_2:
    st.markdown("<strong>Demo mode</strong><br><span style='font-size: 11px; color: #73857B;'>Reports are saved in this browser only. No official government integration.</span>", unsafe_allow_html=True)
with foot_3:
    st.markdown("<div style='text-align: right; font-size: 11px; color: #73857B;'>Map data © OpenStreetMap contributors</div>", unsafe_allow_html=True)
