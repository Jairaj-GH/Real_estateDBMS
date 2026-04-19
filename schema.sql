-- ============================================================
--  Real Estate Management System – MySQL Schema
--  Run this on your MySQL server before starting Django
-- ============================================================

CREATE DATABASE IF NOT EXISTS real_estate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE real_estate_db;

-- ────────────────────────────────────────────────────────────
-- Core Tables
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Owner (
    owner_id    INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    contact     VARCHAR(20),
    email       VARCHAR(100),
    address     TEXT,
    UNIQUE KEY uq_owner_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Agent (
    agent_id       INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    contact        VARCHAR(20),
    email          VARCHAR(100),
    rating         DECIMAL(3,1) CHECK (rating BETWEEN 0 AND 5),
    license_number VARCHAR(50),
    UNIQUE KEY uq_agent_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Buyer (
    buyer_id INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    contact  VARCHAR(20),
    email    VARCHAR(100),
    budget   DECIMAL(15,2),
    UNIQUE KEY uq_buyer_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Tenant (
    tenant_id      INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    contact        VARCHAR(20),
    email          VARCHAR(100),
    monthly_income DECIMAL(12,2),
    UNIQUE KEY uq_tenant_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Property (
    property_id       INT AUTO_INCREMENT PRIMARY KEY,
    owner_id          INT NOT NULL,
    agent_id          INT,
    address           VARCHAR(255) NOT NULL,
    locality          VARCHAR(100),
    city              VARCHAR(100),
    property_type     VARCHAR(50),
    bedrooms          INT,
    bathrooms         INT,
    size_sqft         DECIMAL(10,2),
    construction_year INT,
    listed_price      DECIMAL(15,2),
    current_status    ENUM('available','sold','rented') DEFAULT 'available',
    description       TEXT,
    listed_date       DATE,
    CONSTRAINT fk_property_owner FOREIGN KEY (owner_id) REFERENCES Owner(owner_id),
    CONSTRAINT fk_property_agent FOREIGN KEY (agent_id) REFERENCES Agent(agent_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Sale (
    sale_id        INT AUTO_INCREMENT PRIMARY KEY,
    property_id    INT NOT NULL,
    buyer_id       INT NOT NULL,
    agent_id       INT NOT NULL,
    sale_date      DATE NOT NULL,
    final_price    DECIMAL(15,2) NOT NULL CHECK (final_price >= 0),
    days_on_market INT,
    CONSTRAINT fk_sale_property FOREIGN KEY (property_id) REFERENCES Property(property_id),
    CONSTRAINT fk_sale_buyer    FOREIGN KEY (buyer_id)    REFERENCES Buyer(buyer_id),
    CONSTRAINT fk_sale_agent    FOREIGN KEY (agent_id)    REFERENCES Agent(agent_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Rent (
    rent_id      INT AUTO_INCREMENT PRIMARY KEY,
    property_id  INT NOT NULL,
    tenant_id    INT NOT NULL,
    agent_id     INT NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent >= 0),
    CONSTRAINT fk_rent_property FOREIGN KEY (property_id) REFERENCES Property(property_id),
    CONSTRAINT fk_rent_tenant   FOREIGN KEY (tenant_id)   REFERENCES Tenant(tenant_id),
    CONSTRAINT fk_rent_agent    FOREIGN KEY (agent_id)    REFERENCES Agent(agent_id),
    CONSTRAINT chk_rent_dates   CHECK (end_date > start_date)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_property_city       ON Property(city);
CREATE INDEX IF NOT EXISTS idx_property_locality   ON Property(locality);
CREATE INDEX IF NOT EXISTS idx_property_status     ON Property(current_status);
CREATE INDEX IF NOT EXISTS idx_property_bedrooms   ON Property(bedrooms);
CREATE INDEX IF NOT EXISTS idx_sale_agent          ON Sale(agent_id);
CREATE INDEX IF NOT EXISTS idx_sale_date           ON Sale(sale_date);
CREATE INDEX IF NOT EXISTS idx_rent_agent          ON Rent(agent_id);
CREATE INDEX IF NOT EXISTS idx_rent_dates          ON Rent(start_date, end_date);

-- ────────────────────────────────────────────────────────────
-- Triggers
-- ────────────────────────────────────────────────────────────

DELIMITER $$

-- 1. After inserting a sale → mark property as 'sold'
DROP TRIGGER IF EXISTS update_status_after_sale_insert$$
CREATE TRIGGER update_status_after_sale_insert
AFTER INSERT ON Sale
FOR EACH ROW
BEGIN
    UPDATE Property
    SET current_status = 'sold'
    WHERE property_id = NEW.property_id;
END$$

-- 2. After deleting a sale → revert to 'available' (unless an active rent exists)
DROP TRIGGER IF EXISTS update_status_after_sale_delete$$
CREATE TRIGGER update_status_after_sale_delete
AFTER DELETE ON Sale
FOR EACH ROW
BEGIN
    DECLARE active_rent INT DEFAULT 0;
    SELECT COUNT(*) INTO active_rent
    FROM Rent
    WHERE property_id = OLD.property_id
      AND CURDATE() BETWEEN start_date AND end_date;

    IF active_rent = 0 THEN
        UPDATE Property SET current_status = 'available'
        WHERE property_id = OLD.property_id;
    END IF;
END$$

-- 3. Before inserting a rent → prevent overlapping periods
DROP TRIGGER IF EXISTS prevent_overlap_rent_insert$$
CREATE TRIGGER prevent_overlap_rent_insert
BEFORE INSERT ON Rent
FOR EACH ROW
BEGIN
    DECLARE cnt INT DEFAULT 0;
    SELECT COUNT(*) INTO cnt
    FROM Rent
    WHERE property_id = NEW.property_id
      AND NEW.start_date < end_date
      AND NEW.end_date   > start_date;

    IF cnt > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Overlapping rent period exists for this property.';
    END IF;
END$$

-- 4. After inserting a rent → set status to 'rented' if current date is within period
DROP TRIGGER IF EXISTS update_status_after_rent_insert$$
CREATE TRIGGER update_status_after_rent_insert
AFTER INSERT ON Rent
FOR EACH ROW
BEGIN
    IF CURDATE() BETWEEN NEW.start_date AND NEW.end_date THEN
        UPDATE Property SET current_status = 'rented'
        WHERE property_id = NEW.property_id;
    END IF;
END$$

-- 5. After deleting a rent → revert to 'available' if no other active rent/sale
DROP TRIGGER IF EXISTS update_status_after_rent_delete$$
CREATE TRIGGER update_status_after_rent_delete
AFTER DELETE ON Rent
FOR EACH ROW
BEGIN
    DECLARE active_rent INT DEFAULT 0;
    DECLARE is_sold     INT DEFAULT 0;

    SELECT COUNT(*) INTO active_rent
    FROM Rent
    WHERE property_id = OLD.property_id
      AND CURDATE() BETWEEN start_date AND end_date;

    SELECT COUNT(*) INTO is_sold
    FROM Sale
    WHERE property_id = OLD.property_id;

    IF active_rent = 0 AND is_sold = 0 THEN
        UPDATE Property SET current_status = 'available'
        WHERE property_id = OLD.property_id;
    END IF;
END$$

DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- Sample Data  (50+ records each for realistic demo)
-- ────────────────────────────────────────────────────────────

INSERT IGNORE INTO Owner (name, contact, email, address) VALUES
('Rahul Sharma','9876543210','rahul.sharma@email.com','MG Road, Guwahati'),
('Priya Devi','9765432109','priya.devi@email.com','Zoo Road, Guwahati'),
('Amit Borah','9654321098','amit.borah@email.com','GS Road, Guwahati'),
('Sunita Kalita','9543210987','sunita.kalita@email.com','Paltan Bazar, Guwahati'),
('Deepak Gogoi','9432109876','deepak.gogoi@email.com','Ulubari, Guwahati'),
('Anita Das','9321098765','anita.das@email.com','Dispur, Guwahati'),
('Bikash Nath','9210987654','bikash.nath@email.com','Bhetapara, Guwahati'),
('Ranjit Choudhury','9109876543','ranjit.c@email.com','Chandmari, Guwahati'),
('Meena Baruah','9098765432','meena.b@email.com','Narengi, Guwahati'),
('Sanjay Paul','9087654321','sanjay.p@email.com','Six Mile, Guwahati');

INSERT IGNORE INTO Agent (name, contact, email, rating, license_number) VALUES
('Ravi Kumar','9111222333','ravi.kumar@agency.com',4.5,'LIC-001-GHY'),
('Suman Dutta','9222333444','suman.dutta@agency.com',4.2,'LIC-002-GHY'),
('Puja Singh','9333444555','puja.singh@agency.com',4.8,'LIC-003-GHY'),
('Manish Roy','9444555666','manish.roy@agency.com',3.9,'LIC-004-GHY'),
('Kavita Patel','9555666777','kavita.patel@agency.com',4.6,'LIC-005-GHY');

INSERT IGNORE INTO Buyer (name, contact, email, budget) VALUES
('Ajay Verma','9600000001','ajay.v@gmail.com',5000000),
('Sneha Gupta','9600000002','sneha.g@gmail.com',7500000),
('Rohan Mehta','9600000003','rohan.m@gmail.com',3000000),
('Tina Shah','9600000004','tina.s@gmail.com',9000000),
('Vikram Rao','9600000005','vikram.r@gmail.com',4500000),
('Pooja Nair','9600000006','pooja.n@gmail.com',6000000),
('Arjun Pillai','9600000007','arjun.p@gmail.com',8000000),
('Deepa Iyer','9600000008','deepa.i@gmail.com',4000000);

INSERT IGNORE INTO Tenant (name, contact, email, monthly_income) VALUES
('Ritu Sharma','9700000001','ritu.s@gmail.com',45000),
('Manoj Tiwari','9700000002','manoj.t@gmail.com',60000),
('Sita Devi','9700000003','sita.d@gmail.com',35000),
('Karan Malhotra','9700000004','karan.m@gmail.com',80000),
('Neha Joshi','9700000005','neha.j@gmail.com',55000),
('Suresh Yadav','9700000006','suresh.y@gmail.com',40000);

INSERT IGNORE INTO Property (owner_id,agent_id,address,locality,city,property_type,bedrooms,bathrooms,size_sqft,construction_year,listed_price,current_status,listed_date) VALUES
(1,1,'12 Zoo Road','Zoo Road','Guwahati','Apartment',2,2,950.00,2018,4500000,'available','2024-01-10'),
(2,2,'45 GS Road','GS Road','Guwahati','Apartment',3,2,1200.00,2015,6500000,'available','2024-01-15'),
(3,3,'7 Beltola','Beltola','Guwahati','House',4,3,2200.00,2010,9800000,'available','2024-02-01'),
(4,4,'22 Paltan Bazar','Paltan Bazar','Guwahati','Commercial',0,1,500.00,2005,3500000,'available','2024-02-10'),
(5,5,'88 Ulubari','Ulubari','Guwahati','Apartment',2,1,850.00,2020,3800000,'available','2024-02-20'),
(6,1,'33 Dispur','Dispur','Guwahati','House',3,2,1800.00,2012,7200000,'available','2024-03-01'),
(7,2,'56 Ganeshguri','Ganeshguri','Guwahati','Apartment',2,2,1000.00,2019,4800000,'available','2024-03-05'),
(8,3,'14 Six Mile','Six Mile','Guwahati','Villa',5,4,3500.00,2008,15000000,'available','2024-03-10'),
(9,4,'9 Chandmari','Chandmari','Guwahati','Studio',1,1,450.00,2022,2200000,'available','2024-03-15'),
(10,5,'77 Narengi','Narengi','Guwahati','Apartment',3,2,1350.00,2016,5900000,'available','2024-03-20'),
(1,1,'3 Bhangagarh','Bhangagarh','Guwahati','House',4,3,2500.00,2009,11000000,'available','2024-04-01'),
(2,2,'19 Sijubari','Sijubari','Guwahati','Apartment',2,1,800.00,2021,3500000,'available','2024-04-05'),
(3,3,'61 Fatasil','Fatasil','Guwahati','House',3,2,1600.00,2014,6800000,'available','2024-04-10'),
(4,4,'28 Bhetapara','Bhetapara','Guwahati','Apartment',2,2,950.00,2017,4200000,'available','2024-04-15'),
(5,5,'40 Maligaon','Maligaon','Guwahati','House',3,2,1700.00,2011,7500000,'available','2024-04-20'),
(6,1,'5 Rukminigaon','Rukminigaon','Guwahati','Plot',0,0,3000.00,NULL,2000000,'available','2024-05-01'),
(7,2,'82 Azara','Azara','Guwahati','Apartment',3,2,1100.00,2019,5200000,'available','2024-05-05'),
(8,3,'11 Khanapara','Khanapara','Guwahati','Commercial',0,2,800.00,2013,4000000,'available','2024-05-10'),
(9,4,'66 Noonmati','Noonmati','Guwahati','House',4,3,2100.00,2007,8900000,'available','2024-05-15'),
(10,5,'39 Panjabari','Panjabari','Guwahati','Apartment',2,1,780.00,2022,3600000,'available','2024-05-20');

-- Mark a few as sold/rented via Sale & Rent (triggers handle status update)
INSERT IGNORE INTO Sale (property_id,buyer_id,agent_id,sale_date,final_price,days_on_market) VALUES
(1,1,1,'2024-06-15',4400000,156),
(3,2,3,'2024-07-20',9600000,170),
(8,3,3,'2024-08-01',14800000,144);

INSERT IGNORE INTO Rent (property_id,tenant_id,agent_id,start_date,end_date,monthly_rent) VALUES
(2,1,2,'2024-05-01','2025-04-30',18000),
(5,2,5,'2024-06-01','2025-05-31',12000),
(10,3,5,'2024-07-01','2025-06-30',22000),
(14,4,4,'2024-08-01','2025-07-31',15000);
