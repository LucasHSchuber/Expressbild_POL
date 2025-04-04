// import { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
// import spinners
import Spinner from "../components/spinner.js"
import SpinnerMethod from "../components/spinnerMethod.js"
// import fotnawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFlag, faN, faCameraRetro, faCircle, faAngleDown, faAngleUp, faSquareUpRight, faSort, faSortDown, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
//import toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ENV from '../../env.js'; 
import { DataArray, FlagLogEntry, ExternalLogEntry, CancelLogEntry, PostLogEntry,  } from '../interfaces/interfaces.js';


const Index = () => {

  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingmethod] = useState(false);
  const [data, setData] = useState<DataArray[]>([]);
  const [flaggedOrders, setFlaggedOrders] = useState<DataArray[]>([]);
  const [searchData, setSearchData] = useState<DataArray[]>([]);
  const [selectedData, setSelectedData] = useState<DataArray[]>([]);
  const [markRowGreen, setMarkRowGreen] = useState<DataArray[]>([]);

  const [uniqueOriginatingArray, setUniqueOriginatingArray] = useState<string[]>([]);
  const [uniqueOriginatingSet, setUniqueOriginatingSet] = useState<string[]>([]);

  const [flagLog, setFlagLog] = useState<FlagLogEntry[]>([]);
  const [showFlagLog, setShowFlagLog] = useState(false);

  const [externalLog, setExternalLog] = useState<ExternalLogEntry[]>([]);
  const [showExternalLog, setShowExternalLog] = useState(false);

  const [cancelLog, setCancelLog] = useState<CancelLogEntry[]>([]);
  const [showCancelLog, setShowCancelLog] = useState(false);

  const [postLog, setPostLog] = useState<PostLogEntry[]>([]);
  const [showPostLog, setShowPostLog] = useState(false);

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); 
// portal select
  const [showPortalSelect, setShowPortalSelect] = useState(false);
  const portalSelectRef = useRef<HTMLDivElement>(null);
