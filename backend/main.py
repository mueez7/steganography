from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
from dotenv import load_dotenv
import os
import shutil
import uuid
from pathlib import Path

load_dotenv()

import stego

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cleanup_files(*paths):
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"Error removing file {path}: {e}")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def save_upload_file(upload_file: UploadFile) -> str:
    # generate unique filename to prevent clashes
    unique_filename = f"{uuid.uuid4()}_{upload_file.filename}"
    file_path = UPLOAD_DIR / unique_filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return str(file_path)

@app.post("/encode/text")
async def encode_text(cover: UploadFile = File(...), message: str = Form(...)):
    cover_path = save_upload_file(cover)
    stego_path = str(UPLOAD_DIR / f"stego_{uuid.uuid4()}.txt")
    try:
        res = stego.txt_encode(message, cover_path, stego_path)
        task = BackgroundTask(cleanup_files, cover_path, stego_path)
        return FileResponse(stego_path, filename="stego_text.txt", background=task)
    except Exception as e:
        cleanup_files(cover_path, stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decode/text")
async def decode_text(stego_file: UploadFile = File(...)):
    stego_path = save_upload_file(stego_file)
    try:
        res = stego.decode_txt_data(stego_path)
        cleanup_files(stego_path)
        return {"decoded_message": res}
    except Exception as e:
        cleanup_files(stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/encode/image")
async def encode_image(cover: UploadFile = File(...), message: str = Form(...)):
    cover_path = save_upload_file(cover)
    stego_path = str(UPLOAD_DIR / f"stego_{uuid.uuid4()}.png")
    try:
        res = stego.encode_img_data(cover_path, message, stego_path)
        task = BackgroundTask(cleanup_files, cover_path, stego_path)
        return FileResponse(stego_path, filename="stego_image.png", background=task)
    except Exception as e:
        cleanup_files(cover_path, stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decode/image")
async def decode_image(stego_file: UploadFile = File(...)):
    stego_path = save_upload_file(stego_file)
    try:
        res = stego.decode_img_data(stego_path)
        cleanup_files(stego_path)
        return {"decoded_message": res}
    except Exception as e:
        cleanup_files(stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/encode/audio")
async def encode_audio(cover: UploadFile = File(...), message: str = Form(...)):
    cover_path = save_upload_file(cover)
    stego_path = str(UPLOAD_DIR / f"stego_{uuid.uuid4()}.wav")
    try:
        res = stego.encode_aud_data(cover_path, message, stego_path)
        task = BackgroundTask(cleanup_files, cover_path, stego_path)
        return FileResponse(stego_path, filename="stego_audio.wav", background=task)
    except Exception as e:
        cleanup_files(cover_path, stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decode/audio")
async def decode_audio(stego_file: UploadFile = File(...)):
    stego_path = save_upload_file(stego_file)
    try:
        res = stego.decode_aud_data(stego_path)
        cleanup_files(stego_path)
        return {"decoded_message": res}
    except Exception as e:
        cleanup_files(stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/encode/video")
async def encode_video(
    cover: UploadFile = File(...), 
    message: str = Form(...), 
    key_str: str = Form(...), 
    frame_num: int = Form(...)
):
    cover_path = save_upload_file(cover)
    stego_path = str(UPLOAD_DIR / f"stego_{uuid.uuid4()}.avi")
    try:
        res = stego.encode_vid_data(cover_path, message, stego_path, frame_num, key_str)
        task = BackgroundTask(cleanup_files, cover_path, stego_path)
        return FileResponse(stego_path, filename="stego_video.avi", background=task)
    except Exception as e:
        cleanup_files(cover_path, stego_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decode/video")
async def decode_video(
    stego_file: UploadFile = File(...), 
    key_str: str = Form(...), 
    frame_num: int = Form(...)
):
    stego_path = save_upload_file(stego_file)
    try:
        res = stego.decode_vid_data(stego_path, frame_num, key_str)
        cleanup_files(stego_path)
        return {"decoded_message": res}
    except Exception as e:
        cleanup_files(stego_path)
        raise HTTPException(status_code=500, detail=str(e))
