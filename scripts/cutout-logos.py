"""
Turns the two Contessa logo JPEGs into transparent PNGs.

The artwork is line art sitting on a flat background (near-white #FEFEFE for the
light file, near-black #0B0B0B for the dark one). That means each pixel is the
artwork composited over a known colour:

    observed = alpha * art + (1 - alpha) * background

So rather than key out a colour range and leave hard, aliased edges, we recover
alpha per pixel and then divide the background back out ("unpremultiply"). That
keeps every antialiased edge and the thin gold hairlines intact, which a plain
threshold would chew up.

Alpha comes from how far a pixel travels away from the background:
  * over white  -> ink makes pixels DARKER, so min(R,G,B) falling is the signal
  * over black  -> ink makes pixels BRIGHTER, so max(R,G,B) rising is the signal

Both files get the SAME crop box. They are the same artwork on two backgrounds,
so cropping each to its own content box would give them different aspect ratios
and the logo would visibly jump when the visitor switches theme.

Outputs into public/brand/:
  logo-light.png / logo-dark.png      full lockup (drawing + CONTESSA + rule)
  emblem-light.png / emblem-dark.png  just the crowned figure, for the top bar

Also drops composited previews in preview-logos/ so the cutout can be checked
against several theme backgrounds before shipping.

Run from the repo root, after replacing either source JPEG:
    python scripts/cutout-logos.py

Needs Pillow and numpy:
    pip install pillow numpy
"""

import numpy as np
from PIL import Image

SRC = "public/brand"
OUT = "public/brand"
PREVIEW = "preview-logos"  # composited previews, gitignored
# Below this, alpha is JPEG noise in the flat background rather than artwork.
NOISE_FLOOR = 0.035
PAD = 3


def cut_out(filename: str, mode: str):
    rgb = np.asarray(Image.open(f"{SRC}/{filename}").convert("RGB")).astype(np.float64)
    h, w, _ = rgb.shape

    # Measure the background instead of assuming pure white / pure black.
    corners = np.concatenate([
        rgb[0:20, 0:20].reshape(-1, 3),
        rgb[0:20, w - 20:w].reshape(-1, 3),
        rgb[h - 20:h, 0:20].reshape(-1, 3),
        rgb[h - 20:h, w - 20:w].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    bg_level = float(np.median(bg))

    if mode == "on-white":
        alpha = (bg_level - rgb.min(axis=2)) / bg_level
        ink = 255.0 - rgb.min(axis=2)
    else:
        alpha = (rgb.max(axis=2) - bg_level) / (255.0 - bg_level)
        ink = rgb.max(axis=2)

    alpha = np.clip(alpha, 0.0, 1.0)
    # Drop the noise floor, then restretch so real artwork keeps full opacity.
    alpha = np.clip((alpha - NOISE_FLOOR) / (1.0 - NOISE_FLOOR), 0.0, 1.0)

    # Unpremultiply: recover the artwork's own colour, background divided out.
    a3 = alpha[..., None]
    art = np.clip((rgb - bg * (1.0 - a3)) / np.maximum(a3, 1e-4), 0, 255)
    # Fully transparent pixels have no meaningful colour; park them on the
    # background tone so any downstream resampling can't bleed stray hues in.
    art = np.where(a3 > 0, art, bg)

    rgba = np.dstack([art, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), ink


def content_bands(ink: np.ndarray, width: int):
    """Contiguous runs of rows that actually contain artwork."""
    rows = (ink > 40).sum(axis=1)
    filled = rows > max(3, int(width * 0.004))
    bands, start = [], None
    for i, f in enumerate(filled):
        if f and start is None:
            start = i
        elif not f and start is not None:
            bands.append((start, i - 1))
            start = None
    if start is not None:
        bands.append((start, len(filled) - 1))
    return bands


def alpha_bbox(img: Image.Image):
    return img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()


def union(a, b):
    return (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))


def save(img: Image.Image, path: str, max_width: int):
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, max(1, round(img.height * ratio))), Image.LANCZOS)
    img.save(path, "PNG", optimize=True)
    print(f"  {path}  {img.width}x{img.height}")
    return img


cuts, inks = {}, {}
for filename, mode, key in (
    ("logo-light.jpg", "on-white", "light"),
    ("logo-dark.jpg", "on-black", "dark"),
):
    cuts[key], inks[key] = cut_out(filename, mode)

# Shared full-logo box.
full_box = union(alpha_bbox(cuts["light"]), alpha_bbox(cuts["dark"]))
w_img = cuts["light"].width
full_box = (
    max(0, full_box[0] - PAD),
    max(0, full_box[1] - PAD),
    min(w_img, full_box[2] + PAD),
    min(cuts["light"].height, full_box[3] + PAD),
)
print("shared full box:", full_box)

# Shared emblem split: the tallest content band is the drawing; take the
# midpoint of the gap between it and whatever type sits below.
splits = []
for key in ("light", "dark"):
    bands = content_bands(inks[key], w_img)
    drawing = max(bands, key=lambda b: b[1] - b[0])
    below = [b for b in bands if b[0] > drawing[1]]
    splits.append((drawing[1] + below[0][0]) // 2 if below else cuts[key].height)
split = min(splits)
print("emblem split y:", split, "(candidates", splits, ")")

emblem_box = union(
    alpha_bbox(cuts["light"].crop((0, 0, w_img, split))),
    alpha_bbox(cuts["dark"].crop((0, 0, w_img, split))),
)
emblem_box = (
    max(0, emblem_box[0] - PAD),
    max(0, emblem_box[1] - PAD),
    min(w_img, emblem_box[2] + PAD),
    min(split, emblem_box[3] + PAD),
)
print("shared emblem box:", emblem_box)

finals = {}
for key in ("light", "dark"):
    print(f"\n=== {key} ===")
    finals[f"logo-{key}"] = save(
        cuts[key].crop(full_box), f"{OUT}/logo-{key}.png", 1000
    )
    finals[f"emblem-{key}"] = save(
        cuts[key].crop(emblem_box), f"{OUT}/emblem-{key}.png", 512
    )

# Composite previews onto the real theme backgrounds so the result can be
# judged the way a customer will see it — including a preset that is neither
# cream nor black, to prove the cutout is not tuned to one backdrop.
import os
os.makedirs(PREVIEW, exist_ok=True)
backdrops = [
    ("cream", (251, 248, 245), "light"),
    ("valentine", (255, 247, 247), "light"),
    ("ocean", (246, 249, 252), "light"),
    ("night", (11, 9, 8), "dark"),
    ("emerald-dark", (5, 11, 8), "dark"),
]
for label, colour, variant in backdrops:
    for kind in ("logo", "emblem"):
        art = finals[f"{kind}-{variant}"]
        canvas = Image.new("RGB", (art.width + 80, art.height + 80), colour)
        canvas.paste(art, (40, 40), art)
        canvas.save(f"{PREVIEW}/{kind}-on-{label}.png")
print(f"\npreviews written to {PREVIEW}/")
