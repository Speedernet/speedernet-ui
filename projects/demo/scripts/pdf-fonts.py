# Builds the static Mulish TrueType files the style guide PDF embeds (projects/demo/public/fonts).
# A PDF can't embed the variable WOFF2 font of the library, so this script takes it, makes one
# static instance per weight used by the style guide (400, 700, 800) and keeps only the
# characters of the WinAnsi encoding the PDF writes.
#
#   pip install fonttools brotli
#   python projects/demo/scripts/pdf-fonts.py projects/ui/assets/fonts/mulish-latin.woff2 projects/demo/public/fonts
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

src, outdir = sys.argv[1], sys.argv[2]
# Characters a PDF in WinAnsi encoding can show: Latin-1 and the Windows-1252 extras.
cp1252 = bytes(range(0x80, 0xA0)).decode('cp1252', errors='ignore')
chars = ''.join(chr(c) for c in range(0x20, 0x7F)) + ''.join(chr(c) for c in range(0xA0, 0x100)) + cp1252
for weight, style in [(400, 'Regular'), (700, 'Bold'), (800, 'ExtraBold')]:
    font = TTFont(src)
    font.flavor = None
    static = instantiateVariableFont(font, {'wght': weight}, updateFontNames=False)
    options = subset.Options()
    options.layout_features = []
    options.name_IDs = ['*']
    options.notdef_outline = True
    options.hinting = False
    sub = subset.Subsetter(options)
    sub.populate(text=chars)
    sub.subset(static)
    for record in static['name'].names:
        if record.nameID in (1, 4):
            record.string = f'Mulish {style}' if record.nameID == 4 else 'Mulish'
        elif record.nameID == 2:
            record.string = style
        elif record.nameID == 6:
            record.string = f'Mulish-{style}'
    static['OS/2'].usWeightClass = weight
    path = f'{outdir}/Mulish-{style}.ttf'
    static.save(path)
    print(path, 'glyf' in static, len(static.getGlyphOrder()))
