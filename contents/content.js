console.log("contents test script");

document.onmouseup = function () {
  const selectedText = window.getSelection()?.toString() || "";
  console.log(selectedText);
  if (selectedText.length > 1) {
    chrome.runtime.sendMessage({ text: selectedText, kyusung: "kyusung" });
  }
};