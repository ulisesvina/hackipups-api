from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "detail": "Welcome to Hackipup's API!f"
    }
