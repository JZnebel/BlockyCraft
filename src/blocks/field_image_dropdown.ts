import * as Blockly from 'blockly';

/**
 * Custom field that shows an image next to text in dropdown menus
 */
export class FieldImageDropdown extends Blockly.FieldDropdown {
  private imagePrefix: string;
  private imageFolder: 'item' | 'block' | 'entity';

  // Emoji mapping for entities
  private static entityEmojis: { [key: string]: string } = {
    'axolotl': '🦎',
    'bat': '🦇',
    'bee': '🐝',
    'blaze': '🔥',
    'cat': '🐱',
    'chicken': '🐔',
    'cow': '🐄',
    'creeper': '💣',
    'dolphin': '🐬',
    'enderman': '👾',
    'fox': '🦊',
    'ghast': '👻',
    'goat': '🐐',
    'guardian': '🐡',
    'hoglin': '🐗',
    'horse': '🐴',
    'iron_golem': '🤖',
    'llama': '🦙',
    'panda': '🐼',
    'parrot': '🦜',
    'pig': '🐷',
    'piglin': '🐽',
    'rabbit': '🐰',
    'sheep': '🐑',
    'silverfish': '🐛',
    'skeleton': '💀',
    'slime': '🟢',
    'snow_golem': '⛄',
    'spider': '🕷️',
    'squid': '🦑',
    'strider': '🦎',
    'turtle': '🐢',
    'villager': '👨',
    'witch': '🧙',
    'wolf': '🐺',
    'zombie': '🧟'
  };

  constructor(
    options: Blockly.MenuOption[],
    validator?: Blockly.FieldDropdownValidator,
    imageFolder: 'item' | 'block' | 'entity' = 'item'
  ) {
    super(options, validator);
    this.imageFolder = imageFolder;
    this.imagePrefix = `/minecraft-textures/${imageFolder}/`;
  }

  /**
   * Override getSize to account for image/emoji width and dropdown arrow
   */
  override getSize(): Blockly.utils.Size {
    const size = super.getSize();
    // Add extra width for the image/emoji + padding for the dropdown arrow
    const imageWidth = this.imageFolder === 'entity' ? 22 : 24;
    const arrowPadding = 10; // Extra space to prevent arrow overlap
    return new Blockly.utils.Size(size.width + imageWidth + arrowPadding, size.height);
  }

  /**
   * Override render to show image on the block
   */
  protected override render_(): void {
    super.render_();

    // Add image/emoji to the field display on the block
    const textElement = this.getTextElement();
    if (!textElement) return;

    const currentValue = this.getValue();
    if (!currentValue) return;

    // Remove any existing image or text element
    const existingImg = textElement.previousElementSibling;
    if (existingImg && (existingImg.tagName === 'image' || existingImg.tagName === 'text')) {
      existingImg.remove();
    }

    const svgNS = 'http://www.w3.org/2000/svg';

    // For entities, use emoji instead of image
    if (this.imageFolder === 'entity') {
      const filename = currentValue.toLowerCase().replace(/ /g, '_');
      const emoji = FieldImageDropdown.entityEmojis[filename] || '🎯';

      const emojiText = document.createElementNS(svgNS, 'text');
      emojiText.textContent = emoji;
      emojiText.setAttribute('font-size', '18');
      emojiText.setAttribute('y', '13');
      emojiText.setAttribute('x', '0');

      textElement.parentNode?.insertBefore(emojiText, textElement);

      // Add spacing by offsetting the text element
      const currentX = parseFloat(textElement.getAttribute('x') || '0');
      textElement.setAttribute('x', (currentX + 22).toString());
    } else {
      // For items and blocks, use image
      const imagePath = this.getImagePath(currentValue);
      const image = document.createElementNS(svgNS, 'image');
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imagePath);
      image.setAttribute('height', '20');
      image.setAttribute('width', '20');
      image.setAttribute('y', '-2');
      image.style.imageRendering = 'pixelated';

      textElement.parentNode?.insertBefore(image, textElement);

      // Add spacing by offsetting the text element
      const currentX = parseFloat(textElement.getAttribute('x') || '0');
      textElement.setAttribute('x', (currentX + 24).toString());
    }
  }

  /**
   * Override dropdown display to add images
   */
  protected override showEditor_(): void {
    super.showEditor_();

    // Add images after the dropdown is shown
    requestAnimationFrame(() => {
      this.addImagesToMenu();
    });
  }

  /**
   * Add images or emojis to dropdown menu items
   */
  private addImagesToMenu(): void {
    const menu = (this as any).menu_;
    if (!menu) return;

    const menuElement = menu.getElement();
    if (!menuElement) return;

    const menuItems = menuElement.querySelectorAll('.goog-menuitem');
    const options = this.getOptions();

    menuItems.forEach((item: Element, index: number) => {
      if (index >= options.length) return;

      const option = options[index];
      if (!option || !option[1]) return;

      const value = option[1].toString();

      // Check if already added
      const content = item.querySelector('.goog-menuitem-content');
      if (!content || content.querySelector('img') || content.querySelector('.emoji-icon')) return;

      // For entities, use emoji
      if (this.imageFolder === 'entity') {
        const filename = value.toLowerCase().replace(/ /g, '_');
        const emoji = FieldImageDropdown.entityEmojis[filename] || '🎯';

        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-icon';
        emojiSpan.textContent = emoji;
        emojiSpan.style.fontSize = '20px';
        emojiSpan.style.marginRight = '8px';
        emojiSpan.style.verticalAlign = 'middle';

        content.insertBefore(emojiSpan, content.firstChild);
      } else {
        // For items and blocks, use image
        const imagePath = this.getImagePath(value);
        const img = document.createElement('img');
        img.src = imagePath;
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.marginRight = '8px';
        img.style.verticalAlign = 'middle';
        img.style.imageRendering = 'pixelated';
        img.onerror = () => {
          console.warn(`Failed to load image: ${imagePath}`);
          img.style.display = 'none';
        };

        content.insertBefore(img, content.firstChild);
      }
    });
  }

  /**
   * Get the image path for a given value
   */
  private getImagePath(value: string): string {
    // Convert value to lowercase and replace spaces with underscores
    const filename = value.toLowerCase().replace(/ /g, '_');

    // Special handling for entities - use spawn eggs from items folder as fallback
    if (this.imageFolder === 'entity') {
      // Use the generic spawn egg for entities since entity textures are 3D models
      return `/minecraft-textures/item/spawn_egg.png`;
    }

    return `${this.imagePrefix}${filename}.png`;
  }

  /**
   * Factory method to create item dropdown
   */
  static createItemDropdown(options: Blockly.MenuOption[], validator?: Blockly.FieldDropdownValidator): FieldImageDropdown {
    return new FieldImageDropdown(options, validator, 'item');
  }

  /**
   * Factory method to create block dropdown
   */
  static createBlockDropdown(options: Blockly.MenuOption[], validator?: Blockly.FieldDropdownValidator): FieldImageDropdown {
    return new FieldImageDropdown(options, validator, 'block');
  }

  /**
   * Factory method to create mob dropdown
   */
  static createMobDropdown(options: Blockly.MenuOption[], validator?: Blockly.FieldDropdownValidator): FieldImageDropdown {
    return new FieldImageDropdown(options, validator, 'entity');
  }
}

// Register the field type
Blockly.fieldRegistry.register('field_image_dropdown', FieldImageDropdown);
