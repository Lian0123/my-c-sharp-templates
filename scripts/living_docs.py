#!/usr/bin/env python3
"""Project-scoped MISVG 0.1 static producer, reader and consistency checker.

The authored CommonMark subset is documented in docs/living/README.md. This is
not a general Markdown layout engine or a complete MISVG conformance validator.
No document content is executed. Only standard-library modules are required.
"""
import argparse
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
import fcntl
import hashlib
import json
import math
import os
import platform
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import uuid
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'docs/living'
SVG = 'http://www.w3.org/2000/svg'
MISVG = 'https://example.org/ns/markdown-in-svg/0.1'
AGENT = 'https://github.com/Lian0123/my-c-sharp-templates/ns/living-docs/1'
XML = 'http://www.w3.org/XML/1998/namespace'
SPEC_COMMIT = 'c7c0d96aa398d650c6bea5588e5d060bc6d60da5'
RENDERER = 'relay-living-docs'
VERSION = '1.2.0'
MAX_FILE = 8 * 1024 * 1024
MAX_SOURCE = 1024 * 1024
MAX_NODES = 50000
MAX_DEPTH = 64
MAX_REVISION = 9007199254740991
WIDTH = 1440
FONT = 'PingFang TC, Noto Sans CJK TC, Microsoft JhengHei, sans-serif'
INK = '#183048'
MUTED = '#52677C'
BLUE = '#2863D8'
TEAL = '#087E7C'
WHITE = '#FFFFFF'
PALE = '#F2F6FC'
LINE = '#CEDAE8'
ID = re.compile(r'[A-Za-z][A-Za-z0-9._-]{0,63}')
NUMBER = re.compile(r'[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?')
KINDS = {'dependency', 'realization', 'inheritance', 'association', 'logical',
         'fk', 'event', 'call', 'return', 'transition', 'composition'}
ET.register_namespace('', SVG)
ET.register_namespace('m', MISVG)
ET.register_namespace('a', AGENT)


class DocumentError(ValueError):
    def __init__(self, code, detail):
        super().__init__(f'{code}: {detail}')
        self.code = code


def require(condition, code, detail):
    if not condition:
        raise DocumentError(code, detail)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def line_count(source):
    return 0 if not source else len(source.split('\n')) - int(source.endswith('\n'))


def normalize(source):
    return source.replace('\r\n', '\n').replace('\r', '\n')


@dataclass
class Node:
    ident: str
    title: str
    start: int
    end: int
    fields: list = field(default_factory=list)


@dataclass
class Edge:
    kind: str
    source: str
    target: str
    label: str
    line: int


@dataclass
class Model:
    title: str = ''
    intro: list = field(default_factory=list)
    nodes: list = field(default_factory=list)
    edges: list = field(default_factory=list)
    rules: list = field(default_factory=list)
    references: list = field(default_factory=list)
    headings: dict = field(default_factory=dict)
    view: str = 'cards'


def parse_source(source):
    """Parse only the explicitly documented, non-executable authoring subset."""
    require(len(source.encode('utf-8')) <= MAX_SOURCE, 'E_LIMIT', 'source exceeds 1 MiB')
    require('\r' not in source, 'E_SOURCE', 'decoded source contains CR')
    require(not re.search(r'^(?:<{7}|={7}|>{7})(?: |$)', source, re.M), 'E_CONFLICT', 'unresolved source conflict markers')
    require(not any(c in source for c in ['```', '~~~', '](', '\t']), 'E_UNSUPPORTED', 'authoring subset does not support fences, links or tabs')
    model = Model()
    section = None
    node = None
    for number, raw in enumerate(source.split('\n'), 1):
        if not raw:
            continue
        require(raw == raw.strip(), 'E_UNSUPPORTED', f'line {number}: indentation or trailing spaces outside the authored subset')
        if raw.startswith('# '):
            require(not model.title and number == 1, 'E_SOURCE', 'one title must start on line 1')
            model.title = raw[2:]
        elif raw.startswith('## '):
            section = raw[3:]
            require(section in ['節點', '關係', '準則', '來源'] and section not in model.headings, 'E_SOURCE', f'line {number}: unknown or duplicate section')
            model.headings[section] = number
            node = None
        elif raw.startswith('### ') and section == '節點':
            parts = raw[4:].split(' | ')
            require(len(parts) == 2 and ID.fullmatch(parts[0]), 'E_SOURCE', f'line {number}: expected node-id | title')
            node = Node(parts[0], parts[1], number, number)
            model.nodes.append(node)
        elif raw.startswith('- '):
            value = raw[2:]
            if section == '節點' and node:
                node.fields.append((number, value))
                node.end = number
            elif section == '關係':
                parts = value.split(' | ', 3)
                require(len(parts) == 4 and parts[0] in KINDS, 'E_SOURCE', f'line {number}: expected kind | from | to | label')
                model.edges.append(Edge(*parts, number))
            elif section == '準則':
                model.rules.append((number, value))
            elif section == '來源':
                require(value and not value.startswith('/') and '..' not in Path(value).parts, 'E_SOURCE', 'references must stay in this repository')
                model.references.append((number, value))
            else:
                raise DocumentError('E_SOURCE', f'line {number}: list item outside its section')
        elif section is None and model.title:
            if raw.startswith('視圖：'):
                model.view = raw[3:]
                require(model.view in ['cards', 'sequence', 'usecase', 'activity', 'state', 'deployment'], 'E_UNSUPPORTED', 'unknown project view')
            model.intro.append((number, raw))
        else:
            raise DocumentError('E_SOURCE', f'line {number}: unsupported authoring syntax')
    require(model.title and model.nodes and list(model.headings) == ['節點', '關係', '準則', '來源'], 'E_SOURCE', 'title, nodes and ordered sections are required')
    ids = [n.ident for n in model.nodes]
    require(len(ids) == len(set(ids)), 'E_REFERENCE', 'duplicate node identifiers')
    require(all(e.source in ids and e.target in ids for e in model.edges), 'E_REFERENCE', 'relationship references an unknown node')
    require(len(ids) <= 20 and len(model.edges) <= 40, 'E_LIMIT', 'project document exceeds 20 nodes or 40 edges')
    require(model.references, 'E_SOURCE', 'at least one code reference is required')
    return model


def wrap(value, capacity):
    """Deterministic wrapping; preserve characters, including Unicode composition."""
    lines, current, used = [], '', 0
    for char in value:
        size = 0 if unicodedata.combining(char) else 2 if unicodedata.east_asian_width(char) in 'WF' else 1
        if current and used + size > capacity:
            boundary = current.rfind(' ')
            if char.isascii() and char.isalnum() and boundary > len(current)//2:
                lines.append(current[:boundary+1])
                current = current[boundary+1:]
                used = sum(0 if unicodedata.combining(c) else 2 if unicodedata.east_asian_width(c) in 'WF' else 1 for c in current)
            else:
                lines.append(current)
                current, used = '', 0
        current += char
        used += size
    if current:
        lines.append(current)
    return lines or ['']


