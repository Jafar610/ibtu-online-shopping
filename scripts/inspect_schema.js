const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Connected OK');

    const tables = ['product_variants', 'inventory_movements', 'products', 'product_images'];
    for (const t of tables) {
      console.log('\n=== ' + t + ' ===');
      const [cols] = await conn.query('DESCRIBE `' + t + '`');
      cols.forEach(c => console.log(c.Field + ' | ' + c.Type + ' | KEY:' + c.Key + ' | NULL:' + c.Null + ' | DEFAULT:' + c.Default + ' | EXTRA:' + c.Extra));
    }

    // counts
    for (const t of tables) {
      const [[row]] = await conn.query('SELECT COUNT(*) as cnt FROM `' + t + '`');
      console.log('\n' + t + ' row count:', row.cnt);
    }

    // sample variant if exists
    const [vars] = await conn.query('SELECT * FROM product_variants LIMIT 2');
    console.log('\nSample variants:', JSON.stringify(vars, null, 2));

    // inventory_movements enum check
    const [mvs] = await conn.query('SELECT * FROM inventory_movements LIMIT 2');
    console.log('\nSample inventory_movements:', JSON.stringify(mvs, null, 2));

  } catch (e) {
    console.error('ERROR:', e.message, e.code, e.errno, e.sqlMessage);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
