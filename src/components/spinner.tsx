// Spinner.jsx
import React, { useState, useEffect } from 'react';


const Spinner = () => {
  const [message1, setMessage1] = useState(false);
  const [message2, setMessage2] = useState(false);

  setTimeout(() => {
    setMessage1(true);
  }, 5000);
  
  setTimeout(() => {
    setMessage2(true);
  }, 10000);

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      {message2 ? (
      <p className='mt-3'>Any Second Now...</p>
    ) : message1 ? (
      <p className='mt-3'>Almost Done...</p>
    ) : (
      <p className='mt-3'>Loading Table...</p>
    )}
    </div>
  );
};

export default Spinner;
