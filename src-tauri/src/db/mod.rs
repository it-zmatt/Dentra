use sqlx::SqlitePool;

pub struct DbPool(pub SqlitePool);
