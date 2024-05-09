import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const ObjectDetectionComponent = () => {
  const webcamRef = useRef(null);

  useEffect(() => {
    const fetchImage = async () => {
      const response = await axios.get('http://127.0.0.1:5000/video_feed', {
        responseType: 'arraybuffer',
      });
      const image = Buffer.from(response.data, 'binary').toString('base64');
      const imageSrc = `data:image/jpeg;base64,${image}`;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        context.font = '16px Arial';
        context.fillStyle = 'red';
        context.fillText('Detected Object', 10, 50); // Adjust text position as needed
        const webcamVideo = document.querySelector('video');
        webcamVideo.srcObject = canvas.captureStream();
      };
      img.src = imageSrc;
    };

    const intervalId = setInterval(fetchImage, 100); // Adjust the interval as needed

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <Webcam ref={webcamRef} />
    </div>
  );
};

export default ObjectDetectionComponent;