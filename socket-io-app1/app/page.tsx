"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

// const socket = io("http://localhost:3001/");
const socket = io("https://global-chat-uxv7.onrender.com/");

type Message<T extends "text" | "image"> = {
  from: string;
  type: T;
} & (T extends "text"
  ? {
      text: {
        message: string;
      };
    }
  : {
      image: {
        uri: string;
        message?: string;
      };
    });

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [currentImages, setCurrentImages] = useState<Array<string>>([]);
  const [refresh, setRefresh] = useState<number>(0);

  function handleSubmit(event) {
    console.log(currentImages);

    event.preventDefault();

    const newMessage = {
      body: message,
      from: "Me",
      type: "text",
    };

    setMessage("");

    setMessages([...messages, newMessage]);
    socket.emit("message", message);
  }

  useEffect(() => {
    socket.on("message", recivedMessage);

    return () => {
      socket.off("message", recivedMessage);
    };
  }, []);

  function recivedMessage(message) {
    setMessages((state) => [...state, message]);
  }

  return (
    <div className="bg-zinc-700 flex flex-col h-screen py-1.5 px-2.5">
      <div className="text-white overflow-auto">
        {messages.map((message, index) => (
          <div
            className={` w-2/3 rounded-xl mt-1.5
          ${message.from === "Me" ? " bg-blue-600 ml-auto" : "bg-black/70"}
          `}
            key={index}
          >
            <span className="py-1 px-2 relative break-all flex flex-col">
              <span className=" font-extrabold italic">{message.from}</span>
              <span className=" ml-auto text-sm">{message.body}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex-grow flex mt-3">
        {isLoadingImages ? (
          <div className="flex items-center justify-center">
            {/* <Spinner size="lg" /> */}
            Cargando...
          </div>
        ) : (
          <div className="flex gap-3 overflow-auto mt-1.5 px-4">
            {currentImages.map((aImage, index) => (
              <img
                className="size-36 object-cover rounded-md my-1.5"
                key={index}
                src={aImage}
                alt="..."
              />
            ))}
          </div>
        )}
        <form className=" w-full flex self-end" onSubmit={handleSubmit}>
          <input
            value={message}
            className="rounded-md w-full"
            type="text"
            placeholder="To send here..."
            onChange={(event) => setMessage(event.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              setIsLoadingImages(true);

              const { files } = event.target;

              if (!files?.length) return setIsLoadingImages(false);

              for (const iterator of Array.from(files)) {
                const readImage = new FileReader();
                readImage.readAsDataURL(iterator);
                readImage.onload = (event) => {
                  currentImages.push(String(event.target?.result));
                  setCurrentImages(currentImages);
                };
              }
              setRefresh(refresh + 1);
              setTimeout(() => {
                setRefresh(refresh + 1.81);
                setIsLoadingImages(false);
              }, 891);
            }}
          />
          <button className=" text-white px-1.5">Send</button>
          <img className=" h-12" src="/MatiMati_crop.jpg" alt="" />
        </form>
      </div>

      <div className=" mt-2 flex flex-col justify-center items-center">
        <div className=" text-4xl text-white italic my-3.5">
          Wilson's global chat
        </div>
        {/* <img className=" w-1/3 rounded-full" src="/MatiMati_crop.jpg" alt="" /> */}
      </div>
    </div>
  );
}
