"use client";
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const Upload = () => {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [txSignature, setTxSignature] = useState("");
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    async function onSubmit() {
        const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
            options: images.map(image => ({ imageUrl: image })),
            title,
            signature: txSignature
        }, {
            headers: {
                "Authorization": localStorage.getItem("token") || ""
            }
        });

        router.push(`/task/${response.data.id}`);
    }

    async function makePayment() {
        if (!publicKey) return;
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey("GaVXXi5tKTxrPjEqgqMmNNTiRPMN78xgrn7wRGwDdVFw"),
                lamports: 100000000,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        setTxSignature(signature);
    }

    return (
        <div className="flex justify-center">
            <div className="max-w-screen-lg w-full">
                <div className="text-2xl text-left pt-20 w-full pl-4">Create a task</div>
                <label className="pl-4 block mt-2 text-md font-medium text-gray-900">Task details</label>
                <input onChange={(e) => setTitle(e.target.value)} type="text" className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="What is your task?" required />

                <label className="pl-4 block mt-8 text-md font-medium text-gray-900">Add Images</label>
                <div className="flex justify-center pt-4 flex-wrap gap-2">
                    {images.map((image, idx) => (
                        <UploadImage key={idx} image={image} onImageAdded={() => {}} />
                    ))}
                </div>

                <div className="ml-4 pt-2 flex justify-center">
                    <UploadImage onImageAdded={(imageUrl) => setImages(i => [...i, imageUrl])} />
                </div>

                <div className="flex justify-center">
                    <button onClick={txSignature ? onSubmit : makePayment} type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 rounded-full text-sm px-5 py-2.5">
                        {txSignature ? "Submit Task" : "Pay 0.1 SOL"}
                    </button>
                </div>
            </div>
        </div>
    );
};
