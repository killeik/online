# Font Optimization

This documents how the minimized fonts in `source/_static/` were produced.

## Tools

Required tools:

```sh
fontforge
woff2_compress
uv
```

`uv` is used to run FontTools without installing it into the project:

```sh
uvx --from 'fonttools[woff]' pyftsubset --help
```

## Optimize Px437 Alone

The original file:

```txt
source/_static/Px437_IBM_VGA_8x16.woff2
```

was optimized with FontTools subsetting while keeping every glyph:

```sh
uvx --from 'fonttools[woff]' pyftsubset \
  source/_static/Px437_IBM_VGA_8x16.woff2 \
  --output-file=source/_static/Px437_IBM_VGA_8x16_min.woff2 \
  --flavor=woff2 \
  --glyphs='*' \
  --layout-features='' \
  --no-hinting \
  --name-IDs='' \
  --name-legacy \
  --drop-tables+=DSIG
```

Verify that the charset did not change:

```sh
fc-scan --format '%{charset}\n' source/_static/Px437_IBM_VGA_8x16.woff2
fc-scan --format '%{charset}\n' source/_static/Px437_IBM_VGA_8x16_min.woff2
```

Result:

```txt
Px437_IBM_VGA_8x16.woff2      6652 bytes
Px437_IBM_VGA_8x16_min.woff2  5048 bytes
```

## Merge Px437 And Braille

The merged font was made by copying Braille codepoints from `braille.woff2` into `Px437_IBM_VGA_8x16.woff2` using FontForge, then optimizing the result with FontTools.

Temporary FontForge script:

```py
import fontforge

base_path = "source/_static/Px437_IBM_VGA_8x16.woff2"
braille_path = "source/_static/braille.woff2"
out_path = "source/_static/Px437_IBM_VGA_8x16_braille.ttf"

base = fontforge.open(base_path)
braille = fontforge.open(braille_path)

base.fontname = "Px437IBMVGA8x16Braille"
base.familyname = "Px437 IBM VGA 8x16 Braille"
base.fullname = "Px437 IBM VGA 8x16 Braille"

for codepoint in range(0x2800, 0x2900):
    if codepoint not in braille:
        continue
    braille.selection.none()
    braille.selection.select(codepoint)
    braille.copy()
    base.selection.none()
    base.selection.select(codepoint)
    base.paste()

base.generate(out_path)
base.close()
braille.close()
```

Run it:

```sh
fontforge -script /tmp/opencode/merge_fonts.py
```

Compress the raw merged TTF if you want to inspect the unoptimized WOFF2:

```sh
woff2_compress source/_static/Px437_IBM_VGA_8x16_braille.ttf
```

Then minimize the merged font with FontTools while keeping every glyph:

```sh
uvx --from 'fonttools[woff]' pyftsubset \
  source/_static/Px437_IBM_VGA_8x16_braille.woff2 \
  --output-file=source/_static/Px437_IBM_VGA_8x16_braille_min.woff2 \
  --flavor=woff2 \
  --glyphs='*' \
  --layout-features='' \
  --no-hinting \
  --name-IDs='' \
  --name-legacy \
  --drop-tables+=DSIG
```

Remove intermediate files after verifying the minimized WOFF2:

```sh
rm source/_static/Px437_IBM_VGA_8x16_braille.ttf
rm source/_static/Px437_IBM_VGA_8x16_braille.woff2
```

Verify the merged charset includes both Px437 and Braille:

```sh
fc-scan --format '%{charset}\n' source/_static/Px437_IBM_VGA_8x16_braille_min.woff2
```

Expected addition:

```txt
2800-28ff
```

## Size Results

```txt
Px437_IBM_VGA_8x16.woff2                  6652 bytes
braille.woff2                             1600 bytes
separate original total                    8252 bytes

Px437_IBM_VGA_8x16_min.woff2              5048 bytes
Px437_IBM_VGA_8x16_braille_min.woff2      6300 bytes
```

The minimized merged font is smaller than the two original files together and still includes the Braille range.

## Notes

The generic FontTools merge command was not used because the original fonts had incompatible units-per-em values:

```txt
Expected all items to be equal: [1600, 1000]
```

FontForge handled the glyph copy successfully. FontTools was then used only for cleanup and WOFF2 optimization.

The optimization strips hints and name records. That is acceptable for this pixel-style web font, but if font metadata matters, keep a non-stripped variant too.

## Split Web Fonts

The site uses three small fallback fonts so the browser downloads only the
character sets present on a page:

```txt
static/vga.woff2       2324 bytes  ASCII and the site's pseudographics
static/braille.woff2    816 bytes  U+2800-U+28FF
static/vga-ru.woff2    1416 bytes  Russian alphabet
```

The VGA source fonts remain in `archive/`. Subset them to intermediate TTFs
with FontTools. The Braille font is built from scratch with FontBuilder: it
does not use an existing font file as input. Finally, enable the optional
WOFF2 `hmtx` transform.

