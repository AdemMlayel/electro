from enum import Enum

class Role(str, Enum):
    USER = "user"
    TECHNICIAN = "technician"
    ADMIN = "admin"
