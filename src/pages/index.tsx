import React, { useState, useEffect } from 'react';
import axios from 'axios';

// import fotnawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBan, faFlag, faCheck, faN, faCameraRetro, faCircle } from '@fortawesome/free-solid-svg-icons'; 

//import toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// imported images

// imported css files

interface DataArray {
    cnt: number,
    inserted: string
    orderuuid: string,
    originating: string,
    paid: number,
    portaluuid: string,
    updated: string
}
interface FlagLogEntry {
  status: string;
  updated: string
}

const Index = () => {
  
  const [data, setData] = useState<DataArray[]>([]);
  const [selectedData, setSelectedData] = useState<DataArray[]>([]); 

  const [flagLog, setFlagLog] = useState<FlagLogEntry[]>([]); 
  const [showFlagLog, setShowFlagLog] = useState(false); 


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
          setSelectedData((prevArray) => prevArray.filter(i => i.orderuuid !== project.orderuuid));
          // toast.error("Order already added to selected orders list");
        } else {
          setSelectedData((prevArray) => [...prevArray, project]);
        }
      }

      const deleteRow = (item: DataArray) => {
        console.log('item', item);{
          console.log("Project is already added")
          setSelectedData((prevArray) => prevArray.filter(i => i.orderuuid !== item.orderuuid));
          toast.success("Order removed from selected orders list");
        }
      }
      const deleteAll = () => {
          setSelectedData([]);
          // toast.success("All orders removed from selected orders list");
      }

          
      const openNetlife = (item: DataArray) => {
        let url = "";
        switch (item.portaluuid){
          case "2dba368b-6205-11e1-b101-0025901d40ea": //sweden
            url = "shop.expressbild.se";
          case "1cfa0ec6-d7de-11e1-b101-0025901d40ea": //finland
            url = "shop.expresskuva.fi";
          case "8d944c93-9de4-11e2-882a-0025901d40ea"://denmark
            url = "shop.billedexpressen.dk";
          case "f41d5c48-5af3-94db-f32d-3a51656b2c53"://norway
            url = "shop.fotoexpressen.no";
          case "da399c45-3cf2-11ea-b287-ac1f6b419120"://germany
            url = "shop.bildexpressen.de";
          case "a535027b-2240-11e0-910e-001676d1636c":// studio express sweden
            url = "shop.studioexpress.se";
          case "a0c01dac-d749-11ec-b288-ac1f6b419120":// studio express finland
            url = "shop.studioexpresskuva.fi";
          case "a0aa6525-4435-11ea-b287-ac1f6b419120":// studio express denmark
            url = "shop.studioexpressen.dk";
          case "9a40c7df-436a-11ea-b287-ac1f6b419120":// studio express norway
            url = "shop.studioexpressen.no";
        }
          const link = `https://${url}/admin/portal/orders/order.php?uuid=${item.orderuuid}`
          window.open(link, "_blank");
      }
      const openPicReturn = (item: DataArray) => {
        const link = `https://backend.expressbild.org/index.php/net/returns/load_order/${item.orderuuid}`
        window.open(link, "_blank");
      }


      //  --------------- RUN FLAG METHOD --------------

      const runFlag = async () => {
        console.log("Flag method triggered...");
        const confirm = window.confirm(`Are you sure you want to flag all ${selectedData.length} projects?`);  
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
          const token = '666ab2a5be8ee1.66302861';
  
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(order => {
                  console.log('order', order.orderuuid);
                  return axios.post("http://localhost:5000/api/flag", {
                      orderuuid: order.orderuuid
                  }, {
                      headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                      }
                  });
              }));
  
              // Handle responses if necessary
              console.log('All projects flagged successfully:', responses);
              const flagLog = responses.map(data => data.data);
              toast.success("Successfully flagged all orders");
              setFlagLog(flagLog);
          } catch (error) {
              console.error('Error flagging projects:', error);
          }
      }
      }


      useEffect(() => {
        console.log('flagLog', flagLog);
      }, [flagLog]);

  return (
    <div className='wrapper'>

    <div className='header-box'>
        <h6>POL - Proof Of Life</h6>
        <p>Your system to handle orders</p>
    </div>
    <div className='content-wrapper mt-5'>
      <div className='table-wrapper'>
        <table className='table ' >
            <thead>
              <tr>
                <th>Stauts</th>
                <th>Order UUID</th>
                <th>Portal</th>
                {/* <th>Paid</th> */}
                <th>Inserted</th>
                {/* <th>Updated</th> */}
                <th>Originating</th>
                {/* <th>Count</th> */}
                <th>Netlife</th>
                <th>PicR.</th>
                <th>Flag</th>
                {/* <th></th>
                <th></th>
                <th></th> */}
              </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((item) => (
                        <tr className={`table-row ${selectedData.some(i => i.orderuuid === item.orderuuid) ? "selected-row" : ""}`} key={item.orderuuid} onClick={() => addRow(item)}>
                            <td title="Paid">
                              {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                            </td>
                            <td title={item.orderuuid}>{item.orderuuid.length > 15 ? item.orderuuid.substring(0, 15) + '...' : item.orderuuid}</td>
                            <td title={item.portaluuid}>{item.portaluuid.length > 15 ? item.portaluuid.substring(0, 15) + '...' : item.portaluuid}</td>
                            {/* <td>{item.paid}</td> */}
                            <td>{new Date(item.inserted).toLocaleString().substring(0,10)}</td>
                            {/* <td>{new Date(item.updated).toLocaleString().substring(0,10)}</td> */}
                            <td>{getOriginatingPrefix(item.originating)}</td>
                            {/* <td>{item.cnt !== null ? item.cnt : '-'}</td> */}
                            <td className='table-button' title='To Netlife' onClick={() => openNetlife(item)}><button className='table-button'><FontAwesomeIcon icon={faN} title="To Netlife" className='' onClick={() => deleteRow(item)} /></button></td>
                            <td className='table-button' title='To Pic Returns' onClick={() => openPicReturn(item)}><button className='table-button'><FontAwesomeIcon icon={faCameraRetro} title="To Pic Returns" className='' onClick={() => deleteRow(item)} /></button></td>
                            {/* <td className='flag-button' title='Post'><button className='flag-button'><FontAwesomeIcon icon={faCheck} title="Post" className='' onClick={() => deleteRow(item)} /></button></td> */}
                            {/* <td className='flag-button' title='External'><button className='flag-button'><FontAwesomeIcon icon={faTimes} title="External" className='' onClick={() => deleteRow(item)} /></button></td> */}
                            {/* <td className='flag-button' title='Cancel'><button className='flag-button'><FontAwesomeIcon icon={faBan} title="Cancel" className='' onClick={() => deleteRow(item)} /></button></td> */}
                            <td className='table-button' title='Flag'><button className='table-button table-button-flag'><FontAwesomeIcon icon={faFlag} title="Flag" onClick={() => deleteRow(item)} /></button></td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7}>No data available</td>
                    </tr>
                )}
            </tbody>
          </table>
          <h6>Amount of orders: {data && data.length}</h6>
        </div>

        {selectedData.length > 0 && (
        <div className='selected-data-box ml-5'>
          <h5 className='mb-5'><span style={{ textDecoration: "underline" }}>Selected Orders</span> ({selectedData.length}):</h5>
            {selectedData && selectedData.map((item) => (
                <div className='mb-3 d-flex justify-content-between' key={item.orderuuid}>
                  <FontAwesomeIcon icon={faTimes} title="Remove Project" className='delete-selecteddata-button' onClick={() => deleteRow(item)} />
                  <h6 className='mx-3'>{item.orderuuid}</h6>
                  {/* <h6 className='mx-3'>{item.portaluuid}</h6> */}
                  {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                </div>
              ))}
            <h6 className='delete-all-button' title='Remove All Projects' onClick={() => deleteAll()}>Remove All</h6>  
            <div className='mt-5'>
              <button className='button'>Cancel</button>
              <button className='button mx-2'>Post</button>
              <button className='button' onClick={() => runFlag()}>Flag</button>
            </div>
            {flagLog.length > 0 && (
            <div className='mt-3'>
              <button onClick={() => setShowFlagLog(!showFlagLog)}> {showFlagLog ? "Hide" : "Show"} Flag Log</button>
            </div>
            )}
            {showFlagLog && (
            <div className='flag-log'>
              {flagLog && flagLog.map((item) => (
                <div key={item.updated}>
                  <h6>{item.status}</h6>
                  <h6>{item.updated}</h6>
                </div>
              ))}
            </div>
            )}
        </div>
        
        )}
      </div>


      <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // Can be "light", "dark", or "colored"
                style={{ width: "400px", fontSize: "1rem" }} 
                // toastClassName="custom-toast" 
                // bodyClassName="custom-toast-body"
            />
    </div>
  );
};

export default Index;