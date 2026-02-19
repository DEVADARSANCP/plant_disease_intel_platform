"""
Pydantic request/response models for the farmer profile & related endpoints.
"""
from pydantic import BaseModel
from typing import Optional


class FarmerProfileCreate(BaseModel):
    farmer_type: str = "new_farmer"
    full_name: str = ""
    mobile: str = ""
    location: str = ""
    district: str = ""
    state: str = ""
    land_size: float = 0.0
    soil_type: str = "unknown"
    available_capital: float = 0.0
    has_loan_access: bool = False
    has_subsidy_access: bool = False
    has_irrigation: bool = False
    irrigation_type: str = "none"
    has_storage: bool = False
    storage_capacity_tons: float = 0.0
    current_crops: list[str] = []
    interested_crops: list[str] = []
    technology_interest: list[str] = []
    yearly_yield_tons: float = 0.0
    selling_markets: list[str] = []
    primary_commodity: str = ""
    primary_region: str = ""
    time_commitment: str = ""
    no_land_option: str = ""
    has_land: bool = False


class FarmerProfileResponse(BaseModel):
    id: str
    farmer_type: str
    full_name: str
    location: str
    district: str
    state: str
    land_size: float
    available_capital: float
    has_irrigation: bool
    current_crops: list[str]
    interested_crops: list[str]
    technology_interest: list[str]
    primary_commodity: str
    primary_region: str
    time_commitment: str
    has_land: bool
    no_land_option: str
    onboarding_completed: bool
    profile_completeness: float

    class Config:
        from_attributes = True


class CropListingCreate(BaseModel):
    farmer_id: str
    crop_name: str
    quantity_kg: float
    quality_grade: str = "B"
    expected_price_per_kg: float
    minimum_price_per_kg: float = 0.0
    location: str = ""
    district: str = ""
    storage_days_available: int = 0
    harvest_date: str = ""
    organic_certified: bool = False
    images: list[str] = []


class InputListingCreate(BaseModel):
    farmer_id: Optional[str] = None
    product_name: str
    category: str
    brand: str = ""
    price: float
    unit: str = ""
    quantity_available: float = 0.0
    description: str = ""
    seller_name: str
    seller_rating: float = 0.0
    location: str = ""
    delivery_available: bool = False
    delivery_charge: float = 0.0
    images: list[str] = []


class BuyerInquiryCreate(BaseModel):
    listing_id: str
    listing_type: str = "crop"
    buyer_name: str
    buyer_contact: str = ""
    buyer_location: str = ""
    offered_price: float = 0.0
    quantity_needed: float = 0.0
    message: str = ""
