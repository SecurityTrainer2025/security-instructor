"""Prepare the Traffic visuals and Windows ZIP from the reviewed bilingual script."""
import argparse
import csv
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageDraw, ImageFont, ImageOps
from produce_traffic_review import inventory, write_logo

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "production/traffic"
FONT = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
NAVY, GOLD, WHITE = "#0b1f33", "#dbb97a", "#f6f8fa"
# Diagrams are decision/route schematics for illustrative use. Each sequence has
# its own bilingual labels; signals are never inferred from an illustrative shot.
LESSONS = {
    "tm1s1": (("Traffic Marshal role","دور منظم حركة المرور"),
        [("Protected position","موضع محمي"),("Marked crossing","معبر محدد"),("Gate team","فريق البوابة")],
        ["Illustrative marshal at protected industrial gate", "Crossing priority and gate coordination", "Identify safe position and agreed escape route"]),
    "tm1s2": (("Traffic plan and risks","خطة المرور والمخاطر"),
        [("Entry / exit","الدخول والخروج"),("Pedestrian path","مسار المشاة"),("Emergency route","مسار الطوارئ")],
        ["Supervisor and marshal reviewing a plan", "Route branches and check before changing conditions"]),
    "tm2s1": (("Gate inspection flow","حركة التفتيش عند البوابة"),
        [("Holding lane","حارة الانتظار"),("Bay ready?","هل الحارة جاهزة؟"),("Emergency lane clear","مسار الطوارئ مفتوح")],
        ["Stationary gate queue and protected marshaling position", "Hold until the authorised inspection lead confirms"]),
    "tm2s2": (("Briefing and escalation","إحاطة السائق والتصعيد"),
        [("Vehicle stopped","المركبة متوقفة"),("Confirm route","تأكيد المسار"),("Escalate refusal","تصعيد الرفض")],
        ["Briefing beside a parked van", "Safe escalation without entering a live lane"]),
    "tm3s1": (("Protected crossing","معبر مشاة محمي"),
        [("Accessible walkway","ممر مشاة ميسّر"),("Protected crossing","معبر محمي"),("Check clear","التحقق من خلو المسار")],
        ["Marked walkway separated from vehicles", "Separate routes and keep sightlines clear"]),
    "tm3s2": (("Parking and reversing","المواقف والرجوع"),
        [("Allocated bay","موقف مخصص"),("Keep driver in sight","حافظ على رؤية السائق"),("Loss of sight: stop","فقدان الرؤية: توقّف")],
        ["Stationary parking area with marked bays", "Safeguards diagram without depicting a manoeuvre"]),
    "tm4s1": (("PPE and emergency access","الوقاية ومسار الطوارئ"),
        [("Check PPE","افحص معدات الوقاية"),("Water and shade","الماء والظل"),("Keep access clear","أبقِ مسار الطوارئ مفتوحًا")],
        ["PPE and shaded rest area", "Hazard reporting and protection of emergency access"]),
    "tm4s2": (("Incident report","تقرير الحادث"),
        [("Time and location","الوقت والموقع"),("Observed facts","الوقائع المرصودة"),("Approved channel","القناة المعتمدة")],
        ["Objective report prepared in a protected office", "Separate facts from accounts and send securely"]),
    "tm5s1": (("Site-approved signals","إشارات الموقع المعتمدة"),
        [("Agree first","اتفق أولًا"),("Verify understanding","تحقق من الفهم"),("If unclear: stop","عند الغموض: توقّف")],
        ["Marshal and instructor review the signal chart, without modeled gestures", "Communication safeguards, not a gesture demonstration"]),
    "tm5s2": (("Radio and handover","اللاسلكي وتسليم المناوبة"),
        [("Call sign and location","رمز النداء والموقع"),("Situation and request","الموقف والطلب"),("Confirm handover","تأكيد تسليم المناوبة")],
        ["Two marshals in a protected radio handover", "Confirm the outstanding hazards and emergency lane"]),
}


def font(size):
    return ImageFont.truetype(str(FONT), size)


