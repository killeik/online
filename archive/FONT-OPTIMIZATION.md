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
