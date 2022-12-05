// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const fs = require('fs');
const csv = require('csv-parser');

const db = require('./sqlite').db;

let initialized = false;

const handler = (req, res) => {

    db.serialize(() => {

        if (!initialized) {
            // INIT TABLES
            console.log("initializing db ...");
    
            const createTables = fs.readFileSync('./data/create_tables.sql', { encoding: "utf-8"});
            db.exec(createTables, err => {
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
    
    return res.status(200).end();
}

export default handler;