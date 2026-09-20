import sys

from fontTools.ttLib import TTFont


font = TTFont(sys.argv[1])
font.flavor = None
font.recalcTimestamp = False
font["head"].created = 2082844800
font["head"].modified = 2082844800

os2 = font["OS/2"]
os2.version = 0
os2.fsSelection &= ~(1 << 7)

font.save(sys.argv[2])
