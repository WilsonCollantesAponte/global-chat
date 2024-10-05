"use client";

import { io } from "socket.io-client";
import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("http://localhost:3001/");
// const socket = io("https://global-chat-uxv7.onrender.com/");

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

type Message = TextMessage | ImageMessage;

export default function Component() {
  const [message, setMessage] = useState("");
  const [currentImages, setCurrentImages] = useState<Array<string>>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("message", receivedMessage);
    return () => {
      socket.off("message", receivedMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

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
      socket.emit("message", newMessage);
    } else if (message.trim()) {
      const newMessage: TextMessage = {
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
    setCurrentImages([]);
  }

  function receivedMessage(message: Message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setIsLoadingImages(true);
    const { files } = event.target;
    if (!files?.length) return setIsLoadingImages(false);

    const newFiles = Array.from(files);
    const totalImages = currentImages.length + newFiles.length;

    if (totalImages > 5) {
      alert("Sólo puedes subir un máximo de 5 imágenes.");
      setIsLoadingImages(false);
      return;
    }

    const updatedImages: string[] = [];
    let loadedImages = 0;

    for (const file of newFiles) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        if (event.target?.result) {
          updatedImages.push(String(event.target.result));
          loadedImages++;
          if (loadedImages === newFiles.length) {
            setCurrentImages(updatedImages);
            setIsLoadingImages(false);
          }
        }
      };
    }

    // event.target.value=''
  }

  return (
    <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 flex flex-col min-h-screen">
      <div className="text-white overflow-auto grow p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-2/3 rounded-xl p-3 shadow-lg ${
                message.from === "Me" ? "bg-blue-600 ml-auto" : "bg-zinc-700"
              }`}
            >
              <span className="font-extrabold italic mb-2 block">
                {message.from}
              </span>
              {message.type === "image" ? (
                <div className="space-y-2">
                  <Image
                    src={message.image.uri}
                    width={200}
                    height={200}
                    alt="Uploaded image"
                    className="rounded-lg"
                  />
                  {message.image?.message && (
                    <p className="text-sm">{message.image.message}</p>
                  )}
                  <a
                    href={message.image.uri}
                    download={`${message.from}_${index + 1}`}
                    className="text-blue-300 hover:text-blue-500"
                  >
                    Download Image
                  </a>
                </div>
              ) : (
                <p className="break-words">{message.text.message}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-zinc-800 p-4 space-y-4">
        {isLoadingImages ? (
          <div className="flex items-center justify-center text-white">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        ) : currentImages.length > 0 ? (
          <div className="flex gap-3 overflow-auto pb-2">
            {currentImages.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Preview ${index + 1}`}
                height={100}
                width={100}
                className="object-cover rounded-md"
              />
            ))}
          </div>
        ) : null}

        <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="flex-grow bg-zinc-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Type a message..."
          />
          <label className="cursor-pointer bg-zinc-700 text-white rounded-full p-2 hover:bg-zinc-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 py-4">
        <h1 className="text-4xl text-white italic text-center">
          Wilson's Global Chat
        </h1>
      </div>
    </div>
  );
}
