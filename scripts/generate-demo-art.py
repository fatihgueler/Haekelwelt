# Generator für die Demo-Produktillustrationen (Häkelwelt).
# Erzeugt public/demo/<slug>.svg und public/demo/<slug>-detail.svg.
# Aufruf aus dem Repo-Root:  python3 scripts/generate-demo-art.py
# Farben = Wollfarben-Palette aus docs/design-konzept.md (Stufen 50/100/200/400/700).
import math, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'demo')
C = dict(
 him=('#FCEEF2','#F9D7E2','#F2B0C6','#E05C88','#9D254D'),
 senf=('#FDF4E3','#FAE5BD','#F2CB7D','#E4A425','#77540D'),
 mint=('#E9F7F2','#CBEBE2','#A1D9C8','#49AB8E','#145D47'),
 lav=('#F3EFFB','#E4DAF6','#CAB8EA','#987ACD','#604096'),
 pfir=('#FEEEE7','#FCD9CA','#F7B79C','#ED865A','#8F3D19'),
 blau=('#E9F5FB','#CFE8F7','#A2D1EB','#4BA1D2','#16587E'),
)
CREME='#FBF8F4'; INK='#2D211B'; BROWN='#A8714A'; BROWN_D='#7A4E31'; WOOD='#D9A86C'

DEFS = '''<defs>
<pattern id="st" width="18" height="16" patternUnits="userSpaceOnUse">
<path d="M3 3 L9 12 L15 3" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 5 L9 13" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="2" stroke-linecap="round"/>
</pattern>
<pattern id="rib" width="14" height="30" patternUnits="userSpaceOnUse">
<path d="M7 2 V28" stroke="#000" stroke-opacity=".10" stroke-width="3" stroke-linecap="round"/>
<path d="M2 2 V28" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/>
</pattern>
<pattern id="dots" width="64" height="64" patternUnits="userSpaceOnUse">
<circle cx="8" cy="8" r="3" fill="#fff" fill-opacity=".55"/>
<path d="M40 36 l6 8 l6 -8" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</pattern>
</defs>'''

uid = [0]
def knit(d, color, pat='st', extra=''):
    """Form mit Maschen-Textur: Füllung + Muster, auf die Form beschnitten."""
    uid[0] += 1; cid = f'k{uid[0]}'
    return (f'<clipPath id="{cid}"><path d="{d}"/></clipPath>'
            f'<path d="{d}" fill="{color}" {extra}/>'
            f'<rect x="0" y="0" width="800" height="1000" fill="url(#{pat})" clip-path="url(#{cid})"/>')

def ellipse_d(cx, cy, rx, ry):
    return f'M{cx-rx} {cy} a{rx} {ry} 0 1 0 {2*rx} 0 a{rx} {ry} 0 1 0 {-2*rx} 0 Z'

def circle_d(cx, cy, r): return ellipse_d(cx, cy, r, r)

def rrect_d(x, y, w, h, r):
    return (f'M{x+r} {y} H{x+w-r} Q{x+w} {y} {x+w} {y+r} V{y+h-r} Q{x+w} {y+h} {x+w-r} {y+h} '
            f'H{x+r} Q{x} {y+h} {x} {y+h-r} V{y+r} Q{x} {y} {x+r} {y} Z')

def yarn_ball(cx, cy, r, base, dark, light, tail=True):
    uid[0] += 1; cid = f'y{uid[0]}'
    s = [f'<clipPath id="{cid}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>',
         f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{base}"/>', f'<g clip-path="url(#{cid})" fill="none" stroke-linecap="round">']
    for i, ang in enumerate([-35, -20, -5, 10, 25]):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r*1.05}" ry="{r*(0.32+0.08*i)}" transform="rotate({ang} {cx} {cy})" stroke="{dark}" stroke-opacity=".45" stroke-width="{max(2, r*0.05):.1f}"/>')
    for i, ang in enumerate([60, 75, 90]):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r*1.02}" ry="{r*(0.45+0.12*i)}" transform="rotate({ang} {cx} {cy})" stroke="{light}" stroke-opacity=".7" stroke-width="{max(2, r*0.045):.1f}"/>')
    s.append('</g>')
    if tail:
        s.append(f'<path d="M{cx+r*0.7} {cy+r*0.72} q{r*0.5} {r*0.35} {r*0.95} {r*0.1} t{r*0.9} {r*0.2}" fill="none" stroke="{base}" stroke-width="{max(3, r*0.07):.1f}" stroke-linecap="round"/>')
    return ''.join(s)

