from app import db
from datetime import datetime

class SortingSession(db.Model):
    """Model to track sorting sessions and statistics"""
    id = db.Column(db.Integer, primary_key=True)
    algorithm = db.Column(db.String(50), nullable=False)
    array_size = db.Column(db.Integer, nullable=False)
    comparisons = db.Column(db.Integer, default=0)
    swaps = db.Column(db.Integer, default=0)
    execution_time = db.Column(db.Float, default=0.0)  # in milliseconds
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    mode = db.Column(db.String(20), default='learn')  # 'learn' or 'game'

class AlgorithmStats(db.Model):
    """Model to store algorithm performance statistics"""
    id = db.Column(db.Integer, primary_key=True)
    algorithm = db.Column(db.String(50), nullable=False)
    total_runs = db.Column(db.Integer, default=0)
    avg_comparisons = db.Column(db.Float, default=0.0)
    avg_swaps = db.Column(db.Float, default=0.0)
    avg_execution_time = db.Column(db.Float, default=0.0)
    wins = db.Column(db.Integer, default=0)  # Number of times this algorithm won in game mode
