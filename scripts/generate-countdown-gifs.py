"""
Generates the animated dog-themed countdown GIFs (public/images/countdown/day-N.gif).
Free tooling only: Pillow + the macOS "Apple Color Emoji" font.

    python3 scripts/generate-countdown-gifs.py

Re-run only when the artwork changes; the GIFs are committed.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public/images/countdown"
SIZE = 480
FRAMES = 14
START_DAYS = 14  # keep in sync with COUNTDOWN_START_DAYS

EMOJI_FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"
TEXT_FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

CREAM = (253, 247, 238)
SAGE = (122, 140, 110)
GOLD = (201, 162, 90)
BLUSH = (244, 214, 208)

ASSETS = Path(__file__).resolve().parent / "assets"
_emoji_cache: dict[str, Image.Image] = {}


def dog_portrait(px: int) -> Image.Image:
    """The couple's dog (scripts/assets/dog.jpg), circle-cropped with a gold ring."""
    key = f"dog{px}"
    if key not in _emoji_cache:
        scale = 4  # supersample the mask for smooth edges
        photo = Image.open(ASSETS / "dog.jpg").convert("RGBA").resize((px, px), Image.LANCZOS)
        mask = Image.new("L", (px * scale, px * scale), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, px * scale - 1, px * scale - 1), fill=255)
        photo.putalpha(mask.resize((px, px), Image.LANCZOS))
        ring = Image.new("RGBA", (px + 12, px + 12), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, px + 11, px + 11), fill=GOLD + (255,))
        ring.alpha_composite(photo, (6, 6))
        _emoji_cache[key] = ring
    return _emoji_cache[key]


def emoji(char: str, px: int) -> Image.Image:
    key = f"{char}{px}"
    if key not in _emoji_cache:
        font = ImageFont.truetype(EMOJI_FONT, 160)  # the only bitmap strike Apple ships
        img = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
        ImageDraw.Draw(img).text((0, 0), char, font=font, embedded_color=True)
        img = img.crop(img.getbbox())
        _emoji_cache[key] = img.resize((px, px), Image.LANCZOS)
    return _emoji_cache[key]


def paste_center(base: Image.Image, img: Image.Image, cx: float, cy: float):
    base.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


def centered_text(draw, text, cy, font, fill):
    w = draw.textlength(text, font=font)
    draw.text(((SIZE - w) / 2, cy), text, font=font, fill=fill)


def frame(day: int, i: int, confetti) -> Image.Image:
    t = i / FRAMES * 2 * math.pi
    img = Image.new("RGBA", (SIZE, SIZE), CREAM + (255,))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((14, 14, SIZE - 14, SIZE - 14), 28, outline=GOLD, width=4)

    # Confetti first so it stays behind the text (wedding day only).
    if day == 0:
        for x, y0, speed, color, sz in confetti:
            y = (y0 + i * speed) % SIZE
            d.rectangle((x, y, x + sz, y + sz * 1.6), fill=color)

    # Bobbing paw prints in a band along the bottom.
    for k in range(6):
        paste_center(img, emoji("🐾", 30), 60 + k * 72, 440 + 7 * math.sin(t + k))

    wedding_day = day == 0
    bounce = abs(math.sin(t)) * 26
    paste_center(img, dog_portrait(150), SIZE / 2 - 20 if wedding_day else SIZE / 2, 130 - bounce)
    if wedding_day:
        paste_center(img, emoji("💍", 70), SIZE / 2 + 80, 180 - bounce * 0.5)
    paste_center(img, emoji("🎀", 54), SIZE / 2, 200 - bounce) if not wedding_day else None

    if wedding_day:
        centered_text(d, "HOJE É O DIA!", 235, ImageFont.truetype(TEXT_FONT, 46), SAGE)
        centered_text(d, "Ellen & Bruno", 300, ImageFont.truetype(TEXT_FONT, 38), GOLD)
    else:
        pulse = 1 + 0.06 * math.sin(t)
        num = ImageFont.truetype(TEXT_FONT, int(130 * pulse))
        text = str(day)
        w = d.textlength(text, font=num)
        d.text(((SIZE - w) / 2, 215 - (num.size - 130) / 2), text, font=num, fill=SAGE)
        label = "DIA PARA O SIM!" if day == 1 else "DIAS PARA O SIM!"
        centered_text(d, label, 345, ImageFont.truetype(TEXT_FONT, 32), GOLD)
    centered_text(d, "24 · 10 · 2026", 392 if not wedding_day else 360,
                  ImageFont.truetype(TEXT_FONT, 22), SAGE)
    return img


def main():
    rng = random.Random(24)
    confetti = [
        (rng.randint(20, SIZE - 30), rng.randint(0, SIZE), rng.choice([20, 34, 48]),
         rng.choice([GOLD, SAGE, BLUSH, (230, 150, 140)]), rng.randint(6, 11))
        for _ in range(40)
    ]
    for day in range(START_DAYS + 1):
        frames = [frame(day, i, confetti).convert("P", palette=Image.ADAPTIVE, colors=64)
                  for i in range(FRAMES)]
        path = OUT / f"day-{day}.gif"
        frames[0].save(path, save_all=True, append_images=frames[1:],
                       duration=70, loop=0, optimize=True, disposal=2)
        print(path.name, path.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
