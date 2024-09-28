import React, { useState, useEffect } from 'react';
import axios from 'axios';

// imported images

// imported css files

interface TestResponse {
    message: string;
  }


const Index = () => {
  
  const [data, setData] = useState<TestResponse | null>(null);

    useEffect(() => {
      // Fetching data from the backend
      axios.get('http://localhost:5000/test')  
        .then((response) => {
          setData(response.data); 
          console.log(response.data);
        })
        .catch((error) => {
          console.error("There was an error fetching the data!", error);
        });
    }, []); 
  

  return (
    <div>
      <h6>Heading</h6>
      <p>{data ? data.message : 'Loading...'}</p>
    </div>
  );
};

export default Index;