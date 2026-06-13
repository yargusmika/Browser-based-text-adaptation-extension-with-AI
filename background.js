chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "my-context-menu",
        title: "Упростим страницу",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "my-context-menu-2",
        title: "Упростим выделенное",
        contexts: ["selection"] 
    });
    console.log("Меню созданы, ня~");
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId == "my-context-menu") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return { 
                    document_body_text: document.body.outerHTML,
                }
            }
        }, async (infectionResult) => {
            const htmlContent = infectionResult[0].result;
            console.log("Начинаем обработку, ня~");
            
            // Сохраняем в storage
            chrome.storage.local.set({ 
				// Сохраняем исходную страницу
				"infoBefore": htmlContent.document_body_text
            }, () => {
                console.log("HTML сохранен, ня~");
                chrome.tabs.create({
                    url: "work/work.html"
                });
            });
        });
    }

    if (info.menuItemId == "my-context-menu-2") {
        console.log("Начинаем обработку, ня~");
        
        // Chrome автоматически передает выделенный текст в объекте info
        const selectedText = info.selectionText; 
        console.log(selectedText);
        
        // Сохраняем в storage
        chrome.storage.local.set({ 
            "v_text": selectedText
        }, () => {
            console.log("Выделенный текст сохранен, ня~");
            chrome.storage.local.get(null, function(items) {
                console.log(items);
            });
            chrome.tabs.create({
                url: "work/v_work.html"
            });
        });
    }
});
