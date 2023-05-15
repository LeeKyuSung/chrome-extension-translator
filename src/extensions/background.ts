console.log("background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hasOwnProperty("kyusung") && request.kyusung === "kyusung") {
    console.log(request.text);
    sendResponse({});
    chrome.runtime.sendMessage({
      kyusung: "kyusung",
      text: request.text,
    });
  }
});
