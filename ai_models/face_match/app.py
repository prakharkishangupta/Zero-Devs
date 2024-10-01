#make fastapi server

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List
import json
import requests
import os
from collections import Counter
import urllib
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import random


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the model

class Video(BaseModel):
    url: str
    gesture: str

@app.post("/analyze_video")
async def analyze_video(video: Video):

    """
    Checks if the most frequent gesture in a video matches the given gesture name.

    Args:
        video_url: The URL of the video to analyze.
        gesture_name: The name of the gesture to compare against.

    Returns:
        True if the most frequent gesture matches the given gesture name, False otherwise.
    """
    try:
        # Download the video from the URL to a temporary file
        temp_file, _ = urllib.request.urlretrieve(video_url)

        # Open the video file using cv2.VideoCapture
        video_path = cv2.VideoCapture(temp_file)

        # Check if the video file was opened successfully
        if not video_path.isOpened():
            raise IOError("Error opening video file")

        def select_random_frames(video_path, num_frames):
            # Get the total number of frames in the video
            total_frames = int(video_path.get(cv2.CAP_PROP_FRAME_COUNT))

            # Generate random frame indices
            random_indices = random.sample(range(total_frames), num_frames)

            # Read and return the selected frames
            selected_frames = []
            for frame_index in random_indices:
                # Set the frame position
                video_path.set(cv2.CAP_PROP_POS_FRAMES, frame_index)

                # Read the frame
                ret, frame = video_path.read()

                # Append the frame to the selected frames list
                if ret:
                    selected_frames.append(frame)

            return selected_frames

        selected_frames = select_random_frames(video_path, 50)

        # STEP 2: Create an GestureRecognizer object.
        base_options = python.BaseOptions(
            model_asset_path='gesture_recognizer.task')
        options = vision.GestureRecognizerOptions(base_options=base_options)
        recognizer = vision.GestureRecognizer.create_from_options(options)

        results = []
        for frame in selected_frames:
            # STEP 3: Load the input frame.
            # Specify the image format as SRGB
            image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)

            # STEP 4: Recognize gestures in the input frame.
            recognition_result = recognizer.recognize(image)

            # STEP 5: Process the result. In this case, visualize it.
            # Check if gestures were detected before accessing the list
            if recognition_result.gestures and recognition_result.gestures[0]:
                top_gesture = recognition_result.gestures[0][0]
                hand_landmarks = recognition_result.hand_landmarks
                results.append((top_gesture, hand_landmarks))
            else:
                results.append((None, None))  # Append None for frames with no gesture

        gesture_categories = [
            result[0].category_name if result[0] else None for result in results]

        # Count the occurrences of each gesture category
        gesture_counts = Counter(gesture_categories)

        # Find the category with the maximum count
        if gesture_counts:
            most_common_gesture = gesture_counts.most_common(1)[0][0]
            return most_common_gesture == gesture_name
        else:
            return False

    except Exception as e:
        print(f"An error occurred: {e}")
        return False

