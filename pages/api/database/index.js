// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const db = require('./sqlite').db;

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
        return res.status(400).json({error: "Invalid Query"});
    })
}

export default handler;