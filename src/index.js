const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "Aaabbbccc",
  host: "ec2-46-137-84-173.eu-west-1.compute.amazonaws.com",
  database: "df39sbidlujkpu",
  password: "a2a2af4fb709286e6dfc69e2aa2e9a10d960f3b9740b22e81f21c210a929b942",
  port: 5432,
  ssl: true
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const app = express();
app.route("/students").get(async (req, res) => {
  try {
    pool.connect().then(client => {
      return client
        .query("SELECT * FROM students")
        .then(result => {
          client.release();
          res.json(result.rows);
        })
        .catch(e => {
          client.release();
          console.log(e.stack);
        });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

app.route("/students/:id").get(async (req, res) => {
  try {
    pool.connect().then(client => {
      return client
        .query(`SELECT * FROM students where id = ${req.params.id}`)
        .then(result => {
          client.release();
          res.json(result.rows);
        })
        .catch(e => {
          client.release();
          res.status(500).json({ message: "Ошибка базы данных" });
        });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

app.route("/students").post(bodyParser.json(), async (req, res) => {
  try {
    pool.connect().then(client => {
      return client
        .query(
          `INSERT INTO students (first_name, last_name, group_name, created_at, updated_at)
        VALUES ('${req.body.first_mame}',
                '${req.body.last_name}', 
                '${req.body.group_name}', 
                current_timestamp, 
                current_timestamp);`
        )
        .then(result => {
          client.release();
          res.status(201).json({ message: "Студент создан!" });
        })
        .catch(e => {
          client.release();
          res.status(500).json({ message: "Ошибка базы данных" });
        });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

app.route("/students/:id").put(bodyParser.json(), async (req, res) => {
  try {
    var bodyString = "";
    for (var key in req.body) {
      bodyString += `${key} = '${req.body[key]}', `;
    }
    pool.connect().then(client => {
      return client
        .query(
          `UPDATE students
            SET
            ${bodyString}
            updated_at = current_timestamp 
          WHERE 
            id = ${req.params.id}
              `
        )
        .then(result => {
          client.release();
          res.status(201).json("Студент отредактирован!");
        })
        .catch(e => {
          client.release();
          res.status(500).json({ message: "Ошибка базы данных" });
        });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

app.route("/students/:id").delete(async (req, res) => {
  try {
    pool.connect().then(client => {
      return client
        .query(
          `DELETE FROM students
          WHERE id = ${req.params.id}
              `
        )
        .then(result => {
          client.release();
          res.status(201).json({ message: "Студент удалён!" });
        })
        .catch(e => {
          client.release();
          res.status(500).json({ message: "Ошибка базы данных" });
        });
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

const server = http.createServer(app);
server.listen(8080, () => console.log("Server listen on port 8080"));
