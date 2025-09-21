import os
import logging
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/ai-productivity-app')
        try:
            self.client = MongoClient(self.mongodb_uri)
            self.db = self.client.get_database()
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.client = None
            self.db = None
    
    def store_ai_interaction(self, channel_id: str, user_id: str, message: str, response: Dict[str, Any]) -> bool:
        """Store AI interaction in database."""
        if not self.db:
            return False
        
        try:
            interaction_data = {
                "channel_id": channel_id,
                "user_id": user_id,
                "message": message,
                "ai_response": response,
                "timestamp": datetime.now(),
                "type": "ai_interaction"
            }
            
            result = self.db.ai_interactions.insert_one(interaction_data)
            return bool(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to store AI interaction: {e}")
            return False
    
    def store_event_plan(self, plan_data: Dict[str, Any]) -> bool:
        """Store event plan in database."""
        if not self.db:
            return False
        
        try:
            result = self.db.event_plans.insert_one(plan_data)
            return bool(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to store event plan: {e}")
            return False
    
    def get_event_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve event plan by ID."""
        if not self.db:
            return None
        
        try:
            plan = self.db.event_plans.find_one({"plan_id": plan_id})
            return plan
        except Exception as e:
            logger.error(f"Failed to retrieve event plan: {e}")
            return None
    
    def get_channel_ai_history(self, channel_id: str, limit: int = 50) -> list:
        """Get AI interaction history for a channel."""
        if not self.db:
            return []
        
        try:
            interactions = self.db.ai_interactions.find(
                {"channel_id": channel_id}
            ).sort("timestamp", -1).limit(limit)
            
            return list(interactions)
        except Exception as e:
            logger.error(f"Failed to retrieve AI history: {e}")
            return []
    
    def update_plan_status(self, plan_id: str, status: str) -> bool:
        """Update event plan status."""
        if not self.db:
            return False
        
        try:
            result = self.db.event_plans.update_one(
                {"plan_id": plan_id},
                {"$set": {"status": status, "updated_at": datetime.now()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update plan status: {e}")
            return False
