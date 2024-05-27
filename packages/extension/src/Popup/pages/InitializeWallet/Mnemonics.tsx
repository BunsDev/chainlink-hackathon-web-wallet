import React, { useContext, useState } from "react"
import { useNavigate } from "react-router-dom";

export const Mnemonics: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-2/5">
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    // TODO: move to subroutes
                    onClick={() => navigate('/create-wallet')}
                >
                    Create new Mnemonic
                </button>

                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    // TODO: move to subroutes
                    onClick={() => navigate('/login-page')}
                >
                    Use existing Mnemonic
                </button>

            </div>
        </div>
    );
}