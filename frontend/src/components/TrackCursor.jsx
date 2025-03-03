import React, { useRef, useState } from 'react'
import socket from '../socket';
const TrackCursor = () => {
    const EditorRef = useRef(null);
    const [content, setContent] = useState("");
    const [cursors, setCursors] = useState({});

    socket.on("init", ({ content, cursors }) => {
        setContent(content);
        setCursors(cursors);
      });
  return (
    <div>TrackCursor</div>
  )
}

export default TrackCursor