# import cv2

# # Function to start live video capture and show bounding box
# def capture_live_video():
#     # Open the webcam (0 is the default camera)
#     cap = cv2.VideoCapture(0)

#     # Check if the camera opened successfully
#     if not cap.isOpened():
#         print("Error: Could not open video stream")
#         return

#     # Set the duration for video capture (10 seconds)
#     video_duration = 10  # seconds
#     frame_rate = 30  # assuming 30 fps
#     total_frames = video_duration * frame_rate
    
#     current_frame = 0
    
#     while current_frame < total_frames:
#         # Capture frame-by-frame
#         ret, frame = cap.read()

#         if not ret:
#             print("Error: Failed to capture image")
#             break

#         # Convert to grayscale (optional, for liveness detection later)
#         gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

#         # Draw a bounding box around the face or full screen (for now, a sample box)
#         # You would integrate face detection here if needed
#         height, width, _ = frame.shape
#         cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 255, 0), 2)

#         # Display the resulting frame with a bounding box
#         cv2.imshow("Live Video Capture", frame)

#         # Increment frame count
#         current_frame += 1

#         # Press 'q' to quit the video window
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     # Release the capture and close the window
#     cap.release()
#     cv2.destroyAllWindows()

# # Run the live video capture function
# capture_live_video()


import cv2
import dlib
import numpy as np
import time

# Load the face detector and facial landmarks predictor from dlib
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("models/shape_predictor_68_face_landmarks.dat")  # Ensure this file is available

# Function to calculate distance between two points
def euclidean_distance(point1, point2):
    return np.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)

# Start the video capture
def liveness_detection():
    cap = cv2.VideoCapture(0)  # Open the webcam

    # Check if the camera opened successfully
    if not cap.isOpened():
        print("Error: Could not open video stream")
        return

    start_time = time.time()
    initial_eye_distance = None
    initial_mouth_distance = None
    movement_detected = False  # Flag for movement detection

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture image")
            break
        
        # Convert the frame to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the grayscale frame
        faces = detector(gray, 0)

        # Process detected faces
        for face in faces:
            # Predict facial landmarks
            shape = predictor(gray, face)
            shape = np.array([[p.x, p.y] for p in shape.parts()])

            # Get coordinates for eyes and mouth
            left_eye = shape[36:42]  # Left eye
            right_eye = shape[42:48]  # Right eye
            mouth = shape[48:68]  # Mouth
            
            # Calculate distances for movement detection
            eye_distance = euclidean_distance(left_eye.mean(axis=0), right_eye.mean(axis=0))
            mouth_distance = euclidean_distance(mouth[3], mouth[9])  # Vertical distance

            # Initialize initial distances
            if initial_eye_distance is None and initial_mouth_distance is None:
                initial_eye_distance = eye_distance
                initial_mouth_distance = mouth_distance

            # Check for movement in eye and mouth distances
            if (abs(eye_distance - initial_eye_distance) > 5) or (abs(mouth_distance - initial_mouth_distance) > 5):
                movement_detected = True

            # Draw bounding boxes around eyes and mouth
            cv2.rectangle(frame, (face.left(), face.top()), (face.right(), face.bottom()), (0, 255, 0), 2)
            cv2.rectangle(frame, (left_eye[0][0], left_eye[0][1]), (left_eye[3][0], left_eye[3][1]), (255, 0, 0), 2)
            cv2.rectangle(frame, (right_eye[0][0], right_eye[0][1]), (right_eye[3][0], right_eye[3][1]), (255, 0, 0), 2)
            cv2.rectangle(frame, (mouth[0][0], mouth[0][1]), (mouth[6][0], mouth[6][1]), (0, 0, 255), 2)

        # Show the frame with bounding boxes
        cv2.imshow("Liveness Detection", frame)

        # Check for 10 seconds duration
        if time.time() - start_time > 10:
            break
        
        # Exit the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Print movement detection result
    if movement_detected:
        print("Movement Detected")
    else:
        print("No Movement Detected")

    # Release the webcam and close the window
    cap.release()
    cv2.destroyAllWindows()

# Run the liveness detection function
liveness_detection()
