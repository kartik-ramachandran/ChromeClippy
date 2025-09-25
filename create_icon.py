from PIL import Image, ImageDraw
import os

# Create a simple 128x128 Clippy icon
def create_clippy_icon():
    # Create image
    img = Image.new('RGBA', (128, 128), (74, 144, 226, 255))  # Blue background
    draw = ImageDraw.Draw(img)
    
    # Draw Clippy shape
    # Main body (vertical rectangle)
    draw.rectangle([30, 20, 50, 100], fill=(44, 90, 160, 255), outline=(255, 255, 255, 255), width=2)
    
    # Clip part (horizontal rectangle)
    draw.rectangle([50, 35, 85, 55], fill=(44, 90, 160, 255), outline=(255, 255, 255, 255), width=2)
    
    # Eyes
    draw.rectangle([35, 40, 41, 46], fill=(255, 255, 255, 255))
    draw.rectangle([35, 55, 41, 61], fill=(255, 255, 255, 255))
    
    # Save icon
    img.save('clippy-icon.png')
    print("Icon created successfully!")

if __name__ == "__main__":
    try:
        create_clippy_icon()
    except ImportError:
        print("PIL not available, creating simple file...")
        # Create a minimal PNG file header (will create a small valid PNG)
        with open('clippy-icon.png', 'wb') as f:
            # Minimal PNG file
            f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x02\x00\x00\x00\x90\x91h6\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\xc9e<\x00\x00\x00\x0eIDATx\x9cc\xf8\x0f\x00\x00\x01\x00\x01\x00\x00\x00\x00\x00IEND\xaeB`\x82')
        print("Basic icon file created!")