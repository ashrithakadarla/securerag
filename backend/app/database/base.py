from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

# Import all models to ensure they are registered with SQLAlchemy metadata when Base is imported.
# This avoids the need for explicit imports elsewhere, which is required for the test suite
# that creates the in‑memory SQLite database using `Base.metadata.create_all`.
# Importing here does not cause a circular dependency because the models import this Base
# definition, which is already evaluated before the import statement runs.
from app import models  # noqa: F401
# Explicit imports to guarantee model registration with Base metadata
from app.models.document import Document  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.security_policy import SecurityPolicy  # noqa: F401
from app.models.chat import Conversation, ChatMessage  # noqa: F401