class Canvas:
    def __init__(self):
        self.view = ET.Element(f'{{{SVG}}}g', {'id': 'view', 'font-family': FONT, 'fill': INK})
        self.bindings = []

    def add(self, tag, parent=None, **attrs):
        return ET.SubElement(parent if parent is not None else self.view, f'{{{SVG}}}{tag}', {k.replace('_', '-'): str(v) for k, v in attrs.items()})

    def group(self, ident, start, end=None):
        self.bindings.append((ident, start, end or start))
        return self.add('g', id=ident)

    def text(self, value, x, y, size=20, color=INK, bold=False, parent=None, ident=None, capacity=None):
        attrs = {'x': x, 'y': y, 'font_size': size, 'fill': color}
        if bold:
            attrs['font_weight'] = 'bold'
        if ident:
            attrs['id'] = ident
        element = self.add('text', parent, **attrs)
        lines = wrap(value, capacity) if capacity else [value]
        for i, line in enumerate(lines):
            child = self.add('tspan', element, x=x, y=y + i * (size + 9))
            child.text = line
        return len(lines) * (size + 9)

    def line(self, x1, y1, x2, y2, parent=None, color=LINE, width=2):
        self.add('line', parent, x1=x1, y1=y1, x2=x2, y2=y2, stroke=color, stroke_width=width)

    def dashed(self, x1, y1, x2, y2, parent=None, color=MUTED):
        distance = math.hypot(x2-x1, y2-y1)
        if distance == 0:
            return
        for start in range(0, math.ceil(distance), 14):
            end = min(start+7, distance)
            self.line(x1+(x2-x1)*start/distance, y1+(y2-y1)*start/distance,
                      x1+(x2-x1)*end/distance, y1+(y2-y1)*end/distance, parent, color)

    def arrow(self, x1, y, x2, kind, parent):
        color = TEAL if kind in ['fk', 'event', 'transition'] else BLUE
        if kind in ['logical', 'dependency', 'realization', 'return']:
            self.dashed(x1, y, x2, y, parent, color)
        else:
            self.line(x1, y, x2, y, parent, color)
        direction = 1 if x2 >= x1 else -1
        if kind in ['inheritance', 'realization']:
            self.add('polygon', parent, points=f'{x2},{y} {x2-direction*15},{y-9} {x2-direction*15},{y+9}', fill=WHITE, stroke=color, stroke_width=2)
        else:
            self.add('polyline', parent, points=f'{x2-direction*12},{y-7} {x2},{y} {x2-direction*12},{y+7}', fill='none', stroke=color, stroke_width=2)
        if kind == 'composition':
            self.add('polygon', parent, points=f'{x1},{y} {x1+direction*9},{y-6} {x1+direction*18},{y} {x1+direction*9},{y+6}', fill=color, stroke=color)


def uml_catalog(c, model, y):
    """Keep every guard/trigger searchable next to a numbered directed relation."""
    by_id={n.ident:n for n in model.nodes}
    group=c.group('uml-edges',model.headings['關係'])
    c.text('關係／條件目錄',56,y,25,INK,True,group)
    y+=38
    for index,edge in enumerate(model.edges,1):
        group=c.group('edge-'+str(index),edge.line)
        label=f'{index:02d} {edge.source} → {edge.target} | {edge.kind} | {edge.label}'
        y+=c.text(label,70,y,17,INK,parent=group,capacity=124)+17
    return y+20


