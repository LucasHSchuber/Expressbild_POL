import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// import spinner
import Spinner from "../components/spinner.js"

// import fotnawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFlag, faN, faCameraRetro, faCircle, faAngleDown, faAngleUp, faSquareUpRight } from '@fortawesome/free-solid-svg-icons';

//import toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ENV from '../../env.js'; 
// import API_CONFIG from '../../apiConfig.js'; 


console.log(ENV);
// console.log(API_CONFIG);

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
  message: string,
  updated: string,
  timestamp: string,
  statuscode: number
}
interface ExternalLogEntry {
  message: string,
  updated: string,
  timestamp: string,
  statuscode: number
}
interface CancelLogEntry {
  message: string,
  updated: string,
  timestamp: string,
  statuscode: number
}
interface TokenEntry {
  token: string,
}




const Index = () => {

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataArray[]>([]);
  const [selectedData, setSelectedData] = useState<DataArray[]>([]);

  const [flagLog, setFlagLog] = useState<FlagLogEntry[]>([]);
  const [showFlagLog, setShowFlagLog] = useState(false);

  const [externalLog, setExternalLog] = useState<ExternalLogEntry[]>([]);
  const [showExternalLog, setShowExternalLog] = useState(false);

  const [cancelLog, setCancelLog] = useState<CancelLogEntry[]>([]);
  const [showCancelLog, setShowCancelLog] = useState(false);

  const [token, setToken] = useState("");



    // Fetch token from URL query parameters
    useEffect(() => {
      const fetchToken = () => {
        if (!ENV.isProduction) {
          setToken(ENV.token);
          console.log(token);
          console.log("Running development");
        } else {
          console.log("Running production");
          const location = useLocation();
          const queryParams = new URLSearchParams(location.search);
          const token = queryParams.get('token');
          if (token !== null) { // Check if token is not null
            console.log(token);
            setToken(token); // It's safe to set the token
          } else {
            console.log("Token not found in URL");
            setToken(''); // Or handle it as you prefer
          }
        }
      };
      fetchToken();
    }, []);
    


    useEffect(() => {
      if (data.length === 0) {
        setLoading(true);
        const fetchData = async () => {
          try {
            const response = await axios.get<{ data: DataArray[] }>(`${ENV.API_URL}api/alldata`);
            console.log(response.data);
            if (response.status === 200) {
                console.log("Status = 200");
                setData(response.data.data);
                console.log('response.data', response.data.data);
                setLoading(false);
            } else {
                console.log("Could not fetch data from /alldata");
            }

          } catch (error) {
            console.error("There was an error fetching the data!", error);
            setLoading(false);
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
      const getPortalName = (portal: string) =>{
        let portalname = "";
        switch (portal) {
          case "2dba368b-6205-11e1-b101-0025901d40ea": // sweden
          portalname = "ExpressBild SWE";
            break;
          case "1cfa0ec6-d7de-11e1-b101-0025901d40ea": // finland
          portalname = "ExpressBild FIN";
            break;
          case "8d944c93-9de4-11e2-882a-0025901d40ea": // denmark
          portalname = "ExpressBild DEN";
            break;
          case "f41d5c48-5af3-94db-f32d-3a51656b2c53": // norway
          portalname = "ExpressBild NOR";
            break;
          case "da399c45-3cf2-11ea-b287-ac1f6b419120": // germany
          portalname = "ExpressBild GER";
            break;
          case "a535027b-2240-11e0-910e-001676d1636c": // studio express sweden
          portalname = "StudioExpress SWE";
            break;
          case "a0c01dac-d749-11ec-b288-ac1f6b419120": // studio express finland
          portalname = "StudioExpress FIN";
            break;
          case "a0aa6525-4435-11ea-b287-ac1f6b419120": // studio express denmark
          portalname = "StudioExpress DEN";
            break;
          case "9a40c7df-436a-11ea-b287-ac1f6b419120": // studio express norway
          portalname = "StudioExpress NOR";
            break;
          default:
            console.error('Portal not found');
            return;
        }
        return portalname;
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
        switch (item.portaluuid) {
          case "2dba368b-6205-11e1-b101-0025901d40ea": // sweden
            url = "shop.expressbild.se";
            break;
          case "1cfa0ec6-d7de-11e1-b101-0025901d40ea": // finland
            url = "shop.expresskuva.fi";
            break;
          case "8d944c93-9de4-11e2-882a-0025901d40ea": // denmark
            url = "shop.billedexpressen.dk";
            break;
          case "f41d5c48-5af3-94db-f32d-3a51656b2c53": // norway
            url = "shop.fotoexpressen.no";
            break;
          case "da399c45-3cf2-11ea-b287-ac1f6b419120": // germany
            url = "shop.bildexpressen.de";
            break;
          case "a535027b-2240-11e0-910e-001676d1636c": // studio express sweden
            url = "shop.studioexpress.se";
            break;
          case "a0c01dac-d749-11ec-b288-ac1f6b419120": // studio express finland
            url = "shop.studioexpresskuva.fi";
            break;
          case "a0aa6525-4435-11ea-b287-ac1f6b419120": // studio express denmark
            url = "shop.studioexpressen.dk";
            break;
          case "9a40c7df-436a-11ea-b287-ac1f6b419120": // studio express norway
            url = "shop.studioexpressen.no";
            break;
          default:
            console.error('Portal UUID not found');
            return;
        }

        const link = `https://${url}/admin/portal/orders/order.php?uuid=${item.orderuuid}`;
        window.open(link, "_blank");
      };

      const openPicReturn = (item: DataArray) => {
        const link = `https://backend.expressbild.org/index.php/net/returns/load_order/${item.orderuuid}`;
        window.open(link, "_blank");
      };



      //  --------------- RUN FLAG METHOD --------------

      const runFlag = async () => {
        console.log("Flag method triggered...");
        const confirm = window.confirm(`Are you sure you want to flag all ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(order => {
                  console.log('order', order.orderuuid);
                  return axios.post(`${ENV.API_URL}api/flag`, {
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
              toast.error('An error occurred while Flagging the orders');

          }
        }
      }


      //  --------------- RUN EXTERNAL METHOD --------------

      const runExternal = async (item: DataArray) => {
        console.log("EXTERNAL method triggered...");
        const confirm = window.confirm(`Are you sure you want to run External on order: ${item.orderuuid}?`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
          try {
                console.log('order', item.orderuuid);
                const response = await axios.post(`${ENV.API_URL}api/fixed`, {
                    orderuuid: item.orderuuid
                }, {
                    headers: {
                        Authorization: `Admin ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                // Handle responses if necessary
              console.log('All projects flagged successfully:', response);
              toast.success("Successfully ran External on order");
              setExternalLog((prevExternalLog) => [...prevExternalLog, response.data]);
          } catch (error) {
              console.error('Error flagging projects:', error);
              toast.error('An error occurred while running the External method');

          }
      }
      }


      //  --------------- RUN CANCEL METHOD --------------

      const runCancel = async () => {
        console.log("Cancel method triggered...");
        const confirm = window.confirm(`Are you sure you want to Cancel all ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');

          // Update netlife through REST API
          // Update net_orders
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(order => {
                  console.log('order', order.orderuuid);
                  return axios.post(`${ENV.API_URL}api/cancel`, {
                      orderuuid: order.orderuuid
                  }, {
                      headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                      }
                  });
              }));

              // Handle responses if necessary
              console.log('All projects cancelled successfully:', responses);
              const cancelLog = responses.map(data => data.data);
              toast.success("Successfully cancelled all orders");
              setCancelLog(cancelLog);
          } catch (error) {
              console.error('Error cancelling projects:', error);
              toast.error('An error occurred while cancelling the orders');

          }
        }
      }



      useEffect(() => {
        console.log('flagLog', flagLog);
        console.log('externalLog', externalLog);
      }, [flagLog, externalLog]);





  return (
  <div className='wrapper'>

    {/* HEADER */}
    <div className='header-box'>
        <h6>POL - Proof Of Life</h6>
        <p>Your system to handle orders</p>
    </div>

    {/* CONTENT */}
    <div className='content-wrapper mt-5'>

        <div className='table-wrapper'>
          {/* TABLE */}
          <table className='table ' >
              <thead>
                <tr>
                  <th>Stauts</th>
                  <th>OrderUuid</th>
                  <th>Portal</th>
                  {/* <th>Paid</th> */}
                  <th>Inserted</th>
                  {/* <th>Updated</th> */}
                  <th>Originating</th>
                  {/* <th>Count</th> */}
                  <th>Netlife</th>
                  <th>PicR.</th>
                  <th>External</th>
                  <th>Flag</th>
                  {/* <th></th>
                  <th></th>
                  <th></th> */}
                </tr>
              </thead>
              <tbody>
                  {loading ? (
                    <tr  className="spinner-container">
                      <Spinner />
                    </tr>
                  ) : data.length > 0 ? (
                      data.map((item) => (
                          <tr className={`table-row ${selectedData.some(i => i.orderuuid === item.orderuuid) ? "selected-row" : ""}`} key={item.orderuuid}
                              onClick={(e) => {
                                const target = e.target as HTMLTableCellElement; 
                                if (target.cellIndex < 5) {
                                  addRow(item); // Only trigger addRow for the first 5 cells
                                }
                              }}>
                              <td >
                                {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' title="Paid" /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' title="Returned" /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' title="None" /> : "-"}
                              </td>
                              <td title={item.orderuuid}>{item.orderuuid.length > 12 ? item.orderuuid.substring(0, 12) + '...' : item.orderuuid}</td>
                              {/* <td title={item.portaluuid}>{item.portaluuid.length > 12 ? item.portaluuid.substring(0, 12) + '...' : item.portaluuid}</td> */}
                              <td title={item.portaluuid}>{getPortalName(item.portaluuid)}</td>
                              {/* <td>{item.paid}</td> */}
                              <td>{new Date(item.inserted).toLocaleString().substring(5,10)}</td>
                              {/* <td>{new Date(item.updated).toLocaleString().substring(0,10)}</td> */}
                              <td>{getOriginatingPrefix(item.originating)}</td>
                              {/* <td>{item.cnt !== null ? item.cnt : '-'}</td> */}
                              <td className='table-button' title='To Netlife' onClick={() => openNetlife(item)}><button className='table-button'><FontAwesomeIcon icon={faN} title="To Netlife" className='table-icon' onClick={() => deleteRow(item)} /></button></td>
                              <td className='table-button' title='To Pic Returns' onClick={() => openPicReturn(item)}><button className='table-button'><FontAwesomeIcon icon={faCameraRetro} title="To Pic Returns" className='table-icon' onClick={() => deleteRow(item)} /></button></td>
                              <td className='table-button' title='External' onClick={() => runExternal(item)}><button className='table-button '><FontAwesomeIcon icon={faSquareUpRight} title="External" className='table-icon' /></button></td>
                              <td className='table-button' title='Flag'><button className='table-button table-button-flag'><FontAwesomeIcon icon={faFlag} title="Flag" className='table-icon'  /></button></td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={7}>No data available</td>
                      </tr>
                  )}
              </tbody>
            </table>
            <div>
              <div>
                <h6>Amount of orders: {data && data.length}</h6>
              </div>
            </div>
        </div>

        <div style={{ display: "grid" }}>
          {/* SELECTED DATA BOX */}
          {selectedData.length > 0 && (
          <div className='selected-data-box'>
            <h5 className='mb-5'><span style={{ textDecoration: "underline" }}>Selected Orders</span> ({selectedData.length}):</h5>
              {selectedData && selectedData.map((item) => (
                  <div className='mb-3 d-flex justify-content-between' key={item.orderuuid}>
                    <FontAwesomeIcon icon={faTimes} title="Remove Project" className='delete-selecteddata-button' onClick={() => deleteRow(item)} />
                    <h6 className='mx-3'>{item.orderuuid.length > 15 ? item.orderuuid.substring(0,15) + "..." : item.orderuuid.length}</h6>
                    <h6>{getPortalName(item.portaluuid)}</h6>
                    <h6 className='mx-3'>{new Date(item.inserted).toLocaleString().substring(0,10)}</h6>
                    {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                  </div>
                ))}
              <h6 className='delete-all-button' title='Remove All Projects' onClick={() => deleteAll()}>Remove All</h6>
              <hr className='my-5' style={{border: "0.5px solid rgba(255, 255, 255, 0.1)"}}></hr>
              <div className=''>
                <button className='button' title='Cancel orders' onClick={() => runCancel()}>Cancel {selectedData.length} orders</button>
                <button className='button mx-2' title='Post orders'>Post {selectedData.length} orders</button>
                <button className='button' title='Flag orders' onClick={() => runFlag()}>Flag {selectedData.length} orders</button>
              </div>
          </div>
          )}

          {/* LOGS CONTENT */}
          <div className='log-wrapper'>
            {/* LOG BUTTONS */}
            <div className='d-flex log-button-box'>
              {flagLog.length > 0 && (
                <div>
                  <button title='Flag Log' className='log-button' onClick={() => { setShowFlagLog(!showFlagLog); setShowExternalLog(false); setShowCancelLog(false); }} > {showFlagLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} Flag Log</button>
                </div>
                )}
                {externalLog.length > 0 && (
                <div>
                  <button title='External Log' className='log-button' onClick={() => { setShowExternalLog(!showExternalLog); setShowFlagLog(false); setShowCancelLog(false); }}> {showExternalLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} External Log</button>
                </div>
                )}
                {cancelLog.length > 0 && (
                <div>
                  <button title='Cancel Log' className='log-button' onClick={() => { setShowCancelLog(!showCancelLog); setShowFlagLog(false); setShowExternalLog(false); }}> {showCancelLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} Cancel Log</button>
                </div>
                )}
            </div>

            <div>
              {/* FLAG LOG */}
              {showFlagLog ? (
                <div className='log-box'>
                  <h5>Flag Log:</h5>

                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>Message</th>
                          <th>Order UUID</th>
                          <th>Code</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flagLog.map((item) => (
                          <tr key={item.updated}>
                            <td>{item.message || 'No message'}</td>
                            <td>{item.updated}</td>
                            <td>{item.statuscode}</td>
                            <td>{item.timestamp ? item.timestamp : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                </div>
              ) : showExternalLog ? (
                <div>
                  {/* EXTERNAL LOG */}
                  {showExternalLog && (
                  <div className='log-box'>
                    <h5>External Log:</h5>

                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Message</th>
                            <th>Order UUID</th>
                            <th>Code</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {externalLog.map((item) => (
                            <tr key={item.updated}>
                              <td>{item.message || 'No message'}</td>
                              <td>{item.updated}</td>
                              <td>{item.statuscode}</td>
                              <td>{item.timestamp ? item.timestamp : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                  </div>
                  )}
                </div>
              ) : showCancelLog ? (
                <div>
                  {/* CANCEL LOG */}
                  {showCancelLog && (
                  <div className='log-box'>
                    <h5>Cancel Log:</h5>

                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Message</th>
                            <th>Order UUID</th>
                            <th>Code</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cancelLog.map((item) => (
                            <tr key={item.updated}>
                              <td>{item.message || 'No message'}</td>
                              <td>{item.updated}</td>
                              <td>{item.statuscode}</td>
                              <td>{item.timestamp ? item.timestamp : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                  </div>
                  )}
                </div>
              ) : null }
            </div>
          </div>

        </div>
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