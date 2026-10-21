from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public" / "logo.png"
APP = Path(__file__).resolve().parents[1] / "android" / "app" / "src"

# Extract the exact logo artwork from its white matte while retaining antialiased edges.
image = Image.open(SOURCE).convert("RGBA")
pixels = image.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, _ = pixels[x, y]
        alpha = 255 - min(r, g, b)
        if alpha == 0:
            pixels[x, y] = (0, 0, 0, 0)
        else:
            # Undo white matte compositing so edge colors stay clean on either background.
            pixels[x, y] = tuple(max(0, min(255, round((channel - (255 - alpha)) * 255 / alpha))) for channel in (r, g, b)) + (alpha,)

bounds = image.getbbox()
mark = image.crop(bounds)
mark.thumbnail((310, 310), Image.Resampling.LANCZOS)
foreground = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
foreground.alpha_composite(mark, ((512 - mark.width) // 2, (512 - mark.height) // 2))
main_res = APP / "main" / "res"
(main_res / "drawable-nodpi").mkdir(parents=True, exist_ok=True)
foreground.save(main_res / "drawable-nodpi" / "ic_launcher_foreground.png")

variants = {
    "citizen": ("#FFFFFFFF", (255, 255, 255, 255)),
    "agent": ("#168A4A", (22, 138, 74, 255)),
}
for flavor, (color, rgba) in variants.items():
    flavor_res = APP / flavor / "res"
    values = flavor_res / "values"
    values.mkdir(parents=True, exist_ok=True)
    (values / "launcher_colors.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="launcher_background">' + color + '</color>\n</resources>\n',
        encoding="utf-8",
    )
    adaptive = flavor_res / "mipmap-anydpi-v26"
    adaptive.mkdir(parents=True, exist_ok=True)
    (adaptive / "ic_launcher.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@color/launcher_background"/>\n'
        '    <foreground android:drawable="@drawable/ic_launcher_foreground"/>\n</adaptive-icon>\n',
        encoding="utf-8",
    )
    for density, size in (("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)):
        directory = flavor_res / f"mipmap-{density}"
        directory.mkdir(parents=True, exist_ok=True)
        background = Image.new("RGBA", (size, size), rgba)
        icon_mark = foreground.resize((size, size), Image.Resampling.LANCZOS)
        background.alpha_composite(icon_mark)
        background.save(directory / "ic_launcher.png")
    print(f"Generated launcher resources for {flavor}")