def render_uml(c, model, y):
    """Project UML views: explicit actors/use cases and guarded vertical flows."""
    if model.view=='usecase':
        actors=[n for n in model.nodes if n.title.startswith('«actor»')]
        cases=[n for n in model.nodes if n.title.startswith('«usecase»')]
        require(1<=len(actors)<=3 and 1<=len(cases)<=10 and len(actors)+len(cases)==len(model.nodes),'E_SOURCE','usecase needs actors and use cases')
        require(all(e.kind=='association' and e.source in {n.ident for n in actors} and e.target in {n.ident for n in cases} for e in model.edges),'E_SOURCE','this usecase subset supports actor-to-case associations')
        height=max(430*len(actors),280*math.ceil(len(cases)/2))+100
        c.add('rect',x=405,y=y,width=980,height=height,rx=8,fill=PALE,stroke=LINE)
        c.text('«system» MicroserviceStarter',430,y+35,20,INK,True)
        anchors={}
        for i,node in enumerate(actors):
            cy=y+170+i*430;group=c.group('node-'+node.ident,node.start,node.end)
            c.add('circle',group,cx=165,cy=cy-35,r=22,fill=WHITE,stroke=BLUE,stroke_width=2)
            for coords in [(165,cy-13,165,cy+42),(130,cy+8,200,cy+8),(165,cy+42,135,cy+80),(165,cy+42,195,cy+80)]:c.line(*coords,parent=group,color=BLUE)
            pos=cy+112;c.text(node.ident,65,pos,14,BLUE,True,group)
            pos+=28;c.text(node.title,65,pos,18,INK,True,group,capacity=29)
            pos+=55
            for _,value in node.fields:pos+=c.text(value,65,pos,14,MUTED,parent=group,capacity=29)+5
            anchors[node.ident]=(220,cy+8)
        for i,node in enumerate(cases):
            cx=650+(i%2)*480;cy=y+175+(i//2)*280
            group=c.group('node-'+node.ident,node.start,node.end)
            c.add('ellipse',group,cx=cx,cy=cy,rx=205,ry=105,fill=WHITE,stroke=BLUE,stroke_width=2)
            c.text(node.ident,cx-140,cy-52,14,BLUE,True,group)
            pos=cy-20;c.text(node.title,cx-140,pos,17,INK,True,group,capacity=31)
            pos+=40
            for _,value in node.fields:pos+=c.text(value,cx-140,pos,13,MUTED,parent=group,capacity=36)+4
            require(pos<=cy+90,'E_LIMIT','usecase text must fit its ellipse; move detail to feature contracts')
            anchors[node.ident]=(cx-205,cy)
        # Associations travel through the margins; detailed include/guard labels follow.
        for i,edge in enumerate(model.edges):
            require(edge.source in anchors and edge.target in anchors,'E_REFERENCE','unknown usecase endpoint')
            x1,y1=anchors[edge.source];x2,y2=anchors[edge.target]
            rail=310+i*4;top=y+50+i*3
            if x2>900:
                c.add('polyline',points=f'{x1},{y1} {rail},{y1} {rail},{top} 890,{top} 890,{y2} {x2},{y2}',fill='none',stroke=LINE,stroke_width=1)
            else:c.add('polyline',points=f'{x1},{y1} {rail},{y1} {rail},{y2} {x2},{y2}',fill='none',stroke=LINE,stroke_width=1)
        return uml_catalog(c,model,y+height+50)
    require(model.view in ['activity','state'],'E_UNSUPPORTED','unknown flow view')
    stereotypes=('«initial»','«final»','«action»','«decision»') if model.view=='activity' else ('«initial»','«final»','«state»')
    require(all(n.title.startswith(stereotypes) for n in model.nodes) and sum(n.title.startswith('«initial»') for n in model.nodes)==1,'E_SOURCE','flow requires one initial node and supported UML node types')
    require(all(e.kind=='transition' for e in model.edges),'E_SOURCE','flow edges must be transitions')
    if model.view=='activity':
        for node in model.nodes:
            if node.title.startswith('«decision»'):
                outgoing=[e for e in model.edges if e.source==node.ident]
                require(len(outgoing)>=2 and all('[' in e.label and ']' in e.label for e in outgoing),'E_SOURCE','decision branches need explicit guards')
    anchors={}
    for node in model.nodes:
        group=c.group('node-'+node.ident,node.start,node.end)
        special=node.title.startswith(('«initial»','«final»','«decision»'))
        require(not special or not node.fields,'E_SOURCE','initial/final/decision details belong in guarded relation labels')
        height=130 if special else 100+sum(len(wrap(v,48))*25+5 for _,v in node.fields)
        center=y+height/2
        if node.title.startswith(('«initial»','«final»')):
            c.add('circle',group,cx=705,cy=center,r=18,fill=INK,stroke=INK,stroke_width=2)
            if node.title.startswith('«final»'):c.add('circle',group,cx=705,cy=center,r=25,fill='none',stroke=INK,stroke_width=2)
            c.text(node.ident+' '+node.title,770,center+6,16,INK,parent=group,capacity=52)
        elif node.title.startswith('«decision»'):
            c.add('polygon',group,points=f'705,{y} 955,{center} 705,{y+height} 455,{center}',fill=PALE,stroke=BLUE,stroke_width=2)
            c.text(node.ident+' '+node.title,550,center+5,16,INK,True,group,capacity=34)
        else:
            c.add('rect',group,x=430,y=y,width=550,height=height,rx=28 if model.view=='activity' else 12,fill=WHITE,stroke=BLUE,stroke_width=2)
            c.text(node.ident,450,y+25,14,BLUE,True,group)
            pos=y+55;pos+=c.text(node.title,450,pos,20,INK,True,group,capacity=46)+7
            for _,value in node.fields:pos+=c.text(value,450,pos,16,MUTED,parent=group,capacity=48)+5
        anchors[node.ident]=(y,y+height,center)
        y+=height+65
    link_labels=[]
    for i,edge in enumerate(model.edges):
        a,b=anchors[edge.source],anchors[edge.target]
        source=next(n for n in model.nodes if n.ident==edge.source)
        target=next(n for n in model.nodes if n.ident==edge.target)
        group=c.group('uml-link-'+str(i),edge.line)
        if model.nodes.index(target)==model.nodes.index(source)+1:
            start=a[2]+18 if source.title.startswith('«initial»') else a[1]
            end=b[2]-25 if target.title.startswith('«final»') else b[0]
            c.line(705,start,705,end,group,color=TEAL)
            c.add('polyline',group,points=f'698,{end-12} 705,{end} 712,{end-12}',fill='none',stroke=TEAL,stroke_width=2)
            c.text(f'{i+1:02d}',725,(start+end)/2+5,14,BLUE,parent=group)
            continue
        # Branches and retry loops have separate rails and numbered labels.
        rail=60+i*8
        sx=680 if source.title.startswith(('«initial»','«final»')) else 455 if source.title.startswith('«decision»') else 430
        tx=680 if target.title.startswith(('«initial»','«final»')) else 455 if target.title.startswith('«decision»') else 430
        sy=a[2]+20 if edge.source==edge.target else a[2]
        ty=b[2]-20 if edge.source==edge.target else b[2]
        c.add('polyline',group,points=f'{sx},{sy} {rail},{sy} {rail},{ty} {tx-12},{ty}',fill='none',stroke=TEAL,stroke_width=2)
        c.arrow(tx-12,ty,tx,edge.kind,group)
        lx=32 if edge.source==edge.target else rail+10
        ly=(sy+ty)/2+5 if edge.source==edge.target else (3*sy+ty)/4+5
        while any(abs(lx-x)<24 and abs(ly-y)<24 for x,y in link_labels):ly-=28
        link_labels.append((lx,ly))
        c.text(f'{i+1:02d}',lx,ly,14,BLUE,parent=group)
    return uml_catalog(c,model,y+25)


def render(model):
    c = Canvas()
    c.add('rect', x=0, y=0, width=WIDTH, height=180, fill=INK)
    c.text('RELAY / AGENT LIVING DOCUMENT', 56, 45, 16, '#9EBFE8')
    c.text(model.title, 56, 105, 34, WHITE, True, ident='document-title', capacity=74)
    c.bindings.append(('document-title', 1, 1))
    y = 215
    controls={'文件編號','文件狀態','核准狀態','維護角色','具名負責人','適用基準','最後審查','關聯需求','關聯決策'}
    index=0
    while index < len(model.intro):
        number,value=model.intro[index]
        if value.split('：',1)[0] in controls:
            items=[]
            while index<len(model.intro) and model.intro[index][1].split('：',1)[0] in controls:
                items.append(model.intro[index]);index+=1
            for offset in range(0,len(items),2):
                heights=[]
                for column,(number,value) in enumerate(items[offset:offset+2]):
                    group=c.group(f'intro-{number}',number)
                    color=TEAL if value=='文件狀態：current' else MUTED
                    # Uppercase requirement IDs are wider than average ASCII glyphs.
                    heights.append(c.text(value,56+column*678,y,16,color,parent=group,capacity=60))
                y+=max(heights)+12
            y+=12
        else:
            group=c.group(f'intro-{number}',number)
            y+=c.text(value,56,y,19,MUTED,parent=group,capacity=116)+7
            index+=1
    y += 18
    group = c.group('nodes-heading', model.headings['節點'])
    c.text('節點', 56, y, 25, INK, True, group)
    y += 34
    by_id = {n.ident: n for n in model.nodes}
    if model.view in ['usecase','activity','state']:
        y=render_uml(c,model,y)
    elif model.view == 'sequence':
        count = len(model.nodes)
        cell = (WIDTH-112)/count
        require(cell >= 150, 'E_LIMIT', 'sequence supports at most eight participants')
        heights = [100 + max(0, len(wrap(n.title, int((cell-28)/8.5)))-1)*26
                   + sum(len(wrap(v, int((cell-28)/7))) * 23 for _, v in n.fields) for n in model.nodes]
        height = max(heights)
        centers = {}
        for index, node in enumerate(model.nodes):
            x = 56 + index*cell
            centers[node.ident] = x+cell/2
            group = c.group('node-'+node.ident, node.start, node.end)
            c.add('rect', group, x=x+3, y=y, width=cell-8, height=height, rx=8, fill=PALE, stroke=LINE)
            pos = y+25
            pos += c.text(node.ident, x+15, pos, 14, BLUE, True, group, capacity=int((cell-28)/7))
            pos += c.text(node.title, x+15, pos, 17, INK, True, group, capacity=int((cell-28)/8.5))
            for _, value in node.fields:
                pos += c.text(value, x+15, pos, 14, MUTED, parent=group, capacity=int((cell-28)/7))
        y += height+48
        group = c.group('edges-heading', model.headings['關係'])
        c.text('關係', 56, y, 25, INK, True, group)
        y += 35
        start = y
        # Draw lifelines before messages so all text retains a clear foreground.
        lifelines = c.add('g')
        for index, edge in enumerate(model.edges, 1):
            group = c.group(f'edge-{index}', edge.line)
            a, b = centers[edge.source], centers[edge.target]
            left = max(62, min(a, b))
            capacity = min(100, int((WIDTH-70-left)/8.5))
            if capacity < 30:
                left = max(62, left-230)
                capacity = 44
            height = c.text(f'{index:02d} {edge.kind} | {edge.label}', left, y+20, 17, INK, parent=group, capacity=capacity)
            ay = y+height+21
            if a == b:
                right = min(a+70, WIDTH-20)
                c.add('polyline', group, points=f'{a},{ay} {right},{ay} {right},{ay+23} {a},{ay+23}', fill='none', stroke=BLUE, stroke_width=2)
                c.add('polyline', group, points=f'{a+12},{ay+16} {a},{ay+23} {a+12},{ay+30}', fill='none', stroke=BLUE, stroke_width=2)
            else:
                c.arrow(a, ay, b, edge.kind, group)
            y = ay+50
        for x in centers.values():
            c.dashed(x, start, x, y-12, lifelines, LINE)
    else:
        cell, gap = 646, 32
        for offset in range(0, len(model.nodes), 2):
            row = model.nodes[offset:offset+2]
            heights = [100 + sum(len(wrap(v, 56))*28+5 for _, v in n.fields) + max(0, len(wrap(n.title, 50))-1)*31 for n in row]
            height = max(heights)
            for index, node in enumerate(row):
                x = 56+index*(cell+gap)
                group = c.group('node-'+node.ident, node.start, node.end)
                c.add('rect', group, x=x, y=y, width=cell, height=height, rx=10, fill=WHITE, stroke=LINE, stroke_width=2)
                if model.view=='deployment':
                    c.add('polyline',group,points=f'{x},{y} {x+12},{y-12} {x+cell+12},{y-12} {x+cell+12},{y+height-12} {x+cell},{y+height}',fill='none',stroke=BLUE,stroke_width=2)
                    c.line(x+cell,y,x+cell+12,y-12,group,color=BLUE)
                c.text(node.ident, x+22, y+26, 14, BLUE, True, group)
                pos = y+57
                pos += c.text(node.title, x+22, pos, 22, INK, True, group, capacity=50)
                c.line(x+18, pos-9, x+cell-18, pos-9, group)
                pos += 15
                for _, value in node.fields:
                    pos += c.text(value, x+22, pos, 18, MUTED, parent=group, capacity=56)+5
            y += height+26
        y += 15
        group = c.group('edges-heading', model.headings['關係'])
        c.text('關係', 56, y, 25, INK, True, group)
        y += 35
        for index, edge in enumerate(model.edges, 1):
            group = c.group(f'edge-{index}', edge.line)
            label_height = len(wrap(f'{index:02d} {edge.kind} | {edge.label}', 78))*27
            row_height = max(104, label_height+55)
            c.add('rect', group, x=56, y=y, width=1324, height=row_height, rx=8, fill=PALE)
            c.text(by_id[edge.source].ident, 76, y+27, 15, BLUE, True, group)
            c.text(by_id[edge.source].title.split('»',1)[-1].strip(), 76, y+57, 17, INK, parent=group, capacity=26)
            c.text(by_id[edge.target].ident, 1155, y+27, 15, BLUE, True, group)
            c.text(by_id[edge.target].title.split('»',1)[-1].strip(), 1155, y+57, 17, INK, parent=group, capacity=26)
            c.text(f'{index:02d} {edge.kind} | {edge.label}', 325, y+27, 17, INK, parent=group, capacity=86)
            c.arrow(325, y+row_height-20, 1125, edge.kind, group)
            y += row_height+12
    y += 34
    for heading, values in [('準則', model.rules), ('來源', model.references)]:
        group = c.group('section-'+str(model.headings[heading]), model.headings[heading])
        c.text(heading, 56, y, 25, INK, True, group)
        y += 42
        for number, value in values:
            group = c.group(f'line-{number}', number)
            y += c.text(value, 70, y, 18 if heading == '準則' else 15, MUTED, parent=group, capacity=133 if heading == '準則' else 158)+15
        y += 23
    height = math.ceil(y+55)
    require(height <= 16384 and WIDTH*height <= 16777216, 'E_LIMIT', 'canvas exceeds MISVG limits; split the document')
    background = ET.Element(f'{{{SVG}}}rect', {'x':'0','y':'0','width':str(WIDTH),'height':str(height),'fill':WHITE})
    c.view.insert(0, background)
    c.line(56, height-48, WIDTH-56, height-48)
    c.text('RELAY / STATIC SVG / MARKDOWN IS THE CONTENT AUTHORITY', 56, height-22, 12, MUTED)
    return c, height


def provenance(model, base=ROOT):
    result = []
    for _, name in model.references:
        parts = Path(name).parts
        require(not any(p in ['.env','.local','.git','.aws'] for p in parts)
                and Path(name).suffix not in ['.pem','.key','.pfx'], 'E_REFERENCE', 'secret and VCS files cannot be publication references')
        path = (base/name).resolve()
        require(base.resolve() in path.parents and path.is_file(), 'E_REFERENCE', f'missing repository reference: {name}')
        result.append((name, digest(path.read_bytes())))
    return result


def document(source, doc_id, revision, references):
    model = parse_source(source)
    canvas, height = render(model)
    root = ET.Element(f'{{{SVG}}}svg', {'version':'1.1','width':str(WIDTH),'height':str(height),'viewBox':f'0 0 {WIDTH} {height}'})
    ET.SubElement(root, f'{{{SVG}}}title').text = model.title
    ET.SubElement(root, f'{{{SVG}}}desc').text = '繁體中文 Agent living document。Markdown 是內容權威；UML 關係、資料來源與更新規則以原生靜態 SVG 呈現。'
    metadata = ET.SubElement(root, f'{{{SVG}}}metadata')
    doc = ET.SubElement(metadata, f'{{{MISVG}}}document', {'version':'0.1','profile':'static','doc-id':doc_id,'revision':str(revision)})
    ET.SubElement(doc, f'{{{MISVG}}}source', {'media-type':'text/markdown','dialect':'commonmark-0.31.2',f'{{{XML}}}space':'preserve'}).text = source
    ET.SubElement(doc, f'{{{MISVG}}}presentation', {'root-ref':'view','source-digest':'sha256:'+digest(source.encode('utf-8')),'renderer':RENDERER,'renderer-version':VERSION})
    bindings = ET.SubElement(doc, f'{{{MISVG}}}bindings')
    for target, start, end in canvas.bindings:
        ET.SubElement(bindings, f'{{{MISVG}}}bind', {'target':target,'start-line':str(start),'end-line':str(end)})
    extensions = ET.SubElement(doc, f'{{{MISVG}}}extensions')
    evidence = ET.SubElement(extensions, f'{{{AGENT}}}provenance', {'version':'1','spec-commit':SPEC_COMMIT})
    for path, sha in references:
        ET.SubElement(evidence, f'{{{AGENT}}}file', {'path':path,'sha256':sha})
    root.append(canvas.view)
    def indent(element, level=0):
        # Keep Markdown and text/tspan characters exact; indent element-only XML.
        if element.tag in [f'{{{MISVG}}}source']+[f'{{{SVG}}}{tag}' for tag in ['text','tspan','title','desc']]:
            return
        if len(element):
            element.text='\n'+'  '*(level+1)
            for index, child in enumerate(element):
                indent(child,level+1)
                child.tail='\n'+'  '*(level if index == len(element)-1 else level+1)
    indent(root)
    return ET.tostring(root, encoding='utf-8', xml_declaration=True)+b'\n'


def read(data):
    """Secure core read and supported static subset checks; never render first."""
    started = time.monotonic()
    require(len(data) <= MAX_FILE, 'E_LIMIT', 'file exceeds 8 MiB')
    try:
        text = data.decode('utf-8-sig')
    except UnicodeError:
        raise DocumentError('E_XML', 'UTF-8 required') from None
    # CDATA and comments are inert characters, not declarations or instructions.
    markup = re.sub(r'<!\[CDATA\[.*?\]\]>|<!--.*?-->', lambda match:' '*len(match.group()), text, flags=re.S)
    require(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)', markup, re.I), 'E_XML', 'DTD and entities are prohibited')
    declaration = re.match(r'<\?xml\s+[^?]*\?>', markup)
    if declaration:
        require(re.fullmatch(r'<\?xml\s+version=[\'"]1\.0[\'"](?:\s+encoding=[\'"]UTF-8[\'"])?\s*\?>', declaration.group(), re.I), 'E_XML', 'unsupported XML declaration')
    remaining = markup[declaration.end():] if declaration else markup
    require('<?' not in remaining, 'E_XML', 'processing instructions are prohibited')
    try:
        parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True, insert_pis=True))
        root = ET.fromstring(data, parser=parser)
    except (ET.ParseError, ValueError):
        raise DocumentError('E_XML', 'invalid XML') from None
    nodes = list(root.iter())
    require(len(nodes) <= MAX_NODES, 'E_LIMIT', 'too many XML nodes')
    for element in nodes:
        require(time.monotonic()-started < 10, 'E_LIMIT', 'XML processing exceeds ten seconds')
        require(all(len(v) <= 65536 for v in element.attrib.values()), 'E_LIMIT', 'attribute exceeds 65536 characters')
        if element.tag != f'{{{MISVG}}}source':
            require(len(element.text or '') <= 65536, 'E_LIMIT', 'text node exceeds 65536 characters')
    def depth(element, level):
        require(level <= MAX_DEPTH, 'E_LIMIT', 'XML exceeds depth 64')
        for child in element:
            depth(child, level+1)
    depth(root, 1)
    require(root.tag == f'{{{SVG}}}svg', 'E_STRUCTURE', 'SVG root required')
    children = [x for x in root if isinstance(x.tag, str)]
    require([x.tag for x in children] == [f'{{{SVG}}}{n}' for n in ['title','desc','metadata','g']], 'E_STRUCTURE', 'root children or order differ')
    require(set(root.attrib) == {'version','width','height','viewBox'} and root.get('version') == '1.1', 'E_STRUCTURE', 'invalid root attributes')
    for n in children[:2]:
        require(not n.attrib and not len(n) and n.text and n.text.strip(), 'E_STRUCTURE', 'title and desc must be nonempty plain text')
    try:
        require(len(root.get('width','')) <= 5 and len(root.get('height','')) <= 5, 'E_PROFILE', 'canvas dimension too long')
        width, height = int(root.get('width')), int(root.get('height'))
    except ValueError:
        raise DocumentError('E_PROFILE', 'integer canvas required') from None
    require(all(re.fullmatch(r'[1-9][0-9]*', root.get(k)) for k in ['width','height']) and 1 <= width <= 16384 and 1 <= height <= 16384 and width*height <= 16777216, 'E_PROFILE', 'canvas out of range')
    require(root.get('viewBox') == f'0 0 {width} {height}', 'E_PROFILE', 'viewBox differs from canvas')
    metadata = children[2]
    require(not metadata.attrib and len(metadata) == 1 and metadata[0].tag == f'{{{MISVG}}}document', 'E_STRUCTURE', 'one metadata document required')
    doc = metadata[0]
    require(set(doc.attrib) == {'version','profile','doc-id','revision'}, 'E_STRUCTURE', 'unknown core document attributes')
    require(doc.get('version') == '0.1' and doc.get('profile') == 'static', 'E_UNSUPPORTED', 'unsupported version/profile')
    require(re.fullmatch(r'urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', doc.get('doc-id','')), 'E_STRUCTURE', 'UUIDv4 URN required')
    revision = doc.get('revision','')
    require(len(revision) <= 16 and re.fullmatch(r'[1-9][0-9]*', revision) and int(revision) <= MAX_REVISION, 'E_STRUCTURE', 'revision out of range')
    tags = [x.tag for x in doc]
    core = [f'{{{MISVG}}}{n}' for n in ['source','presentation','bindings','extensions']]
    require(tags[:2] == core[:2] and tags in [core[:2],core[:3],core[:2]+core[3:],core], 'E_STRUCTURE', 'invalid core children or order')
    source, presentation = doc[:2]
    containers = [root, metadata, doc, presentation]
    containers += [x for x in doc if x.tag == f'{{{MISVG}}}bindings']
    for element in containers:
        require(not (element.text or '').strip() and all(not (x.tail or '').strip() for x in element), 'E_STRUCTURE', 'unexpected text in element-only container')
    require(source.get('dialect') == 'commonmark-0.31.2', 'E_UNSUPPORTED', 'unsupported Markdown dialect')
    require(set(source.attrib) == {'media-type','dialect',f'{{{XML}}}space'} and source.get('media-type') == 'text/markdown' and source.get(f'{{{XML}}}space') == 'preserve', 'E_STRUCTURE', 'source attributes differ')
    require(len(source) == 0, 'E_SOURCE', 'source must contain only character data')
    value = source.text or ''
    require('\r' not in value, 'E_SOURCE', 'source contains decoded CR')
    require(len(value.encode('utf-8')) <= MAX_SOURCE, 'E_LIMIT', 'source exceeds 1 MiB')
    require(set(presentation.attrib) == {'root-ref','source-digest','renderer','renderer-version'} and not len(presentation) and not (presentation.text or '').strip(), 'E_STRUCTURE', 'presentation must be empty')
    require(1 <= len(presentation.get('renderer','')) <= 128 and 1 <= len(presentation.get('renderer-version','')) <= 64, 'E_STRUCTURE', 'renderer fields out of range')
    require(presentation.get('source-digest') == 'sha256:'+digest(value.encode('utf-8')), 'E_DIGEST_MISMATCH', 'source differs from digest')
    view = children[3]
    common = {'id','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','font-family','font-size','font-weight','font-style','text-anchor'}
    geometry = {'g':set(), 'rect':{'x','y','width','height','rx','ry'}, 'circle':{'cx','cy','r'}, 'ellipse':{'cx','cy','rx','ry'}, 'line':{'x1','x2','y1','y2'}, 'polygon':{'points'}, 'polyline':{'points'}, 'text':{'x','y','dx','dy',f'{{{XML}}}space'}, 'tspan':{'x','y','dx','dy'}}
    ids = set()
    for n in view.iter():
        require(isinstance(n.tag, str) and n.tag.startswith('{'+SVG+'}'), 'E_PROFILE', 'foreign elements in view')
        tag = n.tag.split('}',1)[1]
        require(tag in set(geometry)|{'circle','ellipse','path'}, 'E_PROFILE', 'element outside MISVG static allowlist')
        require(tag in geometry, 'E_UNSUPPORTED', 'outside this validator geometry subset')
        require(set(n.attrib) <= common | geometry[tag], 'E_PROFILE', f'unsupported attribute on {tag}')
        if 'id' in n.attrib:
            ident = n.get('id')
            require(ID.fullmatch(ident) and ident not in ids, 'E_REFERENCE', 'invalid or duplicate view ID')
            ids.add(ident)
        for attr, v in n.attrib.items():
            if attr in ['fill','stroke']:
                require(v == 'none' or re.fullmatch(r'#[0-9a-fA-F]{6}',v), 'E_PROFILE', 'paint must be a literal RGB or none')
            elif attr == 'points':
                numbers = re.split(r'[\s,]+', v.strip())
                require(len(numbers) >= (6 if tag == 'polygon' else 4) and len(numbers)%2 == 0 and all(NUMBER.fullmatch(x) and math.isfinite(float(x)) for x in numbers), 'E_PROFILE', 'invalid points')
            elif attr == 'font-family':
                families = [f.strip() for f in v.split(',')]
                require(families[-1] in ['sans-serif','serif','monospace'] and all(f and all(c.isalpha() or c.isdecimal() or c in ' -' for c in f) for f in families), 'E_PROFILE', 'invalid font list')
            elif attr in ['x','y','cx','cy','r','dx','dy','x1','x2','y1','y2','width','height','rx','ry','stroke-width','font-size']:
                require(NUMBER.fullmatch(v) and math.isfinite(float(v)), 'E_PROFILE', 'finite unitless number required')
                if attr in ['width','height','r','rx','ry','stroke-width','font-size']:
                    require(float(v) > 0 if attr == 'font-size' else float(v) >= 0, 'E_PROFILE', 'negative dimension')
            elif attr in ['stroke-linecap','stroke-linejoin','font-style','text-anchor','font-weight',f'{{{XML}}}space']:
                choices = {'stroke-linecap':['butt','round','square'],'stroke-linejoin':['miter','round','bevel'],'font-style':['normal','italic','oblique'],'text-anchor':['start','middle','end'],'font-weight':['normal','bold']+[str(i) for i in range(100,1000,100)],f'{{{XML}}}space':['preserve']}
                require(v in choices[attr], 'E_PROFILE', 'unsupported enum')
        allowed_children = {'tspan'} if tag in ['text','tspan'] else (set(geometry)|{'circle','ellipse','path'})-{'tspan'} if tag == 'g' else set()
        require(all(isinstance(x.tag,str) and x.tag.split('}',1)[-1] in allowed_children for x in n), 'E_PROFILE', 'invalid static child')
        if tag not in ['text','tspan']:
            require(not (n.text or '').strip(), 'E_PROFILE', 'text must use text/tspan')
    require(view.get('id') == presentation.get('root-ref') and view.get('id') in ids, 'E_REFERENCE', 'root-ref must identify the view root')
    seen = set()
    bindings = doc.find(f'{{{MISVG}}}bindings')
    if bindings is not None:
        require(not bindings.attrib and len(bindings) > 0, 'E_STRUCTURE', 'bindings must be nonempty')
        for b in bindings:
            require(b.tag == f'{{{MISVG}}}bind' and set(b.attrib) == {'target','start-line','end-line'} and not len(b) and not (b.text or '').strip(), 'E_STRUCTURE', 'invalid binding')
            target = b.get('target')
            require(target in ids and target not in seen, 'E_REFERENCE', 'invalid or repeated binding target')
            seen.add(target)
            require(all(re.fullmatch(r'[1-9][0-9]*', b.get(k,'')) for k in ['start-line','end-line']), 'E_REFERENCE', 'invalid line number')
            require(1 <= int(b.get('start-line')) <= int(b.get('end-line')) <= line_count(value), 'E_REFERENCE', 'binding outside source')
    extensions = doc.find(f'{{{MISVG}}}extensions')
    if extensions is not None:
        require(not extensions.attrib and len(extensions) > 0, 'E_STRUCTURE', 'extensions must be nonempty')
        for e in extensions.iter():
            if e is extensions:
                continue
            require(isinstance(e.tag,str) and e.tag.startswith('{') and e.tag.split('}',1)[0][1:] not in [SVG,MISVG,XML], 'E_STRUCTURE', 'extension namespace must be foreign')
    return root, doc, value


