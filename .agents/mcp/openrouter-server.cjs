#!/usr/bin/env node
/**
 * OpenRouter MCP (Model Context Protocol) Server for Antigravity IDE
 * Communicates via JSON-RPC 2.0 over Stdio.
 */

const readline = require('readline');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CREDITS_URL = 'https://openrouter.ai/api/v1/credits';

const TOOLS = [
  {
    name: 'openrouter_chat',
    description: 'Query frontier AI models via OpenRouter (e.g. deepseek/deepseek-chat, deepseek/deepseek-r1, google/gemini-2.0-flash-001, anthropic/claude-3.7-sonnet). Use for specialized reasoning, coding, or second-opinion analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The user prompt or query to send to the model.'
        },
        model: {
          type: 'string',
          description: 'The OpenRouter model slug (default: deepseek/deepseek-chat). Options: deepseek/deepseek-chat, deepseek/deepseek-r1, google/gemini-2.0-flash-001, anthropic/claude-3.7-sonnet, etc.'
        },
        systemPrompt: {
          type: 'string',
          description: 'Optional system prompt setting role/behavior.'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'openrouter_code_architect',
    description: 'Specialized tool to invoke DeepSeek-R1 or Claude 3.7 Sonnet for complex code architecture, algorithmic logic, or deep refactoring reviews.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The engineering or architectural task description.'
        },
        codeContext: {
          type: 'string',
          description: 'Existing code or snippet to analyze and refactor.'
        },
        preferredModel: {
          type: 'string',
          description: 'Model to use: deepseek/deepseek-r1 (reasoning) or anthropic/claude-3.7-sonnet.'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'openrouter_check_credits',
    description: 'Check current OpenRouter account credit balance, total usage, and active key status.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function callOpenRouter(messages, model = 'deepseek/deepseek-chat') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://antigravity.google',
      'X-Title': 'Antigravity IDE OpenRouter MCP'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No content returned';
}

async function checkCredits() {
  const response = await fetch(CREDITS_URL, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return JSON.stringify(data.data || data, null, 2);
}

function sendResponse(id, result, error = null) {
  const response = {
    jsonrpc: '2.0',
    id
  };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'openrouter-mcp-server',
            version: '1.0.0'
          }
        });
        break;

      case 'notifications/initialized':
        // Client confirmed initialization
        break;

      case 'tools/list':
        sendResponse(id, { tools: TOOLS });
        break;

      case 'tools/call': {
        const { name, arguments: args } = params;
        try {
          if (name === 'openrouter_chat') {
            const messages = [];
            if (args.systemPrompt) {
              messages.push({ role: 'system', content: args.systemPrompt });
            }
            messages.push({ role: 'user', content: args.prompt });
            const reply = await callOpenRouter(messages, args.model || 'deepseek/deepseek-chat');
            sendResponse(id, {
              content: [{ type: 'text', text: reply }]
            });
          } else if (name === 'openrouter_code_architect') {
            const messages = [
              { role: 'system', content: 'You are an expert principal software architect. Provide clear, modular, production-ready code.' },
              { role: 'user', content: `Task: ${args.task}\n\nContext:\n${args.codeContext || 'None provided'}` }
            ];
            const model = args.preferredModel || 'deepseek/deepseek-r1';
            const reply = await callOpenRouter(messages, model);
            sendResponse(id, {
              content: [{ type: 'text', text: reply }]
            });
          } else if (name === 'openrouter_check_credits') {
            const stats = await checkCredits();
            sendResponse(id, {
              content: [{ type: 'text', text: stats }]
            });
          } else {
            sendResponse(id, null, { code: -32601, message: `Tool '${name}' not found` });
          }
        } catch (callErr) {
          sendResponse(id, {
            content: [{ type: 'text', text: `Error: ${callErr.message}` }],
            isError: true
          });
        }
        break;
      }

      default:
        if (id !== undefined) {
          sendResponse(id, null, { code: -32601, message: `Method '${method}' not supported` });
        }
        break;
    }
  } catch (err) {
    console.error('Error handling MCP line:', err);
  }
});
