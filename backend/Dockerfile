FROM python:3.10-slim

# Install system dependencies required for Computer Vision (OpenCV) and OCR (Tesseract)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

# Hugging Face Spaces expose port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
