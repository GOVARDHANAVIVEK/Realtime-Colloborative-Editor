import {useState} from 'react'
import { Editor } from '@monaco-editor/react';
import { TextCursor } from 'lucide-react';
import socket from '../socket';

const TextEditor = (
    {
        enableRestore,
        restoreSelectedVersionContent,
        selectedLanguage,
        saveDocument,
        // closeDocument,
        content,
        handleEditorChange,
        handleEditorDidMount,
        // mountEditor
        userName
    }) => {
        


        

        

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
                <p className="text-sm text-gray-500 text-center mb-4">
                    Detected Language: <span className="font-semibold">{selectedLanguage}</span>
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mb-4">
                    <button
                        onClick={saveDocument}
                        className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
                    >
                        Save
                    </button>
                </div>

                {/* Code Editor */}
                <Editor
                    height="500px"
                    width="100%"
                    language={selectedLanguage}
                    value={content}
                    onChange={handleEditorChange}
                    theme='vs-dark'
                    className="border border-gray-300 rounded-md "
                />

            </div>
        </div>
    )
}

export default TextEditor