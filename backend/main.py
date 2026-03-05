import httpx
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models import (
    Organization, OrganizationCreate, OrganizationSummary,
    Contact, ContactCreate,
    Schedule, ScheduleCreate,
    FoodOffered, FoodOfferedCreate
)
from db_models import OrganizationDB, ContactDB, ScheduleDB, FoodOfferedDB
from database import get_db

class GeocodeRequest(BaseModel):
    addresses: list[str]

app = FastAPI(
    title="Food Access Nova Scotia API",
    description="Handles traffic between layers in FANS",
    version="0.1.0",
    contact={
        "name": "Dan Shaw - Backend Dev",
        "email": "w0190983@nscc.ca",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173", 
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/status")
def get_status():
    return {"message": "Backend layer is active"}


# ==================== ORGANIZATION ENDPOINTS ====================

@app.get("/organizations", response_model=List[OrganizationSummary], tags=["Organizations"])
def get_all_organizations(db: Session = Depends(get_db)):
    """Get all organizations (without nested relationships)"""
    return db.query(OrganizationDB).all()


@app.get("/organizations/{location_id}", response_model=Organization, tags=["Organizations"])
def get_organization(location_id: int, db: Session = Depends(get_db)):
    """Get a specific organization by ID (with nested relationships)"""
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.post("/organizations", response_model=Organization, status_code=status.HTTP_201_CREATED, tags=["Organizations"])
def create_organization(organization: OrganizationCreate, db: Session = Depends(get_db)):
    """Create a new organization"""
    db_org = OrganizationDB(**organization.model_dump())
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org


@app.put("/organizations/{location_id}", response_model=Organization, tags=["Organizations"])
def update_organization(location_id: int, organization: OrganizationCreate, db: Session = Depends(get_db)):
    """Update an existing organization"""
    db_org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for key, value in organization.model_dump().items():
        setattr(db_org, key, value)
    
    db.commit()
    db.refresh(db_org)
    return db_org


@app.delete("/organizations/{location_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Organizations"])
def delete_organization(location_id: int, db: Session = Depends(get_db)):
    """Delete an organization and its related data"""
    db_org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db.delete(db_org)
    db.commit()


# ==================== CONTACT ENDPOINTS ====================

@app.get("/contacts", response_model=List[Contact], tags=["Contacts"])
def get_all_contacts(db: Session = Depends(get_db)):
    """Get all contacts"""
    return db.query(ContactDB).all()


@app.get("/contacts/{contact_id}", response_model=Contact, tags=["Contacts"])
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a specific contact by ID"""
    contact = db.query(ContactDB).filter(ContactDB.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@app.get("/organizations/{location_id}/contacts", response_model=List[Contact], tags=["Contacts"])
def get_organization_contacts(location_id: int, db: Session = Depends(get_db)):
    """Get all contacts for a specific organization"""
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db.query(ContactDB).filter(ContactDB.location_id == location_id).all()


@app.post("/contacts", response_model=Contact, status_code=status.HTTP_201_CREATED, tags=["Contacts"])
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact"""
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == contact.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db_contact = ContactDB(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@app.put("/contacts/{contact_id}", response_model=Contact, tags=["Contacts"])
def update_contact(contact_id: int, contact: ContactCreate, db: Session = Depends(get_db)):
    """Update an existing contact"""
    db_contact = db.query(ContactDB).filter(ContactDB.contact_id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == contact.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for key, value in contact.model_dump().items():
        setattr(db_contact, key, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact


@app.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Contacts"])
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact"""
    db_contact = db.query(ContactDB).filter(ContactDB.contact_id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(db_contact)
    db.commit()


# ==================== SCHEDULE ENDPOINTS ====================

@app.get("/schedules", response_model=List[Schedule], tags=["Schedules"])
def get_all_schedules(db: Session = Depends(get_db)):
    """Get all schedules"""
    return db.query(ScheduleDB).all()


@app.get("/schedules/{hours_id}", response_model=Schedule, tags=["Schedules"])
def get_schedule(hours_id: int, db: Session = Depends(get_db)):
    """Get a specific schedule by ID"""
    schedule = db.query(ScheduleDB).filter(ScheduleDB.hours_id == hours_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@app.get("/organizations/{location_id}/schedules", response_model=List[Schedule], tags=["Schedules"])
def get_organization_schedules(location_id: int, db: Session = Depends(get_db)):
    """Get all schedules for a specific organization"""
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db.query(ScheduleDB).filter(ScheduleDB.location_id == location_id).all()


@app.post("/schedules", response_model=Schedule, status_code=status.HTTP_201_CREATED, tags=["Schedules"])
def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    """Create a new schedule"""
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == schedule.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db_schedule = ScheduleDB(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


@app.put("/schedules/{hours_id}", response_model=Schedule, tags=["Schedules"])
def update_schedule(hours_id: int, schedule: ScheduleCreate, db: Session = Depends(get_db)):
    """Update an existing schedule"""
    db_schedule = db.query(ScheduleDB).filter(ScheduleDB.hours_id == hours_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == schedule.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for key, value in schedule.model_dump().items():
        setattr(db_schedule, key, value)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


@app.delete("/schedules/{hours_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Schedules"])
def delete_schedule(hours_id: int, db: Session = Depends(get_db)):
    """Delete a schedule"""
    db_schedule = db.query(ScheduleDB).filter(ScheduleDB.hours_id == hours_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(db_schedule)
    db.commit()


# ==================== FOOD OFFERED ENDPOINTS ====================

@app.get("/food-offerings", response_model=List[FoodOffered], tags=["Food Offerings"])
def get_all_food_offerings(db: Session = Depends(get_db)):
    """Get all food offerings"""
    return db.query(FoodOfferedDB).all()


@app.get("/food-offerings/{offering_id}", response_model=FoodOffered, tags=["Food Offerings"])
def get_food_offering(offering_id: int, db: Session = Depends(get_db)):
    """Get a specific food offering by ID"""
    food_offering = db.query(FoodOfferedDB).filter(FoodOfferedDB.offering_id == offering_id).first()
    if not food_offering:
        raise HTTPException(status_code=404, detail="Food offering not found")
    return food_offering


@app.get("/organizations/{location_id}/food-offerings", response_model=List[FoodOffered], tags=["Food Offerings"])
def get_organization_food_offerings(location_id: int, db: Session = Depends(get_db)):
    """Get all food offerings for a specific organization"""
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db.query(FoodOfferedDB).filter(FoodOfferedDB.location_id == location_id).all()


@app.post("/food-offerings", response_model=FoodOffered, status_code=status.HTTP_201_CREATED, tags=["Food Offerings"])
def create_food_offering(food_offering: FoodOfferedCreate, db: Session = Depends(get_db)):
    """Create a new food offering"""
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == food_offering.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db_food = FoodOfferedDB(**food_offering.model_dump())
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food


@app.put("/food-offerings/{offering_id}", response_model=FoodOffered, tags=["Food Offerings"])
def update_food_offering(offering_id: int, food_offering: FoodOfferedCreate, db: Session = Depends(get_db)):
    """Update an existing food offering"""
    db_food = db.query(FoodOfferedDB).filter(FoodOfferedDB.offering_id == offering_id).first()
    if not db_food:
        raise HTTPException(status_code=404, detail="Food offering not found")
    
    # Verify organization exists
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == food_offering.location_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for key, value in food_offering.model_dump().items():
        setattr(db_food, key, value)
    
    db.commit()
    db.refresh(db_food)
    return db_food


@app.delete("/food-offerings/{offering_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Food Offerings"])
def delete_food_offering(offering_id: int, db: Session = Depends(get_db)):
    """Delete a food offering"""
    db_food = db.query(FoodOfferedDB).filter(FoodOfferedDB.offering_id == offering_id).first()
    if not db_food:
        raise HTTPException(status_code=404, detail="Food offering not found")
    
    db.delete(db_food)
    db.commit()

# --------------------- Geocod.io endpoints ---------------------

@app.put("/organizations/{location_id}/geocode", tags=["Geocoding"]) 
def update_org_coords(location_id: int, lat: float, lng: float, db: Session = Depends(get_db)):
    """Update Organization Coordinates"""
    org = db.query(OrganizationDB).filter(OrganizationDB.location_id == location_id).first()
    if not org: 
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org.latitude = lat
    org.longitude = lng
    db.commit()
    return org

@app.post("/geocode/batch", tags=["Geocoding"])
async def geocode_batch(addresses: list[str]):
    """Proxy batch geocoding requests to Geocod.io API"""
    import os
    api_key = os.environ.get("GEOCODIO_API_KEY", "a6a95a46f369a3aa69fa965936af56569aaa6a3")
    
    try:
        async with httpx.AsyncClient() as client: 
            response = await client.post(
                f"https://api.geocod.io/v1.7/geocode",
                params={"api_key": api_key},
                json=addresses,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Geocodio error: {response.text}"
                )
            
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
    
@app.get("/geocode/single", tags=["Geocoding"])
async def geocode_single(address: str):
    """Proxy single geocoding requests to Geocod.io API"""
    import os
    api_key = os.environ.get("GEOCODIO_API_KEY", "a6a95a46f369a3aa69fa965936af56569aaa6a3")

    try:
        async with httpx.AsyncClient() as client: 
            response = await client.get(
                f"https://api.geocod.io/v1.7/geocode",
                params={"api_key": api_key, "q": address},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Geocodio error: {response.text}"
                )
            
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
