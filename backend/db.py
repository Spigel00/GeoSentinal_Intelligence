"""Database configuration and session management for GeoSentinel."""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATABASE_URL = "mysql+pymysql://root:vvkumaran_2005@localhost:3306/geosentinel?charset=utf8mb4"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create DB tables if they do not already exist."""
    # Import models lazily so Base metadata is fully registered before create_all.
    from models import Alert, Prediction, Region, User  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_regions_if_empty() -> int:
    """Seed regions table from backend/data/regions.json when table is empty."""
    from models import Region

    db = SessionLocal()
    try:
        existing = db.query(Region).count()
        if existing > 0:
            return 0

        regions_file = os.path.join(BASE_DIR, "data", "regions.json")
        if not os.path.exists(regions_file):
            return 0

        with open(regions_file, "r", encoding="utf-8") as f:
            rows = json.load(f) or []

        inserted = 0
        for row in rows:
            name = row.get("region")
            lat = row.get("lat")
            lon = row.get("lon")
            if not name or lat is None or lon is None:
                continue
            db.add(Region(name=name, lat=float(lat), lon=float(lon)))
            inserted += 1

        db.commit()
        return inserted
    finally:
        db.close()


def seed_initial_data_if_empty() -> dict:
    """Seed regions, users, and alerts from JSON files when respective tables are empty."""
    from models import Alert, Region, User

    db = SessionLocal()
    summary = {"regions": 0, "users": 0, "alerts": 0}

    def get_or_create_region(name: str) -> Region:
        region = db.query(Region).filter(Region.name == name).first()
        if region:
            return region
        region = Region(name=name, lat=0.0, lon=0.0)
        db.add(region)
        db.flush()
        return region

    try:
        # Seed regions
        if db.query(Region).count() == 0:
            regions_file = os.path.join(BASE_DIR, "data", "regions.json")
            if os.path.exists(regions_file):
                with open(regions_file, "r", encoding="utf-8") as f:
                    rows = json.load(f) or []
                for row in rows:
                    name = row.get("region")
                    lat = row.get("lat")
                    lon = row.get("lon")
                    if not name or lat is None or lon is None:
                        continue
                    db.add(Region(name=name, lat=float(lat), lon=float(lon)))
                    summary["regions"] += 1
                db.commit()

        # Seed users
        if db.query(User).count() == 0:
            users_file = os.path.join(BASE_DIR, "data", "users.json")
            if os.path.exists(users_file):
                with open(users_file, "r", encoding="utf-8") as f:
                    users = json.load(f) or []
                for row in users:
                    email = row.get("email")
                    if not email:
                        continue
                    if db.query(User).filter(User.email == email).first():
                        continue
                    region_name = row.get("region") or "Unknown"
                    region = get_or_create_region(region_name)
                    db.add(
                        User(
                            user_id=row.get("user_id") or f"U{str(uuid.uuid4())[:8].upper()}",
                            name=row.get("name") or "Unknown",
                            email=email,
                            phone=row.get("phone") or "",
                            region_id=region.id,
                        )
                    )
                    summary["users"] += 1
                db.commit()

        # Seed alerts
        if db.query(Alert).count() == 0:
            alerts_file = os.path.join(BASE_DIR, "data", "alerts.json")
            if os.path.exists(alerts_file):
                with open(alerts_file, "r", encoding="utf-8") as f:
                    alerts = json.load(f) or []
                for row in alerts:
                    region_name = row.get("region")
                    if not region_name:
                        continue
                    region = get_or_create_region(region_name)
                    ts = row.get("timestamp")
                    try:
                        parsed_ts = datetime.fromisoformat(ts) if ts else datetime.utcnow()
                    except Exception:
                        parsed_ts = datetime.utcnow()
                    db.add(
                        Alert(
                            region_id=region.id,
                            risk_level=row.get("risk_level") or "LOW",
                            probability=float(row.get("probability") or 0.0),
                            timestamp=parsed_ts,
                        )
                    )
                    summary["alerts"] += 1
                db.commit()

        return summary
    finally:
        db.close()
