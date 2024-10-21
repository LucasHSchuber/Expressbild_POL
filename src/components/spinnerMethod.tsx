// Spinner.jsx
// import React, { useState, useEffect } from 'react';


const SpinnerMethod = () => {
//   const [message1, setMessage1] = useState(false);
//   const [message2, setMessage2] = useState(false);
//   const [message3, setMessage3] = useState(false);
//   const [message4, setMessage4] = useState(false);

//   setTimeout(() => {
//     setMessage1(true);
//   }, 5000);
  
//   setTimeout(() => {
//     setMessage2(true);
//   }, 11000);

//   setTimeout(() => {
//     setMessage3(true);
//   }, 16000);

//   setTimeout(() => {
//     setMessage4(true);
//   }, 30000);


  return (
    <div className="spinner-method-container">
    <div className="spinner-method"></div>
        <p className='mt-3'>Running Method..</p>  
      {/* {message4 ? (
      <p className='mt-3'>Maybe Restart or Refresh The Application And Try Again?</p>  
      ) : message3 ? (
      <p className='mt-3'>It's Taking a While...</p>  
        ) : message2 ? (
      <p className='mt-3'>Any Second Now...</p>
      ) : message1 ? (
        <p className='mt-3'>Almost Done...</p>
      ) : (
        <p className='mt-3'>Loading Table...</p>
      )} */}
    </div>
  );
};

export default SpinnerMethod;
