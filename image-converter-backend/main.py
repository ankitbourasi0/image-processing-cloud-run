from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Helper function to save image in different format and compress
def convert_image(image: Image.Image, format: str, quality: int) -> io.BytesIO:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format, quality=quality)
    img_byte_arr.seek(0)
    return img_byte_arr


# Route to convert JPG to PNG
@app.post("/convert/jpg-to-png")
async def convert_jpg_to_png(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = Image.open(file.file)
        if image.format != "JPEG":
            raise HTTPException(status_code=400, detail="File must be JPG")
        
        img_byte_arr = convert_image(image, "PNG", 100)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename.split(".")[0]}.png"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Route to convert PNG to JPG
@app.post("/convert/png-to-jpg")
async def convert_png_to_jpg(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = Image.open(file.file)
        if image.format != "PNG":
            raise HTTPException(status_code=400, detail="File must be PNG")

# JPG does not support transparency - RGBA means Red, Green, Blue, Alpha - Alpha is transparency.

# You need to discard the Alpha Channel or save as something that supports transparency - like PNG.

# The Image class has a method convert which can be used to convert RGBA to RGB - after that you will be able to save as JPG.
        rgb_im = image.convert('RGB')
        img_byte_arr = convert_image(rgb_im, "JPEG", 100)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename.split(".")[0]}.jpg"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Route to compress JPG image
@app.post("/compress/jpg")
async def compress_jpg(file: UploadFile = File(...), quality: int = 50):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = Image.open(file.file)
        if image.format != "JPEG":
            raise HTTPException(status_code=400, detail="File must be JPG")
        
        img_byte_arr = convert_image(image, "JPEG", quality)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Route to compress PNG image
@app.post("/compress/png")
async def compress_png(file: UploadFile = File(...), quality: int = 50):
    print("compresss image")
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = Image.open(file.file)
        if image.format != "PNG":
            raise HTTPException(status_code=400, detail="File must be PNG")
        
        img_byte_arr = convert_image(image, "PNG", quality)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Route to resize image
@app.post("/resize")
async def resize_image(file: UploadFile = File(...), width: int = 100, height: int = 100):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = Image.open(file.file)
        resized_image = image.resize((width, height))
        img_byte_arr = convert_image(resized_image, image.format, 100)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type=file.content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get('PORT', 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)