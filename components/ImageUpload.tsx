"use client";

import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";
import ImageKit from "imagekit";
import config from "@/lib/config";
import {useRef,useState} from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast"



const {
  env: {
    imagekit: { publicKey, privateKey, urlEndpoint },
  },
} = config;

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}:${errorText}`,
      );
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed : ${error.message}`);
  }
};

import React from "react";

const ImageUpload = ({onFileChange}:{onFileChange :(filePath:string)=>void} ) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const onError = (error:any) => {
    console.log(error);
    // @ts-ignore
    toast({
      title: "Image upload failed",
      description : ` Your image could not be uploaded.Please try again`
      variant :"destructive",
    });

  };
  const onSuccess = (res:any ) => {
    setFile(res);
    onFileChange(res.filePath);
    toast({
      title: "Image upload successfull",
      description : `${res.filePath} uploaded successfully`
    });

  };

  return (
    <ImageKitProvider
      publicKey={publickey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="test-upload.png"
      />
      <button className="upload-btn" onClick={(e)=> {
        e.preventDefault();
        if(ikUploadRef.current) {
          ikUploadRef.current?.click();
        }
      }}>

        <Image
          src="/icons/upload.svg"
          alt="Upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100"> Upload a file</p>
        {file && <p className ="upload-filename"{file.name}> {file.name}</p>}
      </button>
      {file && (
          <IKImage
          alt ={file.filePath}
          path={file.filePath}
          width={500}
          height={500}

          />

      )}
    </ImageKitProvider>
  );
};
export default ImageUpload;
