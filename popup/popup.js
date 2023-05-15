let OPENAI_API_KEY = "";
chrome.storage.sync.get(["OPENAI_API_KEY"], (result) => {
  if (result.OPENAI_API_KEY) {
    OPENAI_API_KEY = result.OPENAI_API_KEY;
  } else {
    OPENAI_API_KEY = prompt("OPENAI_API_KEY를 입력해주세요.");
    chrome.storage.sync.set({ OPENAI_API_KEY });
  }
});

const input = document.querySelector(".container .content .input");
const button = document.querySelector(".button #translate");
const output = document.querySelector(".container .content .output");

function onMessageListen(request, sender, sendResponse) {
  if (request.hasOwnProperty("kyusung")) {
    if (request.kyusung === "kyusung") {
      console.log(request.text);
      sendResponse({});
      input.innerHTML = request.text;
    } else if (request.kyusung === "translated") {
      console.log(request.text);
      sendResponse({});
      output.innerHTML = request.text;
    }
  }
}

chrome.runtime.onMessage.addListener(onMessageListen);

chrome.storage.sync.get(["selectedText", "translatedText"], (result) => {
  if (result.selectedText) {
    input.innerHTML = result.selectedText;
  }
  if (result.translatedText) {
    output.innerHTML = result.translatedText;
  }
});

button.addEventListener("click", () => {
  chrome.runtime.sendMessage({ text: input.innerHTML, kyusung: "translate" });
});
