import uvicorn

if __name__ == "__main__":
    print("Starting LEGAL METRIX Enforcement Backend on http://localhost:8000...")
    print("Interactive Swagger Docs available at http://localhost:8000/api/v1/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

