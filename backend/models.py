from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import time
from enum import Enum


class DayOfWeek(str, Enum):
    """Enum for days of the week"""
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


class ContactBase(BaseModel):
    """Base model for Contact"""
    location_id: int = Field(..., description="Foreign key to Organization")
    phone_number: Optional[str] = Field(None, max_length=30, description="Contact phone number")
    websit_url: Optional[HttpUrl] = Field(None, description="Website URL")


class ContactCreate(ContactBase):
    """Model for creating a new Contact"""
    pass


class Contact(ContactBase):
    """Model for Contact with ID"""
    contact_id: int = Field(..., description="Primary key")

    class Config:
        from_attributes = True


class ScheduleBase(BaseModel):
    """Base model for Schedule"""
    location_id: int = Field(..., description="Foreign key to Organization")
    day_of_week: DayOfWeek = Field(..., description="Day of the week")
    open_time: time = Field(..., description="Opening time")
    close_time: time = Field(..., description="Closing time")


class ScheduleCreate(ScheduleBase):
    """Model for creating a new Schedule"""
    pass


class Schedule(ScheduleBase):
    """Model for Schedule with ID"""
    hours_id: int = Field(..., description="Primary key")

    class Config:
        from_attributes = True


class FoodOfferedBase(BaseModel):
    """Base model for FoodOffered"""
    location_id: int = Field(..., description="Foreign key to Organization")
    offering_description: Optional[str] = Field(None, description="Description of food offerings")
    days_available: Optional[str] = Field(None, description="Days when food is available")
    time_available: Optional[str] = Field(None, description="Time when food is available")
    notes: Optional[str] = Field(None, description="Additional notes")


class FoodOfferedCreate(FoodOfferedBase):
    """Model for creating a new FoodOffered entry"""
    pass


class FoodOffered(FoodOfferedBase):
    """Model for FoodOffered with ID"""
    offering_id: int = Field(..., description="Primary key")

    class Config:
        from_attributes = True


class Tag(BaseModel):
    """Model for Tag with ID"""
    id: int = Field(..., description="Primary key")
    location_id: int = Field(..., description="Foreign key to Organization")
    tag: str = Field(..., max_length=255, description="Tag text")

    class Config:
        from_attributes = True


class OrganizationBase(BaseModel):
    """Base model for Organization"""
    name: str = Field(..., max_length=255, description="Organization name")
    description: Optional[str] = Field(None, description="Organization description")
    street_address: Optional[str] = Field(None, max_length=255, description="Street address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")


class OrganizationCreate(OrganizationBase):
    """Model for creating a new Organization"""
    pass


class Organization(OrganizationBase):
    """Model for Organization with ID and relationships"""
    location_id: int = Field(..., description="Primary key")
    contacts: List[Contact] = Field(default_factory=list, description="List of contacts")
    schedules: List[Schedule] = Field(default_factory=list, description="List of schedules")
    food_offerings: List[FoodOffered] = Field(default_factory=list, description="List of food offerings")
    tags: List[Tag] = Field(default_factory=list, description="List of tags")

    class Config:
        from_attributes = True


class OrganizationSummary(OrganizationBase):
    """Model for Organization without nested relationships (for list views)"""
    location_id: int = Field(..., description="Primary key")

    class Config:
        from_attributes = True
