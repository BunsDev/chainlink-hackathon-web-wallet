// import { EventEmitter } from "eventemitter3";
// import { BackgroundProviderInterface, OnMessageResponse, ProviderRPCRequest, RequestClass } from "./types";

// export class EthereumProvider
//     extends EventEmitter
//     implements BackgroundProviderInterface {
//     requestProvider: RequestClass;
//     middlewares: MiddlewareFunction[] = [];
//     KeyRing: PublicKeyRing;
//     UIRoutes = UIRoutes;
//     toWindow: (message: string) => void;
//     constructor(
//         toWindow: (message: string) => void,
//     ) {
//         super();
//         this.toWindow = toWindow;
//         this.setMiddleWares();
//         this.requestProvider = getRequestProvider(network.node, this.middlewares);
//         this.requestProvider.on("notification", (notif: any) => {
//             this.sendNotification(JSON.stringify(notif));
//         });
//         this.KeyRing = new PublicKeyRing();
//     }
//     private setMiddleWares(): void {
//         this.middlewares = Middlewares.map((mw) => mw.bind(this));
//     }
//     setRequestProvider(network: BaseNetwork): void {
//         this.requestProvider.changeNetwork(network.node);
//     }
//     // async isPersistentEvent(request: ProviderRPCRequest): Promise<boolean> {
//     //     if (request.method === "eth_subscribe") return true;
//     //     return false;
//     // }
//     // async sendNotification(notif: string): Promise<void> {
//     //     return this.toWindow(notif);
//     // }
//     request(request: ProviderRPCRequest): Promise<OnMessageResponse> {
//         return this.requestProvider
//             .request(request)
//             .then((res) => {
//                 return {
//                     result: JSON.stringify(res),
//                 };
//             })
//             .catch((e: any) => {
//                 return {
//                     error: JSON.stringify(e.message),
//                 };
//             });
//     }
//     getUIPath(page: string): string {
//         return GetUIPath(page, this.namespace);
//     }
// }
// export default EthereumProvider;