def check(data, base=ROOT):
    root, doc, source = read(data)
    model = parse_source(source)
    actual = doc.find(f'{{{MISVG}}}extensions/{{{AGENT}}}provenance')
    require(actual is not None and actual.get('version') == '1' and actual.get('spec-commit') == SPEC_COMMIT, 'E_STRUCTURE', 'missing project provenance')
    stored = [(f.get('path'),f.get('sha256')) for f in actual]
    require(stored == provenance(model, base), 'E_SOURCE_STALE', 'referenced code changed; review source and update this document')
    expected = document(source, doc.get('doc-id'), int(doc.get('revision')), stored)
    expected_root = ET.fromstring(expected)
    require([n.text for n in root[:2]] == [n.text for n in expected_root[:2]], 'E_CONTENT', 'title or description differs from source-derived presentation')
    # Compare complete model-derived presentation and bindings, not only the hash.
    require(ET.tostring(root[-1]) == ET.tostring(expected_root[-1]), 'E_CONTENT', 'view differs from its authoritative source or renderer')
    require(ET.tostring(doc.find(f'{{{MISVG}}}bindings')) == ET.tostring(expected_root[2][0].find(f'{{{MISVG}}}bindings')), 'E_REFERENCE', 'bindings are stale')
    return {'structure':'pass','source-binding':'pass','static-profile':'pass',
            'content-fidelity':'pass','visual-review':'not-checked'}


