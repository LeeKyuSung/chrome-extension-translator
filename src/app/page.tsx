"use client";
import { useState } from "react";

export default function Home() {
  let [selectedText, setSelectedText] = useState("테스트");

  if (typeof chrome !== "undefined") {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.hasOwnProperty("kyusung") && request.kyusung === "kyusung") {
        console.log(request.text);
        sendResponse({});
        setSelectedText(request.text);
      }
    });
  }
  return (
    <div>
      <span>{selectedText}</span>
    </div>
  );
}
