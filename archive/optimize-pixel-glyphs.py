import sys

from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


def winding_number(contours, x, y):
    winding = 0
    for contour in contours:
        for first, second in zip(contour, contour[1:] + contour[:1]):
            x1, y1 = first
            x2, y2 = second
            cross = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)
            if y1 <= y < y2 and cross > 0:
                winding += 1
            elif y2 <= y < y1 and cross < 0:
                winding -= 1
    return winding


def get_contours(glyph, glyf):
    coordinates, end_points, _ = glyph.getCoordinates(glyf)
    contours = []
    start = 0
    for end in end_points:
        contours.append([tuple(point) for point in coordinates[start : end + 1]])
        start = end + 1
    return contours


def get_horizontal_rectangles(cells):
    rectangles = []
    active = {}
    for y in range(-4, 12):
        runs = []
        x = 0
        while x < 8:
            if (x, y) not in cells:
                x += 1
                continue
            start = x
            while x < 8 and (x, y) in cells:
                x += 1
            runs.append((start, x))

        next_active = {}
        for run in runs:
            if run in active:
                x1, y1, x2, _ = active[run]
                next_active[run] = (x1, y1, x2, y + 1)
            else:
                next_active[run] = (run[0], y, run[1], y + 1)
        rectangles.extend(rect for run, rect in active.items() if run not in next_active)
        active = next_active
    rectangles.extend(active.values())
    return rectangles


def get_vertical_rectangles(cells):
    rectangles = []
    active = {}
    for x in range(8):
        runs = []
        y = -4
        while y < 12:
            if (x, y) not in cells:
                y += 1
                continue
            start = y
            while y < 12 and (x, y) in cells:
                y += 1
            runs.append((start, y))

        next_active = {}
        for run in runs:
            if run in active:
                x1, y1, _, y2 = active[run]
                next_active[run] = (x1, y1, x + 1, y2)
            else:
                next_active[run] = (x, run[0], x + 1, run[1])
        rectangles.extend(rect for run, rect in active.items() if run not in next_active)
        active = next_active
    rectangles.extend(active.values())
    return rectangles


def rectangle_glyph(rectangles):
    pen = TTGlyphPen()
    for x1, y1, x2, y2 in rectangles:
        pen.moveTo((x1 * 100, y1 * 100))
        pen.lineTo((x1 * 100, y2 * 100))
        pen.lineTo((x2 * 100, y2 * 100))
        pen.lineTo((x2 * 100, y1 * 100))
        pen.closePath()
    return pen.glyph()


font = TTFont(sys.argv[1])
font.flavor = None
glyf = font["glyf"]

for name in font.getGlyphOrder():
    source = glyf[name]
    if source.numberOfContours <= 0:
        continue
    contours = get_contours(source, glyf)
    cells = {
        (x, y)
        for y in range(-4, 12)
        for x in range(8)
        if winding_number(contours, x * 100 + 50, y * 100 + 50)
    }
    candidates = [
        source,
        rectangle_glyph(get_horizontal_rectangles(cells)),
        rectangle_glyph(get_vertical_rectangles(cells)),
    ]
    glyf[name] = min(candidates, key=lambda glyph: len(glyph.compile(glyf)))

font.recalcTimestamp = False
font.save(sys.argv[2])