@contextmanager
def locked(path):
    directory = Path(tempfile.gettempdir())/'relay-misvg-locks'
    directory.mkdir(mode=0o700, exist_ok=True)
    lock = directory/(digest(str(path.resolve()).encode('utf-8'))+'.lock')
    with lock.open('a+b') as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        yield


def atomic_write(path, candidate, expected=None):
    """Call under the cooperative file lock; preserve original on failed checks."""
    current = path.read_bytes() if path.exists() else None
    require((digest(current) if current is not None else None) == expected, 'E_CONFLICT', 'file changed since it was read')
    name = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.'+path.name, delete=False) as handle:
            name = handle.name
            handle.write(candidate)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if name and os.path.exists(name):
            os.unlink(name)


def save(path, source, expected=None, create=False):
    source = normalize(source)
    model = parse_source(source)
    references = provenance(model)
    path.parent.mkdir(parents=True, exist_ok=True)
    with locked(path):
        if create:
            require(not path.exists(), 'E_CONFLICT', 'new document already exists')
            ident, revision = 'urn:uuid:'+str(uuid.uuid4()), 1
        else:
            raw = path.read_bytes()
            require(digest(raw) == expected, 'E_CONFLICT', 'file changed since extraction')
            _, doc, _ = read(raw)
            extensions = doc.find(f'{{{MISVG}}}extensions')
            require(extensions is None or len(extensions) == 1 and extensions[0].tag == f'{{{AGENT}}}provenance', 'E_EXTENSION_EDIT', 'unknown extension cannot be safely edited')
            require(int(doc.get('revision')) < MAX_REVISION, 'E_LIMIT', 'revision exhausted')
            ident, revision = doc.get('doc-id'), int(doc.get('revision'))+1
            unchanged = document(source, ident, revision-1, references)
            if unchanged == raw:
                return False
        candidate = document(source, ident, revision, references)
        check(candidate)
        atomic_write(path, candidate, expected)
    return True


