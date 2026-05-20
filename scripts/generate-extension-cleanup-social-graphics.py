from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "extension-cleanup"
OUT.mkdir(parents=True, exist_ok=True)

BG = "#F7F5EF"
CARD = "#FFFFFF"
TEXT = "#17211F"
SOFT = "#34413D"
MUTED = "#5D6863"
TEAL = "#0F5F5C"
TEAL_DARK = "#0A4543"
AMBER = "#B87333"
BORDER = "#D9D6CC"

SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

ARTICLES = [
    {
        "slug": "quickbooks-cleanup-before-tax-filing",
        "headline": "QuickBooks cleanup before tax filing",
        "subhead": "Know what needs fixing before the return is prepared.",
        "accent": "QuickBooks cleanup",
    },
    {
        "slug": "tax-ready-bookkeeping-before-filing",
        "headline": "Tax-ready bookkeeping before filing",
        "subhead": "Reports should be reliable before tax preparation starts.",
        "accent": "Tax-ready books",
    },
    {
        "slug": "catch-up-bookkeeping-extended-tax-deadline",
        "headline": "Catch-up bookkeeping before the extended deadline",
        "subhead": "Get months of activity organized before filing.",
        "accent": "Catch-up bookkeeping",
    },
    {
        "slug": "filed-tax-extension-books-not-ready",
        "headline": "Filed an extension because the books were not ready?",
        "subhead": "Use the extra filing time to find what still needs cleanup.",
        "accent": "Extension cleanup",
    },
    {
        "slug": "schedule-c-s-corp-partnership-extension-deadlines-2026",
        "headline": "Schedule C, S Corp, or Partnership deadline?",
        "subhead": "Know whether September 15 or October 15 applies.",
        "accent": "2026 deadlines",
    },
]

