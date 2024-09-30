import React, { useState, useEffect } from 'react';
import axios from 'axios';

// import fotnawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; 

// imported images

// imported css files

interface DataArray {
    cnt: string | null,
    inserted: string
    orderuuid: string,
    originating: string,
    paid: number,
    portaluuid: string,
    updated: string
}


const Index = () => {
  
  const [data, setData] = useState<DataArray[]>([]);
  const [selectedData, setSelectedData] = useState<DataArray[]>([]); // Updated type for selectedRow



    useEffect(() => {
      if (data.length === 0) {
        const fetchData = async () => {
          try {
            const response = await axios.get<{ data: DataArray[] }>('http://localhost:5000/api/alldata');
            console.log(response.data);
            if (response.status === 200) {
                console.log("Status = 200");
                setData(response.data.data);  
                console.log('response.data', response.data.data);
            } else {
                console.log("Could not fetch data from /alldata");
            }
            
          } catch (error) {
            console.error("There was an error fetching the data!", error);
          }
        };
      
        fetchData();
      }
      }, []);
      
  
      const getOriginatingPrefix = (originating: string) =>{
        const firstPart = originating.split("/")
        // console.log('firstPart', firstPart);
        return firstPart[0];
      }

      const addRow = (project: DataArray) => {
        console.log('project', project);
        const exists = selectedData.some(item => item.orderuuid === project.orderuuid);
        if (exists) {
          console.log("Project is already added")
        } else {
          setSelectedData((prevArray) => [...prevArray, project]);
        }
      }

      const deleteRow = (item: DataArray) => {
        console.log('item', item);{
          console.log("Project is already added")
          setSelectedData((prevArray) => prevArray.filter(i => i.orderuuid !== item.orderuuid));
        }
      }
      
      const deleteAll = () => {
          setSelectedData([]);
      }




  return (
    <div className='wrapper'>

    <div className='header-box'>
        <h6>POL - Proof Of Life</h6>
        <p>Your system to handle orders</p>
    </div>
    <div className='d-flex mt-5'>
      <div className='table-wrapper'>
        <table className='table ' >
            <thead>
              <tr>
                <th>Order UUID</th>
                <th>Portal UUID</th>
                {/* <th>Paid</th> */}
                <th>Inserted</th>
                {/* <th>Updated</th> */}
                <th>Originating</th>
                {/* <th>Count</th> */}
                <th>N.</th>
                <th>P.R</th>
                <th>Post</th>
                <th>External</th>
                <th>Cancel</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((item) => (
                        <tr className='table-row' key={item.orderuuid} onClick={() => addRow(item)}>
                            <td title={item.orderuuid}>{item.orderuuid.length > 15 ? item.orderuuid.substring(0, 15) + '...' : item.orderuuid}</td>
                            <td title={item.portaluuid}>{item.portaluuid.length > 15 ? item.portaluuid.substring(0, 15) + '...' : item.portaluuid}</td>
                            {/* <td>{item.paid}</td> */}
                            <td>{new Date(item.inserted).toLocaleString().substring(0,10)}</td>
                            {/* <td>{new Date(item.updated).toLocaleString().substring(0,10)}</td> */}
                            <td>{getOriginatingPrefix(item.originating)}</td>
                            {/* <td>{item.cnt !== null ? item.cnt : '-'}</td> */}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7}>No data available</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>

        {selectedData.length > 0 && (
        <div className='selected-data-box ml-5'>
          <h6 className='mb-5' style={{ textDecoration: "underline" }}>Selected Data:</h6>
            {selectedData && selectedData.map((item) => (
                <div className='mb-4 d-flex' key={item.orderuuid}>
                  <FontAwesomeIcon icon={faTimes} title="Remove Project" className='delete-selecteddata-button' onClick={() => deleteRow(item)} />
                  <h6 className='mx-3'>{item.orderuuid}</h6>
                </div>
              ))}
            <h6 className='delete-all-button' title='Remove All Projects' onClick={() => deleteAll()}>Remove All</h6>  
        </div>
        )}
      </div>
    </div>
  );
};

export default Index;