def fields(values):
    """Read project control data from visible, authoritative Markdown fields."""
    result = {}
    for _, value in values:
        if '：' in value:
            key, content = value.split('：', 1)
            result.setdefault(key, []).append(content)
    return result


def one(values, key):
    require(key in values and len(values[key]) == 1 and values[key][0].strip(), 'E_GOVERNANCE', 'one nonempty field required: '+key)
    return values[key][0]


def identifiers(value):
    return [v.strip() for v in value.split(',') if v.strip()]


def code_reference(value, base=ROOT):
    require('#' in value, 'E_TRACE', 'implementation/test references need path#declared-symbol')
    name, symbol = value.split('#', 1)
    require(re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.]*', symbol), 'E_TRACE', 'invalid declared symbol')
    path = (base/name).resolve()
    require(base.resolve() in path.parents and path.is_file() and path.suffix in ['.cs','.py','.ts','.tsx'], 'E_TRACE', 'missing code/test reference: '+name)
    text = path.read_text(encoding='utf-8')
    short = re.escape(symbol.split('.')[-1])
    patterns = [r'\b(?:def|class|interface|function)\s+'+short+r'\b',
                r'\b(?:public|private|internal|protected)\s+(?:(?:async|static|override|virtual|sealed)\s+)*[\w<>,?\[\].]+\s+'+short+r'\s*\(']
    require(any(re.search(p, text) for p in patterns), 'E_TRACE', 'declared symbol not found: '+value)
    return value


