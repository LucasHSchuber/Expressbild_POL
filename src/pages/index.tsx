// import React, { useState, useEffect } from 'react';
import { useState, useEffect, useRef } from 'react';

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
// import API_CONFIG from '../../apiConfig.js'; 

//import interfaces
import { DataArray, FlagLogEntry, ExternalLogEntry, CancelLogEntry, PostLogEntry,  } from '../interfaces/interfaces.js';



const Index = () => {

  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingmethod] = useState(false);
  const [data, setData] = useState<DataArray[]>([]);
  const [searchData, setSearchData] = useState<DataArray[]>([]);
  const [selectedData, setSelectedData] = useState<DataArray[]>([]);

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
  // sort column
  const [sortColumn, setSortColumn] = useState<string>(''); 
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); 
  const [filteredData, setFilteredData] = useState(data);
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
          const location = useLocation();
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
        setLoading(true);
          try {
            const response = await axios.get<{ data: DataArray[] }>(`${ENV.API_URL}api/alldata`);
            console.log(response.data);
            if (response.status === 200) {
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
    }
      useEffect(() => {
          fetchData();
      }, []);


      // ---------- GETTING ORGIINATING PREFIX (by splitting strings and returning first value in array) -------------

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



      //  ------------------------------------------- METHODS -------------------------------------------



      //  --------------- RUN FLAG METHOD (on multiple orders) --------------

      const runFlag = async () => {
        setLoadingmethod(true);
        console.log("Flag method triggered...");
        const confirm = window.confirm(`Are you sure you want to FLAG ${selectedData.length} orders?`);
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
              console.log('All orders flagged successfully:', responses);
              const flagLog = responses.map(data => data.data);
              toast.success("Successfully flagged all orders");
              setFlagLog(flagLog);
              setShowFlagLog(true);
              setShowExternalLog(false);
              setShowCancelLog(false);
              setShowPostLog(false);
              fetchData();
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
        setLoadingmethod(true);
        console.log("runFlagSingleOrder method triggered...");
        console.log('item', item);
        const confirm = window.confirm(`Are you sure you want to FLAG the order`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
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
              toast.success("Successfully flagged the order");
              setFlagLog((prevFlagLog) => [...prevFlagLog, response.data]);
              setShowFlagLog(true);
              setShowExternalLog(false);
              setShowCancelLog(false);
              setShowPostLog(false);
              setLoadingmethod(false);
              fetchData();
          } catch (error) {
              console.error('Error flagging order:', error);
              toast.error('An error occurred while flagging the order');
              setLoadingmethod(false);
          }
        }
      }



      //  --------------- RUN EXTERNAL METHOD --------------

      const runExternal = async (item: DataArray) => {
        setLoadingmethod(true);
        console.log("EXTERNAL method triggered...");
        const confirm = window.confirm(`Are you sure you want to run EXTERNAL on order: ${item.orderuuid}?`);
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
              console.log('All orders flagged successfully:', response);
              toast.success("Successfully ran external on order");
              setExternalLog((prevExternalLog) => [...prevExternalLog, response.data]);
              setShowExternalLog(true);
              setShowCancelLog(false);
              setShowFlagLog(false);
              setShowPostLog(false);
              // fetchData();
              setLoadingmethod(false);
          } catch (error) {
              console.error('Error when running external on orders:', error);
              toast.error('An error occurred while running external on order');
              setLoadingmethod(false);
          }
      }
      }


      //  --------------- RUN CANCEL METHOD --------------

      const runCancel = async () => {
        setLoadingmethod(true);
        console.log("Cancel method triggered...");
        const confirm = window.confirm(`Are you sure you want to CANCEL ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
          // Update net_orders
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(async (order) => {
                  console.log('order', order.orderuuid);
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
                   let order_uuid = "205e956e-ee7c-43e4-8dce-cd3c9700333a";
                   console.log('order.orderuuid', order.orderuuid);
                   try {
                    console.log('sending orderuuid to netlife api with status 99: ');
                    const statusResponse = await axios.post(
                      '/api/index.php/rest/netlife/orderstatus', {
                        // orderuuid: order.orderuuid,
                        orderuuid: order_uuid, // change to order.orderuiid when in production mode
                        status: 99,
                        portaluuid: order.portaluuid
                      } , {
                        headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    console.log(`Order StatusResponse: for uuid ${order.orderuuid}`, statusResponse);
                    console.log(`Order StatusResponse.data.result for uuid ${order.orderuuid}`, statusResponse.data.result);
                    
                    return { cancelResponse: cancelResponse, statusResponse: statusResponse.data };
                  } catch (error) {
                    console.error('Error fetching news:', error);
                  }
                    
              }));
              // Handle responses if necessary
              console.log('All orders cancelled successfully:', responses);
              const cancelLogArray: CancelLogEntry[] = [];
              responses.forEach((element) => {
                  console.log('cancelresponse', element?.cancelResponse);
                  console.log('statusResponse', element?.statusResponse);

                  const logEntry: CancelLogEntry = {
                    cancelResponse: element?.cancelResponse ? {
                      message: element.cancelResponse.data.message,
                      statuscode: element.cancelResponse.data.statuscode,
                      orderuuid: element.cancelResponse.data.updated,
                      timestamp: element.cancelResponse.data.timestamp,
                      updated: element.cancelResponse.data.updated
                    } : undefined,
                    statusResponse: '', 
                  };

                  if (element?.statusResponse?.result.result === "OK") {
                    console.log('statusresponse', element?.statusResponse.result);
                    logEntry.statusResponse = element?.statusResponse.result.result || "";
                  } else {
                    console.log('statusresponse', element?.statusResponse?.result.message);
                    logEntry.statusResponse = element?.statusResponse?.result.message || "";
                  }
                  cancelLogArray.push(logEntry);
                  console.log('logEntry', logEntry);
                  console.log('cancelLogArray', cancelLogArray);
                  setCancelLog(cancelLogArray);
                  setShowCancelLog(true);
                  setShowExternalLog(false);
                  setShowFlagLog(false);
                  setShowPostLog(false);
                  fetchData();
                  setLoadingmethod(false);
              });

              // Check if any data in response is NOT FOUND from netlifes API
              let validateResponse = "";
              cancelLogArray.forEach(element => { 
                console.log(element.statusResponse);
                if (element.statusResponse === "Not found" || element.statusResponse !== "OK"){
                  validateResponse = "true";
                }
              });

              if (validateResponse === "true"){
                toast.error("Not all orders was updated in Netlife. Check 'Cancel Log' for more info");
              }  else {
                toast.success("Successfully cancelled all orders");
              }
          } catch (error) {
              console.error('Error cancelling orders:', error);
              toast.error('An error occurred while cancelling the orders');
              setLoadingmethod(false);
          }
        }
      }




      //  --------------- RUN POST METHOD --------------

      const runPost = async () => {
        setLoadingmethod(true);
        console.log("Post method triggered...");
        const confirm = window.confirm(`Are you sure you want to POST ${selectedData.length} orders?`);
        if (!confirm){
          return;
        } else {
          console.log('triggered!');
          // Update net_orders
          try {
              // Use Promise.all to handle multiple requests concurrently
              const responses = await Promise.all(selectedData.map(async (order) => {
                  console.log('order', order.orderuuid);
                  const postResponse = await axios.post(`${ENV.API_URL}api/post`, {
                      orderuuid: order.orderuuid
                  }, {
                      headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                      }
                  });
                  console.log(`postResponse for uuid ${order.orderuuid}`, postResponse);
                   // Update netlife through REST API
                   let order_uuid = "205e956e-ee7c-43e4-8dce-cd3c9700333a";
                   console.log('order.orderuuid', order.orderuuid);
                   try {
                    console.log('sending orderuuid to netlife api with status 9: ');
                    const statusResponse = await axios.post(
                      '/api/index.php/rest/netlife/orderstatus', {
                        // orderuuid: order.orderuuid,
                        orderuuid: order_uuid, // change to order.orderuiid when in production mode
                        status: 9,
                        portaluuid: order.portaluuid
                      } , {
                        headers: {
                          Authorization: `Admin ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    console.log(`Order StatusResponse: for uuid ${order.orderuuid}`, statusResponse);
                    console.log(`Order StatusResponse.data.result for uuid ${order.orderuuid}`, statusResponse.data.result);
                    
                    return { postResponse: postResponse, statusResponse: statusResponse.data };
                  } catch (error) {
                    console.error('Error fetching news:', error);
                  }
                    
              }));
              // Handle responses if necessary
              console.log('All orders posted successfully:', responses);
              const postLogArray: PostLogEntry[] = [];
              responses.forEach((element) => {
                  console.log('postResponse', element?.postResponse);
                  console.log('statusResponse', element?.statusResponse);

                  const logEntry: PostLogEntry = {
                    postResponse: element?.postResponse ? {
                      message: element.postResponse.data.message,
                      statuscode: element.postResponse.data.statuscode,
                      orderuuid: element.postResponse.data.updated,
                      timestamp: element.postResponse.data.timestamp,
                      updated: element.postResponse.data.updated
                    } : undefined,
                    statusResponse: '', 
                  };

                  if (element?.statusResponse?.result.result === "OK") {
                    console.log('statusresponse', element?.statusResponse.result);
                    logEntry.statusResponse = element?.statusResponse.result.result || "";
                  } else {
                    console.log('statusresponse', element?.statusResponse?.result.message);
                    logEntry.statusResponse = element?.statusResponse?.result.message || "";
                  }
                  postLogArray.push(logEntry);
                  console.log('logEntry', logEntry);
                  console.log('cancelLogArray', postLogArray);
                  setPostLog(postLogArray);
                  setShowPostLog(true);
                  setShowExternalLog(false);
                  setShowFlagLog(false);
                  setShowCancelLog(false);
                  fetchData();
                  setLoadingmethod(false);
              });

              // Check if any data in response is NOT FOUND from netlifes API
              let validateResponse = "";
              postLogArray.forEach(element => { 
                console.log(element.statusResponse);
                if (element.statusResponse === "Not found" || element.statusResponse !== "OK"){
                  validateResponse = "true";
                }
              });

              if (validateResponse === "true"){
                toast.error("Not all orders was updated in Netlife. Check 'Post Log' for more info");
              }  else {
                toast.success("Successfully posted all orders");
              }
              
              // setCancelLog(cancelLog);
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
        setSortColumn(column);
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



      const [fontSize, setFontSize] = useState<string>("fontsize-12");

      const changeFontSize = (fontSize: string) => {
        setFontSize(fontSize);
        console.log('fontsize', fontSize);
      };

  return (
  <div className='wrapper'>

    {/* HEADER */}
    <div className='header-box'>
        <h6>POL - Proof Of Life</h6>
        <p>Your system to handle orders</p>
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
                                placeholder="Search.."
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
                      (searchString !== "" ? searchData : data).map((item) => (
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
                              <td title={getPortalName(item.portaluuid)}>{getPortalName(item.portaluuid)}</td>
                              <td>{new Date(item.inserted).toLocaleString().substring(5,10)}</td>
                              <td>{getOriginatingPrefix(item.originating)}</td>
                              <td className='table-button' title='To Netlife' onClick={() => openNetlife(item)}><button className='table-button'><FontAwesomeIcon icon={faN} title="To Netlife" className='table-icon' /></button></td>
                              <td className='table-button' title='To Pic Returns' onClick={() => openPicReturn(item)}><button className='table-button'><FontAwesomeIcon icon={faCameraRetro} title="To Pic Returns" className='table-icon'  /></button></td>
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
                    <h6 className='mx-3'>{new Date(item.inserted).toLocaleString().substring(5,10)}</h6>
                    {item.paid > 0 ? <FontAwesomeIcon icon={faCircle} className='status-green' /> : item.cnt > 0 ? <FontAwesomeIcon icon={faCircle} className='status-yellow' /> : (item.cnt === null || item.cnt === 0 || item.paid === 0)  ? <FontAwesomeIcon icon={faCircle} className='status-red' /> : "-"}
                  </div>
                ))}
              {/* <h6 className='delete-all-button' title='Remove All Orders' onClick={() => deleteAll()}>Remove All</h6> */}
              <hr className='my-4' style={{border: "0.5px solid rgba(255, 255, 255, 0.1)"}}></hr>
              <div>
                <button className='button' title='Cancel orders' onClick={() => runCancel()}>Cancel {selectedData.length} orders</button>
                <button className='button mx-2' title='Post orders' onClick={() => runPost()}>Post {selectedData.length} orders</button>
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
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // light, dark, or colored
                style={{ width: "400px", fontSize: "1rem" }}
                // toastClassName="custom-toast"
                // bodyClassName="custom-toast-body"
            />
  </div>
  );
};

export default Index;