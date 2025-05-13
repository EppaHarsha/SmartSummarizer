chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.get(["apiKey"],(res)=>{
        if(!res.apiKey){
            chrome.tabs.create({url:"options.html"})
        }
    })
})