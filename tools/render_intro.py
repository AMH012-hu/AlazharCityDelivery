#!/usr/bin/env python3
"""Render the lightweight, original vector-motion customer intro video."""
from math import cos, sin, pi
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess
import tempfile

W, H, SCALE, FPS = 960, 540, 2, 24
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "media" / "customer-delivery-intro.mp4"
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def palette(scene):
    return [
        ((232, 245, 234), (251, 247, 232), (203, 229, 207)),
        ((208, 235, 247), (244, 247, 236), (174, 219, 205)),
        ((239, 246, 235), (250, 245, 232), (203, 229, 207)),
        ((223, 242, 228), (251, 248, 236), (180, 218, 190)),
    ][scene]

def draw_scene(scene, t):
    top, sun, ground = palette(scene)
    im = Image.new("RGB", (W*SCALE, H*SCALE), top)
    d = ImageDraw.Draw(im)
    def xy(v): return int(round(v*SCALE))
    def rect(box, fill, outline=None, width=1, radius=0):
        box=tuple(xy(v) for v in box)
        if radius: d.rounded_rectangle(box, radius=xy(radius), fill=fill, outline=outline, width=xy(width))
        else: d.rectangle(box, fill=fill, outline=outline, width=xy(width))
    def ellipse(box, fill, outline=None, width=1): d.ellipse(tuple(xy(v) for v in box), fill=fill, outline=outline, width=xy(width))
    def line(points, fill, width=3): d.line([(xy(x),xy(y)) for x,y in points], fill=fill, width=xy(width), joint="curve")
    def arc(box, start, end, fill, width=3): d.arc(tuple(xy(v) for v in box), start, end, fill=fill, width=xy(width))
    def txt(at, value, size, fill):
        font=ImageFont.truetype(FONT_PATH, xy(size))
        d.text((xy(at[0]),xy(at[1])), value, font=font, fill=fill, stroke_width=0)

    # Soft sky and grounded neighborhood; everything is vector-like and intentionally simple.
    ellipse((760,35,900,175), sun)
    rect((0,392,960,540), ground)
    line([(0,394),(960,394)], (142,190,151), 2)
    for bx, bw, bh in [(28,156,140),(772,178,174),(554,118,105)]:
        rect((bx,394-bh,bx+bw,394), (246,249,241), (213,226,214), 2, 12)
        for wx in range(bx+22,bx+bw-12,48): rect((wx,394-bh+25,wx+22,394-bh+55),(190,220,208),None,1,5)

    def wheel(cx, cy, r=52, phase=0):
        ellipse((cx-r,cy-r,cx+r,cy+r), (244,249,246), (38,69,55), 5)
        ellipse((cx-6,cy-6,cx+6,cy+6), (38,69,55))
        for a in range(8):
            ang=(a*pi/4)+phase
            line([(cx,cy),(cx+cos(ang)*(r-5),cy+sin(ang)*(r-5))], (141,166,151), 1.5)

    def bicycle(x, y, phase=0):
        rear=(x-79,y); front=(x+79,y); crank=(x,y-9); head=(x+43,y-50); seat=(x-42,y-50)
        wheel(*rear, phase=phase); wheel(*front, phase=phase)
        for a,b in [(rear,crank),(crank,front),(rear,seat),(seat,head),(head,front),(seat,crank)]: line([a,b],(36,91,67),5)
        line([(head[0]-7,head[1]-5),(head[0]+16,head[1]-9),(head[0]+25,head[1]-3)],(36,91,67),4)
        line([(seat[0]-11,seat[1]-8),(seat[0]+7,seat[1]-8)],(36,91,67),5)
        ellipse((crank[0]-7,crank[1]-7,crank[0]+7,crank[1]+7),(243,192,73),(36,91,67),2)

    def courier(x, y, phase=0, carry_bag=True):
        bicycle(x,y,phase)
        # rear delivery bag carries a legible local mark
        if carry_bag:
            rect((x-118,y-145,x-42,y-87),(243,191,72),(38,69,55),3,12)
            txt((x-111,y-124),"ALAZHAR",10,(24,66,48))
            rect((x-108,y-142,x-54,y-136),(255,255,255))
        # modest helmeted courier, long-sleeved shirt and dark trousers
        line([(x-31,y-52),(x-44,y-98),(x-30,y-135),(x-7,y-143),(x+12,y-125),(x+28,y-99)],(33,58,47),7)
        line([(x-42,y-97),(x-4,y-98),(x+10,y-68)],(249,252,249),24)
        line([(x-39,y-98),(x-52,y-63),(x-10,y-32),(x-4,y-14)],(34,48,41),12)
        line([(x+6,y-77),(x+31,y-62),(x+53,y-55),(x+62,y-53)],(249,252,249),13)
        line([(x+55,y-57),(x+45,y-44)],(51,69,57),5)
        # Palestine colors on the courier's upper sleeve/shoulder patch.
        rect((x-23,y-113,x-2,y-90),(255,255,255),None,1,2)
        rect((x-23,y-113,x-2,y-106),(16,16,16));rect((x-23,y-99,x-2,y-92),(0,130,76))
        d.polygon([(xy(x-23),xy(y-106)),(xy(x-13),xy(y-102)),(xy(x-23),xy(y-99))],fill=(226,42,53))
        ellipse((x-49,y-183,x-14,y-148),(207,151,111),(62,70,56),2)
        arc((x-53,y-188,x-10,y-150),185,355,(40,62,50),9)
        line([(x-49,y-165),(x-16,y-165)],(40,62,50),4)
        # legs loop around pedals while the wheels spin
        leg=(x-15)+sin(phase)*7
        line([(x-19,y-47),(x-29,y-25),(leg,y-8),(x+8,y-8)],(34,48,41),12)
        line([(x+3,y-50),(x+19,y-32),(x+7,y-10),(x-5,y-9)],(34,48,41),12)

    if scene == 0:
        # Shop handoff: attendant passes a closed delivery bag to the rider.
        rect((54,153,370,394),(248,250,244),(162,193,171),3,18)
        rect((54,126,370,180),(26,89,61),None,1,14)
        for i in range(5): rect((65+i*61,126,117+i*61,180),(244,191,71) if i%2==0 else (251,248,234),None,1,9)
        rect((93,205,330,394),(231,239,230),(193,211,194),2,8)
        for j in range(3):
            rect((111,230+j*48,311,235+j*48),(190,205,190))
            for k,c in enumerate([(228,94,78),(240,191,70),(106,164,122)]):
                rect((122+k*57,203+j*48,162+k*57,230+j*48),c,None,1,5)
        # attendant reaches out with package
        ellipse((381,236,424,279),(196,139,101),(62,70,56),2)
        arc((376,229,430,279),184,356,(244,248,242),10)
        line([(399,275),(399,333)],(249,252,248),18)
        line([(399,293),(435,310),(485,304)],(249,252,248),12)
        rect((462,289,505,326),(244,191,71),(89,82,49),2,5)
        courier(600,425,phase=t*5)
        # Small warm focus around the transfer
        for i in range(3): ellipse((437-i*8,287-i*8,512+i*8,335+i*8),None,(236,172,60,0) if False else (236,172,60),1)
    elif scene == 1:
        # Rider in motion past the neighborhood; subtle parallax stripes and wheel rotation.
        for j in range(4):
            bx=(30+j*270-int(t*60))%1120-80
            rect((bx,285, bx+150,394),(244,248,240),(212,225,211),2,14)
            for wx in range(int(bx+20),int(bx+125),42): rect((wx,312,wx+20,342),(186,218,205),None,1,4)
        line([(0,463),(960,463)],(45,97,69),4)
        for j in range(8):
            xx=(j*150-int(t*200))%1100-90
            line([(xx,492),(xx+45,492)],(247,202,91),4)
        for j in range(4):
            xx=(j*170-int(t*155))%1050-70
            line([(xx,352-j*16),(xx+44,352-j*16)],(255,255,255),3)
        courier(480+int(t*38),455,phase=t*10)
        # motion curves behind rider
        for j in range(3): line([(170-j*13,276+j*22),(220-j*13,276+j*22)],(92,151,122),3)
    elif scene == 2:
        # Doorstep handoff: rider has safely parked and passes the order to the customer.
        rect((640,104,891,394),(246,240,221),(174,154,117),3,16)
        rect((688,145,843,394),(179,132,88),(113,83,61),3,12)
        ellipse((811,262,822,273),(244,207,114))
        rect((572,373,923,394),(180,207,184))
        # parked bike at left, with branded delivery bag
        wheel(260,421,43);wheel(401,421,43)
        for a,b in [((260,421),(320,382)),((320,382),(401,421)),((260,421),(337,421)),((337,421),(320,382)),((320,382),(385,365)),((385,365),(401,421))]:line([a,b],(37,92,66),4)
        rect((245,303,319,356),(243,191,72),(38,69,55),3,10);txt((252,323),"ALAZHAR",9,(24,66,48))
        # courier stands with long shirt, helmet, flag patch
        ellipse((430,179,473,222),(207,151,111),(62,70,56),2);arc((426,173,477,224),185,355,(40,62,50),9)
        line([(450,220),(450,322)],(248,251,247),25)
        line([(439,244),(418,289),(453,306)],(248,251,247),13)
        line([(462,244),(500,284),(544,281)],(248,251,247),13)
        rect((458,233,480,253),(255,255,255),None,1,2);rect((458,233,480,240),(18,18,18));rect((458,246,480,253),(0,130,76));d.polygon([(xy(458),xy(240)),(xy(468),xy(244)),(xy(458),xy(246))],fill=(226,42,53))
        line([(439,320),(435,376)],(34,48,41),13);line([(461,320),(467,376)],(34,48,41),13)
        # delivery parcel sits clearly between courier and customer
        rect((513,260,572,314),(243,191,72),(89,82,49),3,8)
        # customer, modest adult man in a long-sleeved neutral shirt
        ellipse((591,196,636,241),(190,133,98),(62,70,56),2)
        line([(586,193),(640,193)],(45,62,52),8)
        line([(613,240),(613,331)],(44,81,63),28)
        line([(596,260),(568,282),(553,282)],(44,81,63),12)
        line([(630,260),(644,291),(655,292)],(44,81,63),12)
        line([(599,330),(596,379)],(47,54,47),14);line([(626,330),(630,379)],(47,54,47),14)
    else:
        # Warm close: handed-off order, parked bicycle, and a calm neighborhood.
        rect((138,224,375,394),(246,250,243),(204,221,207),2,15)
        for i in range(3): rect((162+i*62,255,208+i*62,310),(191,222,206),None,1,6)
        wheel(365,428,40);wheel(496,428,40)
        for a,b in [((365,428),(425,390)),((425,390),(496,428)),((365,428),(441,428)),((441,428),(425,390)),((425,390),(479,372)),((479,372),(496,428))]:line([a,b],(37,92,66),4)
        rect((348,310,422,363),(243,191,72),(38,69,55),3,10);txt((355,330),"ALAZHAR",9,(24,66,48))
        # courier waves; sleeve flag stays visible
        ellipse((525,172,568,215),(207,151,111),(62,70,56),2);arc((521,167,572,215),185,355,(40,62,50),9)
        line([(547,216),(547,323)],(248,251,247),27)
        line([(535,242),(518,287),(505,270)],(248,251,247),13)
        line([(560,242),(591,205),(609,186)],(248,251,247),13)
        line([(604,185),(614,165)],(55,73,59),4)
        rect((555,233,578,254),(255,255,255),None,1,2);rect((555,233,578,240),(18,18,18));rect((555,247,578,254),(0,130,76));d.polygon([(xy(555),xy(240)),(xy(565),xy(244)),(xy(555),xy(247))],fill=(226,42,53))
        line([(535,321),(530,378)],(34,48,41),14);line([(559,321),(565,378)],(34,48,41),14)
        # customer holds the order and waves back
        ellipse((664,201,707,244),(190,133,98),(62,70,56),2);line([(658,198),(713,198)],(45,62,52),8)
        line([(685,243),(685,328)],(44,81,63),27);line([(667,267),(645,282),(627,267)],(44,81,63),12);line([(700,264),(726,229),(741,216)],(44,81,63),12)
        rect((635,280,680,320),(243,191,72),(89,82,49),2,6)
        line([(670,328),(667,379)],(47,54,47),14);line([(699,328),(704,379)],(47,54,47),14)
        # small sparkle marks, not UI-like decoration overload
        for sx,sy in [(778,156),(812,186),(753,205)]:
            line([(sx-7,sy),(sx+7,sy)],(243,191,72),2);line([(sx,sy-7),(sx,sy+7)],(243,191,72),2)

    # soft dark-green lower edge keeps the illustrations grounded.
    rect((0,518,960,540),(19,73,49))
    return im.resize((W,H),Image.Resampling.LANCZOS)

