import sys

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


units_per_em = 1600
advance_width = 500
dot_boxes = [
    (88, 588, 213, 713),
    (88, 388, 213, 513),
    (88, 188, 213, 313),
    (288, 588, 413, 713),
    (288, 388, 413, 513),
    (288, 188, 413, 313),
    (88, -12, 213, 113),
    (288, -12, 413, 113),
]
dot_names = [f"brailleDot{index}" for index in range(1, 9)]
braille_names = [f"uni{codepoint:04X}" for codepoint in range(0x2800, 0x2900)]
glyph_order = [".notdef", *braille_names, *dot_names]


def empty_glyph():
    return TTGlyphPen().glyph()


glyphs = {".notdef": empty_glyph()}
metrics = {".notdef": (advance_width, 0)}

for name, (x_min, y_min, x_max, y_max) in zip(dot_names, dot_boxes):
    pen = TTGlyphPen()
    pen.moveTo((x_min, y_min))
    pen.lineTo((x_min, y_max))
    pen.lineTo((x_max, y_max))
    pen.lineTo((x_max, y_min))
    pen.closePath()
    glyphs[name] = pen.glyph()
    metrics[name] = (advance_width, x_min)

component_set = {name: None for name in dot_names}
for pattern, name in enumerate(braille_names):
    pen = TTGlyphPen(component_set)
    for bit, dot_name in enumerate(dot_names):
        if pattern & (1 << bit):
            pen.addComponent(dot_name, (1, 0, 0, 1, 0, 0))
    glyphs[name] = pen.glyph()
    if pattern == 0:
        left_side_bearing = 0
    elif pattern & 0b01000111:
        left_side_bearing = 88
    else:
        left_side_bearing = 288
    metrics[name] = (advance_width, left_side_bearing)

font = FontBuilder(units_per_em, isTTF=True)
font.setupGlyphOrder(glyph_order)
font.setupCharacterMap(
    {codepoint: name for codepoint, name in zip(range(0x2800, 0x2900), braille_names)}
)
font.setupGlyf(glyphs)
font.setupHorizontalMetrics(metrics)
font.setupHorizontalHeader(ascent=1200, descent=-400, lineGap=0)
font.setupNameTable(
    {
        "familyName": "Square Braille",
        "styleName": "Regular",
        "uniqueFontIdentifier": "Square Braille",
        "fullName": "Square Braille",
        "psName": "SquareBraille",
        "version": "Version 1.0",
    }
)
font.setupOS2(
    version=0,
    fsType=0,
    sTypoAscender=1200,
    sTypoDescender=-400,
    sTypoLineGap=0,
    usWinAscent=1200,
    usWinDescent=400,
)
font.setupPost(keepGlyphNames=False)
font.setupMaxp()
font.font.recalcTimestamp = False
font.font["head"].created = 2082844800
font.font["head"].modified = 2082844800
font.save(sys.argv[1])
