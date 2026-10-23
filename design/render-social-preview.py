"""Rebuild with Pillow: python design/render-social-preview.py (from repo root)."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).resolve().parents[1]
S=2
im=Image.new('RGB',(1200*S,630*S),'#b74f21');d=ImageDraw.Draw(im)
def text(x,y,t,size,color='#fff5df',bold=False):
 font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf',size*S)
 d.text((x*S,y*S),t,font=font,fill=color,stroke_width=0)
def asset(name,x,y,w,h,r=0,frame=0):
 src=Image.open(root/'media'/name).convert('RGBA').resize((w*S,h*S),Image.Resampling.LANCZOS)
 mask=Image.new('L',src.size);ImageDraw.Draw(mask).rounded_rectangle((0,0,w*S,h*S),radius=r*S,fill=255)
 if frame:d.rounded_rectangle(((x-frame)*S,(y-frame)*S,(x+w+frame)*S,(y+h+frame)*S),radius=(r+frame)*S,fill='#171814')
 im.paste(src,(x*S,y*S),mask)
asset('app-icon.png',58,48,58,58,15)
text(130,55,'So Excited',30,bold=True)
for y,line in [(154,'Count down'),(239,'to the'),(324,'good stuff.')]:text(54,y,line,67,'#f4cd54' if y==324 else '#fff5df',True)
text(58,435,'The trip. The tickets. The big birthday.',20)
text(58,470,'A little more joy in the waiting.',20)
text(58,555,'soexcitedapp.com',18,bold=True)
asset('duo-home.webp',615,126,526,370,20,9)
asset('watch-ticket.png',1002,394,135,161,27,7)
d.rectangle((0,616*S,1200*S,630*S),fill='#f4cd54')
im.resize((1200,630),Image.Resampling.LANCZOS).save(root/'media/social-preview.png',optimize=True)
