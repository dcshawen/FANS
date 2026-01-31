from fastapi import FastAPI

app = FastAPI(
    title="Food Access Nova Scotia API",
    description="Handles traffic between layers in FANS",
    version="0.1.0",
    contact={
        "name": "Dan Shaw - Backend Dev",
        "email": "w0190983@nscc.ca",
    },
)

@app.get("/status")
def get_status():
    return { "message": "Backend layer is active" }
