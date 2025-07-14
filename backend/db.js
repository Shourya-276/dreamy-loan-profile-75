import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

dotenv.config();
console.log(path.join(__dirname, process.env.AWS_CA_BUNDLE));


const db = new pg.Client({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, process.env.AWS_CA_BUNDLE)).toString()
    }
  });
  
db.connect();

export default db; 