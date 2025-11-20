/**
 * Lightweight autocomplete for Minecraft block IDs in Python code editor
 * Triggers inside string literals in create_*() function calls
 */

interface Block {
  id: string;
  textureFile: string;
  displayName: string;
  category: string;
  tags: string[];
  kidFriendly: boolean;
}

interface AutocompleteOptions {
  blocks: Block[];
  textarea: HTMLTextAreaElement;
  onSelect?: (blockId: string) => void;
}

export class BlockAutocomplete {
  private blocks: Block[];
  private textarea: HTMLTextAreaElement;
  private dropdown: HTMLDivElement | null = null;
  private selectedIndex: number = 0;
  private filteredBlocks: Block[] = [];
  private isVisible: boolean = false;
  private onSelectCallback?: (blockId: string) => void;

  constructor(options: AutocompleteOptions) {
    this.blocks = options.blocks;
    this.textarea = options.textarea;
    this.onSelectCallback = options.onSelect;

    this.createDropdown();
    this.attachEventListeners();
  }

  private createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'block-autocomplete-dropdown';
    this.dropdown.style.display = 'none';
    document.body.appendChild(this.dropdown);
  }

  private attachEventListeners() {
    // Handle typing
    this.textarea.addEventListener('input', () => {
      this.handleInput();
    });

    // Handle keyboard navigation
    this.textarea.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectPrevious();
          break;
        case 'Enter':
        case 'Tab':
          if (this.filteredBlocks.length > 0) {
            e.preventDefault();
            this.insertSelected();
          }
          break;
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (e.target !== this.textarea && !this.dropdown?.contains(e.target as Node)) {
        this.hide();
      }
    });
  }

  private handleInput() {
    const context = this.getContext();

    // Check if we're inside a string literal within a create_* function
    if (!context.inString || !context.inCreateFunction) {
      this.hide();
      return;
    }

    // Get the partial block ID being typed
    const query = context.stringContent.toLowerCase();

    // Filter blocks by query
    this.filteredBlocks = this.blocks.filter(block => {
      if (!query) return true; // Show all if no query
      return (
        block.id.toLowerCase().includes(query) ||
        block.displayName.toLowerCase().includes(query) ||
        block.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }).slice(0, 10); // Limit to 10 results

    // Sort: kid-friendly first, then by relevance
    this.filteredBlocks.sort((a, b) => {
      if (a.kidFriendly && !b.kidFriendly) return -1;
      if (!a.kidFriendly && b.kidFriendly) return 1;

      // Exact prefix match gets priority
      const aStartsWith = a.id.toLowerCase().startsWith(query);
      const bStartsWith = b.id.toLowerCase().startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.id.localeCompare(b.id);
    });

    if (this.filteredBlocks.length > 0) {
      this.selectedIndex = 0;
      this.show();
      this.render();
    } else {
      this.hide();
    }
  }

  private getContext() {
    const value = this.textarea.value;
    const pos = this.textarea.selectionStart;

    // Find if we're inside a string literal
    const beforeCursor = value.substring(0, pos);
    const afterCursor = value.substring(pos);

    // Check for string quotes (handle both " and ')
    const lastQuote = Math.max(
      beforeCursor.lastIndexOf('"'),
      beforeCursor.lastIndexOf("'")
    );
    const nextQuote = Math.min(
      afterCursor.indexOf('"') !== -1 ? afterCursor.indexOf('"') : Infinity,
      afterCursor.indexOf("'") !== -1 ? afterCursor.indexOf("'") : Infinity
    );

    const inString = lastQuote !== -1 && nextQuote !== Infinity;

    // Get string content
    const stringContent = inString
      ? beforeCursor.substring(lastQuote + 1)
      : '';

    // Check if we're in a create_* function
    const codeBeforeString = beforeCursor.substring(0, lastQuote);
    const inCreateFunction = /create_(cylinder|sphere|cube|pyramid|cone|torus|custom)\s*\([^)]*$/.test(codeBeforeString);

    return {
      inString,
      inCreateFunction,
      stringContent,
      stringStart: lastQuote + 1
    };
  }

  private show() {
    if (!this.dropdown) return;
    this.isVisible = true;
    this.dropdown.style.display = 'block';
    this.positionDropdown();
  }

  private hide() {
    if (!this.dropdown) return;
    this.isVisible = false;
    this.dropdown.style.display = 'none';
  }

  private positionDropdown() {
    if (!this.dropdown) return;

    const rect = this.textarea.getBoundingClientRect();
    const lineHeight = 20; // Approximate line height
    const cursorPos = this.getCursorPosition();

    // Position below the textarea for simplicity
    // In a production app, you'd calculate exact cursor coordinates
    this.dropdown.style.position = 'fixed';
    this.dropdown.style.left = `${rect.left}px`;
    this.dropdown.style.top = `${rect.bottom + 4}px`;
    this.dropdown.style.width = `${Math.min(400, rect.width)}px`;
    this.dropdown.style.maxHeight = '300px';
  }

  private getCursorPosition() {
    // Simplified - returns approximate position
    const lines = this.textarea.value.substring(0, this.textarea.selectionStart).split('\n');
    return {
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
  }

  private render() {
    if (!this.dropdown) return;

    this.dropdown.innerHTML = `
      <div class="autocomplete-header">
        <span class="text-xs font-semibold text-gray-600">
          📦 Minecraft Blocks (${this.filteredBlocks.length})
        </span>
        <span class="text-xs text-gray-500">
          ↑↓ Navigate • Enter/Tab Select • Esc Close
        </span>
      </div>
      <div class="autocomplete-items">
        ${this.filteredBlocks.map((block, index) => `
          <div
            class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}"
            data-index="${index}"
          >
            <div class="flex items-center gap-3">
              <img
                src="/textures/block/${block.textureFile}"
                alt="${block.displayName}"
                class="w-8 h-8 pixelated"
                style="image-rendering: pixelated;"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  ${block.displayName}
                  ${block.kidFriendly ? '<span class="text-xs bg-yellow-100 text-yellow-700 px-1 rounded ml-1">⭐</span>' : ''}
                </div>
                <div class="text-xs font-mono text-gray-500 truncate">
                  ${block.id}
                </div>
              </div>
              <div class="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                ${block.category}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handlers to items
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.insertSelected();
      });

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.render();
      });
    });
  }

  private selectNext() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredBlocks.length - 1);
    this.render();
    this.scrollSelectedIntoView();
  }

  private selectPrevious() {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.render();
    this.scrollSelectedIntoView();
  }

  private scrollSelectedIntoView() {
    if (!this.dropdown) return;
    const selectedItem = this.dropdown.querySelector('.autocomplete-item.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private insertSelected() {
    if (this.filteredBlocks.length === 0) return;

    const selected = this.filteredBlocks[this.selectedIndex];
    const context = this.getContext();

    const value = this.textarea.value;
    const pos = this.textarea.selectionStart;

    // Find the string start
    const beforeCursor = value.substring(0, pos);
    const lastQuote = Math.max(
      beforeCursor.lastIndexOf('"'),
      beforeCursor.lastIndexOf("'")
    );

    // Replace from string start to cursor
    const newValue =
      value.substring(0, lastQuote + 1) +
      `minecraft:${selected.id}` +
      value.substring(pos);

    const newCursorPos = lastQuote + 1 + `minecraft:${selected.id}`.length;

    this.textarea.value = newValue;
    this.textarea.setSelectionRange(newCursorPos, newCursorPos);
    this.textarea.focus();

    // Trigger input event so other listeners know the value changed
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));

    if (this.onSelectCallback) {
      this.onSelectCallback(selected.id);
    }

    this.hide();
  }

  public destroy() {
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
    }
  }
}
