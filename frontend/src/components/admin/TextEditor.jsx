// components/RichTextEditor.jsx
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

export default function RichTextEditor({ value, onChange, error, placeholder = "Describe your ground facilities, features, and rules..." }) {
  
  // Sanitize HTML to prevent XSS attacks
  const sanitizeHtml = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'],
      ALLOWED_ATTR: ['style', 'class']
    });
  };

  const handleChange = (content) => {
    const cleanContent = sanitizeHtml(content);
    onChange(cleanContent);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background'
  ];

  return (
    <div className={`rich-text-editor ${error ? 'border-red-500' : ''}`}>
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder={placeholder}
        className={error ? 'ql-error' : ''}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}