"""
Makes the two small fonts the Swiss QR-bill generator uses, and a table of their character widths.

Why: the QR-bill style guide (SIX) only allows Helvetica, Arial, Frutiger or Liberation Sans, and the
QR-bill may contain every letter of the "Latin" character set (č, ć, ł, ő, ș …). The 14 standard PDF
fonts can't print those, so the PDF gets its own copy of Liberation Sans (free font, SIL Open Font
License 1.1). The full font files are 410 KB each; we keep only the letters a QR-bill may contain
(about 330), which makes them ~10 times smaller. The OFL asks that a changed font gets a new name,
so the copy is called "QR Bill Sans".

You only need this script if you want to make the fonts again. They are already in the repository:
  public/fonts/qr-bill-sans-regular.ttf, public/fonts/qr-bill-sans-bold.ttf  (+ OFL.txt)
  src/lib/qr-bill-font-widths.json  (used to break long lines exactly like the PDF does)

Usage (needs Python 3 and fontTools: pip install fonttools):
  python3 scripts/make-qr-bill-fonts.py /usr/share/fonts/truetype/liberation
The folder must contain LiberationSans-Regular.ttf and LiberationSans-Bold.ttf (version 2.x,
e.g. from the Debian/Ubuntu package fonts-liberation2 or https://github.com/liberationfonts).
"""

import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

# The characters a QR-bill may contain (SIX Implementation Guidelines, "Latin character set"):
# Basic Latin, Latin-1 Supplement, Latin Extended-A, Ș ș Ț ț and €. Plus "…" for shortened lines.
CHARACTERS = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + list(range(0x100, 0x180))
    + list(range(0x218, 0x21C))
    + [0x20AC, 0x2026]
)

APP = Path(__file__).resolve().parent.parent
NEW_FAMILY = 'QR Bill Sans'


def make_font(source: Path, style: str, target: Path) -> TTFont:
    options = subset.Options()
    options.hinting = False  # hinting only matters for tiny text on old screens
    options.layout_features = []  # no ligatures etc. – the PDF places every letter itself
    options.name_IDs = ['*']
    options.notdef_outline = True
    font = TTFont(source)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=CHARACTERS)
    subsetter.subset(font)

    # Rename (the OFL reserves the name "Liberation" for the original fonts).
    names = {
        1: NEW_FAMILY,
        3: f'{NEW_FAMILY} {style}; based on Liberation Sans',
        4: f'{NEW_FAMILY} {style}',
        6: f'QRBillSans-{style}',
        16: NEW_FAMILY,
        17: style,
    }
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID]
    font.save(target)
    return font


def widths(font: TTFont) -> dict[str, int]:
    """Advance width of every character, in font units (unitsPerEm per letter height)."""
    cmap = font.getBestCmap()
    metrics = font['hmtx'].metrics
    return {chr(code): metrics[cmap[code]][0] for code in CHARACTERS if code in cmap}


def main() -> None:
    folder = Path(sys.argv[1] if len(sys.argv) > 1 else '/usr/share/fonts/truetype/liberation')
    regular = make_font(folder / 'LiberationSans-Regular.ttf', 'Regular', APP / 'public/fonts/qr-bill-sans-regular.ttf')
    bold = make_font(folder / 'LiberationSans-Bold.ttf', 'Bold', APP / 'public/fonts/qr-bill-sans-bold.ttf')

    missing = [hex(code) for code in CHARACTERS if code not in regular.getBestCmap()]
    if missing:
        sys.exit(f'The font lacks these characters: {missing}')

    table = {
        'unitsPerEm': regular['head'].unitsPerEm,
        'regular': widths(regular),
        'bold': widths(bold),
    }
    (APP / 'src/lib/qr-bill-font-widths.json').write_text(json.dumps(table, ensure_ascii=False, separators=(',', ':')) + '\n')
    print('Fonts and widths written.')


if __name__ == '__main__':
    main()
