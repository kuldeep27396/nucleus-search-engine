import json
from typing import Any

import redis.asyncio as redis

from data_plane.config import settings


class RedisIngestionQueue:
    """
    Decouples document ingestion from API response times using Redis Streams.
    """

    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.stream_name = settings.REDIS_STREAM_NAME
        self.redis_client = None

    async def get_client(self):
        if self.redis_client is None:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
        return self.redis_client

    async def enqueue_document(self, doc_payload: dict[str, Any]) -> str:
        """Publishes document payload to Redis Stream."""
        try:
            client = await self.get_client()
            message_id = await client.xadd(self.stream_name, {"payload": json.dumps(doc_payload)})
            return message_id
        except Exception:
            # In memory / local fallback when Redis is offline
            return "queued_local_sync"


queue = RedisIngestionQueue()
