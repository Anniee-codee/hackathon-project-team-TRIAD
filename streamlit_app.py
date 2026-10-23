import os
import uuid
import datetime
import pandas as pd
import streamlit as st

# Configure Page
st.set_page_config(
    page_title="Raasta — Civic Issue Reporting",
    page_icon="🚧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 16px;
        border-radius: 10px;
        margin-bottom: 10px;
    }
    .status-badge {
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# Supabase Initialization (optional remote backend or local mock state)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Try reading from streamlit secrets safely
try:
    if not SUPABASE_URL and hasattr(st, "secrets") and "SUPABASE_URL" in st.secrets:
        SUPABASE_URL = st.secrets["SUPABASE_URL"]
    if not SUPABASE_KEY and hasattr(st, "secrets") and "SUPABASE_KEY" in st.secrets:
        SUPABASE_KEY = st.secrets["SUPABASE_KEY"]
except Exception:
    pass

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        st.sidebar.warning(f"Supabase connection error: {e}")

# In-Memory fallback session state so the app works out of the box
if "local_reports" not in st.session_state:
    st.session_state.local_reports = [
        {
            "id": str(uuid.uuid4()),
            "reference": "RST-1001",
            "title": "Deep Pothole on Main Boulevard",
            "description": "Hazardous road condition causing traffic congestion and tire damage.",
            "category": "Pothole / Road Damage",
            "location_text": "Gulberg Main Blvd, near City Center",
            "latitude": 31.5204,
            "longitude": 74.3587,
            "status": "In Progress",
            "created_at": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M"),
            "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        },
        {
            "id": str(uuid.uuid4()),
            "reference": "RST-1002",
            "title": "Broken Water Pipeline Leakage",
            "description": "Clean drinking water overflowing onto the pedestrian walkway since morning.",
            "category": "Water Supply & Leakage",
            "location_text": "Sector F-7/2, Street 14",
            "latitude": 33.7294,
            "longitude": 73.0551,
            "status": "Under Review",
            "created_at": (datetime.datetime.now() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M"),
            "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        },
        {
            "id": str(uuid.uuid4()),
            "reference": "RST-1003",
            "title": "Garbage Dump Overflowing",
            "description": "Trash container has not been cleared for 4 days, causing foul smell.",
            "category": "Garbage / Waste Disposal",
            "location_text": "Block 5, Clifton",
            "latitude": 24.8138,
            "longitude": 67.0299,
            "status": "Reported",
            "created_at": (datetime.datetime.now() - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"),
            "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        }
    ]

CATEGORIES = [
    'Pothole / Road Damage',
    'Water Supply & Leakage',
    'Garbage / Waste Disposal',
    'Streetlight / Electricity',
    'Sewage & Drainage',
    'Public Safety & Obstruction',
    'Other'
]

STATUS_CHOICES = [
    'Reported',
    'Under Review',
    'In Progress',
    'Resolved',
    'Rejected',
    'Duplicate'
]

def get_reports():
    if supabase_client:
        try:
            res = supabase_client.table("reports").select("*").order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception as e:
            st.error(f"Failed to fetch from Supabase: {e}")
    return st.session_state.local_reports

def create_report(title, category, location, desc, lat=None, lon=None):
    ref = f"RST-{int(datetime.datetime.now().timestamp()) % 10000:04d}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    new_rep = {
        "id": str(uuid.uuid4()),
        "reference": ref,
        "title": title,
        "description": desc,
        "category": category,
        "location_text": location,
        "latitude": lat,
        "longitude": lon,
        "status": "Reported",
        "created_at": now_str,
        "updated_at": now_str
    }
    if supabase_client:
        try:
            supabase_client.table("reports").insert(new_rep).execute()
        except Exception as e:
            st.error(f"Error saving to database: {e}")
    # Always append to local session as well
    st.session_state.local_reports.insert(0, new_rep)
    return ref

def update_report_status(report_id, new_status):
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    if supabase_client:
        try:
            supabase_client.table("reports").update({"status": new_status, "updated_at": now_str}).eq("id", report_id).execute()
        except Exception as e:
            st.error(f"Error updating database: {e}")
    
    for r in st.session_state.local_reports:
        if r["id"] == report_id:
            r["status"] = new_status
            r["updated_at"] = now_str
            break

# Sidebar Navigation
st.sidebar.title("🚧 Raasta Platform")
st.sidebar.caption("Community-Powered Civic Issue Reporting")

if supabase_client:
    st.sidebar.success(" Connected to Supabase Cloud")
else:
    st.sidebar.info(" Demo Mode (Local In-Memory Storage)")
    with st.sidebar.expander("⚙️ Connect Supabase"):
        st.write("Streamlit Cloud Secrets or Env Variables me add karein:")
        st.code("SUPABASE_URL = '...'\nSUPABASE_KEY = '...'")

page = st.sidebar.radio(
    "Navigation",
    ["📊 Public Dashboard", "📝 Report an Issue", "🛡️ Moderator Portal", "ℹ️ About Raasta"]
)

# ----------------- PAGE 1: DASHBOARD -----------------
if page == "📊 Public Dashboard":
    st.title("Civic Issues Dashboard")
    st.write("Track ongoing infrastructure and public utility issues reported across your community.")

    reports = get_reports()
    df = pd.DataFrame(reports)

    # Top metrics
    c1, c2, c3, c4 = st.columns(4)
    total_count = len(df) if not df.empty else 0
    resolved_count = len(df[df['status'] == 'Resolved']) if not df.empty else 0
    in_progress = len(df[df['status'] == 'In Progress']) if not df.empty else 0
    pending_count = len(df[df['status'].isin(['Reported', 'Under Review'])]) if not df.empty else 0

    c1.metric("Total Reports", total_count)
    c2.metric("In Progress", in_progress)
    c3.metric("Resolved", resolved_count)
    c4.metric("Pending Review", pending_count)

    st.markdown("---")

    # Filters
    col_f1, col_f2 = st.columns([1, 1])
    with col_f1:
        cat_filter = st.selectbox("Filter by Category", ["All"] + CATEGORIES)
    with col_f2:
        status_filter = st.selectbox("Filter by Status", ["All"] + STATUS_CHOICES)

    filtered_reports = reports
    if cat_filter != "All":
        filtered_reports = [r for r in filtered_reports if r.get("category") == cat_filter]
    if status_filter != "All":
        filtered_reports = [r for r in filtered_reports if r.get("status") == status_filter]

    st.subheader(f"Active Issues ({len(filtered_reports)})")
    
    if not filtered_reports:
        st.info("No reports found matching the selected criteria.")
    else:
        for r in filtered_reports:
            with st.container():
                cols = st.columns([3, 1])
                with cols[0]:
                    st.markdown(f"### `{r.get('reference')}`: {r.get('title')}")
                    st.write(f"📍 **Location:** {r.get('location_text')}")
                    st.write(f"📁 **Category:** {r.get('category')}")
                    st.write(f"💬 **Description:** {r.get('description')}")
                    st.caption(f"Reported on: {r.get('created_at')} | Last updated: {r.get('updated_at')}")
                with cols[1]:
                    st.markdown(f"**Status:**")
                    st.info(f"📌 {r.get('status')}")
                st.divider()

    # Map visualization
    map_data = [r for r in filtered_reports if r.get("latitude") and r.get("longitude")]
    if map_data:
        st.subheader("📍 Geolocation Map")
        map_df = pd.DataFrame([{"lat": float(r["latitude"]), "lon": float(r["longitude"])} for r in map_data])
        st.map(map_df)

# ----------------- PAGE 2: REPORT AN ISSUE -----------------
elif page == "📝 Report an Issue":
    st.title("Report a Civic Issue")
    st.write("Help authorities address civic and community concerns by submitting accurate details.")

    with st.form("civic_report_form"):
        title = st.text_input("Title / Short Summary *", placeholder="e.g. Broken streetlight causing dark alleyway")
        category = st.selectbox("Issue Category *", CATEGORIES)
        location = st.text_input("Address / Landmark *", placeholder="e.g. Near Habib Bank, Sector G-9 Markaz")
        description = st.text_area("Detailed Description *", placeholder="Explain the severity, hazard level, and exact details...")
        
        st.caption("Optional: Provide Coordinates (GPS)")
        gcol1, gcol2 = st.columns(2)
        with gcol1:
            lat = st.number_input("Latitude", value=0.0, format="%.6f")
        with gcol2:
            lon = st.number_input("Longitude", value=0.0, format="%.6f")

        submitted = st.form_submit_button("Submit Civic Report 🚀")

        if submitted:
            if not title.strip() or not location.strip() or not description.strip():
                st.error("Please fill in all required fields marked with *.")
            else:
                latitude_val = lat if lat != 0.0 else None
                longitude_val = lon if lon != 0.0 else None
                ref = create_report(title, category, location, description, latitude_val, longitude_val)
                st.success(f"✅ Issue reported successfully! Your Tracking Reference ID is **{ref}**")

# ----------------- PAGE 3: MODERATOR PORTAL -----------------
elif page == "🛡️ Moderator Portal":
    st.title("Moderator Action Center")
    st.write("Review, assign, and update statuses of community reports.")

    reports = get_reports()
    if not reports:
        st.info("No reports currently available in the system.")
    else:
        for r in reports:
            with st.expander(f"[{r.get('status')}] {r.get('reference')} — {r.get('title')}"):
                st.write(f"**Category:** {r.get('category')}")
                st.write(f"**Location:** {r.get('location_text')}")
                st.write(f"**Description:** {r.get('description')}")
                st.write(f"**Created At:** {r.get('created_at')}")
                
                curr_status = r.get("status", "Reported")
                curr_idx = STATUS_CHOICES.index(curr_status) if curr_status in STATUS_CHOICES else 0
                
                col_sel, col_btn = st.columns([2, 1])
                with col_sel:
                    new_st = st.selectbox(
                        "Change Status",
                        STATUS_CHOICES,
                        index=curr_idx,
                        key=f"status_sel_{r['id']}"
                    )
                with col_btn:
                    st.write("")
                    st.write("")
                    if st.button("Update Status", key=f"btn_{r['id']}"):
                        update_report_status(r["id"], new_st)
                        st.success(f"Status changed to {new_st}")
                        st.rerun()

# ----------------- PAGE 4: ABOUT -----------------
elif page == "ℹ️ About Raasta":
    st.title("About Raasta")
    st.markdown("""
    ### 🌟 Vision
    **Raasta** is a civic engagement platform designed for Hackathon Team **TRIAD**.
    It bridges the gap between citizens facing public infrastructure dilemmas and municipal authorities or civic moderators responsible for repairs.

    ### 🚀 Deployment Info
    This Streamlit application can be run locally or deployed directly to **Streamlit Community Cloud** (share.streamlit.io).
    
    #### Steps to deploy on Streamlit Cloud:
    1. Push these changes to GitHub.
    2. Go to [share.streamlit.io](https://share.streamlit.io/).
    3. Select your repository: `hackathon-project-team-TRIAD`.
    4. Set Main file path: `app.py`.
    5. In Advanced Settings, optionally add secrets for Supabase:
    ```toml
    SUPABASE_URL = "https://your-project.supabase.co"
    SUPABASE_KEY = "your-anon-key"
    ```
    6. Click **Deploy!**
    """)
