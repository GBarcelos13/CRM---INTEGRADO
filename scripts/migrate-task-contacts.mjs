import pg from 'pg'

const { Client } = pg

const client = new Client({
  host: 'db.nwfcyuqvbqnvcedmxvmx.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'nxXsXMA1Edv7ZFhJ',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

await client.query(`
  ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;
`)

console.log('✅ Colunas contact_phone e contact_email adicionadas à tabela tasks.')
await client.end()
