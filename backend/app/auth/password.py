from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

_password_hasher = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _password_hasher.verify(plain_password, hashed_password)