def eye(x, y, s=1.0):
    return f'<ellipse cx="{x}" cy="{y}" rx="{9*s}" ry="{12*s}" fill="{INK}"/><circle cx="{x+3*s}" cy="{y-4*s}" r="{3*s}" fill="#fff"/>'

def cheek(x, y, color): return f'<ellipse cx="{x}" cy="{y}" rx="18" ry="11" fill="{color}" fill-opacity=".75"/>'

def frame(tone, content, title, accent_balls=True):
    c = C[tone]
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-labelledby="t">',
         f'<title id="t">{title}</title>', DEFS,
         f'<rect width="800" height="1000" fill="{c[1]}"/>',
         f'<rect width="800" height="1000" fill="url(#dots)"/>',
         f'<circle cx="400" cy="470" r="330" fill="{c[0]}" fill-opacity=".7"/>',
         f'<path d="M0 860 Q200 820 400 860 T800 860 V1000 H0Z" fill="{c[2]}" fill-opacity=".55"/>',
         # Picot-Bordüre
         ''.join(f'<circle cx="{x}" cy="858" r="7" fill="{c[2]}" fill-opacity=".8"/>' for x in range(20, 800, 48)),
         '<ellipse cx="400" cy="835" rx="230" ry="26" fill="#000" fill-opacity=".08"/>',
         content]
    if accent_balls:
        s.append(yarn_ball(655, 800, 48, c[3], c[4], c[1], tail=False))
    s.append('</svg>')
    return '\n'.join(s)

def save(name, svg):
    with open(os.path.join(OUT, name + '.svg'), 'w') as f: f.write(svg)

