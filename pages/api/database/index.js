// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const db = require('./sqlite').db;

// db.run("SELECT * FROM RENTAL;", (err, rows) => {
//     if (err) console.err(err);
//     else {
//         console.log(rows);
//     }    
// })

// db.run("UPDATE tbl SET name = ?5 WHERE id = ?", {
//     1: 2,
//     5: "bar"
// });

// db.serialize(() => {
//     db.run('');

//     const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (let i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//         console.log(row.id + ": " + row.info);
//     });
// });
// db.close();

const dbAllPromise = (query) => {
    return new Promise((resolve, reject) => {
        db.all(query, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data)
        });
    })
}

const handler = (req, res) => {
    // Handle any other HTTP method
    const query = req.query.statement;

    return dbAllPromise(query).then(rows => {
        return res.status(200).json(rows);
    }).catch(err => {
        console.error(err)
        return res.status(500).json({error: "Invalid Query"});
    })
}

export default handler;