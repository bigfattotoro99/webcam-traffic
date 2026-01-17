# backend/roads.py

ROADS = [
    {
        "id": "krungthonburi",
        "name": "Krung Thonburi Rd",
        "video": "frontend/demo/cctv_krungthonburi.mp4",
        # ROI ตัวอย่าง (ต้องปรับตามคลิปจริง)
        "roi": [100, 100, 1100, 650],
    },
    {
        "id": "charoenkrung",
        "name": "Charoen Krung Rd",
        "video": "frontend/demo/cctv_charoenkrung.mp4",
        "roi": [120, 120, 1120, 680],
    },
    {
        "id": "ratchawithi",
        "name": "Ratchawithi Rd",
        "video": "frontend/demo/cctv_ratchawithi.mp4",
        "roi": [90, 130, 1100, 700],
    },
    {
        "id": "rama9",
        "name": "Rama 9 Rd",
        "video": "frontend/demo/cctv_rama9.mp4",
        "roi": [140, 120, 1140, 700],
    },
    {
        "id": "asokdindaeng",
        "name": "Asok–Din Daeng",
        "video": "frontend/demo/cctv_asokdindaeng.mp4",
        "roi": [140, 120, 1140, 700],
    },
]
