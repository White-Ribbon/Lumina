import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

const MarkdownViewer = ({ content, className = "" }: MarkdownViewerProps) => {
  return (
    <div className={`prose prose-invert prose-cyan max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 glow-text" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-6" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-2 mt-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-muted-foreground" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
          code: ({node, inline, ...props}: any) => 
            inline 
              ? <code className="bg-muted px-2 py-1 rounded text-primary" {...props} />
              : <code className="block bg-card p-4 rounded-lg overflow-x-auto my-4 border border-border" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:text-secondary transition-colors underline" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
