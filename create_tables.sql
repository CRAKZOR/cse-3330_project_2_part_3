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