// originating select
  const [showOriginatingSelect, setShowOriginatingSelect] = useState(false);
  const originatingSelectRef = useRef<HTMLDivElement>(null);
  // status select
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const statusSelectRef = useRef<HTMLDivElement>(null);
  // orderuuid search
  const [showSearchOrderuuid, setShowSearchOrderuuid] = useState(false);
  const orderuuidSearchRef = useRef<HTMLDivElement>(null);
  const [searchString, setSearchString] = useState("");

  const [token, setToken] = useState("");

  const [fontSize, setFontSize] = useState<string>("fontsize-12");

  const location = useLocation();


  // Get unique portaluuids from the data
  const uniqueStatus = ["Paid", "Returned", "None"];
  // Get unique portaluuids from the data
  const uniquePortals = [...new Set(data.map((item) => item.portaluuid))];
  // Get unique originating from the data
  useEffect(() => {
    const _uniqueOriginatingSet = [...new Set(data.map((item) => item.originating))];
    setUniqueOriginatingSet(_uniqueOriginatingSet);
  }, [data]);
  useEffect(() => {
    let _uniqueOriginating: string [] = [];
    uniqueOriginatingSet.forEach((item) => {
      const parts = item.split("/");
      const firstPart = parts[0]; 
      if (!_uniqueOriginating.includes(parts[0])) {
        _uniqueOriginating.push(firstPart);
      }
    });
    setUniqueOriginatingArray(_uniqueOriginating);
  }, [uniqueOriginatingSet]);



    // -------------- FETCHING TOKEN ------------------

    // Fetch token from URL query parameters
    useEffect(() => {
      const fetchToken = () => {
        if (!ENV.isProduction) {
          setToken(ENV.token);
          console.log("Running development");
        } else {
          console.log("Running production");
          const queryParams = new URLSearchParams(location.search);
          const token = queryParams.get('token');
          if (token !== null) {
            setToken(token);
          } else {
            console.log("Token not found in URL");
            setToken('');
          }
        }
      };
      fetchToken();
    }, []);
    


    // -------------- FETCHING DATA FROM DATABASE METHOD ------------------

    const fetchData = async () => {
       // Fetch data only if valid token
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          // if (tokenResponse === null || tokenResponse === "" || tokenResponse === undefined){
            if (!tokenResponse){
            toast.error("Unable to load order data due to invalid or missing token!");
            return;
          } else {
            setLoading(true);
            try {
              const response = await axios.get<{ data: DataArray[] }>(`${ENV.API_URL}api/alldata`);
              console.log(response.data);
              if (response.status === 200) {
                  setData(response.data.data);
                  console.log('response.data', response.data.data);
                  const flaggedorders = response.data.data.filter(item => item.pol_flag !== null);
                  // console.log('flaggedOrders', flaggedorders);
                  setFlaggedOrders(flaggedorders)
                  setLoading(false);
              } else {
                  console.log("Could not fetch data from /alldata");
              }

            } catch (error) {
              console.error("There was an error fetching the data!", error);
              setLoading(false);
            }
      }
    }
      useEffect(() => {
        if (token){
          fetchData();
        }  
      }, [token]);



      // ---------- GETTING ORGIINATING PREFIX (by splitting strings and returning first value in array) -------------

      const getOriginatingPrefix = (originating: string) =>{
        const firstPart = originating.split("/")
        return firstPart[0];
      }
      const getPortalName = (portal: string) =>{
        let portalname = "";
        switch (portal) {
          case "2dba368b-6205-11e1-b101-0025901d40ea": // sweden
          portalname = "Expressbild";
            break;
          case "1cfa0ec6-d7de-11e1-b101-0025901d40ea": // finland
          portalname = "Express-Kuva";
            break;
          case "8d944c93-9de4-11e2-882a-0025901d40ea": // denmark
          portalname = "Billed-Expressen";
            break;
          case "f41d5c48-5af3-94db-f32d-3a51656b2c53": // norway
          portalname = "Foto-Expressen";
            break;
          case "da399c45-3cf2-11ea-b287-ac1f6b419120": // germany
          portalname = "ExpressBild GER";
            break;
          case "a535027b-2240-11e0-910e-001676d1636c": // studio express sweden
          portalname = "Studioexpress SE";
            break;
          case "a0c01dac-d749-11ec-b288-ac1f6b419120": // studio express finland
          portalname = "Studioexpress FI";
            break;
          case "a0aa6525-4435-11ea-b287-ac1f6b419120": // studio express denmark
          portalname = "Studioexpress DK";
            break;
          case "9a40c7df-436a-11ea-b287-ac1f6b419120": // studio express norway
          portalname = "Studioexpress NO";
            break;
          default:
            console.error('Portal not found');
            return;
        }
        return portalname;
      }

      const addRow = (order: DataArray) => {
        console.log('order', order);
        const exists = selectedData.some(item => item.orderuuid === order.orderuuid);
        if (exists) {
          console.log("Order is already added")
          setSelectedData((prevArray) => prevArray.filter(i => i.orderuuid !== order.orderuuid));
          // toast.error("Order already added to selected orders list");
        } else {
          setSelectedData((prevArray) => [...prevArray, order]);
        }
      }

      const deleteRow = (item: DataArray) => {
        console.log('item', item);{
          console.log("Order is already added")
          setSelectedData((prevArray) => prevArray.filter(i => i.orderuuid !== item.orderuuid));
          // toast.success("Order removed from selected orders list");
        }
      }



      const getPortalUrl = (portaluuid: any) => {
        switch (portaluuid) {
          case "2dba368b-6205-11e1-b101-0025901d40ea":
            return "shop.expressbild.se";
          case "1cfa0ec6-d7de-11e1-b101-0025901d40ea":
            return "shop.expresskuva.fi";
          case "8d944c93-9de4-11e2-882a-0025901d40ea":
            return "shop.billedexpressen.dk";
          case "f41d5c48-5af3-94db-f32d-3a51656b2c53":
            return "shop.fotoexpressen.no";
          case "da399c45-3cf2-11ea-b287-ac1f6b419120":
            return "shop.bildexpressen.de";
          case "a535027b-2240-11e0-910e-001676d1636c":
            return "shop.studioexpress.se";
          case "a0c01dac-d749-11ec-b288-ac1f6b419120":
            return "shop.studioexpresskuva.fi";
          case "a0aa6525-4435-11ea-b287-ac1f6b419120":
            return "shop.studioexpressen.dk";
          case "9a40c7df-436a-11ea-b287-ac1f6b419120":
            return "shop.studioexpressen.no";
          default:
            console.error("Portal UUID not found");
            return "";
        }
      };

    



      //  ------------------------------------------- METHODS -------------------------------------------


      // ------------- VALIDATE TOKEN -----------------

      const validateToken = async () => {
        try {
          // const _token = "666ab2a5be8ee1.66302861";
          const response = await axios.get(
            `/api/index.php/rest/auth/validate_token/${token}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('Token repsonse', response.data.result);
          return response.data.result;
          
        } catch (error) {
          console.error('Error validating token:', error);
        }
      };


      //  --------------- RUN FLAG METHOD (on multiple orders) --------------

      const runFlag = async () => {
        
        console.log("Flag method triggered...");
        const confirm = window.confirm(`Are you sure you want to FLAG ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);
          
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
              console.log('All orders flagged successfully:', responses);
              const flagLog = responses.map(data => data.data);
              // Mark table row as green if statuscode = 200
              responses.forEach((data) => {
                if (data.data.statuscode === 200) {
                  setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, data.data.updated]);
                }
              });              
              toast.success("Successfully flagged all orders");
              setFlagLog(flagLog);
              setShowFlagLog(true);
              setShowExternalLog(false);
              setShowCancelLog(false);
              setShowPostLog(false);
              setSelectedData([]);
              setLoadingmethod(false);
          } catch (error) {
              console.error('Error flagging orders:', error);
              toast.error('An error occurred while flagging the orders');
              setLoadingmethod(false);
          }
        }
      }


       //  --------------- RUN FLAG METHOD (one order) --------------

       const runFlagSingleOrder = async (item: DataArray) => {
        // console.log("runFlagSingleOrder method triggered...");
        console.log('item', item);
        const confirm = window.confirm(`Are you sure you want to FLAG the order`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);

          try {
                console.log('order', item.orderuuid);
                const response = await axios.post(`${ENV.API_URL}api/flag`, {
                    orderuuid: item.orderuuid
                }, {
                    headers: {
                        Authorization: `Admin ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                // Handle responses if necessary
              console.log('Order flagged successfully:', response.data);
               // Mark table row as green if statuscode = 200
              if (response.data.statuscode === 200) {
                setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, response.data.updated]);
              } 
              toast.success("Successfully flagged the order");
              setFlagLog((prevFlagLog) => [...prevFlagLog, response.data]);
              setShowFlagLog(true);
              setShowExternalLog(false);
              setShowCancelLog(false);
              setShowPostLog(false);
              setSelectedData([]);
              setLoadingmethod(false);
          } catch (error) {
              console.error('Error flagging order:', error);
              toast.error('An error occurred while flagging the order');
              setLoadingmethod(false);
          }
        }
      }



      //  --------------- RUN EXTERNAL METHOD (one order) --------------

      const runExternal = async (item: DataArray) => {
        console.log("EXTERNAL method triggered...");
        const confirm = window.confirm(`Are you sure you want to run EXTERNAL on order: ${item.orderuuid}?`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);
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
              console.log('Orders ran external successfully:', response);
              // Mark table row as green if statuscode = 200
              if (response.data.statuscode === 200) {
                setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, response.data.updated]);
              } 
   
              toast.success("Successfully ran external on order");
              setExternalLog((prevExternalLog) => [...prevExternalLog, response.data]);
              setShowExternalLog(true);
              setShowCancelLog(false);
              setShowFlagLog(false);
              setShowPostLog(false);
              setSelectedData([]);
              setLoadingmethod(false);
          } catch (error) {
              console.error('Error when running external on orders:', error);
              toast.error('An error occurred while running external on order');
              setLoadingmethod(false);
          }
      }
      }



      //  --------------- RUN EXTERNAL METHOD (multiple orders) --------------

      const runExternalMultpleOrders = async () => {
        
        console.log("runFlagMultpleOrders method triggered...");
        const confirm = window.confirm(`Are you sure you want to run EXTERNAL on ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);
          
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(order => {
                  console.log('order', order.orderuuid);
                  return axios.post(`${ENV.API_URL}api/fixed`, {
                      orderuuid: order.orderuuid
                  }, {
                      headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                      }
                  });
              }));

              // Handle responses if necessary
              console.log('All orders ran external successfully:', responses);
              const externalLog = responses.map(data => data.data);
              // Mark table row as green if statuscode = 200
              responses.forEach((data) => {
                if (data.data.statuscode === 200) {
                  setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, data.data.updated]);
                }
              });              
              toast.success("Successfully ran external on all orders");
              setExternalLog(externalLog);
              setShowExternalLog(true);
              setShowFlagLog(false);
              setShowCancelLog(false);
              setShowPostLog(false);
              setSelectedData([]);
              setLoadingmethod(false);
          } catch (error) {
              console.error('Error running external on orders:', error);
              toast.error('An error occurred while running external on orders');
              setLoadingmethod(false);
          }
        }
      }




      //  --------------- RUN CANCEL METHOD --------------

      const runCancel = async () => {
        console.log("Cancel method triggered...");
        const confirm = window.confirm(`Are you sure you want to CANCEL ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);
          // Update net_orders
          try {
            const cancelLogArray = [];
      
            // Use loop to process each order 
            for (const order of selectedData) {
              console.log('order', order.orderuuid);
      
              try {
                // Post to cancel the order
                const cancelResponse = await axios.post(`${ENV.API_URL}api/cancel`, {
                  orderuuid: order.orderuuid
                }, {
                  headers: {
                    Authorization: `Admin ${token}`,
                    'Content-Type': 'application/json',
                  }
                });
                console.log(`cancelResponse for uuid ${order.orderuuid}`, cancelResponse);
      
                // Update netlife through REST API
                // let order_uuid = "205e956e-ee7c-43e4-8dce-cd3c9700333a";
                console.log('sending orderuuid to netlife api with status 99: ');
                const statusResponse = await axios.post(
                  '/api/index.php/rest/netlife/orderstatus', {
                    orderuuid: order.orderuuid,
                    // orderuuid: order_uuid, // change when prod mode
                    status: 99,
                    portaluuid: order.portaluuid
                  }, {
                    headers: {
                      Authorization: `Admin ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
      
                // Log and handle responses
                const logEntry = {
                  cancelResponse: cancelResponse ? {
                    message: cancelResponse.data.message,
                    statuscode: cancelResponse.data.statuscode,
                    orderuuid: cancelResponse.data.updated,
                    timestamp: cancelResponse.data.timestamp,
                    updated: cancelResponse.data.updated
                  } : undefined,
                  statusResponse: ''
                };
      
                if (statusResponse?.data?.result?.result === "OK") {
                  logEntry.statusResponse = statusResponse?.data?.result?.result || "";
                } else {
                  logEntry.statusResponse = statusResponse?.data?.result?.message || "";
                }
      
                cancelLogArray.push(logEntry);
      
                // Mark the row green if the cancel was successful
                if (cancelResponse.data.statuscode === 200 && statusResponse?.data?.result?.result === "OK") {
                  setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, cancelResponse.data.updated]);
                }
      
                // Update the logs and UI state
                setCancelLog(cancelLogArray);
                setShowCancelLog(true);
                setShowExternalLog(false);
                setShowFlagLog(false);
                setShowPostLog(false);
              
              } catch (error) {
                console.error(`Error processing order with uuid ${order.orderuuid}:`, error);
                toast.error(`An error occurred while cancelling the order with uuid ${order.orderuuid}`);
              }
            }
      
            // Check if any order cancellation returned "Not found" or other errors
            let validateResponse = "false";
            cancelLogArray.forEach(element => {
              if (element.statusResponse === "Not found" || element.statusResponse !== "OK") {
                console.log("The order was not updated in Netlife: ", element.statusResponse);
                validateResponse = "true";
              }
            });
      
            console.log('validateResponse', validateResponse);
            if (validateResponse === "true"){
              toast.error("Not all orders was updated in Netlife. Check 'Cancel Log' for more info");
            }  else {
              toast.success("Successfully canceled all orders");
            }
            
            setLoadingmethod(false);
            setSelectedData([]);
          } catch (error) {
            console.error('Error cancelling orders:', error);
            toast.error('An error occurred while cancelling the orders');
            setLoadingmethod(false);
          }
        }
      }




      //  --------------- RUN POST METHOD --------------

      const runPost = async () => {
        console.log("Post method triggered...");
        const confirm = window.confirm(`Are you sure you want to POST ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          const tokenResponse = await validateToken();
          console.log('tokenResponse', tokenResponse);
          if (tokenResponse === null || tokenResponse === ""){
            toast.error("Invalid or missing token!");
            return;
          }

          setLoadingmethod(true);
          // Update net_orders
          try {
            const postLogArray = [];
          
            // Loop to process each order 
            for (const order of selectedData) {
              console.log('order', order.orderuuid);
              
              // Post to API (our database)
              try {
                const postResponse = await axios.post(`${ENV.API_URL}api/post`, {
                  orderuuid: order.orderuuid
                }, {
                  headers: {
                    Authorization: `Admin ${token}`,
                    'Content-Type': 'application/json',
                  }
                });
                console.log(`postResponse for uuid ${order.orderuuid}`, postResponse);
                // let order_uuid = "205e956e-ee7c-43e4-8dce-cd3c9700333a";
                // Update netlife through REST API
                // console.log('sending orderuuid to netlife api with status 9: ');
                const statusResponse = await axios.post('/api/index.php/rest/netlife/orderstatus', {
                  orderuuid: order.orderuuid,
                  // orderuuid: order_uuid, // Change when running in dev mode
                  status: 9,
                  portaluuid: order.portaluuid
                }, {
                  headers: {
                    Authorization: `Admin ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                console.log(`Order StatusResponse: for uuid ${order.orderuuid}`, statusResponse);
                console.log(`Order StatusResponse.data.result for uuid ${order.orderuuid}`, statusResponse.data.result);
          
                // Process the responses 
                const logEntry = {
                  postResponse: postResponse ? {
                    message: postResponse.data.message,
                    statuscode: postResponse.data.statuscode,
                    orderuuid: postResponse.data.updated,
                    timestamp: postResponse.data.timestamp,
                    updated: postResponse.data.updated
                  } : undefined,
                  statusResponse: ''
                };
          
                if (statusResponse?.data?.result?.result === "OK") {
                  logEntry.statusResponse = statusResponse?.data?.result?.result || "";
                } else {
                  logEntry.statusResponse = statusResponse?.data?.result?.message || "";
                }
          
                postLogArray.push(logEntry);
          
                // Mark the row green if updated correctly in Netlife and our DB
                if (postResponse.data.statuscode === 200 && statusResponse?.data?.result?.result === "OK") {
                  setMarkRowGreen((prevMarkRowGreen) => [...prevMarkRowGreen, postResponse.data.updated]);
                }
          
                setPostLog(postLogArray);
                setShowPostLog(true);
                setShowExternalLog(false);
                setShowFlagLog(false);
                setShowCancelLog(false);
          
                // Check if any data in response is NOT FOUND
                if (logEntry.statusResponse === "Not found" || logEntry.statusResponse !== "OK") {
                  toast.error("Not all orders were updated in Netlife. Check 'Post Log' for more info");
                } else {
                  console.log("Order '" + order.orderuuid + "' was succesffully updated in Netlife");
                }
              } catch (error) {
                console.error(`Error processing order with uuid ${order.orderuuid}:`, error);
                toast.error(`An error occurred while posting the order with uuid ${order.orderuuid}`);
              }
            }

              // Check if any data in response is NOT found from netlifes API
              let validateResponse = "false";
              postLogArray.forEach(element => { 
                if (element.statusResponse === "Not found" || element.statusResponse !== "OK"){
                  console.log("The order was not updated in Netlife: ", element.statusResponse);
                  validateResponse = "true";
                }
              });
              console.log('validateResponse', validateResponse);
              if (validateResponse === "true"){
                toast.error("Not all orders was updated in Netlife. Check 'Post Log' for more info");
              }  else {
                toast.success("Successfully posted all orders");
              }
            // toast.success("Successfully posted the order");
            setLoadingmethod(false);
            setSelectedData([]);
          } catch (error) {
            console.error('Error posting orders:', error);
            toast.error('An error occurred while posting the orders');
            setLoadingmethod(false);
          }
        }
      }






      //  --------------------------------------- SORTING AND FILTERING ---------------------------------------


      //  --------------- SORTING TABLE --------------

      const sortTable = (column: string) => {
        const sortedData = [...data]; // clone data array
        let direction: 'asc' | 'desc' = sortDirection === 'asc' ? 'desc' : 'asc';
     
        if (column === "flag"){
            sortedData.sort((a, b) => {
              const getFlagPriority = (item: DataArray) => {
                return item.pol_flag ? 1 : 2;
            };
            const flagA = getFlagPriority(a);
            const flagB = getFlagPriority(b);
            return direction === 'asc' ? flagA - flagB : flagB - flagA;
            });
        } else if (column === 'inserted') {
          sortedData.sort((a, b) => {
            const dateA = new Date(a.inserted).getTime();
            const dateB = new Date(b.inserted).getTime();
            return direction === 'asc' ? dateA - dateB : dateB - dateA;
          });
        } 
        // setSortColumn(column);
        setSortDirection(direction);
        setData(sortedData);
      };


      //  --------------- PORTAL TABLE SELECT --------------

      const handlePortalSelect = (portal: string) => {
        const sortedData = [...data]; // clone the data array
        console.log('selectedValue', portal); 
        setShowPortalSelect(false);
      
        if (portal === "all") {
          setData(sortedData); 
        } else {
          // Sort the data to place selected portaluuid at the top
          const sortedByPortal = sortedData.sort((a, b) => {
            // First prioritize entries with the selected portaluuid
            if (a.portaluuid === portal && b.portaluuid !== portal) {
              return -1;
            } else if (a.portaluuid !== portal && b.portaluuid === portal) {
              return 1; 
            }
            const dateA = new Date(a.inserted).getTime();
            const dateB = new Date(b.inserted).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          });
      
          setData(sortedByPortal);
        }
      };

      //  --------------- ORGIINATING TABLE SELECT --------------

      const handleOriginatingSelect = (origin: string) => {
        const sortedData = [...data]; 
        console.log('selectedValue', origin); 
        setShowPortalSelect(false);
      
        if (origin === "all") {
          setData(sortedData); 
        } else {
          // Sort the data to place selected originating at the top
          const sortedByOriginating = sortedData.sort((a, b) => {
            // First prioritize entries with the selected originating
            if (a.originating.split("/")[0] === origin && b.originating.split("/")[0] !== origin) {
              return -1;
            } else if (a.originating.split("/")[0] !== origin && b.originating.split("/")[0] === origin) {
              return 1; 
            }
            const dateA = new Date(a.inserted).getTime();
            const dateB = new Date(b.inserted).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          });
      
          setData(sortedByOriginating); 
        }
      };


      //  ------------------ STATUS TABLE SELECT -----------------

      const handleStatusSelect = (status: string) => {
        const sortedData = [...data]; 
        console.log('selectedValue', status); 
        setShowStatusSelect(false); 
      
        let sortedByStatus: DataArray[] = [];
      
        if (status === "all") {
          sortedByStatus = sortedData;
        } else {
          if (status === "Paid") {
            // Move all items with paid > 0 to the top
            sortedByStatus = sortedData.sort((a, b) => {
              if (a.paid > 0 && b.paid === 0) return -1;
              if (a.paid === 0 && b.paid > 0) return 1;
              return 0; 
            });
          } else if (status === "Returned") {
            sortedByStatus = sortedData.sort((a, b) => {
              // Check if a and b meet the condition cnt > 0 and is not null
              const isATop = (a.cnt !== null && a.cnt > 0) && a.paid === 0;
              const isBTop = (b.cnt !== null && b.cnt > 0) && b.paid === 0;
              // Place such tuples at the top
              if (isATop && !isBTop) return -1;  
              if (!isATop && isBTop) return 1;   
              return 0;
            });
          } else if (status === "None") {
            sortedByStatus = sortedData.sort((a, b) => {
              const isARed = (a.cnt === null || a.cnt === 0) && a.paid === 0
              const isBRed = b.cnt === 0 && b.paid === 0;
              if (isARed && !isBRed) return -1;
              if (!isARed && isBRed) return 1;
              return 0; 
            });
          }
        }
        setData(sortedByStatus); 
      };
      
      

       //  ------------------ ODERUUID SEARCH -----------------

       const handleOrderuuidSearch = (search: string) => {
        const clonedData = [...data]; 
        setSearchString(search);
        console.log('clonedData', clonedData);
        console.log('selectedValue', search); 

        const matchedData = clonedData.filter((item) => item.orderuuid.includes(search))
        console.log('matchedData', matchedData);

        setSearchData(matchedData);
        
      };


      // Close dropdowns when clicking outside
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (portalSelectRef.current && !portalSelectRef.current.contains(event.target as Node)) {
            setShowPortalSelect(false);
          }
          if (originatingSelectRef.current && !originatingSelectRef.current.contains(event.target as Node)) {
            setShowOriginatingSelect(false);
          }
          if (statusSelectRef.current && !statusSelectRef.current.contains(event.target as Node)) {
            setShowStatusSelect(false);
          }
          if (orderuuidSearchRef.current && !orderuuidSearchRef.current.contains(event.target as Node)) {
            setShowSearchOrderuuid(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);


      const changeFontSize = (fontSize: string) => {
        setFontSize(fontSize);
        console.log('fontsize', fontSize);
      };


      useEffect(() => {
        console.log('selectedData', selectedData);
      }, [selectedData]);


  return (
  <div className='wrapper'>

    {/* HEADER */}
    <div className='header-box'>
        <h6>POL - Proof Of Life</h6>
        {/* <p>Your system to handle orders</p> */}
    </div>
         
    <div className='mt-4 d-flex user-selector-box'>
      <div>
        <label className='mr-2'>Table Font Size: </label>
        <select
          className="font-size-select"
          value={fontSize}
          onChange={(e) => changeFontSize(e.target.value)}
        >
          <option value="fontsize-8">8px</option>
          <option value="fontsize-10">10px</option>
          <option value="fontsize-12">12px</option>
          <option value="fontsize-14">14px</option>
          <option value="fontsize-16">16px</option>
        </select>
      </div>
    </div>    

    {/* CONTENT */}
    <div className='content-wrapper mt-3'>

        <div className='table-wrapper'>
          {/* TABLE */}
          <table className={`table ${fontSize ? fontSize: " "}`} >
              <thead>
                <tr>
                  <th onClick={() => setShowStatusSelect(!showStatusSelect)} className='table-header'>Status <FontAwesomeIcon icon={faSortDown} className='' title="Sort Status" style={{ marginBottom: "0.2em" }}  />
                  {showStatusSelect && (
                        <div
                          ref={statusSelectRef}
                          className="table-header-select"
                        >
                          <div
                            className='table-header-select-option'
                            onClick={() => handleStatusSelect('all')}
                          >
                            All
                          </div>
                          {uniqueStatus.map((status) => (
                            <div
                              key={status}
                              className='table-header-select-option'
                              onClick={() => handleStatusSelect(status)}
                            >
                              <div className='d-flex justify-content-between'>
                                {status} 
                                {status === "Paid" ? <FontAwesomeIcon icon={faCircle} className='status-green'/> : status === "Returned" ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : status === "None" ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </th>
                  <th onClick={() => setShowSearchOrderuuid(true)} className='table-header'>OrderUuid <FontAwesomeIcon icon={faMagnifyingGlass} className={`${searchString !== "" ? "table-header-icoon-magnifyingglas" : ""}`} /> 
                    {showSearchOrderuuid && (
                          <div
                            ref={orderuuidSearchRef}
                            className=""
                          > 
                              <input 
                                autoFocus
                                className="table-header-search" 
                                value={searchString}
                                onChange={(e) => handleOrderuuidSearch(e.target.value)}
                                placeholder=" Search.."
                                >
                              </input>
                              {searchString && (
                              <button 
                                title="Clear Search"
                                className='close-searchbox-button'
                                onClick={() => setSearchString("")}
                              >
                                &times;
                            </button>
                            )}
                          </div>
                        )}
                  </th>
                  <th className='table-header'>Subject</th>
                  <th onClick={() => setShowPortalSelect(!showPortalSelect)} className='table-header'>Portal <FontAwesomeIcon icon={faSortDown} className='table-header' title="Sort Portal" style={{ marginBottom: "0.2em" }} />
                      {showPortalSelect && (
                        <div
                          ref={portalSelectRef}
                          className="table-header-select"
                        >
                          <div
                            className='table-header-select-option'
                            onClick={() => handlePortalSelect('all')}
                          >
                            All
                          </div>
                          {uniquePortals.map((portal) => (
                            <div
                              key={portal}
                              className='table-header-select-option'
                              onClick={() => handlePortalSelect(portal)}
                            >
                              {getPortalName(portal)}
                            </div>
                          ))}
                        </div>
                      )}
                  </th>
                  <th onClick={() => sortTable("inserted")} className='table-header'>Inserted <FontAwesomeIcon icon={faSort} className='' title="Sort Inserted" /></th>
                  <th onClick={() => setShowOriginatingSelect(!showOriginatingSelect)} className='table-header'>Originating <FontAwesomeIcon icon={faSortDown} className='table-header' title="Sort Portal" style={{ marginBottom: "0.2em" }} />
                    {showOriginatingSelect && (
                          <div
                            ref={originatingSelectRef}
                            className="table-header-select"
                          >
                            <div
                              className='table-header-select-option'
                              onClick={() => handleOriginatingSelect('all')}
                            >
                              All
                            </div>
                            {uniqueOriginatingArray && uniqueOriginatingArray.map((originating) => (
                              <div
                                key={originating}
                                className='table-header-select-option'
                                onClick={() => handleOriginatingSelect(originating)}
                              >
                                {getOriginatingPrefix(originating)}
                              </div>
                            ))}
                          </div>
                        )}
                  </th>
                  <th>Netlife</th>
                  <th>PicR.</th>
                  <th>External</th>
                  <th onClick={() => sortTable("flag")} className='table-header'>Flag <FontAwesomeIcon icon={faSort} className='' title="Sort Flagged" /></th>
                </tr>
              </thead>
              <tbody>
                  {loading ? (
                    <tr  className="spinner-container">
                      <Spinner />
                    </tr>
                  ) : data.length > 0 ? (
                      (searchString !== "" ? searchData : data).map((item: any) => (
                          <tr className={`table-row ${markRowGreen.includes(item.orderuuid) ? "markasgreen-row" : selectedData.some(i => i.orderuuid === item.orderuuid) ? "selected-row" : ""}`} key={item.orderuuid}
                              onClick={(e) => {
                                const target = e.target as HTMLTableCellElement; 
                                if (target.cellIndex < 6) {
                                  addRow(item); 
                                }
                              }}>
                              <td >
                                {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' title="Paid" /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' title="Returned" /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' title="None" /> : "-"}
                              </td>
                              <td title={item.orderuuid}>{item.orderuuid}</td>
                              <td title={item.subjectname}>{item.subjectname.length > 10 ? item.subjectname.substring(0, 10) + '...' : item.subjectname}</td>
                              <td title={getPortalName(item.portaluuid)}>{getPortalName(item.portaluuid)}</td>
                          
                              <td>
                                {item.inserted && (() => {
                                  const date = new Date(item.inserted);
                                  const day = String(date.getDate()).padStart(2, '0'); 
                                  const month = String(date.getMonth() + 1).padStart(2, '0'); 
                                  return `${day}/${month}`; 
                                })()}
                              </td>

                              <td>{getOriginatingPrefix(item.originating)}</td>
                              {/* <td className='table-button' title='To Netlife' onClick={() => openNetlife(item)}><button className='table-button'><FontAwesomeIcon icon={faN} title="To Netlife" className='table-icon' /></button></td> */}
                              <td className="" title="To Netlife">
                                <a
                                  href={`https://${getPortalUrl(item.portaluuid)}/admin/portal/orders/order.php?uuid=${item.orderuuid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="table-button a-tag-button"
                                >
                                  <FontAwesomeIcon icon={faN} title="To Netlife" className="table-icon" />
                                </a>
                              </td>
                              {/* <td className='table-button' title='To Pic Returns' onClick={() => openPicReturn(item)}><button className='table-button'><FontAwesomeIcon icon={faCameraRetro} title="To Pic Returns" className='table-icon'  /></button></td> */}
                              <td className="" title="To Pic Returns">
                                <a
                                  href={`https://backend.expressbild.org/index.php/net/returns/load_order/${item.orderuuid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="table-button a-tag-button"
                                >
                                  <FontAwesomeIcon icon={faCameraRetro} title="To Pic Returns" className='table-icon'  />
                                </a>
                              </td>
                              <td className='table-button' title='External' onClick={() => runExternal(item)}><button className='table-button '><FontAwesomeIcon icon={faSquareUpRight} title="External" className='table-icon' /></button></td>
                              {/* <td className='table-button' title='Flag'><button className='table-button table-button-flag'><FontAwesomeIcon icon={faFlag} title="Flag" className='table-icon'  /></button></td> */}
                              <td className={`${item.pol_flag ? "flagged-td": "table-button"}`} onClick={!item.pol_flag ? () => runFlagSingleOrder(item) : undefined}> {item.pol_flag ? <FontAwesomeIcon icon={faFlag} title="Flagged Order" className='table-icon table-icon-flag'  /> : <button  className='table-button table-button-flag'><FontAwesomeIcon icon={faFlag} title="Flag" className='table-icon'  /></button>} </td>
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
                <h6>Amount of orders: {searchString !== "" ? searchData.length : data.length}</h6>
                <h6><FontAwesomeIcon icon={faFlag} title="Flag" className='table-icon-flag' /> {flaggedOrders.length}</h6>
              </div>
            </div>
        </div>

        <div style={{ display: "grid" }}>
          {/* SELECTED DATA BOX */}
          {selectedData.length > 0 && (
          <div className='selected-data-box'>
              <div className='d-flex justify-content-between'>
                <h5><span style={{ textDecoration: "underline" }}>Selected Orders</span> ({selectedData.length}):</h5>
                <FontAwesomeIcon icon={faTimes} title="Remove All Orders" className='delete-selecteddata-button' onClick={() => setSelectedData([])} />
              </div>
              {selectedData && selectedData.map((item) => (
                  <div className='d-flex justify-content-between selected-data-row' key={item.orderuuid}>
                    <FontAwesomeIcon icon={faTimes} title="Remove Order" className='delete-selecteddata-button' onClick={() => deleteRow(item)} />
                    <h6 className='mx-3'>{item.orderuuid.length > 15 ? item.orderuuid.substring(0,15) + "..." : item.orderuuid.length}</h6>
                    <h6>{getPortalName(item.portaluuid)}</h6>
                    <h6 className='mx-3'>{item.inserted && (() => {
                          const date = new Date(item.inserted);
                          const day = String(date.getDate()).padStart(2, '0'); 
                          const month = String(date.getMonth() + 1).padStart(2, '0'); 
                          return `${day}/${month}`; 
                        })()}
                    </h6>
                    {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                  </div>
                ))}
              {/* <h6 className='delete-all-button' title='Remove All Orders' onClick={() => deleteAll()}>Remove All</h6> */}
              <hr className='my-4' style={{border: "0.5px solid rgba(255, 255, 255, 0.1)"}}></hr>
              <div>
                <button className='button mr-1' title='Cancel orders' onClick={() => runCancel()}>Cancel All</button>
                <button className='button mr-1' title='Post orders' onClick={() => runPost()}>Post All</button>
                <button className='button mr-1' title='Flag orders' onClick={() => runFlag()}>Flag All</button>
                <button className='button' title='External orders' onClick={() => runExternalMultpleOrders()}>External All</button>
              </div>
          </div>
          )}

          {/* LOGS CONTENT */}
          <div className='log-wrapper'>
            {/* LOG BUTTONS */}
            <div className='d-flex log-button-box'>
              {flagLog.length > 0 && (
                <div>
                  <button title='Flag Log' className={`log-button ${showFlagLog ? 'active-log-button' : ""}`} onClick={() => { setShowFlagLog(!showFlagLog); setShowExternalLog(false); setShowCancelLog(false); setShowPostLog(false); }} > {showFlagLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} Flag Log</button>
                </div>
                )}
                {externalLog.length > 0 && (
                <div>
                  <button title='External Log' className={`log-button ${showExternalLog ? 'active-log-button' : ""}`} onClick={() => { setShowExternalLog(!showExternalLog); setShowFlagLog(false); setShowCancelLog(false); setShowPostLog(false); }}> {showExternalLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} External Log</button>
                </div>
                )}
                {cancelLog.length > 0 && (
                <div>
                  <button title='Cancel Log' className={`log-button ${showCancelLog ? 'active-log-button' : ""}`} onClick={() => { setShowCancelLog(!showCancelLog); setShowFlagLog(false); setShowExternalLog(false); setShowPostLog(false); }}> {showCancelLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} Cancel Log</button>
                </div>
                )}
                {postLog.length > 0 && (
                <div>
                  <button title='Post Log' className={`log-button ${showPostLog ? 'active-log-button' : ""}`} onClick={() => { setShowPostLog(!showPostLog); setShowFlagLog(false); setShowExternalLog(false); setShowCancelLog(false); }}> {showPostLog ? <FontAwesomeIcon icon={faAngleUp} title="Hide Log" /> : <FontAwesomeIcon icon={faAngleDown} title="Show Log" />} Post Log</button>
                </div>
                )}
            </div>

            <div className='log-box'>
              {/* FLAG LOG */}
              {showFlagLog ? (
                <div className='log'>
                  <h5>Flag Log:</h5>
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>Orderuuid</th>
                          <th>Net_Orders</th>
                          <th>Code</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flagLog.map((item) => (
                          <tr key={item.updated}>
                            <td>{item.updated || 'N/A'}</td>
                            <td>{item.message || 'N/A'}</td>
                            <td>{item.statuscode || 'N/A'}</td>
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
                  <div className='log'>
                    <h5>External Log:</h5>
                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Orderuuid</th>
                            <th>Net_Orders</th>
                            <th>Code</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {externalLog.map((item) => (
                            <tr key={item.updated}>
                              <td>{item.updated || 'N/A'}</td>
                              <td>{item.message || 'N/A'}</td>
                              <td>{item.statuscode || 'N/A'}</td>
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
                  <div className='log'>
                    <h5>Cancel Log:</h5>
                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Orderuuid</th>
                            <th>Netlife</th>
                            <th>Net_Orders</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cancelLog.map((item) => (
                            <tr key={item.cancelResponse?.updated || 'N/A'}>
                              <td>{item.cancelResponse?.updated || 'N/A'}</td>
                              <td>{item.statusResponse || 'N/A'}</td>
                              <td>{item.cancelResponse?.message || 'N/A'}</td>
                              <td>{item.cancelResponse?.timestamp || 'N/A'}</td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                  )}
                </div>
              ) : showPostLog ? (
                <div>
                  {/* POST LOG */}
                  {showPostLog && (
                  <div className='log'>
                    <h5>Post Log:</h5>
                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Orderuuid</th>
                            <th>Netlife</th>
                            <th>Net_Orders</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {postLog.map((item) => (
                            <tr key={item.postResponse?.updated || 'N/A'}>
                              <td>{item.postResponse?.updated || 'N/A'}</td>
                              <td>{item.statusResponse || 'N/A'}</td>
                              <td>{item.postResponse?.message || 'N/A'}</td>
                              <td>{item.postResponse?.timestamp || 'N/A'}</td>
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

      {loadingMethod &&(        
        <SpinnerMethod />       
       )}
        
      <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // light, dark, colored
                style={{ width: "400px", fontSize: "1rem" }}
                // toastClassName="custom-toast"
                // bodyClassName="custom-toast-body"
            />
  </div>
  );
};

export default Index;