import Head from 'next/head'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

import { useEffect, useState, useRef } from 'react';

const axios = require('axios').default;

const Home = (props) => {

  const { initialized } = props;

  const [ statement, setStatement ] = useState([]);
  const [ form, setForm ] = useState("");

  const [ retStatus, setRetStatus ] = useState(0);  // 0: none, 1: success: -1: failure

  const [ loading, setLoading ] = useState(false);
  const [ results, setResults ] = useState([]);

  const formRef = useRef();

  // useEffect(() => {
  //   // clean up
  //   if (initialized) {
  //     return () => {
  //       axios.delete('/api/database').then(() => {
  //         console.log("clean up")
  //         setInitialized(true);
  //       }).catch(err => {
  //         alert(err.response.status);
  //       });
  //     }
  //   }
  // }, [])
  


  const handleChange = (e) => {
    setForm(e.target.value);
  }

  useEffect(() => {
    if (form) {
      setForm("")
    };
    if (retStatus!==0) {
      setRetStatus(0);
    }
    if (statement.some(s => s.includes(';'))) {
      setLoading(true);
    }
  }, [statement]);

  useEffect(() => {
    if (loading) {
      axios.get('/api/database', { params: { statement: statement.join(' ') } }).then(results => {
        setResults(results.data);
        setRetStatus(1);
        setLoading(false);
      }).catch(err => {
        // alert(err.response.data.error);
        setResults([]);
        setRetStatus(-1);
        setLoading(false);
      });
    } else {
      if (formRef.current) {
        formRef.current.focus();
      }
    }
  }, [loading])

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatement((retStatus !== 0) ? [form] : [...statement, form]);
  }
  
  const getStatementColor = () => {
    switch (retStatus) {
      case -1: {
        return "text-warning";
      }
      case 1: {
        return "text-success";
      }
      default: {
        ""
      }
    }
  }

  const getRandomNum = (max) => Math.floor(Math.random()*max);

  const renderResults = () => {
    const headers = Object.keys(results[0]);

    return (
      <Table className="text-white" size="sm">
        <thead>
          <tr>
            { headers.map(h => <th key={h + getRandomNum(100).toString()}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {
            results.map( (r,i) => {
              return (
                <tr key={`result-row-${i}-${getRandomNum(100).toString()}`}>
                  { 
                    Object.values(r).map((col, colIndex) => <td key={`result-row-${i}-col-${colIndex}-{${getRandomNum(100).toString()}`}>{col}</td>)
                  }
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    )
  }

  return (
    <Container fluid className="h-100 py-4">
      <Head>
        <title>Car Rental DB</title>
        <meta name="description" content="A car rental database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Row className="h-100 d-flex flex-column align-items-center gap-3">

          <Col xs={12}>
            <h1 className="display-1 text-center">
              <i className="bi bi-car-front"></i> Rental Database
            </h1>
          </Col>
          <Col xs={12} md={8} xl={6} xxl={4} >
            <Form onSubmit={handleSubmit}>
              <FloatingLabel
                controlId="floatingInput"
                label="Enter an SQL Statement"
                className="my-3 text-dark"
              >
                <Form.Control
                  name="form"
                  disabled={!initialized || loading}
                  value={form}
                  onChange={handleChange}
                  placeholder="Enter an SQL statement"
                  autoFocus
                  autoComplete="off"
                  ref={formRef}
                />
              </FloatingLabel>
            </Form>
            
              {
                statement.length > 0 && (
                  <div className="d-flex justify-content-start gap-3">
                  { retStatus !== 1 && <Button size="sm" onClick={() => setStatement([])} variant="outline-secondary"><i className="bi bi-trash3-fill"></i></Button>}
                    <div className={`lead ${getStatementColor()}`} >
                      {statement.map(s => (
                        <h5 key={s+getRandomNum(100).toString()} className='m-0'>{s}</h5>
                      ))}
                    </div>
                  </div>
                )
              }
          </Col>

          { loading ? 
            (
              <Col xs={12} style={{height: '25vh'}} className="d-flex justify-content-center align-items-center"><div ><Spinner animation="grow" /></div></Col>
            ) : (
              results.length > 0 && (
                <Col xs={12}>
                  <strong>{results.length}</strong> Results:
                  <hr/>
                  {renderResults()}
                </Col>
              )
            )
          }


        </Row>

      </main>

    </Container>
  )
}

export default Home;