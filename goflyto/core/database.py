from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from goflyto.core.config import settings

engine = create_async_engine(settings.database_url, pool_pre_ping=True, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
