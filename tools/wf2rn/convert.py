#!/usr/bin/env python3
"""Translate a BabyBadger wireframe (.dc.html) into a React Native screen layout (TSX).

The wireframes are the source of truth. This keeps their structure, order, sizes, spacing, colors,
fonts and copy, so app screens start as a faithful copy instead of a re-interpretation.

  python3 tools/wf2rn/convert.py <wireframe.dc.html> <out.tsx> [ComponentName]

What it does
- div/header/main/footer/nav/label/a/button -> View; span/b/h1/p -> Text when they hold only text,
  else View. Bare text inside a View is wrapped in Text.
- CSS inheritance for text (color, font-size, font-weight, font-family, line-height, letter-spacing,
  text-align) is resolved and written onto each Text.
- display:flex defaults to row (CSS), blocks stack as columns; grid repeat(n) becomes a wrapping row
  with computed cell widths.
- Inline SVG icons are kept byte for byte (react-native-svg SvgXml).
- Links keep their target in a data attribute comment so screens can wire navigation.
- The bottom <nav> (tab bar) is skipped: the app's tab navigator draws it.
"""
import html
import json
import re
import sys
from html.parser import HTMLParser

VOID = {'img', 'input', 'br', 'hr', 'meta', 'link', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'ellipse'}
TEXTY = {'span', 'b', 'strong', 'h1', 'h2', 'h3', 'p', 'em', 'i', 'small', 'option'}
INHERIT = ['color', 'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'white-space', 'opacity-text']


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
        self.raw = None  # svg source

    def style(self):
        out = {}
        for decl in (self.attrs.get('style') or '').split(';'):
            if ':' in decl:
                k, v = decl.split(':', 1)
                out[k.strip()] = v.strip()
        return out


class Parser(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src = src
        self.root = Node('root', [])
        self.cur = self.root
        self.svg_depth = 0
        self.svg_start = None

    def handle_starttag(self, tag, attrs):
        if self.svg_depth:
            if tag == 'svg':
                self.svg_depth += 1
            return
        if tag == 'svg':
            self.svg_depth = 1
            self.svg_start = self.getpos()
            n = Node('svg', attrs, self.cur)
            self.cur.children.append(n)
            self.svg_node = n
            self.svg_attrs = attrs
            return
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        if self.svg_depth:
            return
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)

    def handle_endtag(self, tag):
        if self.svg_depth:
            if tag == 'svg':
                self.svg_depth -= 1
                if self.svg_depth == 0:
                    end = self.getpos()
                    self.svg_node.raw = slice_src(self.src, self.svg_start, end)
            return
        if tag in VOID:
            return
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        if self.svg_depth:
            return
        if data.strip() or (data and self.cur.tag in TEXTY):
            self.cur.children.append(data)


def slice_src(src, start, end):
    lines = src.split('\n')
    (l1, c1), (l2, c2) = start, end
    if l1 == l2:
        chunk = lines[l1 - 1][c1:c2]
    else:
        chunk = '\n'.join([lines[l1 - 1][c1:]] + lines[l1:l2 - 1] + [lines[l2 - 1][:c2]])
    return chunk + '</svg>'


# ---------------------------------------------------------------- CSS -> RN
def px(v):
    v = v.strip()
    if v.endswith('px'):
        n = float(v[:-2])
        return int(n) if n.is_integer() else n
    if v.endswith('%'):
        return v
    if re.fullmatch(r'-?\d+(\.\d+)?', v):
        n = float(v)
        return int(n) if n.is_integer() else n
    return None


def box4(v):
    parts = [px(p) for p in v.split()]
    if len(parts) == 1:
        return parts * 4
    if len(parts) == 2:
        return [parts[0], parts[1], parts[0], parts[1]]
    if len(parts) == 3:
        return [parts[0], parts[1], parts[2], parts[1]]
    return parts[:4]


def color_of(v):
    v = v.strip()
    m = re.match(r'(#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\)|transparent|white|black|none)', v)
    if not m:
        return None
    c = m.group(1)
    return {'white': '#FFFFFF', 'black': '#000000', 'none': 'transparent'}.get(c, c)


def border(v):
    m = re.match(r'([\d.]+)px\s+(solid|dashed|dotted)\s+(.+)', v.strip())
    if not m:
        return None
    return float(m.group(1)), m.group(2), color_of(m.group(3))


FONT = {
    ('baloo', 800): 'font.display', ('baloo', 700): 'font.displayBold', ('baloo', 600): 'font.displayBold', ('baloo', 500): 'font.displayBold',
    ('figtree', 400): 'font.body', ('figtree', 500): 'font.bodyMedium', ('figtree', 600): 'font.bodySemi', ('figtree', 700): 'font.bodyBold', ('figtree', 800): 'font.bodyBold',
}


def text_style(t):
    """t = inherited text props (CSS names) -> RN text style dict (values are code strings)."""
    out = {}
    fam = 'baloo' if 'baloo' in t.get('font-family', '').lower() else 'figtree'
    w = int(t.get('font-weight', '400')) if t.get('font-weight', '400').isdigit() else 700
    out['fontFamily'] = FONT.get((fam, w), 'font.body')
    if 'font-size' in t:
        out['fontSize'] = px(t['font-size'])
    if 'color' in t and color_of(t['color']):
        out['color'] = json.dumps(color_of(t['color']))
    # Baloo's natural line box is 1.6em; a smaller lineHeight shifts glyphs on iOS, so it's left to the font.
    lh = px(t['line-height']) if 'line-height' in t else None
    # A unitless line-height (line-height: 1) is a multiple of the font size, not pixels.
    if isinstance(lh, (int, float)) and re.fullmatch(r'\s*[\d.]+\s*', t['line-height']):
        lh = round(lh * (px(t.get('font-size', '16px')) or 16), 2)
    if isinstance(lh, (int, float)):
        if fam == 'baloo' and t.get('__len', 0) * (px(t.get('font-size', '16px')) or 16) * 0.52 > 340:
            out['lineHeight'] = lh
        elif fam == 'baloo':
            # Baloo's content box is 1.602em. CSS centres it in the line box; iOS misplaces glyphs when lineHeight is
            # smaller than that, so keep the natural height and trim the difference with equal negative margins.
            fs = px(t.get('font-size', '16px')) or 16
            m = round((lh - 1.602 * fs) / 2, 2)
            if m:
                out['marginVertical'] = m
        else:
            out['lineHeight'] = lh
    if 'letter-spacing' in t and px(t['letter-spacing']) is not None:
        out['letterSpacing'] = px(t['letter-spacing'])
    if t.get('text-align') in ('center', 'right', 'left'):
        out['textAlign'] = json.dumps(t['text-align'])
    if 'underline' in t.get('text-decoration', ''):
        out['textDecorationLine'] = json.dumps('underline')
    if 'line-through' in t.get('text-decoration', ''):
        out['textDecorationLine'] = json.dumps('line-through')
    return out


def view_style(s, parent_row, grid_cell_w=None):
    out = {}
    d = s.get('display', '')
    if d in ('flex', 'inline-flex'):
        out['flexDirection'] = json.dumps(s.get('flex-direction', 'row'))
        # inline-flex shrink-wraps in a block parent (column here), but inside a flex row it's an ordinary item that
        # follows the row's align-items (pills centred in their row), so no alignSelf there.
        if d == 'inline-flex' and not parent_row:
            out['alignSelf'] = json.dumps('flex-start')
    elif d == 'grid':
        out['flexDirection'] = json.dumps('column')
    for k, rn in [('align-items', 'alignItems'), ('justify-content', 'justifyContent'), ('align-self', 'alignSelf'), ('flex-wrap', 'flexWrap')]:
        if k in s:
            v = s[k].replace('flex-start', 'flex-start').replace('start', 'flex-start').replace('end', 'flex-end').replace('flex-flex-', 'flex-')
            if v in ('flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch', 'baseline', 'wrap', 'nowrap', 'space-evenly'):
                out[rn] = json.dumps(v)
    if 'gap' in s:
        g = s['gap'].split()
        if len(g) == 2:
            out['rowGap'], out['columnGap'] = px(g[0]), px(g[1])
        else:
            out['gap'] = px(g[0])
    for k, rn in [('width', 'width'), ('height', 'height'), ('min-height', 'minHeight'), ('min-width', 'minWidth'), ('max-width', 'maxWidth'),
                  ('top', 'top'), ('left', 'left'), ('right', 'right'), ('bottom', 'bottom'), ('flex-grow', 'flexGrow'), ('flex-shrink', 'flexShrink'),
                  ('margin-top', 'marginTop'), ('margin-left', 'marginLeft'), ('padding-top', 'paddingTop'), ('padding-bottom', 'paddingBottom'), ('padding-left', 'paddingLeft')]:
        if k in s and px(s[k]) is not None:
            v = px(s[k])
            out[rn] = json.dumps(v) if isinstance(v, str) else v
    # margin-left/right/top: auto pushes an item to the far side of its row or column ("Skip for now" in P3).
    for k, rn in [('margin-left', 'marginLeft'), ('margin-right', 'marginRight'), ('margin-top', 'marginTop')]:
        if s.get(k, '').strip() == 'auto':
            out[rn] = json.dumps('auto')
    if 'flex-basis' in s and px(s['flex-basis']) is not None:
        out['flexBasis'] = px(s['flex-basis']) if not isinstance(px(s['flex-basis']), str) else json.dumps(px(s['flex-basis']))
    if 'padding' in s:
        t, r, b, l = box4(s['padding'])
        for k, v in [('paddingTop', t), ('paddingRight', r), ('paddingBottom', b), ('paddingLeft', l)]:
            if v is not None and k not in out:
                out[k] = v
    if 'margin' in s:
        t, r, b, l = box4(s['margin'].replace('auto', '0'))
        for k, v in [('marginTop', t), ('marginRight', r), ('marginBottom', b), ('marginLeft', l)]:
            if v:
                out.setdefault(k, v)
        if 'auto' in s['margin']:
            out['marginTop' if s['margin'].split()[0] == 'auto' else 'marginLeft'] = json.dumps('auto')
    if 'background' in s and color_of(s['background']):
        out['backgroundColor'] = json.dumps(color_of(s['background']))
    if 'border-radius' in s:
        r = s['border-radius'].split()
        if len(r) == 1 and px(r[0]) is not None:
            out['borderRadius'] = px(r[0])
        elif len(r) == 4:
            for k, v in zip(['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'], r):
                if px(v):
                    out[k] = px(v)
    for k, side in [('border', ''), ('border-top', 'Top'), ('border-bottom', 'Bottom'), ('border-left', 'Left'), ('border-right', 'Right')]:
        if k in s:
            if s[k] in ('none', '0'):
                continue
            b = border(s[k])
            if b:
                out[f'border{side}Width'] = b[0]
                out[f'border{side}Color'] = json.dumps(b[2])
                if b[1] != 'solid':
                    out['borderStyle'] = json.dumps(b[1])
    if s.get('position') == 'absolute':
        out['position'] = json.dumps('absolute')
    if s.get('inset') == '0':
        out.update(top=0, left=0, right=0, bottom=0)
    if s.get('overflow') == 'hidden':
        out['overflow'] = json.dumps('hidden')
    if 'opacity' in s:
        out['opacity'] = float(s['opacity'])
    if 'box-shadow' in s and s['box-shadow'] != 'none':
        out['__shadow'] = True
    if 'flex-shrink' not in s and (parent_row or s.get('overflow') == 'hidden'):
        out['flexShrink'] = 1
    if s.get('overflow') == 'hidden' and 'min-height' not in s:
        out['minHeight'] = 0
    if grid_cell_w == 'cell':
        out['flexGrow'] = 1
        out['flexBasis'] = 0
        out['minWidth'] = 0
    return out


def fmt_style(d, extra=None):
    d = dict(d)
    shadow = d.pop('__shadow', False)
    parts = [f'{k}: {v}' for k, v in d.items()]
    if shadow:
        parts.append('...cardShadow')
    if extra:
        parts.append(extra)
    return '{{ ' + ', '.join(parts) + ' }}' if parts else '{{}}'


# ---------------------------------------------------------------- emit
class Emitter:
    def __init__(self):
        self.lines = []
        self.svgs = []
        self.assets = set()

    def boxy(self, n):
        st = n.style()
        return bool(st.get('display')) or any(k in st for k in ('width', 'height', 'padding', 'border-radius', 'background', 'position', 'border', 'min-height'))

    def text_only(self, n):
        return all(isinstance(c, str) or (isinstance(c, Node) and c.tag in TEXTY | {'br', 'a'} and not self.boxy(c) and self.text_only(c)) for c in n.children)

    def inherited(self, n, base):
        t = dict(base)
        for k, v in n.style().items():
            if k in INHERIT:
                t[k] = v
        if n.tag in ('b', 'strong'):
            t['font-weight'] = '700'
        if n.tag == 'a':
            st = n.style()
            if 'color' not in st:
                t['color'] = '#47698A'
            if 'text-decoration' not in st:
                t['text-decoration'] = 'underline'
        return t

    def text_children(self, n, t):
        out = []
        for c in n.children:
            if isinstance(c, str):
                s = html.unescape(re.sub(r'\s+', ' ', c))
                out.append(jsx_text(s))
            elif c.tag == 'br':
                out.append('{"\\n"}')
            else:
                ct = self.inherited(c, t)
                ts = text_style(ct)
                ts.pop('marginVertical', None)
                ts.update({k: v for k, v in view_style(c.style(), False).items() if k in ('backgroundColor', 'opacity')})
                out.append(f'<Text style={fmt_style(ts)}>{"".join(self.text_children(c, ct))}</Text>')
        return out

    def emit(self, n, t, ind, parent_row=False, cell_w=None):
        pad = '  ' * ind
        if isinstance(n, str):
            s = html.unescape(re.sub(r'\s+', ' ', n)).strip()
            if s:
                self.lines.append(f'{pad}<Text style={fmt_style(text_style(t))}>{jsx_text(s)}</Text>')
            return
        if n.tag == 'nav' and n.attrs.get('aria-label') == 'Main':
            self.lines.append(f'{pad}{{/* tab bar: drawn by the app\'s tab navigator */}}')
            return
        if n.tag in ('helmet', 'script', 'style', 'link', 'meta'):
            return
        s = n.style()
        t2 = self.inherited(n, t)
        if n.tag == 'svg':
            i = len(self.svgs)
            xml = n.raw.replace('currentColor', t2.get('color', '#1B2328')).replace(' aria-hidden="true"', '')
            self.svgs.append(xml)
            w, h = px(n.attrs.get('width', '24')), px(n.attrs.get('height', '24'))
            self.lines.append(f'{pad}<SvgXml xml={{SVG[{i}]}} width={{{w}}} height={{{h}}} />')
            return
        if n.tag == 'img':
            src = n.attrs.get('src', '')
            self.assets.add(src)
            vs = view_style(s, parent_row, cell_w)
            vs['width'] = px(n.attrs.get('width', '100'))
            vs['height'] = px(n.attrs.get('height', '100'))
            self.lines.append(f"{pad}<Image source={{require('@/assets/images/{src}')}} style={fmt_style(vs)} contentFit=\"contain\" />")
            return
        if n.tag in ('input', 'textarea', 'select'):
            vs = view_style(s, parent_row, cell_w)
            ts = text_style(t2)
            ph = n.attrs.get('placeholder', '')
            val = n.attrs.get('value', '') if n.tag != 'textarea' else ''.join(c for c in n.children if isinstance(c, str))
            if n.attrs.get('type') == 'checkbox':
                on = 'checked' in n.attrs
                tick = '<SvgXml xml={CHECK} width={16} height={16} />' if on else ''
                self.lines.append(f'{pad}<View style={{{{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "{"#47698A" if on else "#C3CCD5"}", backgroundColor: "{"#47698A" if on else "#FFFFFF"}", alignItems: "center", justifyContent: "center" }}}}>{tick}</View>')
                return
            self.lines.append(f'{pad}<TextInput placeholder={json.dumps(html.unescape(ph))} defaultValue={json.dumps(html.unescape(val))} placeholderTextColor="#6B7980" style={fmt_style({**vs, **ts})} />')
            return
        is_grid = s.get('display') == 'grid'
        cols = None
        if is_grid:
            m = re.search(r'repeat\((\d+)', s.get('grid-template-columns', ''))
            cols = int(m.group(1)) if m else None
        row = s.get('display') in ('flex', 'inline-flex') and s.get('flex-direction', 'row') == 'row' or is_grid
        disp = s.get('display', '')
        if n.children and self.text_only(n) and not disp.endswith('flex') and disp != 'grid':
            # Inline flow (text plus <b>/<span> runs) = ONE Text with nested runs, as the browser lays it out.
            t2['__len'] = len(re.sub(r'<[^>]+>', '', ''.join(c if isinstance(c, str) else '' for c in n.children)))
            ts = text_style(t2)
            one = ' numberOfLines={1}' if t2.get('white-space') == 'nowrap' else ''
            inner = "".join(self.text_children(n, t2))
            box = {k: v for k, v in view_style(s, parent_row, cell_w).items() if k not in ('flexDirection',)}
            if n.tag in TEXTY and not any(k.startswith(('padding', 'border', 'background', 'height', 'width', 'min', '__')) for k in box):
                ts.update(box)
                self.lines.append(f'{pad}<Text{one} style={fmt_style(ts)}>{inner}</Text>')
            else:
                if 'height' in box or 'minHeight' in box:
                    box.setdefault('justifyContent', json.dumps('center'))
                self.lines.append(f'{pad}<View style={fmt_style(box)}><Text{one} style={fmt_style(ts)}>{inner}</Text></View>')
            return
        vs = view_style(s, parent_row, cell_w)
        if not s.get('display'):
            vs.setdefault('flexDirection', json.dumps('column'))
        if parent_row and n.tag in TEXTY and not s.get('display'):
            pass
        href = n.attrs.get('href')
        comment = f' /* -> {href} */' if href and href != '#' else ''
        self.lines.append(f'{pad}<View style={fmt_style(vs)}>{{{comment.strip() or "/**/"}}}' if comment else f'{pad}<View style={fmt_style(vs)}>')
        if cols:
            # CSS grid repeat(n, 1fr) -> rows of n equal cells (exact, unlike percentage widths with gaps).
            g = px(s.get('gap', '0').split()[-1]) or 0
            kids = [c for c in n.children if not isinstance(c, str) or c.strip()]
            for r in range(0, len(kids), cols):
                chunk = kids[r:r + cols]
                self.lines.append(f'{pad}  <View style={{{{ flexDirection: "row", gap: {g} }}}}>')
                for c in chunk:
                    self.emit(c, t2, ind + 2, True, 'cell')
                for _ in range(cols - len(chunk)):
                    self.lines.append(f'{pad}    <View style={{{{ flex: 1 }}}} />')
                self.lines.append(f'{pad}  </View>')
        else:
            for c in n.children:
                self.emit(c, t2, ind + 1, row, None)
        self.lines.append(f'{pad}</View>')


def jsx_text(s):
    return s.replace('{', '{"{"}').replace('}', '{"}"}').replace('<', '{"<"}').replace('>', '{">"}')


def convert(path, name):
    src = open(path, encoding='utf-8').read()
    start = src.index('<div style="width: 390px')
    end = src.index('</x-dc>')
    p = Parser(src[start:end])
    p.feed(src[start:end])
    root = p.root.children[0]
    e = Emitter()
    base = {'font-family': 'Figtree', 'color': '#1B2328', 'font-size': '16px'}
    rs = root.style()
    t = e.inherited(root, base)
    bg = color_of(rs.get('background', '#F3F5F8')) or '#F3F5F8'
    jc = rs.get('justify-content')
    jcs = f', justifyContent: {json.dumps(jc)}' if jc in ('flex-end', 'center', 'space-between') else ''
    e.lines.append(f'    <View style={{{{ flex: 1, backgroundColor: {json.dumps(bg)}, flexDirection: "column", overflow: "hidden"{jcs} }}}}>')
    for c in root.children:
        e.emit(c, t, 3, False)
    e.lines.append('    </View>')
    title = re.search(r'<title>(.*?)</title>', src)
    svgs = ',\n  '.join(json.dumps(x) for x in e.svgs)
    imports = ["import { Text, TextInput, View } from 'react-native';", "import { SvgXml } from 'react-native-svg';", '']
    if e.assets:
        imports.insert(0, "import { Image } from 'expo-image';")
    imports.append("import { cardShadow, font } from '@/theme';")
    return f"""// GENERATED from wireframe {path.split('/')[-1]} by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
{chr(10).join(imports)}

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  {svgs}
];

/** {html.unescape(title.group(1)) if title else name} */
export default function {name}() {{
  return (
{chr(10).join(e.lines)}
  );
}}
"""


if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else 'Wireframe'
    open(out, 'w', encoding='utf-8').write(convert(src, name))
    print('wrote', out)
