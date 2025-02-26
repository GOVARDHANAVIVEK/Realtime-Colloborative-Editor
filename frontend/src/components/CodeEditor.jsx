import {useState} from 'react'
import { Editor } from '@monaco-editor/react';

import { executeCodeFromAPI } from './codeExecutor';

const CodeEditor =(
    {
        enableRestore,
        restoreSelectedVersionContent,
        selectedLanguage,
        saveDocument,
        content,
        handleEditorChange,
        executeCode,
        runCode,
        closeExecuter
    }) => {

        const [output, setOutput] = useState("");
        const [loading, setLoading] = useState(false);
        const runProgramCode = async () => {
            setLoading(true)
            const output_ = await executeCodeFromAPI(selectedLanguage,content.toString())
            console.log(output_)
            setOutput(output_)
            setLoading(false)
        };
  return (
    <div className='w-full'>
        <div className="w-full  bg-white shadow-lg rounded-lg p-6 border border-gray-300">
                    {/* Document Title */}
                    <div className=' w-full flex flex-row items-center align-center'>

                        <section>
                            {enableRestore ? (
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
                                    onClick={restoreSelectedVersionContent}
                                >
                                    Restore
                                </button>
                            ) : null}
                        </section>
                    </div>


                    {/* Language Detection */}
                    <div className='w-[100%] flex flex-row  bg-blue-50 mb-3   '  >
                        <div className='w-[100%] flex flex-row items-center justify-evenly  justify-between' >
                            
                            
                            {/* Action Buttons */}
                            <div className="flex flex-row  m-4 items-center w-[40%] ">
                                <button
                                    onClick={saveDocument}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-3xl shadow-md hover:bg-blue-600 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 text-center m-4 text-black">
                                Detected Language: <span className="font-semibold text-purple-600">{selectedLanguage}</span>
                            </p>

                            <div className='w-[40%] flex gap-4 items-center px-1 py-1 justify-end'>
                               
                                <button 
                                    onClick={()=>{
                                        executeCode()
                                    runProgramCode()} }
                                    className='px-5 py-2 bg-gray-500 text-white font-semibold rounded-3xl hover:bg-gray-700'
                                >
                                    Run Code
                                </button>
                               
                                
                                {runCode && (
                                    <button
                                    onClick={closeExecuter}
                                    className='px-5 py-2 bg-gray-500 text-white font-semibold rounded-3xl hover:bg-gray-700'
                                >
                                    Close Executor
                                </button>
                                )}
                                
                            </div>

                        </div>

                        
                    </div>
                    {/* Code Editor */}
                    <div className='flex flex-row w-full'>
                    {runCode ?(
                        <>
                       
                            <Editor
                                height="500px"
                                width="70%"
                                language={selectedLanguage}
                                value={content}
                                theme='vs-dark'
                                onChange={handleEditorChange}
                                className="border border-gray-300 rounded-md "/>
                            
                            <section className='w-[30%] h-[500px] bg-black px-4 py-2 overflow-scroll'>
                                <p className='text-white text-lg '>
                                    <span className='text-white text-lg'>Output: </span>  
                                    {loading ? <span className="text-yellow-400"> executing...</span> : output}
                                </p>
                            </section>
                        </>
                        ):
                        
                        <Editor
                            height="500px"
                            width="100%"
                            language={selectedLanguage}
                            value={content}
                            theme='vs-dark'
                            onChange={handleEditorChange}
                            className="border border-gray-300 rounded-md "
                        /> }
                       
                    </div>

                </div>
    </div>
  )
}

export default CodeEditor