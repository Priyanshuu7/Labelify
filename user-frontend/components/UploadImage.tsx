"use client"
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react";
import Image from "next/image";

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);

    async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        setUploading(true);
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
                headers: {
                    "Authorization": localStorage.getItem("token") || ""
                }
            });

            const { preSignedUrl, fields } = response.data;
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append("file", file);

            await fetch(preSignedUrl, {
                method: "POST",
                body: formData,
            });

            onImageAdded(`${CLOUDFRONT_URL}/${fields.key}`);
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    }

    if (image) {
        return <Image className="p-2 rounded" src={image} width={384} height={384} alt="Uploaded image" />;
    }

    return (
        <div className="w-40 h-40 rounded border text-2xl cursor-pointer relative">
            {uploading ? (
                <div className="h-full flex justify-center items-center text-sm">Loading...</div>
            ) : (
                <>
                    <div className="h-full flex justify-center items-center">+</div>
                    <input
                        type="file"
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={onFileSelect}
                    />
                </>
            )}
        </div>
    );
}
