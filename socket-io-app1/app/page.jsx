"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3001/");

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // socket.on("hello", (arg) => {
  //   console.log(arg);
  //   setMessages([...messages, arg]);
  // });

  function handleSubmit(event) {
    event.preventDefault();

    const newMessage = {
      body: message,
      from: "Me",
    };

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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="To send here..."
          onChange={(event) => setMessage(event.target.value)}
        />
        <button>Send</button>
      </form>

      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.from}:{message.body}
          </li>
        ))}
      </ul>
    </div>
  );
}
