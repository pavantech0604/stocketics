#!/usr/bin/env node
/**
 * CLI utility to query any OpenRouter model directly from terminal or Antigravity subagent
 * Usage: node query-model.cjs --model <model-slug> --prompt "<prompt>"
 */

const API_KEY = process.env.OPENROUTER_API_KEY || '';

const args = process.argv.slice(2);
let model = 'deepseek/deepseek-chat';
let prompt = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--model' && args[i + 1]) {
    model = args[i + 1];
    i++;
  } else if (args[i] === '--prompt' && args[i + 1]) {
    prompt = args[i + 1];
    i++;
  }
}

if (!prompt) {
  console.log('Usage: node query-model.cjs --model <slug> --prompt "<prompt>"');
  console.log('Available models: deepseek/deepseek-chat, deepseek/deepseek-r1, google/gemini-2.0-flash-001, anthropic/claude-3.7-sonnet');
  process.exit(1);
}

async function run() {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://antigravity.google',
      'X-Title': 'Antigravity IDE OpenRouter Skill'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Error (${res.status}): ${err}`);
    process.exit(1);
  }

  const json = await res.json();
  console.log(json.choices?.[0]?.message?.content || '');
}

run().catch(console.error);
