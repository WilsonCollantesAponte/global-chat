"use client";
import { io } from "socket.io-client";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";

const socket = io("http://localhost:3001/");

type TextMessage = {
  from: string;
  type: "text";
  text: {
    message: string;
  };
};

type ImageMessage = {
  from: string;
  type: "image";
  image: {
    uri: string;
    message?: string;
  };
};

// Usar la unión de tipos para Message
type Message = TextMessage | ImageMessage;

export default function Home() {
  const [message, setMessage] = useState("");
  const [currentImages, setCurrentImages] = useState<Array<string>>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentImages.length) {
      const newMessage: ImageMessage = {
        from: "Me",
        type: "image",
        image: {
          uri: currentImages[0],
          message,
        },
      };

      setMessages([...messages, newMessage]);
      socket.emit("message", newMessage); // Emitir el mensaje
    } else if (message.trim()) {
      const newMessage: TextMessage = {
        from: "Me",
        type: "text",
        text: {
          message,
        },
      };

      setMessages([...messages, newMessage]);
      socket.emit("message", newMessage); // Emitir el mensaje
    }

    setMessage("");
    setCurrentImages([]); // Limpiar imágenes después de enviar
  }

  useEffect(() => {
    socket.on("message", recivedMessage);

    return () => {
      socket.off("message", recivedMessage);
    };
  }, []);

  function recivedMessage(message: Message) {
    // console.log("Mensaje recibido: ", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setIsLoadingImages(true);

    const { files } = event.target;

    if (!files?.length) return setIsLoadingImages(false);

    const updatedImages: string[] = [];
    let loadedImages = 0;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        if (event.target?.result) {
          updatedImages.push(String(event.target.result));
          loadedImages++;
          if (loadedImages === files.length) {
            setCurrentImages(updatedImages);
            setIsLoadingImages(false);
          }
        }
      };
    }
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
                  <span className="h-24 w-6">{message.text.message}</span>
                </div>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="fixed w-full bottom-0">
        {isLoadingImages ? (
          <div className="flex items-center justify-center">Cargando...</div>
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
            onChange={handleFileChange}
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
      </div>
    </div>
  );
}
