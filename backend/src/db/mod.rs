use mongodb::{Client, Database};

#[derive(Clone)]
pub struct Db {
    pub database: Database,
}

impl Db {
    pub async fn connect(uri: &str, db_name: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(uri).await?;
        let database = client.database(db_name);
        Ok(Self { database })
    }

    pub fn high_scores(&self) -> mongodb::Collection<crate::models::HighScore> {
        self.database.collection("high_scores")
    }

    pub fn emails(&self) -> mongodb::Collection<crate::models::EmailSignup> {
        self.database.collection("emails")
    }
}
