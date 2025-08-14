"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TypingIndicatorProps {
  isVisible: boolean
}

const TypingIndicator = ({ isVisible }: TypingIndicatorProps) => {
  if (!isVisible) return null

  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <Bot className="w-5 h-5 text-blue-400" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-2xl transition-all duration-200 hover:bg-opacity-80 ${
        message.role === "user" ? "bg-[#3a3a3c] ml-12" : "bg-[#2a2a30] mr-12"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === "user" ? "bg-blue-500" : "bg-gray-600"
        }`}
      >
        {message.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                const language = match ? match[1] : ""

                return !inline ? (
                  <div className="relative">
                    {language && (
                      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {language}
                      </div>
                    )}
                    <pre className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 overflow-x-auto">
                      <code className="text-gray-300 text-sm font-mono" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                )
              },
              p: ({ children }) => <p className="mb-3 last:mb-0 text-[#e5e5e7] leading-relaxed">{children}</p>,
              h1: ({ children }) => <h1 className="text-xl font-semibold mb-3 text-[#e5e5e7]">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-[#e5e5e7]">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-[#e5e5e7]">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 text-[#e5e5e7]">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 text-[#e5e5e7]">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-[#7da6ff] hover:text-[#4e8cff] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => <strong className="font-semibold text-[#e5e5e7]">{children}</strong>,
              em: ({ children }) => <em className="italic text-[#e5e5e7]">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("perplexity-chat-history")
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(parsedMessages)
    }
  }, [])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("perplexity-chat-history", JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const simulateAssistantResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1500))

    const message = userMessage.toLowerCase()

    // Programming/Technical questions
    if (
      message.includes("code") ||
      message.includes("programming") ||
      message.includes("javascript") ||
      message.includes("python") ||
      message.includes("react") ||
      message.includes("css") ||
      message.includes("html")
    ) {
      return `Great question about programming! Here's what I can help you with:

**${userMessage}**

\`\`\`javascript
// Here's a practical example
function solveProblem(input) {
  // Process the input
  const result = processData(input);
  
  // Return formatted result
  return {
    success: true,
    data: result,
    timestamp: new Date().toISOString()
  };
}

// Usage example
const solution = solveProblem("${userMessage}");
console.log(solution);
\`\`\`

**Key considerations:**
- **Best practices**: Always follow clean code principles
- **Performance**: Consider optimization for larger datasets  
- **Error handling**: Implement proper try-catch blocks
- **Testing**: Write unit tests for reliability

Would you like me to dive deeper into any specific aspect of this implementation?`
    }

    // Math/Science questions
    if (
      message.includes("math") ||
      message.includes("calculate") ||
      message.includes("formula") ||
      message.includes("science") ||
      message.includes("physics") ||
      message.includes("chemistry")
    ) {
      return `Let me help you with this mathematical/scientific concept:

**Analysis of: "${userMessage}"**

The approach to solving this involves several key steps:

1. **Problem identification**: Understanding the core question
2. **Method selection**: Choosing the appropriate formula or approach
3. **Calculation process**: Step-by-step solution
4. **Verification**: Checking our results

\`\`\`python
# Mathematical solution approach
import math

def solve_problem(parameters):
    """
    Solve the mathematical problem step by step
    """
    # Step 1: Parse input parameters
    # Step 2: Apply relevant formulas
    # Step 3: Calculate result
    
    result = perform_calculation(parameters)
    return result

# Example usage
answer = solve_problem("${userMessage}")
print(f"Solution: {answer}")
\`\`\`

> **Note**: This is a simplified example. Real-world applications may require more complex considerations.

Would you like me to explain any specific part of this solution in more detail?`
    }

    // Business/Strategy questions
    if (
      message.includes("business") ||
      message.includes("strategy") ||
      message.includes("marketing") ||
      message.includes("startup") ||
      message.includes("company")
    ) {
      return `Excellent business question! Let me provide a strategic analysis:

**Topic: "${userMessage}"**

## Strategic Framework

**1. Current Market Analysis**
- Market size and growth potential
- Competitive landscape assessment
- Customer needs and pain points

**2. Strategic Options**
- **Option A**: Direct approach with immediate implementation
- **Option B**: Phased rollout with market testing
- **Option C**: Partnership-based strategy

**3. Implementation Roadmap**
\`\`\`
Phase 1: Research & Planning (Weeks 1-4)
├── Market research
├── Competitive analysis
└── Resource allocation

Phase 2: Development (Weeks 5-12)
├── Product/service development
├── Team building
└── Initial testing

Phase 3: Launch (Weeks 13-16)
├── Go-to-market execution
├── Performance monitoring
└── Optimization
\`\`\`

**Key Success Metrics:**
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Market penetration rate
- Revenue growth

*What specific aspect of this strategy would you like to explore further?*`
    }

    // Technology/AI questions
    if (
      message.includes("ai") ||
      message.includes("artificial intelligence") ||
      message.includes("machine learning") ||
      message.includes("technology") ||
      message.includes("future")
    ) {
      return `Fascinating topic about AI and technology! Here's my analysis:

**"${userMessage}"**

## Current State of AI Technology

**Large Language Models (LLMs)**
- GPT-4, Claude, Gemini leading the space
- Multimodal capabilities (text, image, code)
- Reasoning and problem-solving improvements

**Key Applications:**
1. **Content Generation**: Writing, coding, creative work
2. **Analysis & Research**: Data processing, insights
3. **Automation**: Workflow optimization, decision support

\`\`\`python
# AI Integration Example
class AIAssistant:
    def __init__(self, model_type="gpt-4"):
        self.model = model_type
        self.capabilities = [
            "text_generation",
            "code_analysis", 
            "problem_solving",
            "creative_tasks"
        ]
    
    def process_query(self, query):
        # Analyze query intent
        intent = self.analyze_intent(query)
        
        # Generate contextual response
        response = self.generate_response(intent, query)
        
        return response

# Usage
assistant = AIAssistant()
result = assistant.process_query("${userMessage}")
\`\`\`

**Future Implications:**
- Enhanced reasoning capabilities
- Better multimodal understanding
- More efficient and specialized models
- Improved human-AI collaboration

*What specific aspect of AI development interests you most?*`
    }

    // General knowledge/explanation requests
    if (
      message.includes("explain") ||
      message.includes("what is") ||
      message.includes("how does") ||
      message.includes("why")
    ) {
      return `Let me explain this concept clearly:

**"${userMessage}"**

## Comprehensive Explanation

**Core Concept:**
The topic you're asking about involves several interconnected elements that work together to create the overall phenomenon or system.

**Key Components:**
- **Foundation**: The basic principles that underlie this concept
- **Mechanisms**: How the different parts interact and function
- **Applications**: Real-world uses and implementations
- **Implications**: Broader effects and consequences

**Detailed Breakdown:**

1. **Primary Factors**
   - Direct causes and influences
   - Immediate effects and outcomes

2. **Secondary Considerations**
   - Indirect relationships
   - Long-term implications

3. **Practical Examples**
   - Real-world applications
   - Case studies and scenarios

> **Key Insight**: Understanding this concept requires looking at both the individual components and how they work together as a system.

**Related Topics:**
- Connected concepts you might find interesting
- Further reading suggestions
- Areas for deeper exploration

*Would you like me to elaborate on any particular aspect of this explanation?*`
    }

    // Creative/Design questions
    if (
      message.includes("design") ||
      message.includes("creative") ||
      message.includes("art") ||
      message.includes("ui") ||
      message.includes("ux")
    ) {
      return `Great design question! Let me share some insights:

**Design Challenge: "${userMessage}"**

## Design Thinking Approach

**1. Empathize & Define**
- User needs and pain points
- Context and constraints
- Success criteria

**2. Ideate & Prototype**
- Brainstorming solutions
- Rapid prototyping
- Iterative refinement

\`\`\`css
/* Design System Example */
:root {
  --primary-color: #4e8cff;
  --secondary-color: #7da6ff;
  --background: #1c1c1e;
  --surface: #2c2c2e;
  --text-primary: #e5e5e7;
  --text-secondary: #a1a1a6;
}

.design-component {
  background: var(--surface);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.design-component:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
\`\`\`

**Design Principles:**
- **Clarity**: Clear visual hierarchy and information architecture
- **Consistency**: Unified patterns and components
- **Accessibility**: Inclusive design for all users
- **Performance**: Optimized for speed and efficiency

**Modern Trends:**
- Minimalist interfaces with purposeful elements
- Dark mode as a standard option
- Micro-interactions for enhanced UX
- Responsive design across all devices

*What specific design challenge are you working on?*`
    }

    // Default intelligent response for other topics
    return `Thank you for your question about "${userMessage}". Let me provide a thoughtful response:

## Analysis & Insights

**Understanding Your Question:**
You've raised an interesting point that touches on several important aspects worth exploring.

**Key Considerations:**

1. **Context & Background**
   - Historical perspective and development
   - Current state and recent changes
   - Influencing factors and variables

2. **Multiple Perspectives**
   - Different viewpoints and approaches
   - Pros and cons of various options
   - Stakeholder considerations

3. **Practical Implications**
   - Real-world applications
   - Potential outcomes and consequences
   - Implementation considerations

**Actionable Insights:**
- **Short-term**: Immediate steps you can take
- **Medium-term**: Strategic planning and development
- **Long-term**: Future considerations and planning

\`\`\`
Framework for Analysis:
├── Problem Definition
├── Research & Data Gathering
├── Option Evaluation
├── Decision Making
└── Implementation & Review
\`\`\`

> **Key Takeaway**: The most effective approach often involves considering multiple factors and adapting based on specific circumstances and goals.

**Next Steps:**
- Identify your specific priorities and constraints
- Gather additional information if needed
- Consider testing or piloting approaches
- Plan for monitoring and adjustment

*What aspect of this topic would you like to explore in more depth?*`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const assistantResponse = await simulateAssistantResponse(inputValue.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("perplexity-chat-history")
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-[#e5e5e7] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1c1c1e] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Perplexity Chat</h1>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32 bg-[#2c2c2e] border-gray-700 text-[#e5e5e7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2c2c2e] border-gray-700">
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 bg-transparent"
          >
            Clear Chat
          </Button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-400">Welcome to Perplexity Chat</h2>
              <p className="text-gray-500">
                Ask me anything to get started. I'll provide detailed, well-formatted responses.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}

          <TypingIndicator isVisible={isTyping} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-800 bg-[#1c1c1e] sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="w-full bg-[#2c2c2e] border-gray-700 text-[#e5e5e7] placeholder-gray-500 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-[#4e8cff] focus:border-transparent"
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#4e8cff] hover:bg-[#3a7ce0] text-white rounded-2xl px-4 py-3 transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
