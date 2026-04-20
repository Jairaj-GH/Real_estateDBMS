-- Create Database
CREATE DATABASE IF NOT EXISTS DBPROJECT;
USE DBPROJECT;
DROP TABLE IF EXISTS Rent;
DROP TABLE IF EXISTS Sale;
DROP TABLE IF EXISTS Property;
DROP TABLE IF EXISTS Agent;
DROP TABLE IF EXISTS Owner;
DROP TABLE IF EXISTS Buyer;
DROP TABLE IF EXISTS Tenant;

CREATE TABLE Owner (
    owner_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) unique,
    email VARCHAR(50) unique
);

CREATE TABLE Agent (
    agent_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    contact VARCHAR(15) unique,
    email VARCHAR(50) unique,
    rating DECIMAL(2,1),
    CHECK (rating BETWEEN 0 AND 5)
);

CREATE TABLE Buyer (
    buyer_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) unique,
    email VARCHAR(50) unique
);

CREATE TABLE Tenant (
    tenant_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) unique,
    email VARCHAR(50) unique
);

CREATE TABLE Property (
    property_id INT PRIMARY KEY,
    address VARCHAR(100),
    city VARCHAR(50),
    locality VARCHAR(50),
    type VARCHAR(30), 
    size INT,
    no_of_bedroom INT,
    listed_price DECIMAL(12,2),
    listed_date DATE,
    construction_year INT,
    current_status VARCHAR(20),

    owner_id INT NOT NULL,
    agent_id INT NOT NULL,

    FOREIGN KEY (owner_id) REFERENCES Owner(owner_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CHECK (listed_price >= 0),
    CHECK (current_status IN ('available', 'sold', 'rented'))
);

CREATE TABLE Sale (
    property_id INT PRIMARY KEY,
    buyer_id INT NOT NULL,
    agent_id INT NOT NULL,

    sale_date DATE,
    final_price DECIMAL(12,2),
    days_on_market INT,

    FOREIGN KEY (property_id) REFERENCES Property(property_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CHECK (final_price >= 0)
);

CREATE TABLE Rent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    tenant_id INT,
    agent_id INT,

    start_date DATE,
    end_date DATE,
    monthly_rent DECIMAL(10,2),

    FOREIGN KEY (property_id) REFERENCES Property(property_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (tenant_id) REFERENCES Tenant(tenant_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    UNIQUE (property_id, tenant_id, start_date),
    CHECK (monthly_rent >= 0),
    CHECK (end_date > start_date)
);
-- create indices
-- Property: most queried table
CREATE INDEX idx_property_city ON Property(city);
CREATE INDEX idx_property_locality ON Property(locality);
CREATE INDEX idx_property_status ON Property(current_status);
CREATE INDEX idx_property_price ON Property(listed_price);
CREATE INDEX idx_property_year ON Property(construction_year);
CREATE INDEX idx_property_bedrooms ON Property(no_of_bedroom);

-- Sale: used in agent performance and date queries
CREATE INDEX idx_sale_date ON Sale(sale_date);
CREATE INDEX idx_sale_agent ON Sale(agent_id);
CREATE INDEX idx_sale_price ON Sale(final_price);

-- Rent: used in locality + bedroom + rent amount queries
CREATE INDEX idx_rent_property ON Rent(property_id);
CREATE INDEX idx_rent_monthly ON Rent(monthly_rent);
CREATE INDEX idx_rent_dates ON Rent(start_date, end_date); 

DELIMITER $$

CREATE TRIGGER prevent_overlap_rent_insert
BEFORE INSERT ON Rent
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Rent
        WHERE property_id = NEW.property_id
        AND NEW.start_date < end_date
        AND NEW.end_date > start_date
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Rent period overlaps with an existing booking for this property';
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER prevent_overlap_rent_update
BEFORE UPDATE ON Rent
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Rent
        WHERE property_id = NEW.property_id
        AND NOT (
            property_id = OLD.property_id AND
            tenant_id = OLD.tenant_id AND
            start_date = OLD.start_date
        )
        AND NEW.start_date < end_date
        AND NEW.end_date > start_date
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Updated rent period overlaps with an existing booking';
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_sale_insert
AFTER INSERT ON Sale
FOR EACH ROW
BEGIN
    UPDATE Property
    SET current_status = 'sold'
    WHERE property_id = NEW.property_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_sale_update
AFTER UPDATE ON Sale
FOR EACH ROW
BEGIN
    UPDATE Property
    SET current_status = 'sold'
    WHERE property_id = NEW.property_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_sale_delete
AFTER DELETE ON Sale
FOR EACH ROW
BEGIN
    -- Check if property is rented currently
    IF EXISTS (
        SELECT 1 FROM Rent
        WHERE property_id = OLD.property_id
        AND CURDATE() BETWEEN start_date AND end_date
    ) THEN
        UPDATE Property
        SET current_status = 'rented'
        WHERE property_id = OLD.property_id;
    ELSE
        UPDATE Property
        SET current_status = 'available'
        WHERE property_id = OLD.property_id;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_rent_insert
AFTER INSERT ON Rent
FOR EACH ROW
BEGIN
    IF CURDATE() BETWEEN NEW.start_date AND NEW.end_date THEN
        UPDATE Property
        SET current_status = 'rented'
        WHERE property_id = NEW.property_id;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_rent_update
AFTER UPDATE ON Rent
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM Sale WHERE property_id = NEW.property_id
    ) THEN
        UPDATE Property
        SET current_status = 'sold'
        WHERE property_id = NEW.property_id;

    ELSEIF EXISTS (
        SELECT 1 FROM Rent
        WHERE property_id = NEW.property_id
        AND CURDATE() BETWEEN start_date AND end_date
    ) THEN
        UPDATE Property
        SET current_status = 'rented'
        WHERE property_id = NEW.property_id;

    ELSE
        UPDATE Property
        SET current_status = 'available'
        WHERE property_id = NEW.property_id;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_status_after_rent_delete
AFTER DELETE ON Rent
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM Sale WHERE property_id = OLD.property_id
    ) THEN
        UPDATE Property
        SET current_status = 'sold'
        WHERE property_id = OLD.property_id;

    ELSEIF EXISTS (
        SELECT 1 FROM Rent
        WHERE property_id = OLD.property_id
        AND CURDATE() BETWEEN start_date AND end_date
    ) THEN
        UPDATE Property
        SET current_status = 'rented'
        WHERE property_id = OLD.property_id;

    ELSE
        UPDATE Property
        SET current_status = 'available'
        WHERE property_id = OLD.property_id;
    END IF;
END$$

DELIMITER ;

INSERT INTO Owner VALUES
(1, 'Ramesh Sharma', '9876543210', 'ramesh@gmail.com'),
(2, 'Suresh Gupta', '9123456780', 'suresh@gmail.com'),
(3, 'Anita Das', '9988776655', 'anita@gmail.com'),
(4, 'Rahul Mehta', '9871234567', 'rahul@gmail.com'),
(5, 'Pankaj Das', '9871111111', 'pankaj.das@gmail.com'),
(6, 'Monalisa Baruah', '9871111112', 'monalisa.b@gmail.com'),
(7, 'Hiren Bora', '9871111113', 'hiren.bora@yahoo.com'),
(8, 'Dipali Saikia', '9871111114', 'dipali.s@gmail.com'),
(9, 'Gautam Talukdar', '9871111115', 'gautam.t@rediffmail.com'),
(10, 'Rina Deka', '9871111116', 'rina.deka@gmail.com'),
(11, 'Jatin Kalita', '9871111117', 'jatin.k@yahoo.com'),
(12, 'Purnima Sarma', '9871111118', 'purnima.sarma@gmail.com'),
(13, 'Mridul Borthakur', '9871111119', 'mridul.b@rediffmail.com'),
(14, 'Anjali Phukan', '9871111120', 'anjali.p@gmail.com'),
(15, 'Nayanjyoti Das', '9871111121', 'nayan.das@yahoo.com'),
(16, 'Rupam Barua', '9871111122', 'rupam.b@gmail.com'),
(17, 'Smita Hazarika', '9871111123', 'smita.h@rediffmail.com'),
(18, 'Diganta Rajbongshi', '9871111124', 'diganta.r@gmail.com'),
(19, 'Karabi Medhi', '9871111125', 'karabi.m@yahoo.com'),
(20, 'Munmi Borah', '9871111126', 'munmi.b@gmail.com'),
(21, 'Ranjan Choudhury', '9871111127', 'ranjan.c@rediffmail.com'),
(22, 'Mousumi Goswami', '9871111128', 'mousumi.g@gmail.com'),
(23, 'Rituparna Bora', '9871111129', 'rituparna.b@yahoo.com'),
(24, 'Bibek Sarma', '9871111130', 'bibek.s@gmail.com'),
(25, 'Anurag Baruah', '9871111131', 'anurag.b@rediffmail.com'),
(26, 'Kangkan Dutta', '9871111132', 'kangkan.d@gmail.com'),
(27, 'Papori Saikia', '9871111133', 'papori.s@yahoo.com'),
(28, 'Suraj Nath', '9871111134', 'suraj.n@gmail.com'),
(29, 'Juri Deka', '9871111135', 'juri.d@rediffmail.com'),
(30, 'Montu Das', '9871111136', 'montu.d@gmail.com'),
(31, 'Himangshu Kalita', '9871111137', 'himangshu.k@yahoo.com'),
(32, 'Barnali Bora', '9871111138', 'barnali.b@gmail.com'),
(33, 'Saurav Rajkhowa', '9871111139', 'saurav.r@rediffmail.com'),
(34, 'Monali Phukan', '9871111140', 'monali.p@gmail.com'),
(35, 'Naba Kr Nath', '9871111141', 'naba.n@yahoo.com'),
(36, 'Rini Sharma', '9871111142', 'rini.s@gmail.com'),
(37, 'Utpal Bora', '9871111143', 'utpal.b@rediffmail.com'),
(38, 'Gitashree Borah', '9871111144', 'gitashree.b@gmail.com'),
(39, 'Robin Das', '9871111145', 'robin.d@yahoo.com'),
(40, 'Tultul Barua', '9871111146', 'tultul.b@gmail.com'),
(41, 'Rajib Medhi', '9871111147', 'rajib.m@rediffmail.com'),
(42, 'Moushumi Borthakur', '9871111148', 'moushumi.bo@gmail.com'),
(43, 'Lakhinandan Sarma', '9871111149', 'lakhinandan.s@yahoo.com'),
(44, 'Geetika Talukdar', '9871111150', 'geetika.t@gmail.com'),
(45, 'Pradip Hazarika', '9871111151', 'pradip.h@rediffmail.com'),
(46, 'Manisha Kalita', '9871111152', 'manisha.k@gmail.com'),
(47, 'Deepjyoti Bora', '9871111153', 'deepjyoti.b@yahoo.com'),
(48, 'Swapna Phukan', '9871111154', 'swapna.p@gmail.com'),
(49, 'Bikram Das', '9871111155', 'bikram.d@rediffmail.com'),
(50, 'Mridusmita Baruah', '9871111156', 'mridusmita.b@gmail.com'),
(51, 'Hemanta Bora', '9871111157', 'hemanta.b@yahoo.com'),
(52, 'Pallavi Sarma', '9871111158', 'pallavi.s@gmail.com'),
(53, 'Nilotpal Das', '9871111159', 'nilotpal.d@rediffmail.com'),
(54, 'Rupjyoti Saikia', '9871111160', 'rupjyoti.s@gmail.com');


INSERT INTO Agent VALUES
(1, 'Amit Verma', '9000000001', 'amit@gmail.com', 4.5),
(2, 'Neha Singh', '9000000002', 'neha@gmail.com', 4.2),
(3, 'Raj Malhotra', '9000000003', 'raj@gmail.com', 4.8),
(4, 'Priya Kapoor', '9000000004', 'priya@gmail.com', 4.0),
(5, 'Sanjay Kumar', '9000000005', 'sanjay@gmail.com', 4.3),
(6, 'Ritika Sharma', '9000000006', 'ritika@gmail.com', 4.6),
(7, 'Manish Gupta', '9000000007', 'manish@gmail.com', 3.9),
(8, 'Anjali Verma', '9000000008', 'anjali@gmail.com', 4.7),
(9, 'Deepak Singh', '9000000009', 'deepak@gmail.com', 4.1),
(10, 'Kavita Joshi', '9000000010', 'kavita@gmail.com', 4.4),
(11, 'Sagarika Bora', '9000000011', 'sagarika.b@gmail.com', 4.5),
(12, 'Rupankar Das', '9000000012', 'rupankar.d@yahoo.com', 4.1),
(13, 'Liza Hazarika', '9000000013', 'liza.h@gmail.com', 4.7),
(14, 'Prasenjit Sarma', '9000000014', 'prasenjit.s@rediffmail.com', 3.8),
(15, 'Monalisha Bora', '9000000015', 'monalisha.b@gmail.com', 4.9),
(16, 'Bhaskar Kalita', '9000000016', 'bhaskar.k@yahoo.com', 4.0),
(17, 'Anuradha Saikia', '9000000017', 'anuradha.s@gmail.com', 4.3),
(18, 'Rahul Borthakur', '9000000018', 'rahul.bo@rediffmail.com', 4.6),
(19, 'Nibedita Das', '9000000019', 'nibedita.d@gmail.com', 4.2),
(20, 'Jintu Gogoi', '9000000020', 'jintu.g@yahoo.com', 3.9),
(21, 'Rituraj Bora', '9000000021', 'rituraj.b@gmail.com', 4.8),
(22, 'Pallabi Deka', '9000000022', 'pallabi.d@rediffmail.com', 4.4),
(23, 'Manabendra Talukdar', '9000000023', 'manab.t@gmail.com', 4.1),
(24, 'Dipsikha Phukan', '9000000024', 'dipsikha.p@yahoo.com', 4.7),
(25, 'Pabitra Bora', '9000000025', 'pabitra.b@gmail.com', 3.7),
(26, 'Mridul Sarma', '9000000026', 'mridul.s@rediffmail.com', 4.5),
(27, 'Barnali Das', '9000000027', 'barnali.d@gmail.com', 4.9),
(28, 'Tapan Kalita', '9000000028', 'tapan.k@yahoo.com', 4.0),
(29, 'Junmoni Bora', '9000000029', 'junmoni.b@gmail.com', 4.2),
(30, 'Himadri Saikia', '9000000030', 'himadri.s@rediffmail.com', 4.6),
(31, 'Pranjit Barua', '9000000031', 'pranjit.b@gmail.com', 4.3),
(32, 'Rupali Medhi', '9000000032', 'rupali.m@yahoo.com', 4.1),
(33, 'Partha Hazarika', '9000000033', 'partha.h@gmail.com', 4.8),
(34, 'Mitali Phukan', '9000000034', 'mitali.p@rediffmail.com', 3.9),
(35, 'Debojit Bora', '9000000035', 'debojit.b@gmail.com', 4.4),
(36, 'Ankita Das', '9000000036', 'ankita.d@yahoo.com', 4.7),
(37, 'Raktim Sarma', '9000000037', 'raktim.s@gmail.com', 4.0),
(38, 'Neelakshi Bora', '9000000038', 'neelakshi.b@rediffmail.com', 4.5),
(39, 'Dwipen Kalita', '9000000039', 'dwipen.k@gmail.com', 4.2),
(40, 'Jonali Saikia', '9000000040', 'jonali.s@yahoo.com', 4.9),
(41, 'Nripen Das', '9000000041', 'nripen.d@gmail.com', 3.8),
(42, 'Mridula Borthakur', '9000000042', 'mridula.bo@rediffmail.com', 4.6),
(43, 'Ranjit Baruah', '9000000043', 'ranjit.ba@gmail.com', 4.1),
(44, 'Tulika Hazarika', '9000000044', 'tulika.h@yahoo.com', 4.7),
(45, 'Bikash Sarma', '9000000045', 'bikash.s@gmail.com', 4.3),
(46, 'Mousumi Bora', '9000000046', 'mousumi.b@rediffmail.com', 4.0),
(47, 'Arup Kalita', '9000000047', 'arup.k@gmail.com', 4.8),
(48, 'Lakhimi Das', '9000000048', 'lakhimi.d@yahoo.com', 4.5),
(49, 'Mridul Saikia', '9000000049', 'mridul.sa@gmail.com', 4.2),
(50, 'Rupam Borthakur', '9000000050', 'rupam.bo@rediffmail.com', 4.9),
(51, 'Dipa Phukan', '9000000051', 'dipa.p@gmail.com', 4.1),
(52, 'Hitesh Bora', '9000000052', 'hitesh.b@yahoo.com', 4.6),
(53, 'Sangita Das', '9000000053', 'sangita.d@gmail.com', 3.9),
(54, 'Pallav Sarma', '9000000054', 'pallav.s@rediffmail.com', 4.7),
(55, 'Nayanjyoti Barua', '9000000055', 'nayanjyoti.b@gmail.com', 4.4),
(56, 'Rimjim Kalita', '9000000056', 'rimjim.k@yahoo.com', 4.2),
(57, 'Rupjyoti Bora', '9000000057', 'rupjyoti.b@gmail.com', 4.8),
(58, 'Gitanjali Saikia', '9000000058', 'gitanjali.s@rediffmail.com', 4.0),
(59, 'Bhabesh Das', '9000000059', 'bhabesh.d@gmail.com', 4.5),
(60, 'Monika Borthakur', '9000000060', 'monika.bo@yahoo.com', 4.3);


INSERT INTO Buyer VALUES
(1, 'Karan Shah', '9011111111', 'karan@gmail.com'),
(2, 'Pooja Jain', '9022222222', 'pooja@gmail.com'),
(3, 'Vikas Roy', '9033333333', 'vikas@gmail.com'),
(4, 'Rohit Agarwal', '9077777777', 'rohit@gmail.com'),
(5, 'Meena Patel', '9088888888', 'meena@gmail.com'),
(6, 'Sanjay Malhotra', '9011111112', 'sanjay.m@gmail.com'),
(7, 'Rekha Verma', '9011111113', 'rekha.v@yahoo.com'),
(8, 'Tarun Kaushik', '9011111114', 'tarun.k@gmail.com'),
(9, 'Sonali Agarwal', '9011111115', 'sonali.a@rediffmail.com'),
(10, 'Vikram Singh', '9011111116', 'vikram.s@gmail.com'),
(11, 'Deepa Nair', '9011111117', 'deepa.n@yahoo.com'),
(12, 'Amit Sharma', '9011111118', 'amit.sh@gmail.com'),
(13, 'Priyanka Roy', '9011111119', 'priyanka.r@rediffmail.com'),
(14, 'Rajesh Khanna', '9011111120', 'rajesh.k@gmail.com'),
(15, 'Neha Gupta', '9011111121', 'neha.g@yahoo.com'),
(16, 'Manish Taneja', '9011111122', 'manish.t@gmail.com'),
(17, 'Swati Mehta', '9011111123', 'swati.m@rediffmail.com'),
(18, 'Rohit Chopra', '9011111124', 'rohit.c@gmail.com'),
(19, 'Kavita Bhatia', '9011111125', 'kavita.b@yahoo.com'),
(20, 'Ankit Jain', '9011111126', 'ankit.j@gmail.com'),
(21, 'Pallavi Kapoor', '9011111127', 'pallavi.k@rediffmail.com'),
(22, 'Vivek Saxena', '9011111128', 'vivek.s@gmail.com'),
(23, 'Shilpa Shetty', '9011111129', 'shilpa.sh@yahoo.com'),
(24, 'Rahul Bose', '9011111130', 'rahul.b@gmail.com'),
(25, 'Mamta Sharma', '9011111131', 'mamta.sh@rediffmail.com'),
(26, 'Kunal Kohli', '9011111132', 'kunal.k@gmail.com'),
(27, 'Simran Kaur', '9011111133', 'simran.kaur@yahoo.com'),
(28, 'Prateek Singh', '9011111134', 'prateek.s@gmail.com'),
(29, 'Divya Agarwal', '9011111135', 'divya.a@rediffmail.com'),
(30, 'Abhishek Bachchan', '9011111136', 'abhishek.b@gmail.com'),
(31, 'Kareena Kapoor', '9011111137', 'kareena.k@yahoo.com'),
(32, 'Ranbir Singh', '9011111138', 'ranbir.s@gmail.com'),
(33, 'Katrina Kaif', '9011111139', 'katrina.k@rediffmail.com'),
(34, 'Ajay Devgn', '9011111140', 'ajay.d@gmail.com'),
(35, 'Kajol Mukherjee', '9011111141', 'kajol.m@yahoo.com'),
(36, 'Akshay Kumar', '9011111142', 'akshay.k@gmail.com'),
(37, 'Twinkle Khanna', '9011111143', 'twinkle.kh@rediffmail.com'),
(38, 'John Abraham', '9011111144', 'john.a@gmail.com'),
(39, 'Priyanka Chopra', '9011111145', 'priyanka.ch@yahoo.com'),
(40, 'Shahid Kapoor', '9011111146', 'shahid.k@gmail.com'),
(41, 'Mira Rajput', '9011111147', 'mira.r@rediffmail.com'),
(42, 'Ranveer Singh', '9011111148', 'ranveer.s@gmail.com'),
(43, 'Deepika Padukone', '9011111149', 'deepika.p@yahoo.com'),
(44, 'Hrithik Roshan', '9011111150', 'hrithik.r@gmail.com'),
(45, 'Sussanne Khan', '9011111151', 'sussanne.k@rediffmail.com'),
(46, 'Salman Khan', '9011111152', 'salman.k@gmail.com'),
(47, 'Arpita Sharma', '9011111153', 'arpita.sh@yahoo.com'),
(48, 'Shah Rukh Khan', '9011111154', 'srk@gmail.com'),
(49, 'Gauri Khan', '9011111155', 'gauri.k@rediffmail.com'),
(50, 'Aamir Khan', '9011111156', 'aamir.k@gmail.com'),
(51, 'Kiran Rao', '9011111157', 'kiran.r@yahoo.com'),
(52, 'Saif Ali Khan', '9011111158', 'saif.k@gmail.com'),
(53, 'Kareena K', '9011111159', 'kareena.kapoor@rediffmail.com'),
(54, 'Varun Dhawan', '9011111160', 'varun.d@gmail.com'),
(55, 'Natasha Dalal', '9011111161', 'natasha.d@yahoo.com');


INSERT INTO Tenant VALUES
(1, 'Arjun Das', '9044444444', 'arjun@gmail.com'),
(2, 'Sneha Paul', '9055555555', 'sneha@gmail.com'),
(3, 'Rohit Sen', '9066666666', 'rohit@gmail.com'),
(4, 'Aman Gupta', '9099999999', 'aman@gmail.com'),
(5, 'Nikita Roy', '9100000000', 'nikita@gmail.com'),
(6, 'Bikram Chetry', '9044444445', 'bikram.c@gmail.com'),
(7, 'Mousumi Deka', '9044444446', 'mousumi.d@yahoo.com'),
(8, 'Rinku Kalita', '9044444447', 'rinku.k@gmail.com'),
(9, 'Juri Borah', '9044444448', 'juri.b@rediffmail.com'),
(10, 'Anupam Das', '9044444449', 'anupam.d@gmail.com'),
(11, 'Gitanjali Sarma', '9044444450', 'gitanjali.s@yahoo.com'),
(12, 'Prabin Bora', '9044444451', 'prabin.b@gmail.com'),
(13, 'Lakhimi Saikia', '9044444452', 'lakhimi.s@rediffmail.com'),
(14, 'Nabin Talukdar', '9044444453', 'nabin.t@gmail.com'),
(15, 'Rupali Borthakur', '9044444454', 'rupali.bo@yahoo.com'),
(16, 'Himanshu Phukan', '9044444455', 'himanshu.p@gmail.com'),
(17, 'Mitali Barua', '9044444456', 'mitali.ba@rediffmail.com'),
(18, 'Pankaj Hazarika', '9044444457', 'pankaj.h@gmail.com'),
(19, 'Dimpal Bora', '9044444458', 'dimpal.b@yahoo.com'),
(20, 'Swapnil Das', '9044444459', 'swapnil.d@gmail.com'),
(21, 'Barnali Kalita', '9044444460', 'barnali.k@rediffmail.com'),
(22, 'Nripen Saikia', '9044444461', 'nripen.s@gmail.com'),
(23, 'Mridusmita Bora', '9044444462', 'mridusmita.b@yahoo.com'),
(24, 'Ranjit Medhi', '9044444463', 'ranjit.m@gmail.com'),
(25, 'Junu Das', '9044444464', 'junu.d@rediffmail.com'),
(26, 'Bhabani Sarma', '9044444465', 'bhabani.s@gmail.com'),
(27, 'Rupjyoti Phukan', '9044444466', 'rupjyoti.p@yahoo.com'),
(28, 'Pranjit Bora', '9044444467', 'pranjit.b@gmail.com'),
(29, 'Dipjyoti Barua', '9044444468', 'dipjyoti.ba@rediffmail.com'),
(30, 'Kangkan Hazarika', '9044444469', 'kangkan.h@gmail.com'),
(31, 'Rupam Das', '9044444470', 'rupam.d@yahoo.com'),
(32, 'Papori Borthakur', '9044444471', 'papori.bo@gmail.com'),
(33, 'Manab Saikia', '9044444472', 'manab.s@rediffmail.com'),
(34, 'Rupali Kalita', '9044444473', 'rupali.k@gmail.com'),
(35, 'Mridul Bora', '9044444474', 'mridul.b@yahoo.com'),
(36, 'Pallabi Phukan', '9044444475', 'pallabi.p@gmail.com'),
(37, 'Diganta Das', '9044444476', 'diganta.d@rediffmail.com'),
(38, 'Gitashree Sarma', '9044444477', 'gitashree.s@gmail.com'),
(39, 'Himangshu Bora', '9044444478', 'himangshu.b@yahoo.com'),
(40, 'Rituraj Barua', '9044444479', 'rituraj.ba@gmail.com'),
(41, 'Moushumi Kalita', '9044444480', 'moushumi.k@rediffmail.com'),
(42, 'Lakhinandan Borthakur', '9044444481', 'lakhinandan.b@gmail.com'),
(43, 'Rina Phukan', '9044444482', 'rina.p@yahoo.com'),
(44, 'Nayanjyoti Bora', '9044444483', 'nayanjyoti.b@gmail.com'),
(45, 'Purnima Das', '9044444484', 'purnima.d@rediffmail.com'),
(46, 'Rupankar Sarma', '9044444485', 'rupankar.s@gmail.com'),
(47, 'Jonali Kalita', '9044444486', 'jonali.k@yahoo.com'),
(48, 'Bhaskar Bora', '9044444487', 'bhaskar.b@gmail.com'),
(49, 'Smita Phukan', '9044444488', 'smita.p@rediffmail.com'),
(50, 'Monali Das', '9044444489', 'monali.d@gmail.com'),
(51, 'Bibek Borthakur', '9044444490', 'bibek.bo@yahoo.com'),
(52, 'Anurag Saikia', '9044444491', 'anurag.s@gmail.com'),
(53, 'Ritu Bora', '9044444492', 'ritu.b@rediffmail.com'),
(54, 'Mridul Kalita', '9044444493', 'mridul.k@gmail.com'),
(55, 'Pabitra Das', '9044444494', 'pabitra.d@yahoo.com');


INSERT INTO Property VALUES
(1, 'GS Road Apt 1', 'Guwahati', 'G.S Road', 'Apartment', 1200, 2, 3000000, '2023-01-01', 2022, 'sold', 1, 1),
(2, 'Beltola House', 'Guwahati', 'Beltola', 'House', 1800, 3, 5000000, '2023-02-01', 2021, 'sold', 2, 2),
(3, 'Zoo Road Flat', 'Guwahati', 'Zoo Road', 'Apartment', 900, 2, 2500000, '2023-03-01', 2020, 'rented', 3, 1),
(4, 'Maligaon Villa', 'Guwahati', 'Maligaon', 'House', 2000, 4, 6000000, '2022-05-01', 2019, 'sold', 4, 3),
(5, 'GS Road Apt 2', 'Guwahati', 'G.S Road', 'Apartment', 1100, 2, 2800000, '2023-06-01', 2023, 'rented', 1, 2),
(6, 'Dispur Flat', 'Guwahati', 'Dispur', 'Apartment', 1000, 2, 3200000, '2023-07-01', 2022, 'sold', 2, 4),
(7, 'Panbazar House', 'Guwahati', 'Panbazar', 'House', 1700, 3, 4500000, '2023-08-01', 2021, 'sold', 3, 3),
(8, 'Hatigaon Flat', 'Guwahati', 'Hatigaon', 'Apartment', 950, 2, 2700000, '2023-09-01', 2023, 'rented', 4, 1),
(9, 'Ganeshguri Apt', 'Guwahati', 'Ganeshguri', 'Apartment', 1050, 2, 3100000, '2023-10-01', 2022, 'available', 1, 2),
(10, 'Six Mile House', 'Guwahati', 'Six Mile', 'House', 1900, 3, 5500000, '2023-11-01', 2021, 'sold', 2, 4),
(11, 'Ulubari Flat', 'Guwahati', 'Ulubari', 'Apartment', 800, 1, 2000000, '2023-01-15', 2020, 'available', 3, 1),
(12, 'Bhangagarh Apt', 'Guwahati', 'Bhangagarh', 'Apartment', 1150, 2, 3300000, '2023-02-20', 2022, 'rented', 4, 3),
(13, 'Rehabari House', 'Guwahati', 'Rehabari', 'House', 1600, 3, 4200000, '2023-03-10', 2021, 'sold', 1, 2),
(14, 'Kahilipara Flat', 'Guwahati', 'Kahilipara', 'Apartment', 980, 2, 2900000, '2023-04-05', 2023, 'available', 2, 1),
(15, 'GS Road Apt 3', 'Guwahati', 'G.S Road', 'Apartment', 1300, 3, 3500000, '2023-05-01', 2024, 'rented', 3, 4),
(16, 'Narengi House', 'Guwahati', 'Narengi', 'House', 2100, 4, 6200000, '2022-06-01', 2020, 'sold', 4, 2),
(17, 'Chandmari Flat', 'Guwahati', 'Chandmari', 'Apartment', 900, 2, 2600000, '2023-07-10', 2022, 'available', 1, 3),
(18, 'Jalukbari House', 'Guwahati', 'Jalukbari', 'House', 1800, 3, 4800000, '2023-08-15', 2021, 'sold', 2, 1),
(19, 'Zoo Road Apt 2', 'Guwahati', 'Zoo Road', 'Apartment', 1000, 2, 3000000, '2023-09-20', 2023, 'rented', 3, 2),
(20, 'Dispur Apt 2', 'Guwahati', 'Dispur', 'Apartment', 1100, 2, 3400000, '2023-10-25', 2024, 'available', 4, 4),
(21, 'GS Road Luxury Apt', 'Guwahati', 'G.S Road', 'Apartment', 1400, 3, 4500000, '2024-01-10', 2024, 'available', 1, 5),
(22, 'Beltola Duplex', 'Guwahati', 'Beltola', 'House', 2200, 4, 7000000, '2024-02-15', 2024, 'sold', 2, 6),
(23, 'Zoo Road Premium Flat', 'Guwahati', 'Zoo Road', 'Apartment', 1200, 3, 3800000, '2024-03-20', 2024, 'rented', 3, 7),
(24, 'Dispur Residency', 'Guwahati', 'Dispur', 'Apartment', 1100, 2, 3600000, '2024-04-05', 2024, 'available', 4, 8),
(25, 'Six Mile Villa', 'Guwahati', 'Six Mile', 'House', 2500, 5, 8000000, '2024-05-12', 2024, 'sold', 1, 9),
(26, 'Hatigaon Modern Flat', 'Guwahati', 'Hatigaon', 'Apartment', 1000, 2, 3300000, '2024-06-18', 2024, 'rented', 2, 10),
(27, 'GS Road Penthouse', 'Guwahati', 'G.S Road', 'Apartment', 1800, 4, 9000000, '2025-01-05', 2025, 'available', 3, 6),
(28, 'Panbazar Heritage House', 'Guwahati', 'Panbazar', 'House', 2000, 3, 6500000, '2025-02-10', 2025, 'sold', 4, 7),
(29, 'Ganeshguri Smart Flat', 'Guwahati', 'Ganeshguri', 'Apartment', 1050, 2, 3700000, '2025-03-15', 2025, 'rented', 1, 8),
(30, 'Ulubari Studio', 'Guwahati', 'Ulubari', 'Apartment', 750, 1, 2200000, '2025-04-20', 2025, 'available', 2, 9),
(31, 'Lakhara Flat', 'Guwahati', 'Lakhara', 'Apartment', 850, 1, 1800000, '2024-01-01', 2023, 'available', 5, 11),
(32, 'Bamunimaidam House', 'Guwahati', 'Bamunimaidam', 'House', 1600, 3, 4200000, '2024-02-01', 2022, 'sold', 6, 12),
(33, 'Sarusajai Apt', 'Guwahati', 'Sarusajai', 'Apartment', 1000, 2, 2900000, '2024-03-01', 2023, 'rented', 7, 13),
(34, 'Kahilipara House', 'Guwahati', 'Kahilipara', 'House', 1400, 2, 3500000, '2024-04-01', 2021, 'available', 8, 14),
(35, 'Bhangagarh Villa', 'Guwahati', 'Bhangagarh', 'House', 2200, 4, 6800000, '2024-05-01', 2020, 'sold', 9, 15),
(36, 'Uzan Bazar Flat', 'Guwahati', 'Uzan Bazar', 'Apartment', 1200, 3, 4000000, '2024-06-01', 2023, 'rented', 10, 16),
(37, 'Dispur House', 'Guwahati', 'Dispur', 'House', 1800, 3, 5200000, '2024-07-01', 2022, 'available', 11, 17),
(38, 'Ganeshguri Pent', 'Guwahati', 'Ganeshguri', 'Apartment', 1600, 3, 4800000, '2024-08-01', 2024, 'sold', 12, 18),
(39, 'Six Mile Flat', 'Guwahati', 'Six Mile', 'Apartment', 1100, 2, 3200000, '2024-09-01', 2023, 'rented', 13, 19),
(40, 'Zoo Road Studio', 'Guwahati', 'Zoo Road', 'Apartment', 700, 1, 1900000, '2024-10-01', 2024, 'available', 14, 20),
(41, 'GS Road Duplex', 'Guwahati', 'G.S Road', 'Apartment', 2000, 4, 7200000, '2024-11-01', 2023, 'sold', 15, 21),
(42, 'Beltola Pent', 'Guwahati', 'Beltola', 'Apartment', 1500, 3, 4600000, '2024-12-01', 2024, 'rented', 16, 22),
(43, 'Hatigaon House', 'Guwahati', 'Hatigaon', 'House', 1700, 3, 4400000, '2025-01-01', 2022, 'available', 17, 23),
(44, 'Panbazar Flat', 'Guwahati', 'Panbazar', 'Apartment', 900, 2, 2500000, '2025-02-01', 2023, 'sold', 18, 24),
(45, 'Ulubari House', 'Guwahati', 'Ulubari', 'House', 1300, 2, 3600000, '2025-03-01', 2021, 'rented', 19, 25),
(46, 'Narengi Apt', 'Guwahati', 'Narengi', 'Apartment', 1050, 2, 3100000, '2025-04-01', 2024, 'available', 20, 26),
(47, 'Jalukbari Flat', 'Guwahati', 'Jalukbari', 'Apartment', 950, 2, 2700000, '2025-05-01', 2023, 'sold', 21, 27),
(48, 'Chandmari Villa', 'Guwahati', 'Chandmari', 'House', 2100, 4, 6500000, '2025-06-01', 2022, 'rented', 22, 28),
(49, 'Maligaon Pent', 'Guwahati', 'Maligaon', 'Apartment', 1400, 3, 4200000, '2025-07-01', 2024, 'available', 23, 29),
(50, 'Lokhra House', 'Guwahati', 'Lokhra', 'House', 1600, 3, 4500000, '2025-08-01', 2023, 'sold', 24, 30),
(51, 'Paltan Bazar Flat', 'Guwahati', 'Paltan Bazar', 'Apartment', 800, 1, 2100000, '2025-09-01', 2024, 'rented', 25, 31),
(52, 'Basistha Apt', 'Guwahati', 'Basistha', 'Apartment', 1000, 2, 3000000, '2025-10-01', 2023, 'available', 26, 32),
(53, 'Lal Ganesh House', 'Guwahati', 'Lal Ganesh', 'House', 1500, 3, 4100000, '2025-11-01', 2022, 'sold', 27, 33),
(54, 'Bhetapara Flat', 'Guwahati', 'Bhetapara', 'Apartment', 1100, 2, 3300000, '2025-12-01', 2024, 'rented', 28, 34),
(55, 'Gorchuk House', 'Guwahati', 'Gorchuk', 'House', 1800, 3, 5000000, '2026-01-01', 2023, 'available', 29, 35),
(56, 'Pandu Apt', 'Guwahati', 'Pandu', 'Apartment', 900, 2, 2600000, '2026-02-01', 2024, 'sold', 30, 36),
(57, 'Narangi House', 'Guwahati', 'Narangi', 'House', 2000, 4, 6200000, '2026-03-01', 2022, 'rented', 31, 37),
(58, 'Dakhingaon Flat', 'Guwahati', 'Dakhingaon', 'Apartment', 1050, 2, 2900000, '2026-04-01', 2025, 'available', 32, 38),
(59, 'Bamuni Hill View', 'Guwahati', 'Bamunimaidam', 'Apartment', 1200, 3, 3700000, '2026-05-01', 2024, 'sold', 33, 39),
(60, 'Japorigog House', 'Guwahati', 'Japorigog', 'House', 1700, 3, 4800000, '2026-06-01', 2023, 'rented', 34, 40),
(61, 'Beltola Survey', 'Guwahati', 'Beltola', 'Apartment', 1300, 3, 3900000, '2026-07-01', 2025, 'available', 35, 41),
(62, 'Dispur Raj Bhavan', 'Guwahati', 'Dispur', 'House', 2500, 5, 8500000, '2026-08-01', 2024, 'sold', 36, 42),
(63, 'GS Road Business Apt', 'Guwahati', 'G.S Road', 'Apartment', 1400, 3, 4300000, '2026-09-01', 2025, 'rented', 37, 43),
(64, 'Uzan Bazar House', 'Guwahati', 'Uzan Bazar', 'House', 1900, 4, 5800000, '2026-10-01', 2023, 'available', 38, 44),
(65, 'Six Mile Duplex', 'Guwahati', 'Six Mile', 'Apartment', 1600, 3, 5000000, '2026-11-01', 2025, 'sold', 39, 45),
(66, 'Zoo Road Pent', 'Guwahati', 'Zoo Road', 'Apartment', 1500, 3, 4700000, '2026-12-01', 2024, 'rented', 40, 46),
(67, 'Hatigaon Studio', 'Guwahati', 'Hatigaon', 'Apartment', 750, 1, 2000000, '2027-01-01', 2025, 'available', 41, 47),
(68, 'Ganeshguri House', 'Guwahati', 'Ganeshguri', 'House', 2000, 4, 6400000, '2027-02-01', 2024, 'sold', 42, 48),
(69, 'Panbazar Pent', 'Guwahati', 'Panbazar', 'Apartment', 1300, 2, 3800000, '2027-03-01', 2025, 'rented', 43, 49),
(70, 'Narengi House', 'Guwahati', 'Narengi', 'House', 2200, 4, 6900000, '2027-04-01', 2023, 'available', 44, 50),
(71, 'Jalukbari Duplex', 'Guwahati', 'Jalukbari', 'Apartment', 1700, 3, 5100000, '2027-05-01', 2025, 'sold', 45, 51),
(72, 'Chandmari Flat', 'Guwahati', 'Chandmari', 'Apartment', 950, 2, 2800000, '2027-06-01', 2024, 'rented', 46, 52),
(73, 'Kahilipara Pent', 'Guwahati', 'Kahilipara', 'Apartment', 1200, 2, 3400000, '2027-07-01', 2025, 'available', 47, 53),
(74, 'Lakhara House', 'Guwahati', 'Lakhara', 'House', 1500, 3, 4300000, '2027-08-01', 2024, 'sold', 48, 54),
(75, 'Bhangagarh Duplex', 'Guwahati', 'Bhangagarh', 'Apartment', 1800, 4, 5600000, '2027-09-01', 2025, 'rented', 49, 55),
(76, 'Sarusajai House', 'Guwahati', 'Sarusajai', 'House', 2000, 4, 6300000, '2027-10-01', 2023, 'available', 50, 56),
(77, 'Dispur Luxury Apt', 'Guwahati', 'Dispur', 'Apartment', 1400, 3, 4500000, '2027-11-01', 2025, 'sold', 51, 57),
(78, 'Bamunimaidam Pent', 'Guwahati', 'Bamunimaidam', 'Apartment', 1250, 2, 3600000, '2027-12-01', 2024, 'rented', 52, 58),
(79, 'Paltan Bazar House', 'Guwahati', 'Paltan Bazar', 'House', 1600, 3, 4700000, '2028-01-01', 2025, 'available', 53, 59),
(80, 'Basistha Pent', 'Guwahati', 'Basistha', 'Apartment', 1350, 3, 4100000, '2028-02-01', 2025, 'sold', 54, 60);


INSERT INTO Sale VALUES
(1, 1, 1, '2023-02-01', 3100000, 30),
(4, 2, 3, '2023-06-15', 6100000, 45),
(7, 3, 3, '2023-09-10', 4600000, 25),
(10, 1, 4, '2023-12-01', 5600000, 60),
(13, 2, 2, '2023-05-20', 4300000, 20),
(16, 3, 2, '2023-07-30', 6300000, 35),
(18, 1, 1, '2023-11-10', 4900000, 40),
(2, 1, 5, '2018-05-10', 3000000, 40),
(6, 2, 6, '2018-08-20', 3200000, 35),
(22, 1, 6, '2024-03-01', 7100000, 35),
(25, 2, 9, '2024-06-01', 8100000, 50),
(28, 3, 7, '2025-03-10', 6600000, 40),
(31, 6, 11, '2024-02-15', 1850000, 45),
(32, 7, 12, '2024-03-20', 4300000, 50),
(34, 8, 14, '2024-05-10', 3600000, 40),
(35, 9, 15, '2024-06-25', 7000000, 55),
(37, 10, 17, '2024-08-05', 5300000, 35),
(38, 11, 18, '2024-09-15', 4950000, 45),
(40, 12, 20, '2024-11-01', 1950000, 30),
(41, 13, 21, '2024-12-10', 7400000, 40),
(43, 14, 23, '2025-02-20', 4550000, 50),
(44, 15, 24, '2025-03-15', 2600000, 35),
(46, 16, 26, '2025-05-05', 3200000, 45),
(47, 17, 27, '2025-06-20', 2800000, 40),
(49, 18, 29, '2025-08-10', 4350000, 50),
(50, 19, 30, '2025-09-25', 4650000, 45),
(52, 20, 32, '2025-11-15', 3150000, 40),
(53, 21, 33, '2025-12-05', 4250000, 35),
(55, 22, 35, '2026-02-01', 5150000, 50),
(56, 23, 36, '2026-03-10', 2750000, 45),
(58, 24, 38, '2026-05-05', 3000000, 40),
(59, 25, 39, '2026-06-20', 3850000, 50),
(61, 26, 41, '2026-08-01', 4050000, 45),
(62, 27, 42, '2026-09-15', 8700000, 55),
(64, 28, 44, '2026-11-01', 5950000, 40),
(65, 29, 45, '2026-12-10', 5150000, 50),
(67, 30, 47, '2027-02-05', 2100000, 35),
(68, 31, 48, '2027-03-20', 6600000, 45),
(70, 32, 50, '2027-05-10', 7050000, 50),
(71, 33, 51, '2027-06-25', 5250000, 40),
(73, 34, 53, '2027-08-15', 3550000, 45),
(74, 35, 54, '2027-09-01', 4450000, 50),
(76, 36, 56, '2027-11-01', 6450000, 45),
(77, 37, 57, '2027-12-10', 4650000, 40),
(79, 38, 59, '2028-02-01', 4850000, 50),
(80, 39, 60, '2028-03-15', 4250000, 45),
(33, 40, 13, '2024-04-10', 3000000, 50),
(36, 41, 16, '2024-07-15', 4150000, 45),
(39, 42, 19, '2024-10-01', 3350000, 40),
(42, 43, 22, '2025-01-10', 4750000, 50),
(45, 44, 25, '2025-04-15', 3750000, 45),
(48, 45, 28, '2025-07-20', 6650000, 55),
(51, 46, 31, '2025-10-05', 2250000, 40),
(54, 47, 34, '2026-01-01', 3450000, 50),
(57, 48, 37, '2026-04-15', 6350000, 45),
(60, 49, 40, '2026-07-10', 4950000, 40),
(63, 50, 43, '2026-10-01', 4450000, 50),
(66, 6, 46, '2027-01-15', 4850000, 45),
(69, 7, 49, '2027-04-01', 3950000, 40),
(72, 8, 52, '2027-07-10', 2950000, 50),
(75, 9, 55, '2027-10-01', 5750000, 45),
(78, 10, 58, '2028-01-01', 3750000, 40);



INSERT INTO Rent (property_id, tenant_id, agent_id, start_date, end_date, monthly_rent) VALUES
(3, 1, 1, '2023-04-01', '2023-10-01', 12000),
(5, 2, 2, '2023-06-15', '2023-12-15', 14000),
(8, 3, 1, '2023-07-01', '2024-01-01', 13000),
(12, 4, 3, '2023-03-01', '2023-09-01', 15000),
(15, 5, 4, '2024-01-01', '2024-07-01', 16000),
(19, 1, 2, '2023-10-01', '2024-04-01', 13500),
(23, 2, 7, '2024-04-01', '2024-10-01', 18000),
(26, 3, 10, '2024-07-01', '2025-01-01', 15000),
(29, 4, 8, '2025-04-01', '2025-10-01', 17000),
(33, 6, 13, '2024-04-01', '2024-10-01', 12500),
(36, 7, 16, '2024-07-01', '2025-01-01', 14500),
(39, 8, 19, '2024-10-01', '2025-04-01', 11500),
(42, 9, 22, '2025-01-01', '2025-07-01', 15500),
(45, 10, 25, '2025-04-01', '2025-10-01', 13500),
(48, 11, 28, '2025-07-01', '2026-01-01', 16500),
(51, 12, 31, '2025-10-01', '2026-04-01', 9500),
(54, 13, 34, '2026-01-01', '2026-07-01', 12500),
(57, 14, 37, '2026-04-01', '2026-10-01', 14500),
(60, 15, 40, '2026-07-01', '2027-01-01', 15500),
(63, 16, 43, '2026-10-01', '2027-04-01', 13500),
(66, 17, 46, '2027-01-01', '2027-07-01', 16500),
(69, 18, 49, '2027-04-01', '2027-10-01', 12500),
(72, 19, 52, '2027-07-01', '2028-01-01', 11500),
(75, 20, 55, '2027-10-01', '2028-04-01', 15500),
(78, 21, 58, '2028-01-01', '2028-07-01', 13500),
(31, 22, 11, '2024-01-15', '2024-07-15', 11000),
(32, 23, 12, '2024-02-20', '2024-08-20', 14000),
(34, 24, 14, '2024-04-10', '2024-10-10', 12000),
(35, 25, 15, '2024-05-25', '2024-11-25', 15000),
(37, 26, 17, '2024-07-05', '2025-01-05', 13000),
(38, 27, 18, '2024-08-15', '2025-02-15', 16000),
(40, 28, 20, '2024-10-01', '2025-04-01', 10000),
(41, 29, 21, '2024-11-10', '2025-05-10', 17000),
(43, 30, 23, '2025-01-20', '2025-07-20', 12500),
(44, 31, 24, '2025-02-15', '2025-08-15', 11500),
(46, 32, 26, '2025-04-05', '2025-10-05', 13500),
(47, 33, 27, '2025-05-20', '2025-11-20', 11000),
(49, 34, 29, '2025-07-10', '2026-01-10', 14500),
(50, 35, 30, '2025-08-25', '2026-02-25', 15500),
(52, 36, 32, '2025-10-15', '2026-04-15', 12500),
(53, 37, 33, '2025-11-05', '2026-05-05', 11500),
(55, 38, 35, '2026-01-01', '2026-07-01', 14500),
(56, 39, 36, '2026-02-10', '2026-08-10', 10500),
(58, 40, 38, '2026-04-05', '2026-10-05', 12500),
(59, 41, 39, '2026-05-20', '2026-11-20', 13500),
(61, 42, 41, '2026-07-01', '2027-01-01', 14500),
(62, 43, 42, '2026-08-15', '2027-02-15', 18500),
(64, 44, 44, '2026-10-01', '2027-04-01', 12500),
(65, 45, 45, '2026-11-10', '2027-05-10', 16500),
(67, 46, 47, '2027-01-05', '2027-07-05', 9500),
(68, 47, 48, '2027-02-20', '2027-08-20', 15500),
(70, 48, 50, '2027-04-10', '2027-10-10', 17500),
(71, 49, 51, '2027-05-25', '2027-11-25', 14500),
(73, 50, 53, '2027-07-15', '2028-01-15', 11500),
(74, 6, 54, '2027-08-01', '2028-02-01', 13500),
(76, 7, 56, '2027-10-01', '2028-04-01', 15500),
(77, 8, 57, '2027-11-10', '2028-05-10', 12500),
(79, 9, 59, '2028-01-01', '2028-07-01', 14500),
(80, 10, 60, '2028-02-15', '2028-08-15', 11500);
