import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../socket";

const TrackCursor = ({ userId }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const [remoteCursors, setRemoteCursors] = useState({});
  const [remoteTyping, setRemoteTyping] = useState({});
  const [cursorDecorations, setCursorDecorations] = useState([]);
  const userColors = useRef(new Map());

  const userColorsList = [
    "#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F6", "#FF9933", "#33FFFF"
  ];

  const getNextUserColor = useCallback(() => {
    const availableColors = userColorsList.filter(color => !Array.from(userColors.current.values()).includes(color));
    if (availableColors.length > 0) {
      return availableColors[0];
    }
    return userColorsList[userColors.current.size % userColorsList.length];
  }, [userColorsList]);

  useEffect(() => {
    const handleCursorMove = (data) => {
      if (data.userId !== userId) {
        setRemoteCursors((prev) => ({
          ...prev,
          [data.userId]: { ...data.position } // <--- Important: New position object
        }));
      }
    };

    const handleHighlightText = (data) => {
      if (data.userId !== userId) {
        setRemoteCursors((prev) => ({
          ...prev,
          [data.userId]: { ...data.position } // <--- Important: New position object
        }));
        setRemoteTyping((prev) => ({
          ...prev,
          [data.userId]: Date.now()
        }));
        addTemporaryHighlight(data.userId, data.position);
      }
    };

    socket.on("cursor-move", handleCursorMove);
    socket.on("highlight-text", handleHighlightText);

    return () => {
      socket.off("cursor-move", handleCursorMove);
      socket.off("highlight-text", handleHighlightText);
    };
  }, [userId]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      updateCursorDecorations();
    }
  }, [remoteCursors, remoteTyping, getNextUserColor]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    editor.onDidChangeCursorPosition((event) => {
      const position = event.position;
      const pos = { line: position.lineNumber, column: position.column };
      socket.emit("cursor-move", { userId, position: pos });
    });

    editor.onDidChangeModelContent((event) => {
      if (event.changes.length > 0) {
        const change = event.changes[0];
        const pos = {
          line: change.range.startLineNumber,
          column: change.range.startColumn
        };
        socket.emit("highlight-text", { userId, position: pos });
        addTemporaryHighlight(userId, pos);
        socket.emit("cursor-move", { userId, position: pos });
      }
    });
  };

  const updateCursorDecorations = useCallback(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const now = Date.now();
    const threshold = 1000;

    const activeRemoteCursors = Object.entries(remoteCursors).reduce((acc, [uid, pos]) => {
      if (uid === userId) return acc;
      const lastTyped = remoteTyping[uid] || 0;

      if (remoteCursors[uid] || now - lastTyped < threshold) {
        acc[uid] = pos;
      }
      return acc;
    }, {});

    const newDecorations = Object.entries(activeRemoteCursors).map(([uid, pos]) => {
      if (!userColors.current.has(uid)) {
        userColors.current.set(uid, getNextUserColor());
      }
      const color = userColors.current.get(uid);
      const cursorClass = `cursor-highlight-${uid}`;

      if (!document.querySelector(`style[data-cursor="${cursorClass}"]`)) {
        const styleTag = document.createElement("style");
        styleTag.setAttribute("data-cursor", cursorClass);
        styleTag.innerHTML = `.${cursorClass} { background-color: ${color}; border-radius: 3px; opacity: 0.8; padding: 2px; width: 5px; height: 14px; display: inline-block; }`;
        document.head.appendChild(styleTag);
      }

      return {
        range: new monaco.Range(pos.line, pos.column, pos.line, pos.column + 1),
        options: { inlineClassName: cursorClass }
      };
    });

    setCursorDecorations(editor.deltaDecorations(cursorDecorations, newDecorations));
  }, [cursorDecorations, remoteCursors, remoteTyping, getNextUserColor]);

  const addTemporaryHighlight = (uid, pos) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (!userColors.current.has(uid)) {
      userColors.current.set(uid, getNextUserColor());
    }
    const color = userColors.current.get(uid);
    const highlightClass = `highlight-${uid}`;

    if (!document.querySelector(`style[data-highlight="${highlightClass}"]`)) {
      const styleTag = document.createElement("style");
      styleTag.setAttribute("data-highlight", highlightClass);
      styleTag.innerHTML = `.${highlightClass} { background-color: ${color}55 !important; transition: background-color 0.5s ease-in-out; }`;
      document.head.appendChild(styleTag);
    }

    const decoration = {
      range: new monaco.Range(pos.line, pos.column, pos.line, pos.column + 1),
      options: { inlineClassName: highlightClass }
    };

    const ids = editor.deltaDecorations([], [decoration]);
    setTimeout(() => {
      editor.deltaDecorations(ids, []);
    }, 500);
  };

  return { handleEditorDidMount };
};

export default TrackCursor;