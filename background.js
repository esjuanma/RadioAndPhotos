/*console.log('chrome.browserAction!!!!!!!!!!!!!!!!!!!!!', chrome.browserAction);

const radioTabs = [];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

	const code = `
		console.log('tabId:', ${JSON.stringify(tabId)});
		console.log('changeInfo:', ${JSON.stringify(changeInfo)});
		console.log('tab:', ${JSON.stringify(tab)});
	`;

	chrome.tabs.executeScript({ code });
});

let memory;

chrome.system.memory.getInfo(info => (memory = info));
*/

chrome.browserAction.onClicked.addListener(function(tab) {

	const code = `
		console.log('tab:', ${JSON.stringify(tab)});
		console.log('chrome.tabs:', ${JSON.stringify(chrome.tabs)});
		document.body.style.backgroundColor = 'red';
	`;

	chrome.tabs.executeScript({ code });
});