
export interface DataArray {
    cnt: number,
    inserted: string
    orderuuid: string,
    originating: string,
    paid: number,
    portaluuid: string,
    updated: string
  }
  export interface FlagLogEntry {
    message: string,
    updated: string,
    timestamp: string,
    statuscode: number
  }
  export interface ExternalLogEntry {
    message: string,
    updated: string,
    timestamp: string,
    statuscode: number
  }
  export interface CancelLogEntry {
    cancelResponse: {
      message: string;
      statuscode: number;
      orderuuid: string;
      timestamp: string;
      updated: string;
    } | undefined;    
    statusResponse: string;
  }
  export interface PostLogEntry {
    postResponse: {
      message: string;
      statuscode: number;
      orderuuid: string;
      timestamp: string;
      updated: string;
    } | undefined;    
    statusResponse: string;
  }