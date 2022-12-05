// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const sqlite = require('./sqlite')
const { db, initialized, setInitialized } = sqlite;

const handler = (req, res) => {

    if (!initialized) {
        setInitialized();
    }

    return res.status(200).end();
}

export default handler;