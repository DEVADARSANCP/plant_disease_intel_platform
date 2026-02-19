"""
SQLAlchemy ORM models for the Jomee platform.

Tables:
  - farmer_profiles
  - crop_listings
  - input_listings
  - buyer_inquiries
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Boolean, Integer, Text, DateTime, JSON, ForeignKey
)
from database import Base


def _uuid():
    return str(uuid.uuid4())


# ────────────────────────────────────────
# Farmer Profile (from onboarding wizard)
# ────────────────────────────────────────
class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id            = Column(String, primary_key=True, default=_uuid)
    farmer_type   = Column(String, nullable=False, default="new_farmer")  # new_farmer | experienced | learning | profit_focused
    full_name     = Column(String, default="")
    mobile        = Column(String, default="")
    location      = Column(String, default="")
    district      = Column(String, default="")
    state         = Column(String, default="")
    land_size     = Column(Float, default=0.0)
    soil_type     = Column(String, default="unknown")
    available_capital = Column(Float, default=0.0)
    has_loan_access   = Column(Boolean, default=False)
    has_subsidy_access = Column(Boolean, default=False)
    has_irrigation    = Column(Boolean, default=False)
    irrigation_type   = Column(String, default="none")
    has_storage       = Column(Boolean, default=False)
    storage_capacity_tons = Column(Float, default=0.0)
    current_crops     = Column(JSON, default=list)   # ["rice", "wheat"]
    interested_crops  = Column(JSON, default=list)
    technology_interest = Column(JSON, default=list)  # ["hydroponics", "drip_irrigation"]
    yearly_yield_tons = Column(Float, default=0.0)
    selling_markets   = Column(JSON, default=list)
    primary_commodity = Column(String, default="")    # e.g. "Banana", "Tomato"
    primary_region    = Column(String, default="")     # e.g. "Kerala_Kottayam"
    time_commitment   = Column(String, default="")
    no_land_option    = Column(String, default="")
    has_land          = Column(Boolean, default=False)
    onboarding_completed = Column(Boolean, default=False)
    profile_completeness = Column(Float, default=0.0)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ────────────────────────────────
# Crop Listing (farmer sells crop)
# ────────────────────────────────
class CropListing(Base):
    __tablename__ = "crop_listings"

    id                    = Column(String, primary_key=True, default=_uuid)
    farmer_id             = Column(String, ForeignKey("farmer_profiles.id"), nullable=False)
    crop_name             = Column(String, nullable=False)
    quantity_kg           = Column(Float, nullable=False)
    quality_grade         = Column(String, default="B")    # A | B | C | premium
    expected_price_per_kg = Column(Float, nullable=False)
    minimum_price_per_kg  = Column(Float, default=0.0)
    location              = Column(String, default="")
    district              = Column(String, default="")
    storage_days_available = Column(Integer, default=0)
    harvest_date          = Column(String, default="")
    organic_certified     = Column(Boolean, default=False)
    images                = Column(JSON, default=list)
    status                = Column(String, default="active")  # active | sold | expired | withdrawn
    views_count           = Column(Integer, default=0)
    inquiries_count       = Column(Integer, default=0)
    created_at            = Column(DateTime, default=datetime.utcnow)


# ──────────────────────────────────────
# Input Listing (agri-products for sale)
# ──────────────────────────────────────
class InputListing(Base):
    __tablename__ = "input_listings"

    id                 = Column(String, primary_key=True, default=_uuid)
    farmer_id          = Column(String, ForeignKey("farmer_profiles.id"), nullable=True)
    product_name       = Column(String, nullable=False)
    category           = Column(String, nullable=False)  # seeds | fertilizers | pesticides | tools | equipment | irrigation | other
    brand              = Column(String, default="")
    price              = Column(Float, nullable=False)
    unit               = Column(String, default="")
    quantity_available  = Column(Float, default=0.0)
    description        = Column(Text, default="")
    seller_name        = Column(String, nullable=False)
    seller_rating      = Column(Float, default=0.0)
    location           = Column(String, default="")
    delivery_available  = Column(Boolean, default=False)
    delivery_charge    = Column(Float, default=0.0)
    images             = Column(JSON, default=list)
    status             = Column(String, default="available")  # available | out_of_stock | discontinued
    created_at         = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────
# Buyer Inquiry (on a listing)
# ─────────────────────────────────────
class BuyerInquiry(Base):
    __tablename__ = "buyer_inquiries"

    id              = Column(String, primary_key=True, default=_uuid)
    listing_id      = Column(String, nullable=False)
    listing_type    = Column(String, nullable=False)  # crop | input
    buyer_name      = Column(String, nullable=False)
    buyer_contact   = Column(String, default="")
    buyer_location  = Column(String, default="")
    offered_price   = Column(Float, default=0.0)
    quantity_needed = Column(Float, default=0.0)
    message         = Column(Text, default="")
    status          = Column(String, default="pending")  # pending | accepted | rejected | completed
    created_at      = Column(DateTime, default=datetime.utcnow)
