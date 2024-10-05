"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
  const [currentImages, setCurrentImages] = useState<Array<string>>([]);
  const [messages, setMessages] = useState<Message<"image" | "text">[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  function handleSubmit(event) {
    console.log(currentImages);

    event.preventDefault();

    if (currentImages.length) {
      const newMessage: Message<"image"> = {
        from: "Me",
        type: "image",
        image: {
          uri: currentImages[0],
          message,
        },
      };

      setMessages([...messages, newMessage]);
      socket.emit("message", newMessage);
    } else {
      const newMessage: Message<"text"> = {
        from: "Me",
        type: "text",
        text: {
          message,
        },
      };

      setMessages([...messages, newMessage]);
      socket.emit("message", newMessage);
    }

    setMessage("");
  }

  useEffect(() => {
    socket.on("message", recivedMessage);

    return () => {
      socket.off("message", recivedMessage);
    };
  }, []);

  function recivedMessage(message: Message<"image" | "text">) {
    console.log(message);

    setMessages((state) => [...state, message]);
  }

  return (
    <div className="bg-zinc-700 flex flex-col min-h-screen">
      <div className="text-white overflow-auto grow">
        {messages.map((message, index) => (
          <div
            className={`w-2/3 rounded-xl mt-1.5 ${
              message.from === "Me" ? "bg-blue-600 ml-auto" : "bg-black/70"
            }`}
            key={index}
          >
            <span className="py-1 px-2 relative break-all flex flex-col">
              <span className="font-extrabold italic">{message.from}</span>

              {message.type === "image" ? (
                <div>
                  <Image
                    src={message.image.uri}
                    width={120}
                    height={120}
                    alt="..."
                  />
                  <span>{message.image?.message}</span>
                </div>
              ) : (
                <div>
                  <span className="bg-purple-700 h-24 w-6">
                    {message.text?.message}
                  </span>
                </div>
              )}

              {/* <span className="ml-auto text-sm">{message.body}</span> */}
            </span>
          </div>
        ))}
      </div>

      {/* Formulario y área de imágenes */}
      <div className="fixedX w-fullX bottom-0X">
        {/* Imágenes a enviar */}
        {isLoadingImages ? (
          <div className="flex items-center justify-center">
            {/* <Spinner size="lg" /> */}
            Cargando...
          </div>
        ) : currentImages.length > 0 ? (
          <div className="flex gap-3 overflow-auto m-1.5 h-[125px]">
            {currentImages.map((aImage, index) => (
              <Image
                className="object-cover rounded-md my-1.5"
                key={index}
                src={aImage}
                alt="..."
                height={120}
                width={120}
              />
            ))}
          </div>
        ) : null}

        {/* Formulario de envío */}
        <form
          className="flex items-center justify-center"
          onSubmit={handleSubmit}
        >
          <input
            value={message}
            className="rounded-md w-full grow"
            type="text"
            placeholder="Escribe un mensaje..."
            onChange={(event) => setMessage(event.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            // className="ml-2"
            onChange={(event) => {
              setIsLoadingImages(true);

              const { files } = event.target;

              if (!files?.length) return setIsLoadingImages(false);

              const updatedImages = [];
              let loadedImages = 0;

              for (const file of Array.from(files)) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                  updatedImages.push(String(event.target?.result));
                  loadedImages++;
                  if (loadedImages === files.length) {
                    setCurrentImages(updatedImages);
                    setIsLoadingImages(false);
                  }
                };
              }
            }}
          />
          <button className="text-white px-3 py-2 bg-blue-600 rounded-md ml-2">
            Enviar
          </button>
        </form>
      </div>

      <div className="mt-2 flex flex-col justify-center items-center">
        <div className="text-4xl text-white italic my-3.5">
          Wilson's Global Chat
        </div>
        {/* <img className=" w-1/3 rounded-full" src="/MatiMati_crop.jpg" alt="" /> */}
      </div>
    </div>
  );
}