def frame(photo, logo, title, labels, diagram, route_map=False):
    canvas = Image.new("RGB", (1280, 720), NAVY)
    draw = ImageDraw.Draw(canvas)
    draw.text((35, 27), title[0], GOLD, font=font(32))
    draw.text((1141, 31), title[1], WHITE, font=font(33), anchor="ra", direction="rtl")
    canvas.paste(ImageOps.contain(logo, (73, 73)), (1176, 14))
    width = 748 if diagram else 1208
    fitted = ImageOps.contain(photo, (width, 475), Image.Resampling.LANCZOS)
    canvas.paste(fitted, (35 + (width - fitted.width) // 2, 108 + (475 - fitted.height) // 2))
    if diagram:
        left, right = 817, 1244
        for i, (en, ar) in enumerate(labels):
            y = 120 + 144 * i
            draw.rounded_rectangle((left, y, right, y + 104), radius=14, fill="#17334e", outline=GOLD, width=2)
            draw.text(((left + right) / 2, y + 22), en, WHITE, font=font(22), anchor="ma")
            draw.text(((left + right) / 2, y + 58), ar, WHITE, font=font(22), anchor="ma", direction="rtl")
            if route_map:
                color = ("#6eb6f1", "#9bd9ae", GOLD)[i]
                draw.line((left + 24, y + 91, right - 26, y + 91), fill=color, width=3)
                draw.polygon([(right - 25, y + 91), (right - 36, y + 86), (right - 36, y + 96)], fill=color)
            elif i < len(labels) - 1:
                x = (left + right) / 2
                draw.line((x, y + 104, x, y + 135), fill=GOLD, width=3)
                draw.polygon([(x, y + 137), (x - 7, y + 129), (x + 7, y + 129)], fill=GOLD)
    draw.text((640, 600), "REPRESENTATIVE TRAINING VISUAL  /  مادة تدريبية تمثيلية",
              GOLD, font=font(22), anchor="ma", direction="ltr")
    return canvas


def clock(seconds):
    minute, sec = divmod(seconds, 60)
    return f"00:{minute:02}:{sec:02}.000"


def build(sheet):
    images = PACK / "assets"
    images.mkdir(parents=True, exist_ok=True)
    write_logo(images / "si-logo.jpg")
    logo = Image.open(images / "si-logo.jpg").convert("RGB")
    grid = Image.open(sheet).convert("RGB")
    plan = {"course_id": "CRS-TRAFFIC-001", "status": "illustrative_review",
            "timing": "Planning estimates only; render measures decoded narration for final timing.", "lessons": []}
    rows = []
    for index, (key, (final_name, _, cues)) in enumerate(inventory().items()):
        title, labels, notes = LESSONS[key]
        row, col = divmod(index, 2)
        w, h = grid.size
        photo = grid.crop((col*w//2+3, row*h//5+3, (col+1)*w//2-3, (row+1)*h//5-3))
        for name, diagram in (("photo", False), ("diagram", True)):
            frame(photo, logo, title, labels, diagram, key in {'tm1s2', 'tm2s1', 'tm3s1'}).save(images / f"{key}-{name}.jpg", quality=91, optimize=True)
        lesson = {"id": key, "module": index//2+1, "kind": "explanation" if col == 0 else "application",
                  "title_en": title[0], "title_ar": title[1], "staging_filename": final_name, "scenes": []}
        plan["lessons"].append(lesson)
        timeline = 0
        for number, ((ar, en), note) in enumerate(zip(cues, notes, strict=True), 1):
            ar, en = ar.strip(), en.strip()
            ar = ar.replace("منظم المرور", "منظم حركة المرور")
            if key == "tm1s1" and number == 1:
                ar = "مرحبًا بكم في دورة إدارة حركة المرور والتحكم في المركبات في الموقع من منصة سيكيوريتي إنستركتور."
                en = "Welcome to Security Instructor’s Traffic Management & Vehicle Control course."
            seconds = max(8, round(len(ar.split()) / 1.8) + 1, round(len(en.split()) / 2.4))
            scene = {"scene": number, "description_en": note,
                     "planned_start": clock(timeline), "planned_end": clock(timeline + seconds),
                     "visual": f"assets/{key}-{'photo' if number == 1 else 'diagram'}.jpg", "ar": ar, "en": en}
            timeline += seconds
            lesson["scenes"].append(scene)
            rows.append({"lesson": key, "title_ar": title[1], "title_en": title[0],
                         "kind": lesson["kind"], **scene})
    (PACK / "scene-plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (PACK / "SCENE_LIST.csv").open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def archive(target):
    files = [*PACK.glob("*.py"), *PACK.glob("*.bat"), *PACK.glob("*.md"), *PACK.glob("*.json"),
             *PACK.glob("*.csv"), *PACK.glob("assets/*.jpg")]
    with ZipFile(target, "w", ZIP_DEFLATED) as zipfile:
        for file in sorted(files):
            name = (Path("SI-Traffic-Production") / file.relative_to(PACK)).as_posix()
            if file.suffix == ".bat":
                zipfile.writestr(name, file.read_text(encoding="ascii").replace("\n", "\r\n"))
            else:
                zipfile.write(file, name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sheet", type=Path, help="Prepared 2×5 training-image contact sheet")
    parser.add_argument("--zip", type=Path, help="Create Windows package from existing production assets")
    args = parser.parse_args()
    if args.sheet:
        build(args.sheet)
    if args.zip:
        archive(args.zip)
