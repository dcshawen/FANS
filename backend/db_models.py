from sqlalchemy import Column, Integer, String, Text, DECIMAL, Enum as SQLEnum, Time, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class DayOfWeekEnum(enum.Enum):
    """Enum for days of the week"""
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"
    Sunday = "Sunday"


class OrganizationDB(Base):
    __tablename__ = "Organization"
    
    location_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    street_address = Column(String(255))
    city = Column(String(100))
    postal_code = Column(String(20))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    contacts = relationship("ContactDB", back_populates="organization", cascade="all, delete-orphan")
    schedules = relationship("ScheduleDB", back_populates="organization", cascade="all, delete-orphan")
    food_offerings = relationship("FoodOfferedDB", back_populates="organization", cascade="all, delete-orphan")


class ContactDB(Base):
    __tablename__ = "Contact"
    
    contact_id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("Organization.location_id", ondelete="CASCADE"), nullable=False)
    phone_number = Column(String(20))
    websit_url = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    organization = relationship("OrganizationDB", back_populates="contacts")


class ScheduleDB(Base):
    __tablename__ = "Schedule"
    
    hours_id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("Organization.location_id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(SQLEnum(DayOfWeekEnum), nullable=False)
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    organization = relationship("OrganizationDB", back_populates="schedules")


class FoodOfferedDB(Base):
    __tablename__ = "FoodOffered"
    
    offering_id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("Organization.location_id", ondelete="CASCADE"), nullable=False)
    offering_description = Column(Text)
    days_available = Column(String(255))
    time_available = Column(String(255))
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    organization = relationship("OrganizationDB", back_populates="food_offerings")
