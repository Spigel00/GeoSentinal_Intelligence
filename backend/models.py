"""SQLAlchemy ORM models for GeoSentinel."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)

    users = relationship("User", back_populates="region", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="region", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="region", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    region = relationship("Region", back_populates="users")
    behavior_events = relationship("UserBehavior", back_populates="user", cascade="all, delete-orphan")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    region = relationship("Region", back_populates="alerts")


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True, nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    environmental_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    region = relationship("Region", back_populates="predictions")


class UserBehavior(Base):
    __tablename__ = "user_behaviors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # login, logout, failed_login, action, region_change
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)  # IPv4 or IPv6
    device_fingerprint: Mapped[str] = mapped_column(String(255), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)  # Geographic location
    success: Mapped[bool] = mapped_column(default=True, nullable=False)
    event_metadata: Mapped[dict] = mapped_column(JSON, nullable=True)  # Additional event metadata
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    
    user = relationship("User", back_populates="behavior_events")

