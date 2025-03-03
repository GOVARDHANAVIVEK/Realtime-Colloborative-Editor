import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';


const TextEditor = ({
    enableRestore,
    restoreSelectedVersionContent,
    selectedLanguage,
    saveDocument,
    content,
    handleEditorChange,

}) => {
   


    return (
        <div className="w-full border-2 border-red-200">
            <div className="w-full bg-white shadow-lg rounded-lg lg:p-6 border border-gray-300 md:p-2 sm:p-2">
                <div className="w-full flex flex-row items-center align-center">
                    {enableRestore && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
                            onClick={restoreSelectedVersionContent}
                        >
                            Restore
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-500 text-center mb-4">
                    Detected Language: <span className="font-semibold">{selectedLanguage}</span>
                </p>

                <div className="flex justify-center gap-4 mb-4">
                    <button
                        onClick={saveDocument}
                        className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
                    >
                        Save
                    </button>
                </div>

                <Editor
                    height="500px"
                    width="100%"
                    language={selectedLanguage}
                    value={content}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    className="border border-gray-300 rounded-md"
                />
            </div>
        </div>
    );
};

export default TextEditor;
