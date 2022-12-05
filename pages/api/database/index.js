// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const fs = require('fs');
const csv = require('csv-parser');

// const db = require('./sqlite').db;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// const db = require('./sqlite').db;

let initialized = false;

db.serialize(() => {

    if (!initialized) {
        // INIT TABLES
        console.log("initializing db ...");

        db.exec(`
            -- CUSTOMER
            CREATE TABLE Customer (
                CustID INTEGER,
                Name VARCHAR(255) NOT NULL,
                Phone VARCHAR(255) NOT NULL,

                PRIMARY KEY (CustID)
            );

            -- RATE
            CREATE TABLE Rate (
                Type INTEGER NOT NULL,              -- 1: Compact ... 6: VAN
                Category INTEGER NOT NULL,          -- 0: Basic, 1: Luxury
                Weekly INTEGER NOT NULL,
                Daily INTEGER NOT NULL,

                PRIMARY KEY(Type, Category)
            );

            -- -- VEHICLE
            CREATE TABLE Vehicle (
                VehicleId CHAR(17) NOT NULL,
                Description VARCHAR(255) NOT NULL,
                Year CHAR(4) NOT NULL,
                Type INTEGER NOT NULL,              -- 1: Compact ... 6: VAN
                Category INTEGER NOT NULL,          -- 0: Basic, 1: Luxury

                PRIMARY KEY (VehicleId),
                FOREIGN KEY (Type) REFERENCES Rate(Type),
                FOREIGN KEY (Category) REFERENCES Rate(Category)
            );

            -- RENTAL
            CREATE TABLE Rental (
                CustID INTEGER NOT NULL,
                VehicleID CHAR(17) NOT NULL,
                StartDate DATE NOT NULL,
                OrderDate DATE NOT NULL,
                RentalType CHAR NOT NULL,           -- '1' for Daily, '7' for weekly
                Qty INTEGER NOT NULL,
                ReturnDate DATE NOT NULL,
                TotalAmount INTEGER NOT NULL,
                PaymentDate DATE,

                FOREIGN KEY (CustID)
                    REFERENCES Customer(CustID)
                    ON DELETE CASCADE,
                FOREIGN KEY (VehicleID)
                    REFERENCES Vehicle(VehicleID)
                    ON DELETE CASCADE
            );
        `, err => {
            if (err) console.error(err);
        });

        const insCustomer = db.prepare( 'INSERT INTO CUSTOMER ( CustID, Name, Phone ) VALUES (?, ?, ?);' );
        fs.createReadStream('./data/CUSTOMER.csv').pipe(csv())
        .on('data', (row) => {
            insCustomer.run( row.CustID, row.Name, row.Phone );
        })

        const insRate = db.prepare( 'INSERT INTO RATE ( Type, Category, Weekly, Daily ) VALUES (?, ?, ?, ?);' );
        fs.createReadStream('./data/RATE.csv').pipe(csv())
        .on('data', (row) => {
            insRate.run( row.Type, row.Category, row.Weekly, row.Daily );
        })

        const insVehicle = db.prepare( 'INSERT INTO VEHICLE ( VehicleID, Description, Year, Type, Category ) VALUES (?, ?, ?, ?, ?);' );
        fs.createReadStream('./data/VEHICLE.csv').pipe(csv())
        .on('data', (row) => {
            insVehicle.run( row.VehicleID, row.Description, row.Year, row.Type, row.Category );
        })

        const insRental = db.prepare( 'INSERT INTO RENTAL ( CustID, VehicleID, StartDate, OrderDate, RentalType, Qty, ReturnDate, TotalAmount, PaymentDate ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);' );
        fs.createReadStream('./data/RENTAL.csv').pipe(csv())
        .on('data', (row) => {
            insRental.run( row.CustID, row.VehicleID, row.StartDate, row.OrderDate, row.RentalType, row.Qty, row.ReturnDate, row.TotalAmount, row.PaymentDate );
        })

        initialized=true;
        
        console.log("initalized");

    }
}) 

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

const handler = (req, res) => {
    const query = req.query.statement;
    console.log(query);
    return db.all(query, (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({error: "Invalid Query"});
        }
        else {
            console.log(rows)
            return res.status(200).json(rows)
        }
    });
    
}

export default handler;