CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL CHECK (target_type IN ('destination', 'food')),
    target_key TEXT NOT NULL,
    visitor_name TEXT NOT NULL CHECK (
        length(trim(visitor_name)) BETWEEN 1 AND 50
    ),
    rating INTEGER NOT NULL CHECK (
        rating BETWEEN 1 AND 5
    ),
    experience_text TEXT NOT NULL CHECK (
        length(trim(experience_text)) BETWEEN 1 AND 1000
    ),
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);