import {useState} from "react";
import "../components/ui/documents.css";
import Document from "./Document";

const Documents = ({ ownDocuments, sharedDocuments, userId }) => {
  
  return (
    <div className="box-border w-full h-screen flex flex-col gap-5 px-10 py-10 overflow-auto">
      {/* Own Documents Section */}
      <div>
        <h2 className="text-lg font-semibold mb-5">My Documents</h2>
        <div className="flex flex-wrap gap-5">
          {ownDocuments.length === 0 ? (
            <p>No own documents available</p>
          ) : (
            ownDocuments.map((doc) => <Document key={doc._id} userId={userId} doc={doc}  />)
          )}
        </div>
      </div>

      {/* Shared Documents Section */}
      <div>
        <h2 className="text-lg font-semibold mt-5 mb-5">Shared Documents</h2>
        <div className="flex flex-wrap gap-5">
          {sharedDocuments.length === 0 ? (
            <p>No shared documents available</p>
          ) : (
            sharedDocuments.map((doc) => <Document key={doc._id} userId={userId} doc={doc}  />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