The base charset is:

```txt
U+0020-007E,U+00B7,U+2022,U+2500,U+2502,U+2510,U+2514,U+2518,
U+251C,U+252C,U+2534,U+2550-2551,U+2554,U+2557,U+255A,U+255D,
U+2560,U+2563-2566,U+2568-2569,U+2580,U+2584,U+2588,U+258C,
U+2590-2593
```

Build the three subsets with the same cleanup options:

```sh
BASE_CHARSET='U+0020-007E,U+00B7,U+2022,U+2500,U+2502,U+2510,U+2514,U+2518,U+251C,U+252C,U+2534,U+2550-2551,U+2554,U+2557,U+255A,U+255D,U+2560,U+2563-2566,U+2568-2569,U+2580,U+2584,U+2588,U+258C,U+2590-2593'

uvx --from 'fonttools[woff]' pyftsubset \
  archive/Px437_IBM_VGA_8x16.woff2 \
  --output-file=/tmp/vga.ttf \
  --unicodes="$BASE_CHARSET" \
  --layout-features='' \
  --no-hinting \
  --name-IDs='' \
  --name-legacy \
  --drop-tables+=DSIG,GDEF,gasp

uvx --from 'fonttools[woff]' pyftsubset \
  archive/PxPlus_IBM_VGA_8x16.woff2 \
  --output-file=/tmp/vga-ru.ttf \
  --unicodes='U+0401,U+0410-044F,U+0451' \
  --layout-features='' \
  --no-hinting \
  --name-IDs='' \
  --name-legacy \
  --drop-tables+=DSIG,GDEF,gasp
```

Build the Braille TTF from scratch. The script creates the required TrueType
tables, eight reusable square outlines, U+2800-U+28FF, and 255 composite
glyphs:

```sh
uv run --with 'fonttools[woff]' python \
  archive/build-braille.py \
  /tmp/braille.ttf

uvx --from 'fonttools[woff]' pyftsubset \
  /tmp/braille.ttf \
  --output-file=/tmp/braille-min.ttf \
  --unicodes='U+2800-28FF' \
  --layout-features='' \
  --no-hinting \
  --name-IDs='' \
  --name-legacy \
  --drop-tables+=DSIG,GDEF,gasp
```

No source font is read by this script. The metrics and square positions are
declared directly in the code.

Reduce the VGA subsets' `OS/2` table to version 0 and set reproducible font
timestamps. Their outlines, character maps, and metrics do not change:

```sh
uv run --with 'fonttools[woff]' python \
  archive/minimize-font-metadata.py \
  /tmp/vga.ttf \
  /tmp/vga-min.ttf

uv run --with 'fonttools[woff]' python \
  archive/minimize-font-metadata.py \
  /tmp/vga-ru.ttf \
  /tmp/vga-ru-min.ttf
```

Optimize the 8x16 pixel glyphs. For every glyph, the script keeps the shortest
of the original outline, horizontal rectangles, and vertical rectangles:

```sh
uv run --with 'fonttools[woff]' python \
  archive/optimize-pixel-glyphs.py \
  /tmp/vga-min.ttf \
  /tmp/vga-pixels.ttf

uv run --with 'fonttools[woff]' python \
  archive/optimize-pixel-glyphs.py \
  /tmp/vga-ru-min.ttf \
  /tmp/vga-ru-pixels.ttf
```

The rectangle variants preserve the occupied 8x16 cells exactly. Chromium
rendering of the old and optimized files was pixel-identical at 16, 17, 23,
and 32 CSS pixels.

Compress each TTF with the optional horizontal metrics transform:

```sh
uvx --from 'fonttools[woff]' fonttools ttLib.woff2 compress \
  --hmtx-transform -o static/vga.woff2 /tmp/vga-pixels.ttf
uvx --from 'fonttools[woff]' fonttools ttLib.woff2 compress \
  --hmtx-transform -o static/braille.woff2 /tmp/braille-min.ttf
uvx --from 'fonttools[woff]' fonttools ttLib.woff2 compress \
  --hmtx-transform -o static/vga-ru.woff2 /tmp/vga-ru-pixels.ttf
```

Verify the charsets:

```sh
fc-scan --format '%{charset}\n' \
  static/vga.woff2 static/braille.woff2 static/vga-ru.woff2
```

Keep the Braille and Cyrillic `unicode-range` descriptors in `main.scss`.
Without them, a browser may download fallback fonts just to inspect their
character maps when it encounters an unrelated unsupported script.

The resulting font transfer sizes are:

```txt
ASCII page       2324 bytes  vga.woff2
Braille page     3140 bytes  vga.woff2 + braille.woff2
Russian page     3740 bytes  vga.woff2 + vga-ru.woff2
all three files  4556 bytes
```
