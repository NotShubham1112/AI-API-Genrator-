"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  Plus,
  Cpu,
  Copy,
  Check,
  BrainCircuit,
  ChevronDown,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThoughtBlock } from "./thought-block";

interface Model {
  name: string;
  size: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  generating?: boolean;
}

// Parse <think> blocks out of content into segments
type Segment = { type: "think"; text: string } | { type: "text"; text: string };
function parseContent(raw: string): Segment[] {
  const segments: Segment[] = [];
  const re = /<think>([\s\S]*?)(<\/think>|$)/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) segments.push({ type: "text", text: raw.slice(last, m.index) });
    segments.push({ type: "think", text: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < raw.length) segments.push({ type: "text", text: raw.slice(last) });
  if (segments.length === 0) segments.push({ type: "text", text: raw });
  return segments;
}

// Sub-component for code blocks to handle copying
function CodeBlock({ inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");

  const handleCopy = () => {
    const textToCopy = String(children).replace(/\n$/, "");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-8">
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCopy}
          className="size-8 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md"
        >
          {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <div className="absolute left-4 top-0 -translate-y-1/2">
        {match && match[1] && (
           <span className="bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-700">
             {match[1]}
           </span>
        )}
      </div>
      <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-5 pt-8 shadow-md">
        <code className={cn(className, "text-slate-50 font-mono text-[13px] md:text-sm leading-relaxed")} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function ChatClient() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadModels = async () => {
    try {
      const response = await fetch("/api/ollama/models");
      const data = await response.json();
      setModels(data.models || []);
      if (data.models?.length > 0) {
        setSelectedModel(data.models[0].name);
      }
    } catch {
      toast.error("Engine offline");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel || generating) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, userMessage, { id: assistantMessageId, role: "assistant", content: "", generating: true }]);
    setInput("");
    setGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ollama/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: userMessage.content,
          system: "You are a helpful AI assistant. Before answering any question, you MUST first reason step-by-step inside <think></think> tags. Think thoroughly about the question, analyze it from multiple angles, then close the </think> tag and provide your final polished answer. Always use <think> tags for your internal reasoning - never skip this step.",
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Generation failed");
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.trim() !== '') {
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + parsed.response, generating: true } 
                      : msg
                  ));
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }
      
      // Stream complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, generating: false } : msg
      ));
      
    } catch (e: any) {
      if (e.name === "AbortError") {
        // User stopped generation — keep whatever content was received
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, generating: false } : msg
        ));
      } else {
        toast.error(e.message || "Failed to generate response");
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      }
    } finally {
      abortControllerRef.current = null;
      setGenerating(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyDocument = (content: string) => {
     // Remove <think> blocks before copying the final document
     const cleanContent = content.replace(/<think>([\s\S]*?)<\/think>/gi, "");
     navigator.clipboard.writeText(cleanContent.trim());
     toast.success("Document copied to clipboard!");
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans">
      {/* Minimal Top Header */}
      <div className="flex items-center justify-between p-4 px-6 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="h-9 px-3 gap-2 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100" onClick={() => setMessages([])}>
            <Plus className="size-4" />
            New Document
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
           <Cpu className="size-4 text-slate-400" />
           <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-auto h-auto bg-transparent border-none shadow-none text-xs font-semibold focus:ring-0 text-slate-600 hover:text-slate-900 p-0 pr-1 gap-1">
                <SelectValue placeholder="Select Engine" />
              </SelectTrigger>
              <SelectContent align="end">
                {models.map(m => (
                  <SelectItem key={m.name} value={m.name} className="text-xs font-medium">{m.name}</SelectItem>
                ))}
              </SelectContent>
           </Select>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-20 lg:px-40 py-10 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-start justify-center max-w-4xl mx-auto space-y-4 pb-32">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 text-balance">
               What are we writing?
             </h1>
             <p className="text-xl text-slate-500 font-medium tracking-tight">
               Type a prompt below to begin generating a document.
             </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-16 pb-48">
            {messages.map((msg) => (
              <div key={msg.id} className="w-full relative group">
                {msg.role === "user" ? (
                  <div className="flex justify-end mb-4 pt-4">
                     <div className="bg-slate-100 text-slate-900 px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm text-[15px] font-medium leading-relaxed">
                       {msg.content}
                     </div>
                  </div>
                ) : (
                  <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out text-slate-900">
                    <div className="w-full">
                      {parseContent(msg.content).map((seg, i) =>
                        seg.type === "think" ? (
                          <ThoughtBlock key={i} content={seg.text} isStreaming={msg.generating && i === parseContent(msg.content).length - 1} />
                        ) : (
                          <ReactMarkdown
                            key={i}
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-8 mb-4 text-slate-900" {...props} />,
                              h2: ({node, ...props}) => <h2 className="scroll-m-20 border-b border-slate-200 pb-2 text-3xl font-semibold tracking-tight mt-10 first:mt-0 mb-4 text-slate-900" {...props} />,
                              h3: ({node, ...props}) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-slate-900" {...props} />,
                              h4: ({node, ...props}) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 text-slate-900" {...props} />,
                              p: ({node, children, ...props}) => {
                                const hasBlock = node?.children?.some(
                                  (c: any) => c.type === "element" && ["div", "pre", "table"].includes(c.tagName)
                                );
                                return hasBlock
                                  ? <div className="leading-7 [&:not(:first-child)]:mt-6 text-slate-700" {...props}>{children}</div>
                                  : <p className="leading-7 [&:not(:first-child)]:mt-6 text-slate-700" {...props}>{children}</p>;
                              },
                              blockquote: ({node, ...props}) => <blockquote className="mt-6 border-l-2 border-slate-300 pl-6 italic text-slate-600" {...props} />,
                              ul: ({node, ...props}) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-slate-700" {...props} />,
                              ol: ({node, ...props}) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-slate-700" {...props} />,
                              li: ({node, ...props}) => <li className="mt-2 leading-7" {...props} />,
                              a: ({node, ...props}) => <a className="font-medium text-slate-900 underline underline-offset-4 decoration-slate-400 hover:decoration-slate-900 transition-colors" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                              pre: ({node, ...props}) => <>{props.children}</>,
                              code: CodeBlock,
                              table: ({node, ...props}) => (
                                <div className="my-6 w-full overflow-y-auto rounded-lg border border-slate-200">
                                  <table className="w-full text-sm" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                              th: ({node, ...props}) => <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
                              td: ({node, ...props}) => <td className="border-b border-slate-100 px-4 py-3 text-left text-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
                              tr: ({node, ...props}) => <tr className="m-0 p-0 even:bg-slate-50/50 transition-colors" {...props} />,
                            }}
                          >
                            {seg.text + (msg.generating && i === parseContent(msg.content).length - 1 ? ' ▍' : '')}
                          </ReactMarkdown>
                        )
                      )}
                    </div>

                    {/* Copy Full Document Button */}
                    {!msg.generating && (
                      <div className="mt-12 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <Button 
                            variant="outline" 
                            className="rounded-full shadow-sm bg-white hover:bg-slate-50 text-slate-500 font-medium px-6 border-slate-200"
                            onClick={() => handleCopyDocument(msg.content)}
                         >
                            <Copy className="size-4 mr-2" />
                            Copy Output
                         </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimal Input Area */}
      <div className="fixed bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-12 pb-8 px-6 md:px-20 lg:px-40 pointer-events-none">
        <div className="max-w-4xl mx-auto relative group pointer-events-auto shadow-2xl shadow-slate-200/50 rounded-2xl bg-white border border-slate-200/60 transition-all duration-300 hover:border-slate-300 hover:shadow-slate-200">
          <Textarea 
            placeholder="Type your prompt here to generate a document..."
            className="min-h-[72px] w-full resize-none rounded-2xl border-none bg-transparent pr-16 pl-6 py-5 text-lg font-medium shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={generating || !selectedModel}
          />
          {generating ? (
            <Button
              size="icon"
              className="absolute right-3 bottom-3 size-12 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md transition-all duration-300"
              onClick={handleStop}
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              className={cn(
                "absolute right-3 bottom-3 size-12 rounded-xl transition-all duration-300",
                input.trim() ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md scale-100 opacity-100" : "scale-95 opacity-50 bg-slate-100 text-slate-400 pointer-events-none"
              )}
              disabled={!input.trim() || !selectedModel}
              onClick={handleSend}
            >
              <Send className="size-5" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
           <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Engine Document Generation</span>
        </div>
      </div>
    </div>
  );
}
