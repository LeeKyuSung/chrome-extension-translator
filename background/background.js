console.log("background script loaded");

let OPENAI_API_KEY = "";
function setOpenAIKey(token) {
  if (token) {
    OPENAI_API_KEY = token;
    return;
  }

  chrome.storage.sync.get(["OPENAI_API_KEY"], (result) => {
    if (result.OPENAI_API_KEY) {
      OPENAI_API_KEY = result.OPENAI_API_KEY;
    }
  });
}
setOpenAIKey();

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
      console.log("000");
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("111");
      console.log(json);
      if (json.hasOwnProperty("error")) {
        return `번역 실패\n${json.error.message}`;
      } else {
        return json.choices[0].message.content;
      }
    })
    .then((text) => {
      console.log("222");
      console.log(text);
      chrome.storage.sync.set({ translatedText: text });
      chrome.runtime.sendMessage({
        text,
        kyusung: "translated",
      });
    })
    .catch((error) => {
      console.error(error);
      chrome.runtime.sendMessage({
        text: `번역 실패\n${error.message}`,
        kyusung: "translated",
      });
    });
}

function translateWithHtml(text, index) {
  console.log("translateWithHtml : " + text);
  return fetchWithTimeout(
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
            content: text + "\nhtml 태그 유지하면서 한글로 번역해줘",
          },
        ],
      }),
    },
    60000
  )
    .then((response) => {
      console.log("000");
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("111");
      console.log(json);
      if (json.hasOwnProperty("error")) {
        return `번역 실패\n${json.error.message}`;
      } else {
        return json.choices[0].message.content;
      }
    })
    .then(async (text) => {
      console.log("222");
      console.log(text);
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      await chrome.tabs.sendMessage(tab.id, {
        text: text,
        kyusung: "translated-element",
        index: index,
      });
    })
    .catch(async (error) => {
      console.error(error);
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      await chrome.tabs.sendMessage(tab.id, {
        text: `번역 실패\n${error.message}`,
        kyusung: "translated-element",
        index: index,
      });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hasOwnProperty("kyusung")) {
    if (request.kyusung === "kyusung") {
      console.log("selected : " + request.text);
      sendResponse({});

      chrome.storage.sync.set({ selectedText: request.text });
    } else if (request.kyusung === "translate") {
      chrome.storage.sync.set({ selectedText: "" });
      chrome.storage.sync.set({ inputText: request.text });
      chrome.storage.sync.set({ translatedText: "번역중..." });

      console.log("translate : " + request.text);
      sendResponse({});

      translate(request.text);
    } else if (request.kyusung === "token") {
      setOpenAIKey(request.text);
      sendResponse({});
    } else if (request.kyusung === "translate-element") {
      console.log("translate-element");
      sendResponse({});
      translateWithHtml(request.element, request.index);
    }
  }
});

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
