document.getElementById("summarize").addEventListener("click",()=>{
    
    const resDiv = document.getElementById('result');
    
    const summaryType=document.getElementById("summary-type").value;
    
    resDiv.innerHTML='<div class="loader"></div>';

    chrome.storage.sync.get(["geminiApiKey"],({geminiApiKey})=>{
        if(!geminiApiKey) {
            resDiv.textContent="No Api key set. Click the gear icon to add one."
            return;
        }
         chrome.tabs.query({active:true,currentWindow:true},([tab])=>{
        chrome.tabs.sendMessage(tab.id,
            {type:"Article_Text"},async ({text})=>{
                if(!text){
                    resDiv.textContent="Couldn't extract text from this page.";
                    return;
                }
                try{
                    const summary=await getGeminiSummary(text,summaryType,geminiApiKey);
                    resDiv.textContent=summary;
                }catch(error){resDiv.textContent="Gemini error : "+err.message}

        })
    })
    })
})
async function getGeminiSummary(rawtext,type,key) {
    const max=20000;
    const text = rawtext.text > max ? rawtext.slice(0,max)+"..." : rawtext;


    const promptMap={
        brief:`Summarize in 2-3 senetnces:\n\n${text}`,
        detailed:`Give a detailed summary:\n\n${text}`,
        bullets:`Summarize in5-7 bullet points (start each line with "-"):\n\n${text}`,
    }
    const prompt = promptMap[type] || promptMap.brief;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, 

        {
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                contents:[{parts:[{text:prompt}]}],
                generationConfig:{temperature:0.2},
            })  
        }

    );
    if(!response.ok){
        const {error} = await response.json();
        throw new Error(error?.message || "Request failed");
    }
    const data = await response.json();
   return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Summary.";

    
}
document.getElementById("copy-btn").addEventListener('click',()=>{
    const txt = document.getElementById("result").innerText;
    if(!txt) return;
    navigator.clipboard.writeText(txt).then(()=>{
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent="Copied";
        setTimeout(()=>{btn.textContent=old},2000);
    })
})