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
    setMessages([...messages, message]);
    socket.emit("message", message);
  }

  useEffect(() => {
    socket.on("hello", (arg) => {
      console.log(arg);
      setMessages([...messages, arg]);
    });
    socket.emit("howdy", "stranger");
  }, [messages.length]);

  return (
    // <div className=" bg-red-400">
    //   <div>Interface</div>
    //   <div>
    //     {messages.map((val) => (
    //       <div>{val}</div>
    //     ))}
    //   </div>
    //   <input
    //     className=" text-black"
    //     type="text"
    //     value={toSend}
    //     onChange={(event) => {
    //       setToSend(event.target.value);
    //     }}
    //   />
    //   <button
    //     onClick={() => {
    //       socket.emit("helloe", "client");
    //     }}
    //   >
    //     Send
    //   </button>
    // </div>
    <div></div>
  );
}
