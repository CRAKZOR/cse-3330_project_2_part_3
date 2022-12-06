import 'bootstrap/dist/css/bootstrap.min.css';

import '../styles/globals.css';

import { useEffect, useState, useRef } from 'react';

import Head from 'next/head'

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Link from 'next/link';
import { useRouter } from 'next/router'

const axios = require('axios').default;

const MyApp = ({ Component, pageProps }) => {

  const [ initialized, setInitialized ] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      axios.get('/api/database/init').then(() => {
        setInitialized(true);
      }).catch(err => {
        alert(err.response.status);
      });
    }
  }, [initialized]);


  return (
    <Container fluid className="h-100 py-2">
      <div>
        <Link href={ router.pathname === '/' ? "/questions" : '/'} className="">
          { router.pathname === '/' ? "> Proj_2_Part_3_Task_2 Questions" : '> Raw SQL'}
        </Link>
      </div>
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

        <Component 
          {...pageProps}
          initialized={initialized}
        />
      </Row>
      </main>
    </Container>
  )

}

export default MyApp
