
import cv2
import math
import numpy as np
from flask import Flask, Response, render_template
from flask_cors import CORS
from ultralytics import YOLO
import json

app = Flask(__name__)
CORS(app)

class FoodDetectionApp:
    def __init__(self):
        self.camera = cv2.VideoCapture(0)
        # self.model = YOLO(r'D:\FinalProjectNSBMReactWebApplication\pythonbackend\best.pt')
        self.model = YOLO('best.pt')
        
        self.items_detected = {}
        self.food_tray_detected = False  # Flag to indicate if food tray is detected


    def __del__(self):
        self.release_camera()

    def release_camera(self):
        if self.camera.isOpened():
            self.camera.release()

    def get_frame(self):
        try:
            success, frame = self.camera.read()
            if success:
                results = self.model(frame, stream=True)
                self.items_detected = {}
                self.food_tray_detected = False  # Reset flag
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)
                        confidence = math.ceil((box.conf[0]*100))/100
                        cls = int(box.cls[0])
                        object_name = self.model.names[cls]
                        cv2.putText(frame, object_name, (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
                        if object_name in self.items_detected:
                            self.items_detected[object_name] += 1
                        else:
                            self.items_detected[object_name] = 1
                        # Check if food tray is detected
                        if object_name == "food_tray":
                            self.food_tray_detected = True
                ret, jpeg = cv2.imencode('.jpg', frame)
                frame_bytes = jpeg.tobytes()
                items_list = [{'name': name, 'quantity': quantity} for name, quantity in self.items_detected.items()]
                return frame_bytes, items_list
            else:
                return None, None
        except Exception as e:
            print("Error occurred during video capture:", e)
            return None, None

food_detection_app = FoodDetectionApp()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            frame, detected_items = food_detection_app.get_frame()
            if frame is not None:
                # Pass food tray detection status to the client
                yield (b'data: ' + json.dumps({'detected_items': detected_items, 'food_tray_detected': food_detection_app.food_tray_detected}).encode() + b'\n\n')
    return Response(generate(), mimetype='text/event-stream')

@app.route('/video')
def video():
    def generate():
        while True:
            frame, _ = food_detection_app.get_frame()
            if frame is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)