FORMATS = {
    "og": (1200, 630),
    "feed": (1080, 1350),
    "story": (1440, 2560),
}


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        if draw.textbbox((0, 0), test, font=fnt)[2] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_logo(draw, x, y, size):
    rounded(draw, (x, y, x + size, y + size), max(8, size // 4), TEAL_DARK)
    logo_font = font(SANS_BOLD, int(size * 0.34))
    text = "BB"
    box = draw.textbbox((0, 0), text, font=logo_font)
    draw.text((x + (size - (box[2] - box[0])) / 2, y + (size - (box[3] - box[1])) / 2 - size * 0.03), text, font=logo_font, fill="#FFFFFF")


def draw_card_art(draw, x, y, w, h, scale=1):
    rounded(draw, (x, y, x + w, y + h), int(28 * scale), CARD, BORDER, int(2 * scale))
    top_h = int(h * 0.22)
    rounded(draw, (x, y, x + w, y + top_h), int(28 * scale), "#EEF4F1", None)
    draw.line((x, y + top_h, x + w, y + top_h), fill=BORDER, width=max(1, int(2 * scale)))
    for i, label_w in enumerate([0.70, 0.52, 0.62, 0.44]):
        yy = y + top_h + int((i + 1) * h * 0.15)
        draw.ellipse((x + int(0.08 * w), yy - int(7 * scale), x + int(0.08 * w) + int(14 * scale), yy + int(7 * scale)), outline=TEAL, width=max(1, int(2 * scale)))
        draw.line((x + int(0.16 * w), yy, x + int((0.16 + label_w) * w), yy), fill=BORDER, width=max(2, int(4 * scale)))
    draw.line((x + int(0.08 * w), y + h - int(0.16 * h), x + w - int(0.08 * w), y + h - int(0.16 * h)), fill=TEAL, width=max(4, int(8 * scale)))


def draw_graphic(article, fmt, size):
    W, H = size
    img = Image.new("RGB", size, BG)
    draw = ImageDraw.Draw(img)
    margin = int(W * 0.075)
    top = int(H * 0.08)
    bottom = int(H * 0.08)

    if fmt == "story":
        top = int(H * 0.14)
        bottom = int(H * 0.16)
        margin = int(W * 0.09)

    draw_logo(draw, margin, top, int(W * 0.045))
    brand_font = font(SANS_BOLD, int(W * 0.025))
    draw.text((margin + int(W * 0.06), top + int(W * 0.009)), "Balance Beam", font=brand_font, fill=TEXT)

    pill_font = font(SANS_BOLD, int(W * 0.022))
    pill_text = "Extension Cleanup Series"
    pill_box = draw.textbbox((0, 0), pill_text, font=pill_font)
    pill_w = pill_box[2] - pill_box[0] + int(W * 0.05)
    pill_h = int(W * 0.052)
    pill_x = margin
    pill_y = top + int(H * 0.13)
    rounded(draw, (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h), pill_h // 2, "#EEF4F1", "#BDD7D3", max(1, int(W * 0.0015)))
    draw.text((pill_x + int(W * 0.025), pill_y + int(W * 0.014)), pill_text, font=pill_font, fill=TEAL)

    if fmt == "og":
        headline_size = int(W * 0.055)
        body_size = int(W * 0.025)
        max_text_w = int(W * 0.62)
        art_x, art_y, art_w, art_h = int(W * 0.69), int(H * 0.27), int(W * 0.23), int(H * 0.45)
    elif fmt == "feed":
        headline_size = int(W * 0.07)
        body_size = int(W * 0.034)
        max_text_w = int(W * 0.78)
        art_x, art_y, art_w, art_h = int(W * 0.55), int(H * 0.58), int(W * 0.32), int(H * 0.23)
    else:
        headline_size = int(W * 0.082)
        body_size = int(W * 0.044)
        max_text_w = int(W * 0.80)
        art_x, art_y, art_w, art_h = int(W * 0.18), int(H * 0.61), int(W * 0.64), int(H * 0.19)

    headline_font = font(SERIF, headline_size)
    body_font = font(SANS, body_size)
    small_font = font(SANS_BOLD, int(body_size * 0.72))

    text_y = pill_y + pill_h + int(H * 0.055)
    for line in wrap_text(draw, article["headline"], headline_font, max_text_w):
        draw.text((margin, text_y), line, font=headline_font, fill=TEXT)
        text_y += int(headline_size * 1.13)

    text_y += int(H * 0.025)
    for line in wrap_text(draw, article["subhead"], body_font, max_text_w):
        draw.text((margin, text_y), line, font=body_font, fill=SOFT)
        text_y += int(body_size * 1.55)

    if fmt == "og":
        draw_card_art(draw, art_x, art_y, art_w, art_h, W / 1200)
    else:
        draw_card_art(draw, art_x, art_y, art_w, art_h, W / 1080)

    cta = "Request an Extension Cleanup Review"
    cta_w = draw.textbbox((0, 0), cta, font=small_font)[2] + int(W * 0.06)
    cta_h = int(W * 0.06 if fmt != "story" else W * 0.075)
    cta_x = margin
    cta_y = H - bottom - cta_h
    rounded(draw, (cta_x, cta_y, cta_x + cta_w, cta_y + cta_h), int(cta_h * 0.24), TEAL, None)
    draw.text((cta_x + int(W * 0.03), cta_y + int(cta_h * 0.31)), cta, font=small_font, fill="#FFFFFF")

    accent_font = font(SANS_BOLD, int(body_size * 0.72))
    accent = article["accent"]
    box = draw.textbbox((0, 0), accent, font=accent_font)
    draw.text((W - margin - (box[2] - box[0]), H - bottom - int(cta_h * 0.70)), accent, font=accent_font, fill=AMBER)

    return img


for article in ARTICLES:
    for fmt, size in FORMATS.items():
        img = draw_graphic(article, fmt, size)
        path = OUT / f"{article['slug']}-{fmt}.png"
        img.save(path, "PNG", optimize=True)
        print(path.relative_to(ROOT))
