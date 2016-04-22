// Type definitions for microgears v4.0.0
// Project: http://github.com/marcusdb/microgears
// Definitions by: Marcus David Bronstein <https://github.com/marcusdb>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace microgears {
    export interface Service {
        name:string;
        async?:boolean;
        pathname?:string;
        namespace:string;
    }

    interface MetaInformation {
        serviceName:string;
        methodName:string;
        serviceNameSpace:string;
        extra:any;
    }

    interface Plugin {
        name:string;
        beforeChain<M extends MetaInformation>(arguments:Array<any>, metaInfo:M):Array<any>;
        afterChain<T,M extends MetaInformation>(result:T, metaInfo:M):T;
    }

    function addService<T extends Service>(service:T):T;

    function addPlugin<T extends Plugin>(plugin:T):void;
}

declare module "microgears" {
    export = microgears;
}