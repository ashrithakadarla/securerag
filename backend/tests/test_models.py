import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.audit_log import AuditLog
from app.models.chat import ChatMessage, Conversation
from app.models.document import Document
from app.models.security_policy import SecurityPolicy
from app.models.user import User
from app.schemas.auth import UserRegister


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()


def test_user_creation_and_defaults(db_session):
    user = User(
        email="test@securerag.io",
        password_hash="hashed_secret",
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.role == "user"
    assert user.is_active is True
    assert user.created_at is not None
    assert repr(user) == "<User id=1 email='test@securerag.io' role='user'>"


def test_document_model_fields_and_relationships(db_session):
    user = User(email="uploader@securerag.io", password_hash="hashed_secret")
    db_session.add(user)
    db_session.commit()

    doc = Document(
        filename="security_guidelines.pdf",
        file_type="pdf",
        file_size=1048576,
        trust_score=95,
        risk_level="trusted",
        processing_status="completed",
        chunk_count=12,
        uploader_id=user.id,
    )
    db_session.add(doc)
    db_session.commit()

    assert doc.id is not None
    assert doc.filename == "security_guidelines.pdf"
    assert doc.file_type == "pdf"
    assert doc.file_size == 1048576
    assert doc.trust_score == 95
    assert doc.risk_level == "trusted"
    assert doc.processing_status == "completed"
    assert doc.chunk_count == 12
    assert doc.uploader_id == user.id
    assert doc.uploader.email == "uploader@securerag.io"
    assert len(user.documents) == 1
    assert user.documents[0].filename == "security_guidelines.pdf"


def test_document_defaults(db_session):
    doc = Document(
        filename="notes.txt",
        file_type="txt",
        file_size=512,
    )
    db_session.add(doc)
    db_session.commit()

    assert doc.risk_level == "scanning"
    assert doc.processing_status == "pending"
    assert doc.chunk_count == 0
    assert doc.trust_score is None
    assert doc.uploader_id is None


def test_security_policy_model(db_session):
    policy = SecurityPolicy(
        key="prompt_injection_protection",
        value="true",
        description="Enable rule-based prompt injection detection",
    )
    db_session.add(policy)
    db_session.commit()

    assert policy.id is not None
    assert policy.key == "prompt_injection_protection"
    assert policy.value == "true"
    assert policy.description == "Enable rule-based prompt injection detection"
    assert policy.created_at is not None
    assert policy.updated_at is not None


def test_conversation_and_chat_messages(db_session):
    user = User(email="chatuser@securerag.io", password_hash="hashed_secret")
    db_session.add(user)
    db_session.commit()

    conv = Conversation(user_id=user.id, title="Security Investigation")
    db_session.add(conv)
    db_session.commit()

    msg1 = ChatMessage(
        conversation_id=conv.id,
        role="user",
        content="What are the casual leave rules?",
        security_status="safe",
        risk_score=5,
    )
    msg2 = ChatMessage(
        conversation_id=conv.id,
        role="assistant",
        content="Employees are entitled to 12 casual leaves.",
        security_status="safe",
        risk_score=0,
    )
    db_session.add_all([msg1, msg2])
    db_session.commit()

    assert conv.id is not None
    assert len(conv.messages) == 2
    assert conv.messages[0].role == "user"
    assert conv.messages[1].role == "assistant"
    assert conv.user.email == "chatuser@securerag.io"
    assert user.conversations[0].title == "Security Investigation"


def test_conversation_cascade_delete(db_session):
    user = User(email="cascade@securerag.io", password_hash="hashed_secret")
    db_session.add(user)
    db_session.commit()

    conv = Conversation(user_id=user.id, title="Temporary Chat")
    db_session.add(conv)
    db_session.commit()

    msg = ChatMessage(
        conversation_id=conv.id,
        role="user",
        content="Hello world",
    )
    db_session.add(msg)
    db_session.commit()

    msg_id = msg.id
    db_session.delete(conv)
    db_session.commit()

    assert db_session.get(Conversation, conv.id) is None
    assert db_session.get(ChatMessage, msg_id) is None


def test_audit_log_compatibility(db_session):
    user = User(email="audited@securerag.io", password_hash="hashed_secret")
    db_session.add(user)
    db_session.commit()

    log = AuditLog(
        user_id=user.id,
        event_type="PROMPT_ATTACK_BLOCKED",
        severity="high",
        risk_score=85,
        message="Blocked attempt to inject prompt override",
    )
    db_session.add(log)
    db_session.commit()

    assert log.id is not None
    assert log.event_type == "PROMPT_ATTACK_BLOCKED"
    assert log.severity == "high"


def test_registration_schema_cannot_assign_admin_role():
    schema_fields = UserRegister.model_fields.keys()
    assert "role" not in schema_fields
    assert "is_admin" not in schema_fields
