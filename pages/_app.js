import 'bootstrap/dist/css/bootstrap.min.css';

import '../styles/globals.css';

import { useEffect, useState, useRef } from 'react';

const axios = require('axios').default;

const MyApp = ({ Component, pageProps }) => {

  const [ initialized, setInitialized ] = useState(false);

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
    <Component 
      {...pageProps}
      initialized={initialized}
    />
  )

}

export default MyApp
