import ReactMarkdown from 'react-markdown';

const withHardBreaks = (text) => text.replace(/\n/g, '  \n');

const FormDescription = ({ description, className = '', linkClassName = '' }) => {
  if (!description) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-3 last:mb-0 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-3 last:mb-0 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {children}
            </a>
          ),
        }}
      >
        {withHardBreaks(description)}
      </ReactMarkdown>
    </div>
  );
};

export default FormDescription;
