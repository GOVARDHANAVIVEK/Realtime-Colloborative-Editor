import React, { useEffect, useState } from 'react'
import Version from './version'
const DocumentVersions = ({ versionedDocuments,
  getVersionIndex,
  setSelectedVersionIndex,
  selectedVersionIndex,
  restoreOriginalContent,
  setShowBackBtn,
  showBackBtn,
  removeVersionIndex
}) => {
  let sortedVersions =[]
  let current = null;
  let latest = null
  if(versionedDocuments && versionedDocuments.length>0){
    sortedVersions = [...versionedDocuments].sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
    current = Math.max(...sortedVersions.map(version => version.__v));
    latest = Math.max(...sortedVersions.map(version => version.__v - 1));
  }



// console.log("versionedDocuments.length",sortedVersions.length)
return (
  <div className="flex-1 bg-white shadow-lg rounded-lg p-6 border-4 border-gray-300 overflow-auto h-[100%]">
          <div className="box-border w-full h-auto px-4 py-4 overflow-auto">
          {sortedVersions.length > 1 && current!=null ? (

              sortedVersions.filter(version => version.__v !== current).map((version) => (

                  <Version
                      key={version.__v}
                      latest={latest === version.__v ? true : false}
                      versionIndex={version.__v}
                      savedBy={version.savedBy}
                      lastSaved={version.lastSaved}
                      getVersionIndex={getVersionIndex}
                      selectedVersionIndex={selectedVersionIndex}
                      setSelectedVersionIndex={setSelectedVersionIndex}
                      restoreOriginalContent={restoreOriginalContent}
                      showBackBtn={showBackBtn}
                      setShowBackBtn={setShowBackBtn}
                      removeVersionIndex={removeVersionIndex} // Ensure onView is passed correctly
                  />
              ))
          ) : (
              <p className="text-center text-gray-600">No versions available</p>
          )}
      </div>
  </div>
);
}

export default DocumentVersions