def engineering_catalog(models, base=ROOT):
    """Trace existence and control completeness, never infer business acceptance."""
    documents, requirements, decisions, stages, open_items = [], {}, {}, {}, {}
    for filename, model in sorted(models.items()):
        info = fields(model.intro)
        ident = one(info, '文件編號')
        state, approval = one(info,'文件狀態'), one(info,'核准狀態')
        require(state in ['current','draft','superseded'] and approval in ['not-recorded','confirmed'], 'E_GOVERNANCE', 'invalid lifecycle/approval status')
        try:
            date.fromisoformat(one(info,'最後審查'))
        except ValueError:
            raise DocumentError('E_GOVERNANCE','review date must be ISO YYYY-MM-DD') from None
        if approval == 'confirmed':
            record_id=one(info,'核准依據')
            require(re.fullmatch(r'REC-[A-Z0-9-]+',record_id) and one(info,'具名負責人') != 'unassigned', 'E_GOVERNANCE', 'confirmation requires attributable evidence')
            approval_path=base/'docs/records'/record_id
            require((approval_path/'record.json').is_file(),'E_GOVERNANCE','confirmation record does not exist')
            verify_record(approval_path,base)
            approval_record=json.loads((approval_path/'record.json').read_text(encoding='utf-8'))
            require(any(a.get('documentId')==ident and a.get('by')==one(info,'具名負責人') and a.get('status')=='confirmed'
                        for a in approval_record.get('approvals',[])),'E_GOVERNANCE','record does not contain the claimed document confirmation')
        documents.append({'id':ident,'file':filename,'title':model.title,'status':state,'approval':approval,
                          'ownerRole':one(info,'維護角色'),'namedOwner':one(info,'具名負責人'),
                          'applicability':one(info,'適用基準'),'reviewed':one(info,'最後審查'),
                          'requirements':identifiers(one(info,'關聯需求')),'decisions':identifiers(one(info,'關聯決策'))})
        for node in model.nodes:
            target = requirements if node.ident.startswith('REQ-') else decisions if node.ident.startswith('ADR-') else stages if node.ident.startswith('PHASE-') else open_items if node.ident.startswith('OPEN-') else None
            if target is not None:
                require(node.ident not in target, 'E_TRACE', 'duplicate control ID: '+node.ident)
                target[node.ident] = {'id':node.ident,'title':node.title,'document':filename,'fields':fields(node.fields)}
    require(len({d['id'] for d in documents}) == len(documents), 'E_GOVERNANCE', 'document numbers must be unique')
    require(set(stages) == {'PHASE-0'+str(i) for i in range(1,7)}, 'E_GOVERNANCE', 'all six engineering stages must be defined')
    for stage in stages.values():
        for key in ['輸入','產出','完成條件','責任角色']:
            one(stage['fields'],key)
    for decision in decisions.values():
        f = decision['fields']
        require(one(f,'決策狀態') in ['observed-retrospective','proposed','superseded'], 'E_GOVERNANCE', 'invalid decision status')
        for key in ['問題','採用方案','替代方案','理由與代價','重評條件','紀錄性質']:
            one(f,key)
    for requirement in requirements.values():
        f = requirement['fields']
        require(one(f,'需求狀態') in ['confirmed','proposed','retired'], 'E_GOVERNANCE', 'invalid requirement state')
        require(one(f,'風險') in ['low','medium','high'], 'E_GOVERNANCE', 'invalid risk')
        for key in ['目標','需求依據','驗收','預期依據','決策','圖頁','實作','測試','驗證命令','驗證狀態','證據']:
            one(f,key)
        require(all(token in one(f,'驗收') for token in ['AC-','Given','When','Then']), 'E_TRACE', 'acceptance needs an ID, precondition, trigger and observable result')
        require(one(f,'驗證狀態') in ['historical-pass','partial','record-linked','not-run'], 'E_GOVERNANCE', 'existence of tests is not a current pass')
        require(all(v in decisions for v in identifiers(one(f,'決策'))), 'E_TRACE', 'unknown decision in requirement')
        require(all(v in models for v in identifiers(one(f,'圖頁'))), 'E_TRACE', 'unknown diagram in requirement')
        for ref in identifiers(one(f,'實作'))+identifiers(one(f,'測試')):
            code_reference(ref,base)
        for ref in identifiers(one(f,'測試')):
            require(ref.startswith('tests/'), 'E_TRACE', 'test references must point to test code')
    for item in open_items.values():
        f=item['fields']
        require(one(f,'待辦狀態') in ['open','resolved'], 'E_GOVERNANCE', 'invalid open-item status')
        for key in ['未知條件','影響','處理方式','責任角色']:
            one(f,key)
        if one(f,'待辦狀態') == 'resolved':
            one(f,'解決證據')
    for doc in documents:
        require(all(v in requirements for v in doc['requirements']) and all(v in decisions for v in doc['decisions']), 'E_TRACE', 'diagram has dangling requirement/decision references')
        for ident in doc['requirements']:
            require(doc['file'] in identifiers(one(requirements[ident]['fields'],'圖頁')), 'E_TRACE', 'diagram/requirement relationship must be bidirectional')
    by_file={d['file']:d for d in documents}
    for requirement in requirements.values():
        for filename in identifiers(one(requirement['fields'],'圖頁')):
            require(requirement['id'] in by_file[filename]['requirements'],'E_TRACE','requirement/diagram relationship must be bidirectional')
    return {'schemaVersion':1,'authority':'Derived from SVG m:source; do not edit this index.',
            'documents':documents,'stages':list(stages.values()),'requirements':list(requirements.values()),
            'decisions':list(decisions.values()),'openItems':list(open_items.values()),
            'coverage':{'requirements':len(requirements),'withAcceptanceAndTestReferences':len(requirements),
                        'meaning':'Reference coverage only; not proof that requirements pass or that current code was executed.'}}


def catalog(directory=DIRECTORY, base=ROOT):
    models = {}
    for path in sorted(directory.glob('*.misvg.svg')):
        models[path.name] = parse_source(read(path.read_bytes())[2])
    require(models,'E_REFERENCE','no living documents')
    return engineering_catalog(models,base)


