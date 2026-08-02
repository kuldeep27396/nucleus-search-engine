from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from data_plane.config import settings

Base = declarative_base()

engine = create_async_engine(
    settings.DATABASE_URL, echo=settings.DEBUG, future=True, pool_size=20, max_overflow=10
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Dependency for providing Async Database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initializes PostgreSQL vector extension and creates all defined schemas."""
    async with engine.begin() as conn:
        # Create vector extension if not exists
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gin;"))
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
