import React, { useContext, useState } from "react"
import { Route, Routes, useNavigate } from "react-router-dom";
import { Mnemonics } from "./Mnemonics";

export const InitializeWallet: React.FC = () => {
    const navigate = useNavigate();

    return (
        // TODO: create subroutes here
        <Mnemonics />
    );
}