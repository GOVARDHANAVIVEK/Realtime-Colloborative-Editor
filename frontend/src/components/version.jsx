import { useEffect, useState } from 'react';

const Version = (
    {
        versionIndex,
        savedBy,
        lastSaved,
        getVersionIndex,
        selectedVersionIndex,
        setSelectedVersionIndex,
        restoreOriginalContent,
        showBackBtn,
        setShowBackBtn,
        latest,
        removeVersionIndex
    }
) => {

    // useEffect(()=>{
    //     console.log(selectedVersionIndex)
    //     console.log(restoreOriginalContent)
    // },[selectedVersionIndex,restoreOriginalContent])

    const [viewingVersion, setViewingVersion] = useState(true)
    console.log(versionIndex, latest)
    return (
        <div className="p-4 shadow-lg rounded-xl  mb-3 flex flex-col gap-3 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
                <p className="text-sm text-gray-500">
                    Last Saved: <span className="font-medium text-gray-700">{lastSaved}</span>
                </p>

                <p>{latest ? "latest" : ""}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Saved By: <span className="font-medium text-gray-800">{savedBy}</span>
                </p>
                <div className="flex gap-2">
                    {selectedVersionIndex !== versionIndex && (
                        <button
                            value={versionIndex}
                            onClick={() => {
                                console.log("Button clicked for versionIndex:", versionIndex);
                                getVersionIndex(versionIndex);
                                setSelectedVersionIndex(versionIndex);
                                setViewingVersion(false)
                                console.log("selected version index to bg", selectedVersionIndex);
                            }}
                            className={`px-4 py-2 rounded-lg shadow-sm transition-all 
                            ${selectedVersionIndex === versionIndex ? "bg-blue-500 text-white" : "bg-blue-200 text-gray-800 hover:bg-gray-300"}
                        `}
                            aria-label="View Document Version"
                        >
                            View
                        </button>
                    )}



                    {(selectedVersionIndex === versionIndex && showBackBtn && !viewingVersion) ? (
                        <button className="px-4 py-2 bg-gray-300 rounded-lg shadow-sm hover:bg-gray-400 transition-all"
                            onClick={() => {
                                restoreOriginalContent()
                                removeVersionIndex()
                                setSelectedVersionIndex(null)
                                setShowBackBtn(false)
                                setViewingVersion(true)
                            }}>
                            Back
                        </button>
                    ) : null}


                </div>
            </div>
        </div>
    );
};

export default Version;
