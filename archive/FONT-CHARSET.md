# Font Charset Checks

Use this command to find characters in `source/` that are not supported by the font. It reads the font charset with `fc-scan`, converts that range list into a PCRE character class, and passes it to `rg`:

```sh
rg --no-config --pcre2 -n "[^$(fc-scan --format '%{charset}\n' source/_static/Px437_IBM_VGA_8x16_braille.woff2 | tr ' ' '\n' | sed -E 's/^([0-9a-fA-F]+)$/\\x{\1}/; s/^([0-9a-fA-F]+)-([0-9a-fA-F]+)$/\\x{\1}-\\x{\2}/' | tr -d '\n')]" source/
```

`--no-config` matters because the local ripgrep config may enable `--fixed-strings`, which disables regex matching.

## Replace With ASCII When Possible

Prefer replacing unsupported punctuation with ASCII equivalents:

```txt
’ -> '
‘ -> '
“ -> "
” -> "
— -> -- or -
– -> -
… -> ...
• -> * or -
  -> regular space
```

Replace only where the ASCII version preserves the meaning. Do not blindly replace non-Latin text, box drawing, block art, Braille, or intentional symbols unless the page is meant to be ASCII-only.

After editing, rerun the unsupported-character check to confirm the page content is covered by the font.
