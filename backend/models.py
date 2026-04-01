"""
═══════════════════════════════════════════════════════════════
SAST Pipeline — Database Models
Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
Repo  : BYTEGUARDIAN14/sast-pipeline
Reg   : 6176AC23UCS097

SQLAlchemy 2.x declarative models for storing SAST scan results.
═══════════════════════════════════════════════════════════════
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    relationship,
    sessionmaker,
)


# ── SQLAlchemy 2.x declarative base ─────────────────────────
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ── Scan model ───────────────────────────────────────────────
class Scan(Base):
    """
    Represents a single SAST scan run.
    Each push/CI run creates one Scan record that aggregates
    the counts of findings by severity.
    """
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    commit_sha = Column(String(40), nullable=False)
    branch = Column(String(100), nullable=False)
    total_findings = Column(Integer, default=0, nullable=False)
    critical_count = Column(Integer, default=0, nullable=False)
    high_count = Column(Integer, default=0, nullable=False)
    medium_count = Column(Integer, default=0, nullable=False)
    low_count = Column(Integer, default=0, nullable=False)

    # One-to-many: a scan has many findings
    findings = relationship(
        "Finding",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def to_dict(self):
        """Serialize Scan to a JSON-safe dictionary."""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "commit_sha": self.commit_sha,
            "branch": self.branch,
            "total_findings": self.total_findings,
            "critical_count": self.critical_count,
            "high_count": self.high_count,
            "medium_count": self.medium_count,
            "low_count": self.low_count,
        }


# ── Finding model ────────────────────────────────────────────
class Finding(Base):
    """
    Represents a single security finding from Semgrep.
    Each finding belongs to exactly one Scan.
    """
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    severity = Column(String(20), nullable=False)
    rule_id = Column(String(200), nullable=False)
    file_path = Column(String(500), nullable=False)
    line_number = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    cwe = Column(String(50), nullable=True)

    # Many-to-one: a finding belongs to a scan
    scan = relationship("Scan", back_populates="findings")

    def to_dict(self):
        """Serialize Finding to a JSON-safe dictionary."""
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "severity": self.severity,
            "rule_id": self.rule_id,
            "file_path": self.file_path,
            "line_number": self.line_number,
            "message": self.message,
            "cwe": self.cwe,
        }


# ── Database initialization helper ──────────────────────────
def init_db(database_url="sqlite:///findings.db"):
    """
    Create the database engine, session factory, and all tables.
    Returns (engine, SessionLocal) tuple.
    """
    engine = create_engine(database_url, echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    return engine, SessionLocal
