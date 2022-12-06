import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import moment from 'moment';

import { useEffect, useState, useRef } from 'react';
const axios = require('axios').default;

const QuestionsPage = () => {

    const [ form, setForm ] = useState({
        q1: {
            name: '',
            phone: ''
        },
        q2: {
            vehicleID: '',
            description: '',
            year: '',
            type: '',
            category: ''
        },
        q3: {
            custID: '',
            vehicleID: '',
            startDate: '',
            orderDate: '',
            totalAmount: '',
            paymentDate: '',
            returnDate: '',

            type: '',
            category: '',
            rentalType: '',
            qty: ''
        },
        q4: {
            vehicleID: '',
            name: '',
            returnDate: ''
        },
        q4AmountDue: '',
        q5: {
            query: '',
        },
        q6: {
            query: '',
        }
        
    });

    const [ sentQuery, setSentQuery ] = useState({
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        q6: ""
    })

    const [ availableVehicles, setAvailableVehicles ] = useState([]);
    const [ selectedVehicle, setSelectedVehicle ] = useState(null);

    const [ q5CustList, setQ5CustList ] = useState([]);
    const [ q6VehicleList, setQ6VehicleList ] = useState([]);

    useEffect(() => {

        if (selectedVehicle) {
            const totalAmount = (() => {
                if (form.q3.rentalType === 7) {
                    return 7*form.q3.qty*selectedVehicle.Weekly
                } else {
                    return form.q3.qty*selectedVehicle.Daily
                }
            })()
            setForm({
                ...form,
                q3: {
                    ...form.q3,
                    vehicleID: selectedVehicle.VehicleID,
                    totalAmount: totalAmount,
                }
            })
        }

    }, [selectedVehicle])

    const getAvailableVehicles = () => {
        if (
            form.q3.startDate.length !== 10 ||
            !form.q3.type ||
            !form.q3.category ||
            !form.q3.rentalType
        ) {
            return alert("Incomplete data")
        }
        setSelectedVehicle(null);

        const startDate = moment(form.q3.startDate, "MM-DD-YYYY")
        const endDate = moment(startDate).add(form.q3.qty*form.q3.rentalType, 'days')
        const query =  `
            SELECT *
            FROM VEHICLE AS V JOIN RATE ON (RATE.Type=V.Type AND RATE.Category=V.Category)
            WHERE 
                V.Type = ${form.q3.type} AND
                V.Category = ${form.q3.category} AND
                V.VehicleID NOT IN (
                    SELECT V1.VehicleID
                    FROM VEHICLE AS V1 JOIN RENTAL AS R ON (V1.VehicleID = R.VehicleID) 
                    GROUP BY V1.VehicleID
                    HAVING 
                    R.ReturnDate BETWEEN \'${startDate.format('MM-DD-YYYY')}\' AND \'${endDate.format('MM-DD-YYYY')}\' AND
                    R.StartDate BETWEEN \'${startDate.format('MM-DD-YYYY')}\' AND \'${endDate.format('MM-DD-YYYY')}\'
                )
        `.replaceAll('\n', '').replace(/ +/g,' ');

        return axios.get('/api/database', { params: { statement: query } }).then(results => {
            setAvailableVehicles(results.data);
            setForm({
                ...form,
                q3: {
                    ...form.q3,
                    returnDate: endDate.format('MM-DD-YYYY')
                }
            })
        }).catch(err => {
            alert(err);
        });
    }

    const handleChange = (e) => {
        const target = e.target;
        const name = target.name;

        const splitData = name.split('-');
        const qKey = splitData[0];
        const key = splitData[1];

        setForm({
            ...form,
            [qKey]: {
                ...form[qKey],
                [key]: target.value
            }
        })
    }

    const submit = (qKey) => {
        switch (qKey) {
            case "q1": {
                const query =  `
                    INSERT INTO CUSTOMER (Name, Phone)
                    VALUES (\'${form.q1.name}\', \'${form.q1.phone}\');
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query } }).then(results => {
                    setSentQuery({...sentQuery, q1: query });
                    setForm({
                        ...form,
                        q1: {
                            name: '',
                            phone: ''
                        }
                    })
                }).catch(err => {
                    alert(err);
                });
            }
            case "q2": {
                const query =  `
                    INSERT INTO VEHICLE (VehicleID, Description, Year, Type, Category)
                    VALUES (\'${form.q2.vehicleID}\', \'${form.q2.description}\', \'${form.q2.year}\', \'${form.q2.type}\', \'${form.q2.category}\');
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query } }).then(results => {
                    setSentQuery({...sentQuery, q2: query });
                    setForm({
                        ...form,
                        q2: {
                            vehicleID: '',
                            description: '',
                            Year: '',
                            type: '',
                            category: ''
                        }
                    })
                }).catch(err => {
                    alert(err);
                });
            }
            case "q3": {
                const query =  `
                    INSERT INTO RENTAL (CustID, VehicleID, StartDate, OrderDate, RentalType, Qty, ReturnDate, TotalAmount, PaymentDate)
                    VALUES (\'${form.q3.custID}\', \'${form.q3.vehicleID}\', \'${form.q3.startDate}\', \'${form.q3.orderDate}\', ${form.q3.rentalType}, ${form.q3.qty}, \'${form.q3.returnDate}\', \'${form.q3.totalAmount}\', \'${form.q3.paymentDate}\');
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query } }).then(results => {
                    setSentQuery({...sentQuery, q3: query });
                    setAvailableVehicles([]);
                    setSelectedVehicle(null);
                    setForm({
                        ...form,
                        q3: {
                            custID: '',
                            vehicleID: '',
                            startDate: '',
                            orderDate: '',
                            totalAmount: '',
                            paymentDate: '',
                            returnDate: '',
                
                            type: '',
                            category: '',
                            rentalType: '',
                            qty: ''
                        }
                    })
                }).catch(err => {
                    alert(err);
                });
            }
            case "q4": {
                const query1 =  `
                    SELECT DISTINCT *
                    FROM CUSTOMER AS C JOIN RENTAL AS R ON (C.CustID=R.CustID) JOIN VEHICLE AS V ON (R.VehicleID=V.VehicleID) 
                    WHERE 
                        C.Name=\'${form.q4.name}\' AND
                        R.ReturnDate=\'${form.q4.returnDate}\' AND
                        V.VehicleID=\'${form.q4.vehicleID}\';
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query1 } }).then(results => {
                    if (!results.data.length) alert("No results");
                    const { CustId, TotalAmount } = results.data[0];
                    const query2 =  `
                        UPDATE RENTAL
                        SET Returned=1
                        WHERE 
                            CustID=\'${CustId}\' AND
                            ReturnDate=\'${form.q4.returnDate}\' AND
                            VehicleID=\'${form.q4.vehicleID}\';
                    `.replaceAll('\n', '').replace(/ +/g,' ');

                    return axios.get('/api/database', { params: { statement: query2 } }).then(() => {

                        setSentQuery({...sentQuery, q4: query1 + query2 });

                        setForm({
                            ...form,
                            q4: {
                                vehicleID: '',
                                name: '',
                                returnDate: ''
                            },
                            q4AmountDue: TotalAmount
                        })
                    })
                }).catch(err => {
                    setForm({
                        ...form,
                        q4AmountDue: ''
                    })
                    alert(err);
                });
            }
            case "q5": {
                const query =  `
                    SELECT C.CustID, C.Name, R.TotalAmount
                    FROM CUSTOMER AS C LEFT OUTER JOIN RENTAL AS R ON (C.CustID=R.CustID)
                    WHERE
                        lower(C.Name) LIKE '%${form.q5.query.toLowerCase()}%' OR
                        lower(C.CustID) LIKE '%${form.q5.query.toLowerCase()}%'
                    ORDER BY R.TotalAmount DESC;
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query } }).then(results => {
                    setSentQuery({...sentQuery, q5: query });
                    setQ5CustList(results.data)
                    setForm({
                        ...form,
                        q5: {
                            query: ''
                        }
                    })
                }).catch(err => {
                    setQ5CustList([])
                    alert(err);
                });
            }
            case "q6": {
                const query =  `
                    SELECT
                        V.VehicleID AS VIN, 
                        V.Description, 
                        AVG(R.Qty*R.RentalType*RA.Daily) AS Average_Daily_Price
                    FROM VEHICLE AS V LEFT OUTER JOIN RENTAL AS R ON (V.VehicleID=R.VehicleID) JOIN RATE AS RA ON (RA.Type=V.Type AND RA.Category=V.Category)
                    WHERE
                        lower(V.VehicleID) = '${form.q6.query.toLowerCase()}' OR
                        lower(V.Description) LIKE '%${form.q6.query.toLowerCase()}%'
                    GROUP BY V.VehicleID
                    ORDER BY Average_Daily_Price DESC;
                `.replaceAll('\n', '').replace(/ +/g,' ');
                return axios.get('/api/database', { params: { statement: query } }).then(results => {
                    setSentQuery({...sentQuery, q6: query });
                    setQ6VehicleList(results.data)
                    setForm({
                        ...form,
                        q6: {
                            query: ''
                        }
                    })
                }).catch(err => {
                    setQ6VehicleList([])
                    alert(err);
                });
            }
        }
    }

    const validate = (qKey) => {
        return Object.keys(form[qKey]).some( k => !form[qKey][k])
    }

    const renderResults = (results) => {
        const getRandomNum = (max) => Math.floor(Math.random()*max);

        const dollars = new Intl.NumberFormat(`en-US`, {
            currency: `USD`,
            style: 'currency',
            maximumFractionDigits: 2
        })

        const headers = Object.keys(results[0]);
    
        return (
            <div className='overflow-auto' style={{height: '250px'}}>
            <Table className="text-white" size="sm">
                <thead>
                <tr>
                    { headers.map(h => <th key={h + getRandomNum(100).toString()} className={h.toLowerCase().includes('amount') || h.toLowerCase().includes('price') ? 'text-end' : ''}>{h}</th>)}
                </tr>
                </thead>
                <tbody>
                {
                    results.map( (r,i) => {
                        
                    return (
                        <tr key={`result-row-${i}-${getRandomNum(100).toString()}`}>
                        { 
                            Object.values(r).map((col, colIndex) => {
                                const isCurrency = headers[colIndex].toLowerCase().includes('amount') || headers[colIndex].toLowerCase().includes('price');
                                return <td key={`result-row-${i}-col-${colIndex}-{${getRandomNum(100).toString()}`} className={ isCurrency ? "text-end" : ""}>{isCurrency ? dollars.format(col) : col}</td>
                            })
                        }
                        </tr>
                    )
                    })
                }
                </tbody>
            </Table>
            </div>
        )
    }


    return (
        <Col xs={12} md={8} xxl={6} className="pb-5">
            
            <Form as={Row} className="g-2 justify-content-center" >
                <h4>1. Add information about a new customer:</h4>
                { sentQuery.q1 && <h6 className="text-info">{sentQuery.q1}</h6>}
                <Form.Text>The purpose of this form is to add a new customer to the rental database. Enter the customer's name in "Name" and Phone number in the "Phone" fields.</Form.Text>
                <Col xs={6}>
                    <Form.Control
                        placeholder="Name"
                        value={form.q1.name}
                        name="q1-name"
                        onChange={handleChange}
                    />
                </Col>
                <Col xs={6}>
                    <Form.Control
                        placeholder="Phone"
                        value={form.q1.phone}
                        name="q1-phone"
                        onChange={handleChange}
                    />
                </Col>
                <div className="d-grid"><Button type="button" disabled={validate("q1")} onClick={() => submit('q1')}>Submit</Button></div>
            </Form> 

            <hr/>

            <Form as={Row} className="g-2 justify-content-center">
                <h4>2. Add all information about a new vehicle:</h4>
                { sentQuery.q2 && <h6 className="text-info">{sentQuery.q2}</h6>}
                <Form.Text>The purpose of this form is to add a new vehicle to the rental database. Enter the vehicle's VIN in "VehicleID". Note: the 'type' and 'category' fields determine the rental rate for the vehicle.</Form.Text>
                <Col xs={12}>
                    <Form.Control
                        placeholder="Vehicle ID"
                        value={form.q2.vehicleID}
                        name="q2-vehicleID"
                        onChange={handleChange}
                    />
                </Col>
                <Col xs={4}>
                    <Form.Control
                        placeholder="Year"
                        value={form.q2.year}
                        name="q2-year"
                        onChange={handleChange}
                    />
                </Col>
                <Col xs={8}>
                    <Form.Control
                        placeholder="Description"
                        value={form.q2.description}
                        name="q2-description"
                        onChange={handleChange}
                    />
                </Col>
                <Col xs={6}>
                    <Form.Select name="q2-type" value={form.q2.type} onChange={handleChange}>
                        <option>Choose Type...</option>
                        <option value="1">Compact</option>
                        <option value="2">Medium</option>
                        <option value="3">Large</option>
                        <option value="4">SUV</option>
                        <option value="5">Truck</option>
                        <option value="6">VAN</option>
                    </Form.Select>
                </Col>
                <Col xs={6}>
                    <Form.Select name="q2-category" value={form.q2.category} onChange={handleChange}>
                        <option>Choose Category...</option>
                        <option value="0">Basic</option>
                        <option value="1">Luxury</option>
                    </Form.Select>
                </Col>

                <div className="d-grid"><Button type="button" disabled={validate("q2")} onClick={() => submit('q2')}>Submit</Button></div>
            </Form>

            <hr/>

            <Form as={Row} className="g-2 justify-content-center">
                <h4>3. Create Rental:</h4>
                { sentQuery.q3 && <h6 className="text-info">{sentQuery.q3}</h6>}
                <Form.Text>The purpose of this form is to create a new rental to input in the rental database. First select the type, category, enter a start date in "MM-DD-YYYY" format, rental type, and quantity. The rental type also determines the charge rate in conjunction with quantity.</Form.Text>
                <>
                    <h6>Select Available Vehicle To Rent:</h6>
                    <Col xs={6}>
                        
                        <Form.Select name="q3-type" value={form.q3.type} onChange={handleChange} disabled={selectedVehicle}>
                            <option>Choose Type...</option>
                            <option value="1">Compact</option>
                            <option value="2">Medium</option>
                            <option value="3">Large</option>
                            <option value="4">SUV</option>
                            <option value="5">Truck</option>
                            <option value="6">VAN</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6}>
                        <Form.Select name="q3-category" value={form.q3.category} onChange={handleChange} disabled={selectedVehicle}>
                            <option>Choose Category...</option>
                            <option value="0">Basic</option>
                            <option value="1">Luxury</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12}>
                        <Form.Control
                            placeholder="Start Date - (MM-DD-YYYY)"
                            value={form.q3.startDate}
                            name="q3-startDate"
                            onChange={handleChange}
                            disabled={selectedVehicle}
                        />
                    </Col>
                    <Col xs={6}>
                        <Form.Select name="q3-rentalType" value={form.q3.rentalType} onChange={handleChange} disabled={selectedVehicle}>
                            <option>Choose Rental Type...</option>
                            <option value="1">Daily</option>
                            <option value="7">Weekly</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6}>
                        <Form.Control
                            placeholder="Quantity"
                            value={form.q3.qty}
                            name="q3-qty"
                            onChange={handleChange}
                            disabled={selectedVehicle}
                        />
                    </Col>
                    <div className="d-grid"><Button type="button" onClick={() => getAvailableVehicles()}>Get Vehicles</Button></div>
                    {
                        availableVehicles.length > 0 && (
                            <ListGroup>
                                {
                                    availableVehicles.map( v => (
                                        <ListGroup.Item key={v.VehicleID} className="d-flex  justify-content-between text-center" action active={selectedVehicle && selectedVehicle.VehicleID === v.VehicleID} onClick={() => setSelectedVehicle((selectedVehicle && selectedVehicle.VehicleID === v.VehicleID) ? null : v )}>
                                            <div>
                                                {v.Year} {v.Description}
                                            </div>
                                            <div>
                                                {v.VehicleID}
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                }
                            </ListGroup>
                        )
                    }
                </>
                { selectedVehicle &&
                    <>
                        <Col xs={12}>
                            <Form.Control
                                placeholder="Customer ID"
                                value={form.q3.custID}
                                name="q3-custID"
                                onChange={handleChange}
                            />
                        </Col>
                        <Col xs={6}>
                            <Form.Control
                                placeholder="Order Date - (MM-DD-YYYY)"
                                value={form.q3.orderDate}
                                name="q3-orderDate"
                                onChange={handleChange}
                            />
                        </Col>

                        <Col xs={6}>
                            <Form.Control
                                placeholder="Payment Date - (MM-DD-YYYY)"
                                value={form.q3.paymentDate}
                                name="q3-paymentDate"
                                onChange={handleChange}
                            />
                        </Col>
                    </>
                }

                <div className="d-grid"><Button type="button" disabled={validate("q3")} onClick={() => submit('q3')}>Submit</Button></div>
            </Form>

            <hr/>

            <Form as={Row} className="g-2 justify-content-center">
                <h4>4. Return Rental:</h4>
                <Form.Text>The purpose of this form is to return a rental. Input the rental's return date, customer name, and vehicle information number. The rental will be marked returned and the total amount will be printed. </Form.Text>
                { sentQuery.q4 && <h6 className="text-info">{sentQuery.q4}</h6>}
                { form.q4AmountDue && <h2 className="text-danger">Total Amount: <strong>${form.q4AmountDue}</strong></h2>}
                <Col xs={12}>
                    <Form.Control
                        placeholder="Customer Name"
                        value={form.q4.name}
                        name="q4-name"
                        onChange={handleChange}
                    />
                </Col>
                <Col xs={6}>
                    <Form.Control
                        placeholder="Return Date - (MM-DD-YYYY)"
                        value={form.q4.returnDate}
                        name="q4-returnDate"
                        onChange={handleChange}
                    />
                </Col>

                <Col xs={6}>
                    <Form.Control
                        placeholder="Vehicle ID"
                        value={form.q4.vehicleID}
                        name="q4-vehicleID"
                        onChange={handleChange}
                    />
                </Col>

                <div className="d-grid"><Button type="button" disabled={validate("q4")} onClick={() => submit('q4')}>Submit</Button></div>
            </Form>

            <hr/>

            <Form as={Row} className="g-2 justify-content-center">
                <h4>5a. Search Customers:</h4>
                <Form.Text>The purpose of this form is to search through customers using their (Customer Name OR Customer ID) to see their remaining balance.</Form.Text>
                { sentQuery.q5 && <h6 className="text-info">{sentQuery.q5}</h6>}
                <Col xs={12}>
                    <Form.Control
                        placeholder="Customer Name OR ID"
                        value={form.q5.query}
                        name="q5-query"
                        onChange={handleChange}
                    />
                </Col>
                <div className="d-grid"><Button type="button" onClick={() => submit('q5')}>Submit</Button></div>
                { q5CustList.length > 0 && <>
                    <p className="mb-0 mt-4"><strong>{q5CustList.length}</strong> Results:</p>
                    <hr className="mt-0"/> 
                    {renderResults(q5CustList)}
                </>
                }
            </Form>

            <hr/>

            <Form as={Row} className="g-2 justify-content-center">
                <h4>5b. Search Vehicles:</h4>
                <Form.Text>The purpose of this form is to search through customers to see their remaining balance.</Form.Text>
                { sentQuery.q6 && <h6 className="text-info">{sentQuery.q6}</h6>}
                <Col xs={12}>
                    <Form.Control
                        placeholder="Vehicle Description OR ID"
                        value={form.q6.query}
                        name="q6-query"
                        onChange={handleChange}
                    />
                </Col>
                <div className="d-grid"><Button type="button" onClick={() => submit('q6')}>Submit</Button></div>
                { q6VehicleList.length > 0 && <>
                    <p className="mb-0 mt-4"><strong>{q6VehicleList.length}</strong> Results:</p>
                    <hr className="mt-0"/>
                    {renderResults(q6VehicleList)}
                </>
                }
            </Form>


        </Col>
    )
}

export default QuestionsPage;