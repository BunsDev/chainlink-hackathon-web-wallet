import { useState, useEffect } from "react";

export const usePagePromise = <TResult>() => {
    const [{ pagePromise, pagePromiseFunctions }] = useState(
        () => {
            const funcs = {} as {
                reject: (err: any) => void | undefined;
                resolve: (value: TResult) => void | undefined;
            }

            return {
                pagePromiseFunctions: funcs,
                pagePromise: new Promise<TResult>((_resolve, _reject) => {
                    funcs.resolve = _resolve;
                    funcs.reject = _reject;
                })
            }
        });

    return [pagePromise, pagePromiseFunctions] as const;
}