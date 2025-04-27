from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from PIL import Image
import io
import torch
import base64
import numpy as np
import pytesseract
import cv2
import tempfile
import os

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)


model_dir = r"C:\Users\vanshika\Downloads\model_spolier\saved_model"

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)

# Define the request body model for text predictions
class TextRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_spoiler(request: TextRequest):
    try:
        
        inputs = tokenizer(request.text, return_tensors="pt", truncation=True, padding=True)

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.softmax(outputs.logits, dim=1)

            spoiler_prob = predictions[0][1].item()
            return {"is_spoiler": spoiler_prob > 0.5, "probability": spoiler_prob}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in POST request: {str(e)}")


# GET method to provide instructions for text-based prediction
@app.get("/predict")
async def get_text_instructions():
    return {"message": "Send a POST request with a 'text' field to predict spoilers. Example: /predict with {\"text\": \"your text here\"}"}

@app.post("/predict-image")
async def predict_image_spoiler(file: UploadFile = File(...)):
    try:
     
        image = Image.open(file.file)
        
    
        ocr_text = pytesseract.image_to_string(image)
        
       
        inputs = tokenizer(ocr_text, return_tensors="pt", truncation=True, padding=True)

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.softmax(outputs.logits, dim=1)

            # Assume '1' corresponds to 'spoiler'
            spoiler_prob = predictions[0][1].item()
            return {"is_spoiler": spoiler_prob > 0.5, "probability": spoiler_prob, "ocr_text": ocr_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in POST request: {str(e)}")

@app.post("/predict-video")
async def predict_video_spoiler(file: UploadFile = File(...), interval: int = 5):
    try:
        # Save the uploaded video to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(file.file.read())
            temp_video_path = temp_video.name

        
        video_capture = cv2.VideoCapture(temp_video_path)
        fps = int(video_capture.get(cv2.CAP_PROP_FPS))
        frame_number = 0
        spoiler_found = False

        while video_capture.isOpened():
            ret, frame = video_capture.read()
            if not ret:
                break

            # Extract frames at intervals
            if frame_number % (fps * interval) == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)

                ocr_text = pytesseract.image_to_string(pil_image)


                inputs = tokenizer(ocr_text, return_tensors="pt", truncation=True, padding=True)
                with torch.no_grad():
                    outputs = model(**inputs)
                    predictions = torch.softmax(outputs.logits, dim=1)
                    spoiler_prob = predictions[0][1].item()

                if spoiler_prob > 0.5:
                    spoiler_found = True
                    break  

            frame_number += 1

        # Release video resources
        video_capture.release()
        os.remove(temp_video_path)  #

        return {"is_spoiler": spoiler_found, "message": "Spoiler detected in video!" if spoiler_found else "No spoilers detected in video."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in POST request: {str(e)}")