def smooth(a): return a*a*(3-2*a)

def main():
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    durations=[1.8,1.95,1.8,1.77]
    cross=.24
    starts=[0]
    for i in range(1,4): starts.append(starts[-1]+durations[i-1]-cross)
    total=starts[-1]+durations[-1]
    n=round(total*FPS)
    with tempfile.TemporaryDirectory(prefix="acd-intro-") as temp:
        tdir=Path(temp)
        for frame in range(n):
            t=frame/FPS
            scene=max(i for i,s in enumerate(starts) if s<=t)
            local=t-starts[scene]
            current=draw_scene(scene,local)
            # Crossfade scenes over a short overlap so the story reads as one trip.
            if scene<3 and t>starts[scene+1]-cross:
                progress=min(1,max(0,(t-(starts[scene+1]-cross))/cross))
                blend=draw_scene(scene+1,t-starts[scene+1])
                current=Image.blend(current,blend,smooth(progress))
            current.save(tdir/f"frame-{frame:04d}.jpg",quality=86,optimize=True)
        subprocess.run([
            "ffmpeg","-y","-hide_banner","-loglevel","error","-framerate",str(FPS),
            "-i",str(tdir/"frame-%04d.jpg"),"-an","-c:v","libx264","-preset","medium",
            "-crf","28","-pix_fmt","yuv420p","-movflags","+faststart",str(OUTPUT)
        ],check=True)
    print(OUTPUT, OUTPUT.stat().st_size)

if __name__ == "__main__": main()
