"""Seed script: creates chapter one and three sample chapters."""
import asyncio
from google.cloud import firestore
from app.core.config import settings
from datetime import datetime, timezone

CHAPTER_ONE = {
    "title": "The Wheel Cart of Bangles",
    "pages": [
        "A squeaky wheel cart rolls down the street every evening. Rows of bangles, bindis, hair clips, small mirrors and cosmetics shine under the last light of the day.",
        "Mom cannot walk past it. She tries bangles on her wrist and bargains like it is a game. Little Sanjay stands beside her, bored of bangles, until he spots the corner with stickers.",
        "Ben 10 stickers and a toy train. He pulls her saree and asks again and again until she gives in. He was not collecting stickers. He was collecting the sound of that cart and his mom laughing while she paid.",
    ],
    "authorUid": "sanjay-uid",
    "authorName": "Sanjay",
    "authorPhoto": None,
    "language": "en",
    "place": {"label": "Chennai, Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    "icon": "bangles",
    "heroImagePath": None,
    "audioPath": None,
    "status": "published",
    "featured": True,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "updatedAt": datetime.now(timezone.utc).isoformat(),
    "chapterNumber": 1,
}

SAMPLE_CHAPTERS = [
    {
        "title": "The Kite That Wouldn't Come Down",
        "pages": [
            "Every January, the sky over our street turned into a battlefield of kites. The winner was not the one who flew highest, but the one whose string was coated with the sharpest glass powder.",
            "My grandfather made my kite himself. He used old newspaper and paste made from rice. It was ugly, but it flew like it had something to prove.",
            "It got stuck in a tree on the last day of the festival. I cried. He said, 'Some kites are meant to stay up there, watching over us.' I still look for it every January.",
        ],
        "authorUid": "sample-user-1",
        "authorName": "Priya",
        "authorPhoto": None,
        "language": "en",
        "place": {"label": "Jaipur, Rajasthan", "lat": 26.9124, "lng": 75.7873},
        "icon": "kite",
        "heroImagePath": None,
        "audioPath": None,
        "status": "published",
        "featured": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "chapterNumber": 2,
    },
    {
        "title": "மழை வந்த நாள்",
        "pages": [
            "முதல் மழை துளி விழும்போது நான் வீதியில் ஓடினேன். அம்மா கதவை மூடினாலும் நான் வெளியே சென்றேன்.",
            "சிறு குளத்தில் காகிதப் படகு விட்டேன். அது மிதக்கும் போது என் வாழ்க்கை முழுவதும் அந்தப் படகு போல இருந்தது.",
            "இன்றும் மழை வந்தால் நான் சிறுவன் மீண்டும் ஆகிறேன். காகிதப் படகு இன்னும் என் இதயத்தில் மிதக்கிறது.",
        ],
        "authorUid": "sample-user-2",
        "authorName": "Kavitha",
        "authorPhoto": None,
        "language": "ta",
        "place": {"label": "Madurai, Tamil Nadu", "lat": 9.9252, "lng": 78.1198},
        "icon": "paper-boat",
        "heroImagePath": None,
        "audioPath": None,
        "status": "published",
        "featured": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "chapterNumber": 3,
    },
    {
        "title": "The School Bag That Was Too Big",
        "pages": [
            "My first school bag was bigger than me. It had two pockets, one for books and one for the tiffin box that always leaked sambar.",
            "I wore it like armor. The weight of it made me feel important, like I was carrying something the world needed.",
            "Years later I found it in the attic. It was tiny. I sat inside it and cried for the boy who thought he was so big.",
        ],
        "authorUid": "sample-user-3",
        "authorName": "Rahul",
        "authorPhoto": None,
        "language": "en",
        "place": {"label": "Bengaluru, Karnataka", "lat": 12.9716, "lng": 77.5946},
        "icon": "school-bag",
        "heroImagePath": None,
        "audioPath": None,
        "status": "published",
        "featured": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "chapterNumber": 4,
    },
]


async def seed():
    db = firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)
    chapters_ref = db.collection("chapters")

    # Check if chapter one exists
    existing = await chapters_ref.where("chapterNumber", "==", 1).get()
    if existing:
        print("Chapter one already exists. Skipping seed.")
        return

    # Create chapter one
    await chapters_ref.add(CHAPTER_ONE)
    print("Created chapter 1: The Wheel Cart of Bangles")

    # Create sample chapters
    for chapter in SAMPLE_CHAPTERS:
        await chapters_ref.add(chapter)
        print(f"Created chapter {chapter['chapterNumber']}: {chapter['title']}")

    # Set counter
    await db.collection("counters").document("chapters").set({"count": 4})
    print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
