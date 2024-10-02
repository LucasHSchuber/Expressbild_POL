// Spinner.jsx
import React, { useState, useEffect } from 'react';


const Spinner = () => {
  const [message1, setMessage1] = useState(false);
  const [message2, setMessage2] = useState(false);
  const [message3, setMessage3] = useState(false);
  const [message4, setMessage4] = useState(false);

  setTimeout(() => {
    setMessage1(true);
  }, 5000);
  
  setTimeout(() => {
    setMessage2(true);
  }, 11000);

  setTimeout(() => {
    setMessage3(true);
  }, 16000);

  setTimeout(() => {
    setMessage4(true);
  }, 30000);


  return (
    <div className="spinner-container">
    <div className="spinner"></div>
      {message4 ? (
      <p className='mt-3'>Maybe Try To Restart The Application And Try Again?</p>  
      ) : message3 ? (
      <p className='mt-3'>Sorry It's Taking a While...</p>  
        ) : message2 ? (
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
