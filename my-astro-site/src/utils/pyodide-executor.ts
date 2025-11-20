/**
 * Pyodide executor - manages Web Worker for Python code execution
 * Runs Python in a separate thread to keep UI responsive during heavy model generation
 */

// Worker state
let worker: Worker | null = null;
let workerReady = false;
let initPromise: Promise<void> | null = null;

// Callbacks
type StatusCallback = (status: string) => void;
let statusCallback: StatusCallback | null = null;

/**
 * Initialize the Pyodide Web Worker
 * This loads Pyodide and the voxel shape library in a background thread
 */
export async function initPyodide(): Promise<void> {
  // If already initializing, return the existing promise
  if (initPromise) {
    return initPromise;
  }

  // If already initialized, return immediately
  if (worker && workerReady) {
    return Promise.resolve();
  }

  initPromise = new Promise((resolve, reject) => {
    try {
      // Create the Web Worker
      worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
        type: 'module',
      });

      // Handle messages from worker
      worker.onmessage = (e) => {
        const message = e.data;

        switch (message.type) {
          case 'ready':
            workerReady = true;
            updateStatus('Python runtime ready!');
            resolve();
            break;

          case 'status':
            updateStatus(message.message);
            break;

          case 'error':
            updateStatus('Error: ' + message.error);
            reject(new Error(message.error));
            break;
        }
      };

      worker.onerror = (error) => {
        console.error('[Pyodide] Worker error:', error);
        updateStatus('Worker error');
        reject(error);
      };

      // Start initialization
      worker.postMessage({ type: 'init' });
    } catch (error) {
      reject(error);
    }
  });

  return initPromise;
}

/**
 * Execute user's Python code in the Web Worker
 * @param userCode - The Python code containing the generate() function
 * @param timeoutMs - Maximum execution time in milliseconds (default: 5 minutes)
 * @returns The result from generate() or an error object
 */
export async function executeVoxelCode(
  userCode: string,
  timeoutMs: number = 300000 // 5 minutes for massive models
): Promise<{ blocks: any[]; components: any[] } | { error: string; type: string; traceback?: string }> {
  try {
    // Initialize worker if needed
    await initPyodide();

    if (!worker) {
      throw new Error('Worker not initialized');
    }

    console.log('[Pyodide] Sending code to worker for execution...');

    // Execute in worker and wait for result
    return new Promise((resolve) => {
      const messageHandler = (e: MessageEvent) => {
        const message = e.data;

        switch (message.type) {
          case 'result':
            // Remove this handler
            worker!.removeEventListener('message', messageHandler);
            resolve(message.data);
            break;

          case 'status':
            updateStatus(message.message);
            break;

          case 'error':
            // Remove this handler
            worker!.removeEventListener('message', messageHandler);
            resolve({
              error: message.error,
              type: 'WorkerError',
            });
            break;
        }
      };

      worker!.addEventListener('message', messageHandler);

      // Send execute command to worker
      worker!.postMessage({
        type: 'execute',
        code: userCode,
        timeoutMs: timeoutMs,
      });
    });
  } catch (error: any) {
    console.error('[Pyodide] Execution error:', error);
    return {
      error: error.message || 'Failed to execute code',
      type: 'ExecutionError',
    };
  }
}

/**
 * Cancel the currently running execution
 * This terminates the worker and creates a fresh one
 */
export async function cancelExecution(): Promise<void> {
  if (worker) {
    console.log('[Pyodide] Cancelling execution and terminating worker...');

    // Terminate the worker (kills any running Python code)
    worker.terminate();
    worker = null;
    workerReady = false;
    initPromise = null;

    updateStatus('Execution cancelled');

    // Reinitialize with a fresh worker
    // This happens in the background; next execution will wait for it
    setTimeout(() => {
      initPyodide().catch(err => {
        console.error('[Pyodide] Failed to reinitialize after cancel:', err);
      });
    }, 100);
  }
}

/**
 * Check if Pyodide worker is ready
 */
export function isPyodideReady(): boolean {
  return worker !== null && workerReady;
}

/**
 * Get initialization status
 */
export function getInitializationStatus(): 'not_started' | 'loading' | 'ready' {
  if (worker && workerReady) {
    return 'ready';
  }
  if (initPromise || worker) {
    return 'loading';
  }
  return 'not_started';
}

/**
 * Set a callback to receive status updates
 */
export function setStatusCallback(callback: StatusCallback | null) {
  statusCallback = callback;
}

function updateStatus(status: string) {
  if (statusCallback) {
    statusCallback(status);
  }
}
