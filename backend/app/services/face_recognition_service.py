"""
Face recognition service for user authentication
"""
import numpy as np
import cv2
import base64 as b64
import face_recognition
from datetime import datetime
from typing import Tuple, Optional
from fastapi import HTTPException


class FaceRecognitionService:
    """Service for face recognition operations"""
    
    @staticmethod
    def decode_base64_image(data_b64: str) -> np.ndarray:
        """
        Decode base64 image string to numpy array
        
        Args:
            data_b64: Base64 encoded image string
            
        Returns:
            Decoded image as numpy array
            
        Raises:
            HTTPException: If image is invalid
        """
        try:
            # Support data:image/jpeg;base64, format
            header_removed = data_b64.split(',', 1)[-1]
            binary = b64.b64decode(header_removed)
            np_arr = np.frombuffer(binary, dtype=np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid base64 image: {e}"
            )
    
    @staticmethod
    def extract_face_encoding(img_bgr: np.ndarray) -> list:
        """
        Extract face encoding from image
        
        Args:
            img_bgr: Image in BGR format
            
        Returns:
            Face encoding as list
            
        Raises:
            HTTPException: If no face detected or encoding extraction fails
        """
        # Convert to RGB
        rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb)
        
        if not boxes:
            raise HTTPException(
                status_code=422,
                detail="No face detected in the provided image"
            )
        
        # Use first face if multiple detected
        if len(boxes) > 1:
            boxes = [boxes[0]]
        
        encodings = face_recognition.face_encodings(rgb, boxes)
        if not encodings:
            raise HTTPException(
                status_code=422,
                detail="Could not extract face encoding"
            )
        
        return encodings[0].tolist()
    
    @staticmethod
    def compare_face(
        stored_encoding: list, 
        img_bgr: np.ndarray, 
        tolerance: float = 0.5
    ) -> bool:
        """
        Compare stored face encoding with image
        
        Args:
            stored_encoding: Stored face encoding
            img_bgr: Image in BGR format to compare
            tolerance: Comparison tolerance (lower = stricter)
            
        Returns:
            True if faces match
        """
        rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb)
        
        if not boxes:
            return False
        
        encodings = face_recognition.face_encodings(rgb, boxes)
        if not encodings:
            return False
        
        stored_array = np.array(stored_encoding)
        for encoding in encodings:
            matches = face_recognition.compare_faces(
                [stored_array], 
                encoding, 
                tolerance=tolerance
            )
            if matches[0]:
                return True
        
        return False
    
    @staticmethod
    def encode_image_to_base64(img: np.ndarray) -> bytes:
        """
        Encode image to JPEG bytes for storage
        
        Args:
            img: Image as numpy array
            
        Returns:
            JPEG encoded bytes
        """
        success, buf = cv2.imencode('.jpg', img)
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Error encoding image to JPEG"
            )
        return buf.tobytes()

