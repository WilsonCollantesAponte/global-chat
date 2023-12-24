"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

// const socket = io("http://localhost:3001/");
const socket = io("https://global-chat-uxv7.onrender.com/");

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();

    const newMessage = {
      body: message,
      from: "Me",
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
    <div className="bg-zinc-700 flex flex-col h-screen h-fullX py-1.5 px-2.5">
      {/* <div className=""> */}
      <div className=" text-white overflow-auto">
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
        <form className=" w-full flex self-end" onSubmit={handleSubmit}>
          <input
            value={message}
            className="rounded-md w-full"
            type="text"
            placeholder="To send here..."
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className=" text-white px-1.5">Send</button>
          <img className=" h-12" src="/MatiMati_crop.jpg" alt="" />
        </form>
      </div>
      {/* </div> */}
    </div>
  );
}
