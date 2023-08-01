chrome.storage.sync.get(["OPENAI_API_KEY"], (result) => {
  if (!result.OPENAI_API_KEY) {
    const OPENAI_API_KEY = prompt("OPENAI_API_KEY를 입력해주세요.");
    chrome.storage.sync.set({ OPENAI_API_KEY });
  }
});
const tokenRefresh = document.querySelector(".token-refresh");
tokenRefresh.addEventListener("click", () => {
  const OPENAI_API_KEY = prompt("OPENAI_API_KEY를 입력해주세요.");
  chrome.storage.sync.set({ OPENAI_API_KEY });
  // TODO synchronouse 써보기
  // https://developer.chrome.com/docs/extensions/reference/storage/
  chrome.runtime.sendMessage({
    text: OPENAI_API_KEY,
    kyusung: "token",
  });
});

const tabTranslateButton = document.querySelector(".tab-translate");
tabTranslateButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {
      kyusung: "translate-start",
    });
  });
});

const selected = document.querySelector(".container .content .selected");
const button = document.querySelector(".button .translate");
const input = document.querySelector(".container .content .input");
const output = document.querySelector(".container .content .output");

function onMessageListen(request, sender, sendResponse) {
  if (request.hasOwnProperty("kyusung")) {
    if (request.kyusung === "kyusung") {
      console.log(request.text);
      sendResponse({});
      selected.innerHTML = request.text;
    } else if (request.kyusung === "translated") {
      console.log(request.text);
      sendResponse({});
      output.innerHTML = request.text;
    }
  }
}

chrome.runtime.onMessage.addListener(onMessageListen);

chrome.storage.sync.get(
  ["selectedText", "inputText", "translatedText"],
  (result) => {
    if (result.selectedText) {
      selected.innerHTML = result.selectedText;
    }
    if (result.inputText) {
      input.innerHTML = result.inputText;
    }
    if (result.translatedText) {
      output.innerHTML = result.translatedText;
    }
  }
);

button.addEventListener("click", () => {
  input.innerHTML = selected.innerHTML;
  output.innerHTML = "번역중...";
  chrome.runtime.sendMessage({
    text: selected.innerHTML,
    kyusung: "translate",
  });
  selected.innerHTML = "";
});
