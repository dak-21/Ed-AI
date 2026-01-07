
import React, { useState } from 'react';
import { AITool } from '../types';
import { streamAITool } from '../services/gemini';

interface ToolModalProps {
  tool: AITool | null;
  onClose: () => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  if (!tool) return null;

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setOutput('');
    
    // Simple placeholder logic for template
    const finalPrompt = tool.promptTemplate.replace(/\${(\w+)}/g, input);
    
    const stream = streamAITool(finalPrompt);
    for await (const chunk of stream) {
      if (chunk) setOutput(prev => prev + chunk);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`p-3 rounded-xl text-2xl ${tool.color}`}>{tool.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{tool.title}</h3>
              <p className="text-sm text-slate-500">{tool.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Enter Details / Topic</label>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px] transition-all"
              placeholder={`E.g. "Photosynthesis", "School Policy on Uniforms", "Grade 10 Math"...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating AI magic...
                </>
              ) : (
                'Generate Output'
              )}
            </button>
          </form>

          {output && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Result</h4>
                <button 
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Copy to Clipboard
                </button>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
                {output}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
