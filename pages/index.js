import Head from 'next/head'

import Container from 'react-bootstrap/Container';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

import { useEffect, useState, useRef } from 'react';

const axios = require('axios').default;

const Home = () => {

  const [ initialized, setInitialized ] = useState(false);
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
  
  useEffect(() => {
    if (!initialized) {
      axios.get('/api/database/init').then(() => {
        setInitialized(true);
      }).catch(err => {
        alert(err.response.status);
      });
    }
  }, [initialized])

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
        alert(err.response.data.error);
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
    <Container className="h-100 py-4">
      <Head>
        <title>Car Rental DB</title>
        <meta name="description" content="A car rental database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-100">
        <div className="h-100 d-flex flex-column align-items-center gap-3">

          <div>
            <h1 className="display-1">
              Car Rental Database
            </h1>
          </div>
          <div style={{width: '50%'}}>
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
                  ref={formRef}
                />
              </FloatingLabel>
            </Form>
            
              {
                statement.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div className={`lead ${getStatementColor()}`} >
                      {statement.map(s => (
                        <h5 key={s+getRandomNum(100).toString()} className='m-0'>{s}</h5>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => setStatement([])}><i className="bi bi-x-lg"></i></Button>
                  </div>
                )
              }
              <div style={{display: 'flex 0 0 150px'}}>
                
              </div>
          </div>

          { loading ? 
            (
              <Spinner animation="grow" />
            ) : (
              results.length > 0 && (
                <div className="w-100 mt-4">
                  Results:
                  <hr/>
                  {renderResults()}
                </div>
              )
            )
          }


        </div>

      </main>

    </Container>
  )
}

export default Home;