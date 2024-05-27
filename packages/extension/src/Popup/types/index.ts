export type PromisePageProps<TResolve> = {
    runtimeListen?: boolean;
    onRejectCallback?: (err: any) => void
    onResolveCallback?: (value: TResolve) => void
}
