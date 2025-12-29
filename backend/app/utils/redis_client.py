
import json
import os
import logging
from dotenv import load_dotenv

# Load environment variables explicitly
load_dotenv()

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Any

import redis.asyncio as redis
from redis.exceptions import ConnectionError, RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)

class CustomEncoder(json.JSONEncoder):
    """
    JSON Encoder to handle datetime, date, and Decimal objects.
    """
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

class RedisClient:
    _instance = None

    def __init__(self):
        # Try from settings first, then fallback to os.getenv in case settings loaded too early
        self.redis_url = settings.REDIS_URL or os.getenv("REDIS_URL")
        self.client: Optional[redis.Redis] = None
        
        # Log the URL (masking password)
        if self.redis_url:
            masked_url = self.redis_url
            if "@" in masked_url:
                try:
                    prefix, suffix = masked_url.rsplit("@", 1)
                    if ":" in prefix:
                        proto_user, _ = prefix.rsplit(":", 1)
                        masked_url = f"{proto_user}:***@{suffix}"
                except:
                    pass
            logger.info(f"Initializing Redis Client with URL: {masked_url}")
            
        if self.redis_url:
            try:
                self.client = redis.from_url(self.redis_url, decode_responses=True)
                logger.info("Redis client initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Redis client: {e}")
        else:
            logger.warning("REDIS_URL not set. Redis caching disabled.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def get_cache(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from Redis.
        Returns None if key doesn't exist or Redis is down.
        """
        if not self.client:
            return None
        
        try:
            val = await self.client.get(key)
            if val:
                return json.loads(val)
        except (ConnectionError, RedisError, Exception) as e:
            logger.error(f"Redis get_cache error for key {key}: {e}")
            return None
        
        return None

    async def set_cache(self, key: str, value: Any, ttl: int = 3600):
        """
        Set a value in Redis with a TTL.
        Fails silently if Redis is down.
        """
        if not self.client:
            return

        try:
            json_str = json.dumps(value, cls=CustomEncoder)
            await self.client.setex(key, ttl, json_str)
        except (ConnectionError, RedisError, Exception) as e:
            logger.error(f"Redis set_cache error for key {key}: {e}")

    async def delete_cache(self, key: str):
        """
        Delete a key from Redis.
        Fails silently if Redis is down.
        """
        if not self.client:
            return

        try:
            await self.client.delete(key)
        except (ConnectionError, RedisError, Exception) as e:
            logger.error(f"Redis delete_cache error for key {key}: {e}")

    async def delete_pattern(self, pattern: str):
        """
        Delete all keys matching a pattern.
        Uses scan_iter for safe iteration.
        """
        if not self.client:
            return

        try:
            keys = []
            async for key in self.client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                await self.client.delete(*keys)
                logger.info(f"Deleted {len(keys)} keys matching pattern: {pattern}")
        except (ConnectionError, RedisError, Exception) as e:
            logger.error(f"Redis delete_pattern error for pattern {pattern}: {e}")

# Global instance
redis_client = RedisClient.get_instance()
