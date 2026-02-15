import React, { useRef, useEffect, useState } from "react";
import { 
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, 
  FiAlignCenter, FiAlignRight, FiLink, FiImage, FiCode,
  FiType, FiMessageSquare
} from "react-icons/fi";

const RichTextEditor = ({ value, onChange, isDarkMode, placeholder = "Start writing your content..." }) => {
  const editorRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e) => {
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    // Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
    // Tab key handling
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    const text = selection?.toString();
    if (text) {
      setSelectedText(text);
      setShowLinkDialog(true);
    } else {
      alert('Please select text first to create a link');
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl("");
      setSelectedText("");
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      execCommand('insertImage', imageUrl);
      setShowImageDialog(false);
      setImageUrl("");
    }
  };

  const formatBlock = (tag) => {
    execCommand('formatBlock', `<${tag}>`);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-all ${
        active
          ? isDarkMode 
            ? "bg-primary/30 text-primary" 
            : "bg-primary/20 text-primary"
          : isDarkMode 
            ? "hover:bg-white/10 text-white/70 hover:text-white" 
            : "hover:bg-secondary/10 text-secondary/70 hover:text-secondary"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarDivider = () => (
    <div className={`w-px h-6 ${isDarkMode ? "bg-white/10" : "bg-secondary/10"}`}></div>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1 p-2 rounded-lg border ${
        isDarkMode 
          ? "bg-white/5 border-white/10" 
          : "bg-secondary/5 border-secondary/10"
      }`}>
        {/* Text Formatting */}
        <ToolbarButton 
          icon={FiBold} 
          onClick={() => execCommand('bold')} 
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton 
          icon={FiItalic} 
          onClick={() => execCommand('italic')} 
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton 
          icon={FiUnderline} 
          onClick={() => execCommand('underline')} 
          title="Underline (Ctrl+U)"
        />

        <ToolbarDivider />

        {/* Headings */}
        <select
          onChange={(e) => formatBlock(e.target.value)}
          className={`px-2 py-1 text-xs rounded border ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white"
              : "bg-white border-secondary/10 text-secondary"
          } focus:outline-none focus:ring-2 focus:ring-primary/50`}
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton 
          icon={FiList} 
          onClick={() => execCommand('insertUnorderedList')} 
          title="Bullet List"
        />
        <ToolbarButton 
          icon={FiList} 
          onClick={() => execCommand('insertOrderedList')} 
          title="Numbered List"
        />

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton 
          icon={FiAlignLeft} 
          onClick={() => execCommand('justifyLeft')} 
          title="Align Left"
        />
        <ToolbarButton 
          icon={FiAlignCenter} 
          onClick={() => execCommand('justifyCenter')} 
          title="Align Center"
        />
        <ToolbarButton 
          icon={FiAlignRight} 
          onClick={() => execCommand('justifyRight')} 
          title="Align Right"
        />

        <ToolbarDivider />

        {/* Insert */}
        <ToolbarButton 
          icon={FiLink} 
          onClick={handleLinkClick} 
          title="Insert Link"
        />
        <ToolbarButton 
          icon={FiImage} 
          onClick={() => setShowImageDialog(true)} 
          title="Insert Image"
        />
        <ToolbarButton 
          icon={FiCode} 
          onClick={() => execCommand('formatBlock', '<pre>')} 
          title="Code Block"
        />
        <ToolbarButton 
          icon={FiMessageSquare} 
          onClick={() => execCommand('formatBlock', '<blockquote>')} 
          title="Quote"
        />

        <ToolbarDivider />

        {/* Clear Formatting */}
        <ToolbarButton 
          icon={FiType} 
          onClick={() => execCommand('removeFormat')} 
          title="Clear Formatting"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 rounded-lg border ${
          isDarkMode
            ? "bg-white/5 border-white/10 text-white"
            : "bg-white border-secondary/10 text-secondary"
        } focus:outline-none focus:ring-2 focus:ring-primary/50 prose prose-sm max-w-none ${
          isDarkMode ? "prose-invert" : ""
        }`}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />

      {/* Keyboard Shortcuts Help */}
      <div className={`text-xs ${isDarkMode ? "text-white/50" : "text-secondary/50"}`}>
        <strong>Keyboard shortcuts:</strong> Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Tab (Indent)
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? "bg-secondary" : "bg-white"} rounded-xl p-6 w-full max-w-md shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-secondary"}`}>
              Insert Link
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${isDarkMode ? "text-white/80" : "text-secondary/80"}`}>
                  Selected Text
                </label>
                <input
                  type="text"
                  value={selectedText}
                  disabled
                  className={`w-full px-4 py-2.5 text-xs rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 text-white/50" 
                      : "bg-secondary/5 text-secondary/50"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${isDarkMode ? "text-white/80" : "text-secondary/80"}`}>
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-2.5 text-xs rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 text-white placeholder-white/40" 
                      : "bg-secondary/5 text-secondary placeholder-secondary/40"
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl("");
                    setSelectedText("");
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 hover:bg-white/20 text-white" 
                      : "bg-secondary/10 hover:bg-secondary/20 text-secondary"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-primary/90 text-white"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? "bg-secondary" : "bg-white"} rounded-xl p-6 w-full max-w-md shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-secondary"}`}>
              Insert Image
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${isDarkMode ? "text-white/80" : "text-secondary/80"}`}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg or /uploads/Blogs/image.jpg"
                  className={`w-full px-4 py-2.5 text-xs rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 text-white placeholder-white/40" 
                      : "bg-secondary/5 text-secondary placeholder-secondary/40"
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  autoFocus
                />
              </div>
              {imageUrl && (
                <div className="mt-4">
                  <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-white/80" : "text-secondary/80"}`}>
                    Preview:
                  </p>
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl("");
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 hover:bg-white/20 text-white" 
                      : "bg-secondary/10 hover:bg-secondary/20 text-secondary"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-primary/90 text-white"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(27, 38, 59, 0.4)'};
          pointer-events: none;
          display: block;
        }
        
        [contenteditable] {
          line-height: 1.6;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        [contenteditable] p {
          margin: 1em 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid ${isDarkMode ? 'rgba(246, 147, 27, 0.5)' : 'rgba(246, 147, 27, 0.5)'};
          font-style: italic;
        }
        
        [contenteditable] pre {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(27, 38, 59, 0.05)'};
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          font-family: monospace;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1em 0;
        }
        
        [contenteditable] a {
          color: ${isDarkMode ? '#F6931B' : '#F6931B'};
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;