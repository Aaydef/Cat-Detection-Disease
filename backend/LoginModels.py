import psycopg2
from config import DATABASE

def get_connection():
    return psycopg2.connect(
        host=DATABASE['host'],
        database=DATABASE['database'],
        user=DATABASE['user'],
        password=DATABASE['password']
    )
