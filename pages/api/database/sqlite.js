// const sqlite3 = require('sqlite3').verbose();
const sqlite3 = require('sqlite3');
const fs = require('fs');
const csv = require('csv-parser');

let initialized = fs.existsSync("./data/initialized.txt");

let db = (() => {

    if (!initialized)
    try {
        fs.rmSync("./data/rental.db");
    } catch (e) {
        // do nothing
    }

    let db = new sqlite3.Database('./data/rental.db');

    if (!initialized) {
        db.serialize(() => {
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

            db.exec(`
            ALTER TABLE RENTAL
            ADD Returned INTEGER;
            
            UPDATE RENTAL
            SET Returned=1
            WHERE PaymentDate != "NULL";
            
            UPDATE RENTAL
            SET Returned=0
            WHERE PaymentDate = "NULL";`);
    
            console.log("initalized");    
            fs.writeFileSync("./data/initialized.txt", "alfredo dummy")
        }) 
    } else {
        // try {
        //     fs.rmSync("./data/initialized.txt");
        // } catch (e) {
        //     // do nothing
        // }
    }
    
    return db;

})()

module.exports.db = db;
module.exports.initialized=initialized;
module.exports.setInitialized=()=> initialized=true;