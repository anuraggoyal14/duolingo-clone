"""CLI: `python -m app.seed` seeds an empty DB; `python -m app.seed --reset` wipes and re-seeds."""

import sys

from app.database import Base, SessionLocal, engine
from app.seed.seeder import reset_database, seed_if_empty

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if "--reset" in sys.argv:
            reset_database(db)
            print("Database reset and re-seeded.")
        else:
            print("Seeded." if seed_if_empty(db) else "Database already seeded; use --reset to start over.")
