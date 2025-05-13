function getArticleText() {
  const article =  document.querySelector("article");
  if(article) return article.innerText;

  const paragraphs = Array.from(document.querySelectorAll("p"));
  return paragraphs.map((p)=> p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((req,sender,sendResponse)=>{
    if((req.type ==="Article_Text")){
        const text = getArticleText();
        sendResponse({text});
    }
    return true;
})