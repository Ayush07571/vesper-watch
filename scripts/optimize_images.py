import os
from PIL import Image

images = [
    "public/images/caliber-detail.png",
    "public/images/titanium-detail.png",
    "public/images/components-detail.png"
]

for img_path in images:
    if os.path.exists(img_path):
        with Image.open(img_path) as img:
            # Resize if too large
            max_size = 1200
            if img.width > max_size or img.height > max_size:
                ratio = max_size / max(img.width, img.height)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Save as WebP
            webp_path = img_path.replace(".png", ".webp")
            img.save(webp_path, "WEBP", quality=80)
            print(f"Optimized {img_path} -> {webp_path}")
            
            # Remove original if different
            # os.remove(img_path) 
