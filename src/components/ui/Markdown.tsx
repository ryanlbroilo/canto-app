import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renderiza o markdown que a EVA (LLM) devolve, com elementos estilizados pelo
// design system (ver .md-* em styles/pages.css).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p className="md-p" {...props} />,
          strong: (props) => <strong className="md-strong" {...props} />,
          em: (props) => <em className="md-em" {...props} />,
          ul: (props) => <ul className="md-ul" {...props} />,
          ol: (props) => <ol className="md-ol" {...props} />,
          li: (props) => <li className="md-li" {...props} />,
          h1: (props) => <p className="md-h" {...props} />,
          h2: (props) => <p className="md-h" {...props} />,
          h3: (props) => <p className="md-h" {...props} />,
          h4: (props) => <p className="md-h" {...props} />,
          a: (props) => <a className="md-a" target="_blank" rel="noreferrer" {...props} />,
          code: (props) => <code className="md-code" {...props} />,
          blockquote: (props) => <blockquote className="md-quote" {...props} />,
          hr: () => <hr className="md-hr" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
