const baseUrl="https://emkc.org/api/v2/piston"


export const executeCodeFromAPI=async(language,code)=>{
    
    try {
        const url = baseUrl+"/execute"
        const options={
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: language,
                version: await getRuntimeVersion(language),  // Use a valid version
                files: [
                    {
                        content: code
                    }
                ]
            })
            
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result?.run?.output)
        // Find language match
       return result?.run?.output ? result?.run?.output : result?.run?.stderr
    } catch (error) {
        console.log(error)
    }
}

// executeCode()

const getRuntimeVersion =async(language)=>{
    const url = baseUrl+"/runtimes"
    const options={
        method:"GET",
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        // Find language match
        const langObj = result.find(ele => 
            ele.language.toLowerCase() === language.toLowerCase() || 
            (ele.aliases && ele.aliases.some(alias => alias.toLowerCase() === language.toLowerCase()))
        );
        console.log(langObj.version)
        return langObj.version
        // return langObj ? langObj?.version : null
    } catch (error) {
        console.log(error)
    }
}