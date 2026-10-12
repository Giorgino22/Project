"""
Creates the sample images used by the tests (they are committed, so you only
need to run this if you want to change them). Requires Python 3 + Pillow:
    pip install pillow && python3 tests/fixtures/make-fixtures.py
"""
import io
import random
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw
from PIL.PngImagePlugin import PngInfo

HERE = Path(__file__).parent
random.seed(42)  # same images on every run

# A fake location (Eiffel Tower) so the "remove EXIF" test has GPS data to find.
GPS = {
    1: "N", 2: (48.0, 51.0, 30.24),  # latitude 48°51'30.24"
    3: "E", 4: (2.0, 17.0, 40.2),    # longitude 2°17'40.2"
}

XMP = b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>Test Person</dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>'


def photo(width, height, noise=True):
    """A colourful test 'photo': gradient + shapes (+ noise so JPEG compression has work to do)."""
    image = Image.new("RGB", (width, height))
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            n = random.randint(-12, 12) if noise else 0
            pixels[x, y] = (
                max(0, min(255, int(255 * x / width) + n)),
                max(0, min(255, int(255 * y / height) + n)),
                max(0, min(255, 160 + n)),
            )
    draw = ImageDraw.Draw(image)
    draw.ellipse((width * 0.1, height * 0.1, width * 0.5, height * 0.6), fill=(250, 220, 40))
    draw.rectangle((width * 0.6, height * 0.5, width * 0.9, height * 0.9), fill=(30, 30, 30))
    return image


def exif_with_gps(orientation=1):
    exif = Image.Exif()
    exif[0x010F] = "TestCam"            # Make
    exif[0x0110] = "Model X"            # Model
    exif[0x0131] = "Test Software 1.0"  # Software
    exif[0x0112] = orientation          # Orientation
    exif[0x0132] = "2026:07:14 12:30:00"
    exif.get_ifd(0x8769)[0x9003] = "2026:07:14 12:30:00"  # DateTimeOriginal
    gps = exif.get_ifd(0x8825)
    for key, value in GPS.items():
        gps[key] = value
    return exif


srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()

# 1) A phone-like photo: stored 64 wide × 48 high, but Orientation 6 = "rotate 90° clockwise",
#    so viewers show it 48 × 64. Has GPS, XMP, a comment and a colour profile.
photo(64, 48).save(
    HERE / "photo-gps.jpg", quality=90, exif=exif_with_gps(orientation=6),
    xmp=XMP, comment=b"secret comment", icc_profile=srgb,
)

# 2) Same idea, progressive JPEG (pixel data in several "scans").
photo(64, 48).save(HERE / "photo-gps-progressive.jpg", quality=90, progressive=True, exif=exif_with_gps())

# 3) A plain, bigger photo without metadata for compress/resize/convert tests.
photo(400, 300).save(HERE / "photo.jpg", quality=95)

# 4) A PNG with transparency, a text chunk and EXIF.
png = Image.new("RGBA", (80, 60), (0, 0, 0, 0))
ImageDraw.Draw(png).ellipse((10, 5, 70, 55), fill=(20, 120, 220, 255))
info = PngInfo()
info.add_text("Author", "Test Person")
info.add_text("Comment", "secret comment")
png.save(HERE / "graphic.png", pnginfo=info, exif=exif_with_gps())

# 5) A WebP with EXIF and XMP (this makes Pillow write the extended "VP8X" format).
photo(64, 48).save(HERE / "photo.webp", quality=80, exif=exif_with_gps(), xmp=XMP)

# 6) A GIF (a format the compressor turns into JPG).
photo(64, 48, noise=False).convert("P", palette=Image.ADAPTIVE).save(HERE / "photo.gif")

for file in sorted(HERE.glob("*.*")):
    if file.suffix != ".py":
        print(f"{file.name:32} {file.stat().st_size:>7} bytes")
