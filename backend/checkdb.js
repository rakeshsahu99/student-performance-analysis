import pool from './config/db.js';

function getConnectionSummary() {
    if (process.env.DATABASE_URL) {
        return 'DATABASE_URL is set';
    }

    return [
        `host=${process.env.DB_HOST || '(missing)'}`,
        `port=${process.env.DB_PORT || '(missing)'}`,
        `database=${process.env.DB_NAME || '(missing)'}`,
        `user=${process.env.DB_USER || '(missing)'}`,
        `password=${process.env.DB_PASSWORD ? '(set)' : '(empty)'}`,
    ].join(', ');
}

function printHelpfulError(error) {
    const code = error?.code || 'UNKNOWN';

    console.error(`Database check failed [${code}]`);

    if (code === '28P01') {
        console.error('PostgreSQL rejected the username/password.');
        console.error(`Current connection config: ${getConnectionSummary()}`);
        console.error('Fix backend/.env so DB_USER and DB_PASSWORD match your local PostgreSQL account, or set DATABASE_URL.');
        return;
    }

    if (code === '3D000') {
        console.error(`Database "${process.env.DB_NAME}" does not exist.`);
        console.error('Create it, load backend/db/schema.sql, and run npm run seed.');
        return;
    }

    if (code === 'ECONNREFUSED') {
        console.error('PostgreSQL is not reachable on the configured host/port.');
        console.error(`Current connection config: ${getConnectionSummary()}`);
        console.error('Start PostgreSQL or update backend/.env to the correct host and port.');
        return;
    }

    console.error(error instanceof Error ? error.message : String(error));
}

(async () => {
    try {
        const now = await pool.query('SELECT NOW()');
        console.log('connected', now.rows[0]);

        const tables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name
    `);

        console.log(
            'tables',
            tables.rows.map((row) => `${row.table_schema}.${row.table_name}`).join(', ')
        );

        const counts = [];

        for (const table of tables.rows) {
            try {
                const countResult = await pool.query(`SELECT COUNT(*) AS cnt FROM "${table.table_schema}"."${table.table_name}"`);

                counts.push({
                    table: `${table.table_schema}.${table.table_name}`,
                    count: countResult.rows[0].cnt,
                });
            } catch (error) {
                counts.push({
                    table: `${table.table_schema}.${table.table_name}`,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        console.log('counts', counts);
    } catch (error) {
        printHelpfulError(error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();