# ---------- Amigurumi (Pfirsich) ----------
def hase():
    body, dark, light = '#F7F1EA', '#E7D8C8', '#fff'
    p = C['him']
    s = []
    for x, rot in [(330, -10), (470, 10)]:
        s.append(f'<g transform="rotate({rot} {x} 330)">' + knit(rrect_d(x-42, 110, 84, 250, 42), body) +
                 f'<path d="{rrect_d(x-20, 150, 40, 180, 20)}" fill="{p[2]}"/></g>')
    s.append(knit(ellipse_d(400, 650, 175, 190), body))
    s.append(knit(ellipse_d(400, 650, 95, 120), p[1]))
    s.append(knit(circle_d(400, 420, 150), body))
    s.append(eye(345, 420) + eye(455, 420) + cheek(318, 465, p[2]) + cheek(482, 465, p[2]))
    s.append(f'<path d="M388 452 Q400 464 412 452" fill="{p[3]}" stroke="{p[3]}" stroke-width="6" stroke-linejoin="round"/>')
    s.append(f'<path d="M378 476 Q400 494 422 476" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    for x in (262, 538):
        s.append(knit(ellipse_d(x, 620, 42, 70), body))
    for x in (320, 480):
        s.append(knit(ellipse_d(x, 815, 70, 42), body))
    s.append(f'<path d="M340 548 Q400 580 460 548 L470 572 Q400 606 330 572Z" fill="{p[3]}"/>')
    s.append(f'<circle cx="400" cy="578" r="14" fill="{p[4]}"/>')
    return frame('pfir', ''.join(s), 'Illustration: Kuschelhase Luna aus cremefarbener Baumwolle mit rosa Halstuch')

def baer():
    b, bd = '#C28A5C', BROWN_D
    m = C['mint']
    s = []
    for x in (272, 528):
        s.append(knit(circle_d(x, 300, 62), b) + f'<circle cx="{x}" cy="300" r="32" fill="#E9C9A6"/>')
    s.append(knit(ellipse_d(400, 660, 180, 185), b))
    s.append(knit(ellipse_d(400, 680, 100, 115), '#E9C9A6'))
    s.append(knit(circle_d(400, 420, 155), b))
    s.append(knit(ellipse_d(400, 470, 70, 52), '#E9C9A6'))
    s.append(eye(338, 405) + eye(462, 405))
    s.append(f'<ellipse cx="400" cy="450" rx="22" ry="15" fill="{INK}"/>')
    s.append(f'<path d="M400 465 V482 M380 490 Q400 502 420 490" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    s.append(f'<path d="M400 572 L330 540 Q318 572 330 604 Z M400 572 L470 540 Q482 572 470 604 Z" fill="{m[3]}"/><circle cx="400" cy="572" r="18" fill="{m[4]}"/>')
    for x in (250, 550):
        s.append(knit(ellipse_d(x, 640, 45, 78), b))
    for x in (318, 482):
        s.append(knit(ellipse_d(x, 818, 72, 45), b) + f'<ellipse cx="{x}" cy="818" rx="38" ry="22" fill="#E9C9A6"/>')
    return frame('pfir', ''.join(s), 'Illustration: Teddybär Bruno in Karamellbraun mit mintfarbener Fliege')

def wal():
    bl = C['blau']
    s = []
    body = 'M170 560 C170 400 330 330 470 360 C590 385 640 470 640 560 C640 690 520 760 400 760 C270 760 170 690 170 560 Z'
    tail = 'M600 600 C660 560 700 500 690 440 C720 470 760 480 780 470 C760 520 720 560 660 590 C700 610 730 650 735 690 C690 660 640 640 600 640 Z'
    s.append(knit(tail, bl[3]))
    s.append(knit(body, bl[3]))
    s.append(knit('M200 620 C260 720 520 740 600 640 C560 700 470 735 400 735 C300 735 230 690 200 620 Z', CREME, pat='rib'))
    s.append(eye(300, 540, 1.1) + cheek(270, 590, C['him'][2]))
    s.append(f'<path d="M320 610 Q350 630 380 612" fill="none" stroke="{INK}" stroke-width="4.5" stroke-linecap="round"/>')
    s.append(knit('M430 600 C470 640 520 650 550 630 C530 690 460 690 430 600 Z', bl[4]))
    for dx, h in [(-40, 90), (0, 130), (40, 90)]:
        s.append(f'<path d="M{400+dx} 350 Q{400+dx*1.8} {350-h*0.6} {400+dx*2.4} {350-h}" fill="none" stroke="{bl[2]}" stroke-width="12" stroke-linecap="round"/>')
    s.append(f'<circle cx="340" cy="210" r="16" fill="{bl[2]}"/><circle cx="480" cy="190" r="12" fill="{bl[2]}"/>')
    return frame('pfir', ''.join(s), 'Illustration: kleiner Wal Walter in Himmelblau mit cremefarbenem Bauch')

# ---------- Heimdeko (Senf) ----------
def granny_square(x, y, size, colors):
    s = []
    n = len(colors)
    for i, col in enumerate(colors):
        inset = i * size / (2 * n)
        s.append(f'<rect x="{x+inset}" y="{y+inset}" width="{size-2*inset}" height="{size-2*inset}" rx="{6 if i==0 else 4}" fill="{col}"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="url(#st)" rx="6"/>')
    return ''.join(s)

def decke():
    pal = [C['senf'][3], C['him'][3], C['mint'][3], C['lav'][3], C['pfir'][3], C['blau'][3]]
    s = ['<g transform="translate(400 470) rotate(-8) skewX(-6) translate(-270 -300)">',
         f'<rect x="-14" y="-14" width="568" height="628" rx="22" fill="{CREME}"/>']
    size = 128; gap = 8
    k = 0
    for r in range(4):
        for c in range(4):
            cols = [CREME, pal[(k) % 6], pal[(k + 2) % 6], CREME, pal[(k + 4) % 6]]
            s.append(granny_square(c * (size + gap) + 2, r * (size + gap) + 30, size, list(reversed(cols))))
            k += 1
    for x in range(0, 560, 22):
        s.append(f'<path d="M{x+6} 606 v34" stroke="{C["senf"][3]}" stroke-width="7" stroke-linecap="round"/>')
    s.append('</g>')
    return frame('senf', ''.join(s), 'Illustration: bunte Granny-Square-Decke Sonnenschein mit Fransen', accent_balls=False)

def kissen():
    m = C['mint']; se = C['senf']
    d = 'M180 330 Q400 290 620 330 Q660 520 620 710 Q400 750 180 710 Q140 520 180 330 Z'
    s = [knit(d, m[3])]
    for i in range(6):
        y = 380 + i * 55
        s.append(f'<path d="M205 {y} Q400 {y-18} 595 {y}" fill="none" stroke="{m[2]}" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 22"/>')
    s.append(knit(circle_d(400, 520, 95), se[3]))
    for ang in range(0, 360, 30):
        a = math.radians(ang)
        s.append(f'<ellipse cx="{400+62*math.cos(a):.1f}" cy="{520+62*math.sin(a):.1f}" rx="22" ry="12" transform="rotate({ang} {400+62*math.cos(a):.1f} {520+62*math.sin(a):.1f})" fill="{CREME}"/>')
    s.append(f'<circle cx="400" cy="520" r="34" fill="{C["him"][3]}"/>')
    for x, y in [(185, 335), (615, 335), (185, 705), (615, 705)]:
        s.append(f'<circle cx="{x}" cy="{y}" r="16" fill="{m[4]}"/>')
    return frame('senf', ''.join(s), 'Illustration: mintgrüne Kissenhülle Maschenglück mit Blütenmotiv')

def korb():
    se = C['senf']; bl = C['blau']
    s = []
    s.append(yarn_ball(330, 400, 85, C['him'][3], C['him'][4], C['him'][1], tail=False))
    s.append(yarn_ball(470, 385, 95, bl[3], bl[4], bl[1], tail=False))
    s.append(yarn_ball(410, 330, 70, C['lav'][3], C['lav'][4], C['lav'][1], tail=False))
    d = 'M190 450 H610 L570 790 Q400 830 230 790 Z'
    s.append(knit(d, '#E8D9C3', pat='rib'))
    for i in range(7):
        y = 490 + i * 45
        w = 205 - i * 5
        s.append(f'<path d="M{400-w} {y} Q400 {y+14} {400+w} {y}" fill="none" stroke="{se[3]}" stroke-opacity=".55" stroke-width="7"/>')
    s.append(knit(rrect_d(170, 430, 460, 52, 26), se[3]))
    for x in (190, 610):
        s.append(f'<path d="M{x} 470 q{-50 if x<400 else 50} 20 {-40 if x<400 else 40} 80" fill="none" stroke="{se[4]}" stroke-width="18" stroke-linecap="round"/>')
    return frame('senf', ''.join(s), 'Illustration: Häkelkorb Mia in Natur und Senf, gefüllt mit Wollknäueln', accent_balls=False)

# ---------- Accessoires (Lavendel) ----------
def muetze():
    l = C['lav']
    s = []
    s.append(knit(circle_d(400, 250, 90), C['him'][2]))
    for ang in range(0, 360, 20):
        a = math.radians(ang)
        s.append(f'<path d="M{400+50*math.cos(a):.0f} {250+50*math.sin(a):.0f} L{400+88*math.cos(a):.0f} {250+88*math.sin(a):.0f}" stroke="{C["him"][1]}" stroke-width="6" stroke-linecap="round"/>')
    s.append(knit('M190 640 C190 420 280 320 400 320 C520 320 610 420 610 640 Z', l[3]))
    for i in range(6):
        y = 400 + i * 42
        s.append(f'<path d="M{230 - i*6} {y} Q400 {y-30} {570 + i*6} {y}" fill="none" stroke="{l[2]}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 20"/>')
    s.append(knit(rrect_d(165, 620, 470, 130, 50), l[4], pat='rib'))
    return frame('lav', ''.join(s), 'Illustration: lavendelfarbene Bommelmütze Cosima mit rosa Bommel')

def tasche():
    l = C['lav']
    s = []
    s.append(f'<path d="M270 470 C260 250 540 250 530 470" fill="none" stroke="{BROWN}" stroke-width="26" stroke-linecap="round"/>')
    d = 'M200 450 H600 Q630 450 625 490 L595 760 Q590 800 550 800 H250 Q210 800 205 760 L175 490 Q170 450 200 450 Z'
    s.append(knit(d, CREME))
    for r in range(2):
        for c in range(3):
            s.append(granny_square(245 + c * 108, 510 + r * 108, 96, [l[3], C['senf'][3], CREME, C['him'][3]]))
    s.append(knit(rrect_d(185, 440, 430, 50, 22), l[4], pat='rib'))
    s.append(f'<circle cx="400" cy="466" r="16" fill="{WOOD}"/>')
    return frame('lav', ''.join(s), 'Illustration: cremefarbene Häkeltasche Mira mit bunten Granny Squares und Lederriemen')

def loop():
    l = C['lav']; b = C['blau']
    s = []
    s.append(knit('M180 470 C180 300 620 300 620 470 C620 560 520 590 400 590 C280 590 180 560 180 470 Z M260 470 C260 390 540 390 540 470 C540 510 480 525 400 525 C320 525 260 510 260 470 Z', b[2], pat='rib', extra='fill-rule="evenodd"'))
    s.append(knit('M230 560 C200 700 320 800 420 790 C560 780 620 690 580 580 C540 640 480 660 400 660 C320 660 260 630 230 560 Z', l[3], pat='rib'))
    for x in range(250, 600, 40):
        s.append(f'<path d="M{x} 800 v40" stroke="{l[3]}" stroke-width="8" stroke-linecap="round"/>')
    return frame('lav', ''.join(s), 'Illustration: weicher Loopschal Wolke in Himmelblau und Lavendel')

# ---------- Babys & Kinder (Himmelblau) ----------
def star(cx, cy, r, color):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36); rr = r if i % 2 == 0 else r * 0.48
        pts.append(f'{cx+rr*math.cos(a):.1f},{cy+rr*math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{color}" stroke="{color}" stroke-width="8" stroke-linejoin="round"/>'

def mobile():
    s = []
    s.append(f'<path d="M400 90 V200" stroke="{INK}" stroke-opacity=".5" stroke-width="3"/>')
    s.append(f'<ellipse cx="400" cy="210" rx="250" ry="30" fill="none" stroke="{WOOD}" stroke-width="18"/>')
    items = [(190, 470, 'moon'), (300, 560, 'star'), (400, 430, 'cloud'), (500, 580, 'star'), (610, 480, 'heart')]
    for x, y, kind in items:
        s.append(f'<path d="M{x} 215 V{y-60}" stroke="{INK}" stroke-opacity=".45" stroke-width="3"/>')
        if kind == 'moon':
            s.append(knit('M{0} {1} a75 75 0 1 0 60 120 a60 60 0 1 1 -60 -120 Z'.format(x-10, y-70), C['senf'][3]))
        elif kind == 'star':
            s.append(star(x, y, 50, C['senf'][2]))
        elif kind == 'cloud':
            d = f'M{x-90} {y+30} a40 40 0 0 1 20 -70 a55 55 0 0 1 100 -10 a40 40 0 0 1 60 60 a30 30 0 0 1 -10 20 Z'
            s.append(knit(d, CREME))
        else:
            d = f'M{x} {y+50} C{x-80} {y} {x-60} {y-60} {x} {y-25} C{x+60} {y-60} {x+80} {y} {x} {y+50} Z'
            s.append(knit(d, C['him'][2]))
    return frame('blau', ''.join(s), 'Illustration: Baby-Mobile Mond und Sterne mit Wolke und Herz an einem Holzring')

def schuhe():
    b = C['blau']
    s = []
    s.append(knit('M160 700 C160 640 220 620 280 630 L280 520 Q280 490 320 490 H360 Q400 490 400 530 V660 C440 680 450 720 420 740 H180 C160 740 160 720 160 700 Z', b[3]))
    s.append(f'<path d="M280 530 H400" stroke="{CREME}" stroke-width="14" stroke-linecap="round"/><circle cx="340" cy="600" r="14" fill="{WOOD}"/>')
    s.append(knit('M400 610 C400 550 460 530 520 540 L520 430 Q520 400 560 400 H600 Q640 400 640 440 V570 C680 590 690 630 660 650 H420 C400 650 400 630 400 610 Z', C['mint'][3]))
    s.append(f'<path d="M520 440 H640" stroke="{CREME}" stroke-width="14" stroke-linecap="round"/><circle cx="580" cy="510" r="14" fill="{WOOD}"/>')
    s.append(star(250, 320, 30, C['senf'][2]) + star(560, 260, 22, C['him'][2]))
    return frame('blau', ''.join(s), 'Illustration: ein Paar Babyschuhe Erste Schritte in Himmelblau und Mint mit Holzknöpfen')

def elefant():
    g = '#B9B3C9'; gd = '#A29AB8'
    s = []
    s.append(f'<circle cx="610" cy="640" r="105" fill="none" stroke="{WOOD}" stroke-width="34"/>')
    s.append(knit(ellipse_d(400, 660, 165, 145), g))
    for x in (250, 550):
        s.append(knit(ellipse_d(x, 420, 118, 138), g))
        s.append(knit(ellipse_d(x + (-12 if x < 400 else 12), 425, 74, 94), C['him'][2]))
    s.append(knit(circle_d(400, 430, 128), g))
    trunk = 'M372 470 C360 560 380 640 450 660 C490 670 520 650 515 622 C512 604 492 600 482 612 C470 626 446 622 430 600 C414 575 420 530 428 470 Z'
    s.append(knit(trunk, gd))
    for y in (520, 555, 590):
        s.append(f'<path d="M{388 if y<580 else 400} {y} q18 6 32 0" fill="none" stroke="{g}" stroke-width="5" stroke-linecap="round"/>')
    s.append(eye(345, 420) + eye(455, 420) + cheek(318, 468, C['him'][2]) + cheek(482, 468, C['him'][2]))
    for x in (320, 480):
        s.append(knit(ellipse_d(x, 790, 62, 42), g))
    return frame('blau', ''.join(s), 'Illustration: Greifling Elefant Emil in Grau-Lavendel mit Holzring')

ART = {
 'kuschelhase-luna': hase, 'teddybaer-bruno': baer, 'wal-walter': wal,
 'granny-square-decke-sonnenschein': decke, 'kissenhuelle-maschenglueck': kissen, 'haekelkorb-mia': korb,
 'bommelmuetze-cosima': muetze, 'haekeltasche-mira': tasche, 'loopschal-wolke': loop,
 'baby-mobile-mond-und-sterne': mobile, 'babyschuhe-erste-schritte': schuhe, 'greifling-elefant-emil': elefant,
}
for name, fn in ART.items():
    uid[0] = 0
    save(name, fn())
print('ok', len(ART))

# ---------- Detailbilder (Maschen-Nahaufnahme) für die Galerie ----------
def detail(tone, main, second, title):
    s = []
    s.append('<g transform="rotate(-6 400 480)">')
    s.append(knit(rrect_d(170, 250, 460, 460, 40), main))
    # große Maschen-Reihen
    for r in range(8):
        y = 290 + r * 54
        for c in range(9):
            x = 200 + c * 50
            s.append(f'<path d="M{x} {y} q12 30 22 34 q10 -4 22 -34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>')
    s.append('</g>')
    s.append(yarn_ball(600, 700, 90, second, C[tone][4], C[tone][1]))
    # Häkelnadel
    s.append('<g transform="rotate(-38 360 700)"><rect x="140" y="690" width="420" height="18" rx="9" fill="#D9A86C"/>'
             '<rect x="140" y="690" width="120" height="18" rx="9" fill="#9D254D"/>'
             '<path d="M560 690 q22 0 22 9 q0 9 -14 9" fill="none" stroke="#D9A86C" stroke-width="10" stroke-linecap="round"/></g>')
    return frame(tone, ''.join(s), title, accent_balls=False)

DETAILS = {
 'kuschelhase-luna': ('pfir', '#F7F1EA', C['him'][3]),
 'teddybaer-bruno': ('pfir', '#C28A5C', C['mint'][3]),
 'wal-walter': ('pfir', C['blau'][3], CREME),
 'granny-square-decke-sonnenschein': ('senf', C['senf'][3], C['him'][3]),
 'kissenhuelle-maschenglueck': ('senf', C['mint'][3], C['senf'][3]),
 'haekelkorb-mia': ('senf', '#E8D9C3', C['senf'][3]),
 'bommelmuetze-cosima': ('lav', C['lav'][3], C['him'][2]),
 'haekeltasche-mira': ('lav', CREME, C['lav'][3]),
 'loopschal-wolke': ('lav', C['blau'][2], C['lav'][3]),
 'baby-mobile-mond-und-sterne': ('blau', C['senf'][3], CREME),
 'babyschuhe-erste-schritte': ('blau', C['blau'][3], C['mint'][3]),
 'greifling-elefant-emil': ('blau', '#B9B3C9', C['him'][2]),
}
for name, (tone, main, second) in DETAILS.items():
    uid[0] = 0
    save(name + '-detail', detail(tone, main, second, 'Detailansicht der Maschen mit Wollknäuel und Häkelnadel'))
print('details ok')
