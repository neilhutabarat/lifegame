"""Gabungkan game jadi satu berkas HTML (untuk tautan uji Artifact).
Pakai: python3 tools/bundel.py <keluaran.html>"""
import re, sys, pathlib
akar = pathlib.Path(__file__).resolve().parent.parent
html = (akar / 'index.html').read_text()
kepala = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
badan = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
kepala = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*|<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\s*', '', kepala)
kepala = kepala.replace('<link rel="stylesheet" href="css/game.css">', '<style>\n' + (akar / 'css/game.css').read_text() + '</style>')
def skrip(m):
    return '<script>\n' + (akar / m.group(1)).read_text() + '</script>'
badan = re.sub(r'<script src="(js/[^"]+)"></script>', skrip, badan)
pathlib.Path(sys.argv[1]).write_text(kepala.strip() + '\n' + badan.strip() + '\n')
print('ok', len(kepala) + len(badan))
