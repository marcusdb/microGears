// Type definitions for microgears v4.0.x
// Project: http://github.com/marcusdb/microgears
// Definitions by: Marcus David Bronstein <https://github.com/marcusdb>
export interface Service {
  name:string;
  async ?:boolean;
  pathname ?:string;
  namespace:string;
}

export interface MetaInformation {
  serviceName:string;
  methodName:string;
  serviceNameSpace:string;
  extra:any;
}

export interface Plugin {
  name:string;
  beforeChain < M extends MetaInformation > (arguments:Array < any >, metaInfo:M):Array < any > ;
  afterChain < T, M extends MetaInformation > (result:T, metaInfo:M):T;
}

export function addService < T extends Service >(service:T):T;

export function addPlugin < T extends Plugin >(plugin:T):void;





