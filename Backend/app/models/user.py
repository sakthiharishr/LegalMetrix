from typing import Optional
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    designation: Mapped[Optional[str]] = mapped_column(String, default="Legal Metrology Inspector")
    badge_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    jurisdiction: Mapped[Optional[str]] = mapped_column(String, default="New Delhi Central Enforcement Zone")
    role: Mapped[Optional[str]] = mapped_column(String, default="SENIOR_ENFORCEMENT_OFFICER")
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "designation": self.designation,
            "badgeNumber": self.badge_number,
            "jurisdiction": self.jurisdiction,
            "role": self.role,
            "email": self.email,
            "avatarUrl": self.avatar_url,
        }

