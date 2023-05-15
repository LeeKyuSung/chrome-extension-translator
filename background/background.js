console.log("background script loaded");

let OPENAI_API_KEY = "";

function setOpenAIKey() {
  chrome.storage.sync.get(["OPENAI_API_KEY"], (result) => {
    if (result.OPENAI_API_KEY) {
      OPENAI_API_KEY = result.OPENAI_API_KEY;
    }
  });
}

async function fetchWithTimeout(url, opts = {}, timeout = 5000) {
  const signal = AbortSignal.timeout(timeout);

  const _fetchPromise = fetch(url, {
    ...opts,
    signal,
  });

  const result = await _fetchPromise;
  return result;
}

function translate(text) {
  try {
    fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: text + "\n한글로 번역해줘",
            },
          ],
        }),
      },
      60000
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log(json);
        return json.choices[0].message.content;
      })
      .then((text) => {
        console.log(text);
        chrome.storage.sync.set({ translatedText: text });
        chrome.runtime.sendMessage({ text, kyusung: "translated" });
      });
  } catch (error) {
    console.log(error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hasOwnProperty("kyusung")) {
    if (request.kyusung === "kyusung") {
      console.log("selected : " + request.text);
      sendResponse({});

      chrome.storage.sync.set({ selectedText: request.text });
    } else if (request.kyusung === "translate") {
      if (OPENAI_API_KEY === "") setOpenAIKey();

      console.log("translate : " + request.text);
      sendResponse({});

      translate(request.text);
    }
  }
});

setOpenAIKey();

function test() {
  fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + OPENAI_API_KEY,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);
    });

  fetch("https://api.openai.com/v1/models/text-davinci-003", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + OPENAI_API_KEY,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);
    });
}
