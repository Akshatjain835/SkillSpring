import React, { useRef, useEffect, useState } from 'react';

const RichTextEditor = ({ input, setInput }) => {
  const editorRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = () => {
    if (editorRef.current && !isUpdating) {
      const content = editorRef.current.innerHTML;
      // Only update if content actually changed
      if (content !== input.description) {
        setInput({ ...input, description: content });
      }
    }
  };

  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleChange();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  // Handle external content updates
  useEffect(() => {
    if (editorRef.current && input.description !== undefined) {
      setIsUpdating(true);
      const currentContent = editorRef.current.innerHTML;
      
      // Only update if the content is different to prevent loops
      if (currentContent !== input.description) {
        editorRef.current.innerHTML = input.description || '';
      }
      
      setIsUpdating(false);
    }
  }, [input.description]);

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && input.description) {
      editorRef.current.innerHTML = input.description;
    }
  }, []);

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap text-black gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm bg-white  border border-gray-300 rounded hover:bg-gray-100"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={insertLink}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={() => formatText('removeFormat')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        onBlur={handleChange}
        onKeyUp={handleChange}
        className="min-h-[200px] p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        data-placeholder="Start typing your content here..."
        onFocus={(e) => {
          if (!e.target.innerHTML || e.target.innerHTML === '<br>') {
            e.target.innerHTML = '';
          }
        }}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;



