console.log("contents test script");

document.onmouseup = function () {
  const selectedText = window.getSelection()?.toString() || "";
  console.log(selectedText);
  if (selectedText.length > 1) {
    chrome.runtime.sendMessage({ text: selectedText, kyusung: "kyusung" });
  }
};

var elements = [];

function onMessageListen(request, sender, sendResponse) {
  if (request.hasOwnProperty("kyusung")) {
    console.log(request);
    if (request.kyusung === "translate-start") {
      document
        .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
        .forEach(async (element) => {
          const index =
            elements.push({
              element: element,
            }) - 1;

          chrome.runtime.sendMessage({
            index: index,
            element: element.outerHTML,
            kyusung: "translate-element",
          });
        });
    } else if (request.kyusung === "translated-element") {
      sendResponse({});
      elements[request.index].element.outerHTML = request.text;
    }
  }
}

chrome.runtime.onMessage.addListener(onMessageListen);