def json_bytes(value):
    return (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode('utf-8')


def git_output(base, *args):
    result = subprocess.run(['git','-C',str(base),*args],capture_output=True)
    require(result.returncode == 0,'E_RECORD','Git history is required for archive checks')
    return result.stdout


def verify_record(directory, base=ROOT, history=True):
    manifests=list(directory.glob('manifest.*.json'))
    require(len(manifests)==1,'E_RECORD','one sealed manifest required')
    manifest=manifests[0]
    require(manifest.name=='manifest.'+digest(manifest.read_bytes())+'.json','E_RECORD','manifest seal differs')
    values=json.loads(manifest.read_text(encoding='utf-8'))
    actual={str(p.relative_to(directory)):digest(p.read_bytes()) for p in directory.rglob('*') if p.is_file() and p!=manifest}
    require(values.get('files')==actual,'E_RECORD','archive contents changed')
    record=json.loads((directory/'record.json').read_text(encoding='utf-8'))
    require(record.get('recordId')==directory.name and record.get('kind')=='verification','E_RECORD','record identity/kind mismatch')
    require(record.get('scope') and record.get('applicability') and record.get('checks'),'E_RECORD','scope, version and checks are required')
    for check_item in record['checks']:
        status=check_item.get('status')
        require(status in ['pass','fail','skipped','not-run'],'E_RECORD','unknown check result')
        require(check_item.get('command') and check_item.get('reason'),'E_RECORD','each result needs command and scope/reason')
        if status=='pass':
            require(check_item.get('exitCode')==0 and check_item.get('evidence') in actual,'E_RECORD','pass requires successful exit and retained evidence')
        elif status=='not-run':
            require(check_item.get('exitCode') is None,'E_RECORD','not-run cannot have an exit code')
    for superseded in record.get('corrects',[]):
        require((directory.parent/superseded/'record.json').is_file() and superseded!=directory.name,'E_RECORD','correction must reference an existing other record')
    history_status='not-checked'
    if history:
        require(git_output(base,'rev-parse','--is-shallow-repository').strip()==b'false','E_RECORD_HISTORY','full Git history required; do not claim immutability from a shallow checkout')
        relative=directory.resolve().relative_to(base.resolve()).as_posix()
        commits=git_output(base,'log','--reverse','--format=%H','--',relative).decode().splitlines()
        if commits:
            first=commits[0]
            names=git_output(base,'ls-tree','-r','--name-only',first,'--',relative).decode().splitlines()
            initial={str(Path(name).relative_to(relative)):digest(git_output(base,'show',first+':'+name)) for name in names}
            current=dict(actual);current[manifest.name]=digest(manifest.read_bytes())
            require(initial==current,'E_RECORD_IMMUTABLE','archive differs from its first committed snapshot; append a correction record')
            history_status='unchanged-since-first-commit'
        else:
            history_status='new-uncommitted-record'
    return {'recordId':record['recordId'],'integrity':'pass','history':history_status,'scope':record['scope']}


def archive_record(destination, record, evidence, base=ROOT):
    require(re.fullmatch(r'REC-[A-Z0-9-]+',record.get('recordId','')),'E_RECORD','record ID must be REC- followed by uppercase identifiers')
    require(destination.name==record['recordId'],'E_RECORD','destination and record ID must match')
    destination.parent.mkdir(parents=True,exist_ok=True)
    with locked(destination):
        require(not destination.exists(),'E_RECORD_IMMUTABLE','archive already exists; append a correction record')
        with tempfile.TemporaryDirectory(dir=destination.parent,prefix='.record-') as temp:
            staging=Path(temp)/destination.name;staging.mkdir()
            (staging/'record.json').write_bytes(json_bytes(record))
            (staging/'evidence').mkdir()
            for name,source in evidence.items():
                require(re.fullmatch(r'[A-Za-z0-9._-]+',name),'E_RECORD','evidence names must be bare filenames')
                shutil.copyfile(source,staging/'evidence'/name)
            files={str(p.relative_to(staging)):digest(p.read_bytes()) for p in sorted(staging.rglob('*')) if p.is_file()}
            manifest=json_bytes({'schemaVersion':1,'recordId':record['recordId'],'files':files})
            (staging/('manifest.'+digest(manifest)+'.json')).write_bytes(manifest)
            verify_record(staging,base,history=False)
            os.replace(staging,destination)


def check_records(base=ROOT):
    directory=base/'docs/records'
    # Also detect an entire archived directory being removed in a later commit.
    names=git_output(base,'log','--format=','--name-only','--','docs/records').decode().splitlines()
    recorded={Path(name).parts[2] for name in names if len(Path(name).parts)>2 and Path(name).parts[2].startswith('REC-')}
    require(all((directory/name).is_dir() for name in recorded),'E_RECORD_IMMUTABLE','a previously committed archive directory was removed')
    return [verify_record(p,base) for p in sorted(directory.glob('REC-*')) if p.is_dir()]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    extract = sub.add_parser('extract')
    extract.add_argument('document', type=Path)
    fingerprint = sub.add_parser('fingerprint')
    fingerprint.add_argument('document', type=Path)
    for name in ['create','update']:
        command = sub.add_parser(name)
        command.add_argument('document', type=Path)
        command.add_argument('--source', type=Path, required=True)
        command.add_argument('--reviewed-code', action='store_true', required=True)
        if name == 'update':
            command.add_argument('--expected-sha256', required=True)
    validate = sub.add_parser('check')
    validate.add_argument('documents', nargs='*', type=Path)
    validate.add_argument('--report', type=Path)
    index=sub.add_parser('catalog')
    index.add_argument('--write',action='store_true')
    index.add_argument('--requirement',help='show only one requirement and its linked diagrams/decisions')
    archives=sub.add_parser('records-check')
    seal=sub.add_parser('archive')
    seal.add_argument('--record',type=Path,required=True)
    seal.add_argument('--evidence',action='append',default=[],help='bare-name=source-path')
    args = parser.parse_args()
    if args.command == 'extract':
        sys.stdout.buffer.write(read(args.document.read_bytes())[2].encode('utf-8'))
    elif args.command == 'fingerprint':
        print(digest(args.document.read_bytes()))
    elif args.command in ['create','update']:
        changed = save(args.document, args.source.read_text(encoding='utf-8'), getattr(args,'expected_sha256',None), args.command == 'create')
        print(('Updated ' if changed else 'Unchanged ')+args.document.name)
    elif args.command=='catalog':
        value=catalog()
        if args.requirement:
            require(not args.write,'E_GOVERNANCE','a filtered view cannot replace the complete derived index')
            selected=[r for r in value['requirements'] if r['id']==args.requirement]
            require(selected,'E_TRACE','unknown requirement')
            chosen=identifiers(one(selected[0]['fields'],'決策'))
            value={'authority':value['authority'],'requirement':selected[0],
                   'documents':[d for d in value['documents'] if args.requirement in d['requirements']],
                   'decisions':[d for d in value['decisions'] if d['id'] in chosen]}
        if args.write:
            target=DIRECTORY/'catalog.json'
            with locked(target):
                atomic_write(target,json_bytes(value),digest(target.read_bytes()) if target.exists() else None)
        print(json.dumps(value,ensure_ascii=False,indent=2))
    elif args.command=='records-check':
        print(json.dumps({'records':check_records()},ensure_ascii=False,indent=2))
    elif args.command=='archive':
        value=json.loads(args.record.read_text(encoding='utf-8'))
        evidence={}
        for item in args.evidence:
            name,path=item.split('=',1);evidence[name]=Path(path)
        archive_record(ROOT/'docs/records'/value['recordId'],value,evidence)
        print('Archived '+value['recordId'])
    else:
        files = args.documents or sorted(DIRECTORY.glob('*.misvg.svg'))
        require(files, 'E_REFERENCE', 'no living documents found')
        records, failed = [], False
        for path in files:
            try:
                raw = path.read_bytes()
                dimensions = check(raw)
                _, metadata, _ = read(raw)
                records.append({'file':path.name,'docId':metadata.get('doc-id'),'revision':int(metadata.get('revision')),
                                'sourceDigest':metadata.find(f'{{{MISVG}}}presentation').get('source-digest'),
                                'dimensions':dimensions,'sha256':digest(raw)})
            except (DocumentError,OSError) as error:
                failed = True
                records.append({'file':path.name,'error':str(error)})
        report = {'specification':'MISVG 0.1 static / Draft 02, revision 0.1.1',
                  'specCommit':SPEC_COMMIT,'scope':'project-authored CommonMark subset and generated native SVG geometry; not a general MISVG certification',
                  'execution':{'atUtc':datetime.now(timezone.utc).isoformat(),'command':'python3 scripts/living_docs.py check',
                               'python':platform.python_version(),'platform':platform.system(),'rendererVersion':VERSION},
                  'visualReview':'Run the separate browser review; digest checks never establish visual validity.',
                  'documents':records,'passed':not failed}
        if not args.documents and not failed:
            try:
                value=catalog()
                require((DIRECTORY/'catalog.json').read_bytes()==json_bytes(value),'E_CATALOG_STALE','regenerate the derived catalog from reviewed SVG sources')
                report['engineering']={'traceability':'pass','coverage':value['coverage'],'records':check_records()}
            except (DocumentError,OSError) as error:
                report['engineering']={'error':str(error)};failed=True;report['passed']=False
        if args.report:
            args.report.parent.mkdir(parents=True,exist_ok=True)
            args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps(report,ensure_ascii=False,indent=2))
        return 1 if failed else 0
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (DocumentError,OSError) as error:
        print(str(error),file=sys.stderr)
        sys.exit(1)
