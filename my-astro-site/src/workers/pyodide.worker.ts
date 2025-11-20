/**
 * Pyodide Web Worker - Runs Python code in a separate thread
 * This keeps the UI responsive even during heavy model generation (2-5 minutes for massive models)
 */

import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;
let voxelLibraryLoaded = false;

// Message types
interface InitMessage {
  type: 'init';
}

interface ExecuteMessage {
  type: 'execute';
  code: string;
  timeoutMs: number;
}

interface CancelMessage {
  type: 'cancel';
}

type WorkerMessage = InitMessage | ExecuteMessage | CancelMessage;

// Response types
interface ReadyResponse {
  type: 'ready';
}

interface StatusResponse {
  type: 'status';
  message: string;
}

interface ResultResponse {
  type: 'result';
  data: {
    blocks: any[];
    components: any[];
  } | {
    error: string;
    type: string;
    traceback?: string;
  };
}

interface ErrorResponse {
  type: 'error';
  error: string;
}

type WorkerResponse = ReadyResponse | StatusResponse | ResultResponse | ErrorResponse;

// Execution state
let isExecuting = false;
let shouldCancel = false;

/**
 * Initialize Pyodide and load voxel shape library
 */
async function initialize() {
  try {
    postMessage({ type: 'status', message: 'Loading Python runtime...' } as StatusResponse);

    // Load Pyodide (~6-8MB, cached by browser)
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
    });

    postMessage({ type: 'status', message: 'Loading voxel shape library...' } as StatusResponse);

    // Fetch and load the voxel shape library
    const response = await fetch('/voxel_shape_library.py');
    if (!response.ok) {
      throw new Error(`Failed to load voxel library: ${response.statusText}`);
    }
    const libraryCode = await response.text();

    // Load library into Python namespace
    await pyodide.runPythonAsync(libraryCode);
    voxelLibraryLoaded = true;

    postMessage({ type: 'ready' } as ReadyResponse);
  } catch (error: any) {
    postMessage({
      type: 'error',
      error: `Initialization failed: ${error.message}`,
    } as ErrorResponse);
  }
}

/**
 * Execute Python code with cancellation support
 */
async function executeCode(userCode: string, timeoutMs: number) {
  if (!pyodide || !voxelLibraryLoaded) {
    postMessage({
      type: 'error',
      error: 'Pyodide not initialized',
    } as ErrorResponse);
    return;
  }

  isExecuting = true;
  shouldCancel = false;

  try {
    // Clean the code: remove markdown code fences if present
    let cleanedCode = userCode.trim();
    if (cleanedCode.startsWith('```python')) {
      cleanedCode = cleanedCode.replace(/^```python\s*\n/, '').replace(/\n```\s*$/, '');
    } else if (cleanedCode.startsWith('```')) {
      cleanedCode = cleanedCode.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
    }

    postMessage({ type: 'status', message: 'Executing Python code...' } as StatusResponse);

    // Execute with timeout protection (5 minutes for massive models)
    const result = await Promise.race([
      // Execute the code
      (async () => {
        // Check for cancellation before starting
        if (shouldCancel) {
          throw new Error('Execution cancelled by user');
        }

        // Load user's code into Python
        await pyodide.runPythonAsync(`
import json
import math
import random

# User's generate function
${cleanedCode}
`);

        // Check for cancellation after loading
        if (shouldCancel) {
          throw new Error('Execution cancelled by user');
        }

        // Execute generate() and capture result
        const pythonResult = pyodide.runPython(`
import json
import traceback

_result = None
try:
    _result = generate()
    _json_output = json.dumps(_result)
except Exception as e:
    _json_output = json.dumps({
        "error": str(e),
        "type": type(e).__name__,
        "traceback": traceback.format_exc()
    })

_json_output
`);

        return pythonResult;
      })(),
      // Timeout (5 minutes - safety net for infinite loops)
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Execution timed out after ' + (timeoutMs / 1000 / 60) + ' minutes. Your code may have an infinite loop.')),
          timeoutMs
        )
      ),
    ]);

    // Parse the JSON result
    const parsed = JSON.parse(result as string);

    // Check if it's an error from Python
    if (parsed.error) {
      postMessage({
        type: 'result',
        data: {
          error: parsed.error,
          type: parsed.type || 'PythonError',
          traceback: parsed.traceback,
        },
      } as ResultResponse);
      return;
    }

    // Validate result structure
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      postMessage({
        type: 'result',
        data: {
          error: 'Invalid result: generate() must return {"blocks": [...], "components": [...]}',
          type: 'ValidationError',
        },
      } as ResultResponse);
      return;
    }

    // Success!
    postMessage({
      type: 'result',
      data: {
        blocks: parsed.blocks,
        components: parsed.components || [],
      },
    } as ResultResponse);
  } catch (error: any) {
    postMessage({
      type: 'result',
      data: {
        error: error.message || 'Unknown error occurred',
        type: 'ExecutionError',
        traceback: error.stack,
      },
    } as ResultResponse);
  } finally {
    isExecuting = false;
    shouldCancel = false;
  }
}

/**
 * Handle messages from main thread
 */
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const message = e.data;

  switch (message.type) {
    case 'init':
      await initialize();
      break;

    case 'execute':
      await executeCode(message.code, message.timeoutMs);
      break;

    case 'cancel':
      if (isExecuting) {
        shouldCancel = true;
        postMessage({
          type: 'status',
          message: 'Cancelling execution...',
        } as StatusResponse);
      }
      break;
  }
};
