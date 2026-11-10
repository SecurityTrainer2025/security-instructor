#!/usr/bin/env python3
"""Generate six Arabic audio review tracks for hand signals, without publishing."""
import asyncio
import subprocess
import re
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "review/traffic-ai-audio"
VOICE = "ar-SA-HamedNeural"
SCRIPTS = {
    "01-forward": "قبل توجيه المركبة، تأكد من خلو المسار وأن السائق يراك بوضوح. للإشارة إلى التقدم ببطء، ارفع ذراعيك ووجّه راحتي اليدين وفق الشكل المرجعي، ثم اثنهما نحو الرأس والصدر بحركة واضحة ومتكررة. راقب استجابة السائق، وأوقف الحركة فور فقدان التواصل البصري.",
    "02-reverse": "الرجوع للخلف من أكثر المناورات التي تتطلب الانتباه. تأكد من خلو المنطقة ومن وجود إجراءات الموقع المعتمدة. استخدم إشارة الرجوع كما في المرجع، مع توجيه راحتي اليدين للأمام. إذا فقد السائق رؤيتك أو ظهرت نقطة عمياء غير مسيطر عليها، أوقف المناورة فورًا.",
    "03-turn": "عند توجيه الانعطاف، تحقق أولًا من خلو مسار المركبة من المشاة والعوائق. أشر بإحدى الذراعين إلى اتجاه الانعطاف، واستخدم الذراع الأخرى بالحركة الموضحة في المرجع. اعرض الانعطاف يمينًا ويسارًا كلًّا على حدة، ولا تسمح بالمناورة إذا لم يفهم السائق الإشارة.",
    "04-exit": "قبل السماح للمركبة بالمغادرة، تأكد من استكمال الإجراءات وأن مسار الخروج آمن. اجذب انتباه السائق أولًا، ثم استدر ومد ذراعيك باتجاه الخروج كما يوضح المرجع. تابع حركة المركبة حتى تغادر منطقة التحكم بأمان.",
    "05-stop": "للتوقف العادي، استخدم الإشارة المحددة في المرجع بتقاطع الذراعين أعلى الرأس. حافظ على وضع واضح ومرئي للسائق، وتأكد من أن المركبة توقفت فعليًا. لا تقف في مسارها، ولا تفترض أن السائق فهم الإشارة دون ملاحظة استجابته.",
    "06-emergency": "عند ظهور خطر مفاجئ، استخدم إشارة التوقف الطارئ الموضحة في المرجع: ابدأ بتشابك اليدين أعلى الرأس، ثم مد الذراعين إلى أسفل وإلى الجانبين بحركة متكررة وواضحة. أوقف المناورة، وأبلغ عن الخطر، واتبع إجراءات الطوارئ المعتمدة في الموقع.",
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for key, words in SCRIPTS.items():
        target = OUT / f"{key}.ar.mp3"
        await edge_tts.Communicate(words, VOICE, rate="-5%").save(str(target))
        if target.stat().st_size < 1000:
            raise RuntimeError(f"Missing audio: {key}")
        p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(target)], capture_output=True, text=True, check=True)
        duration = float(p.stdout.strip())
        if not (8 < duration < 120):
            raise RuntimeError(f"Unusual narration length: {key}: {duration}")
        # File size and duration alone do not prove that speech is audible.
        analysis = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostats", "-i", str(target),
             "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True, check=True
        )
        mean = re.search(r"mean_volume: *(-?[0-9.]+) dB", analysis.stderr)
        peak = re.search(r"max_volume: *(-?[0-9.]+) dB", analysis.stderr)
        if not mean or not peak:
            raise RuntimeError(f"Could not inspect audio levels: {key}")
        mean_db, peak_db = float(mean.group(1)), float(peak.group(1))
        if mean_db < -45 or peak_db < -30:
            raise RuntimeError(f"Audio appears too quiet: {key}, mean={mean_db} dB, peak={peak_db} dB")
        print(f"PASS: {key} Arabic neural voice draft, {duration:.1f}s, mean={mean_db:.1f} dB, peak={peak_db:.1f} dB")
    assert len(list(OUT.glob("*.ar.mp3"))) == 6

if __name__ == "__main__":
    asyncio.run(main())
