"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();

    const signAndSend = useCallback(async () => {
        if (!publicKey || !signMessage) return;
        const message = new TextEncoder().encode("Sign into mechanical turks");
        const signature = await signMessage(message);
        const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
            signature,
            publicKey: publicKey.toString()
        });
        localStorage.setItem("token", response.data.token);
    }, [publicKey, signMessage]);

    useEffect(() => {
        signAndSend();
    }, [signAndSend]);

    return (
        <div className="flex justify-between border-b pb-2 pt-2">
            <div className="text-2xl pl-4 flex justify-center pt-3">
                Labelify
            </div>
            <div className="text-xl pr-4 pb-2">
                {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
            </div>
        </div>
    );
};
